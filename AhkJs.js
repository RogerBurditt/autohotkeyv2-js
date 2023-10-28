// Import required modules for child processes and file system operations.
const { spawn, fork } = require("child_process");
const fs = require("fs/promises");

// Define a class named AhkJs to encapsulate AutoHotkey (AHK) interactions.
class AhkJs {
    constructor() {
        // Initialize default properties for the AhkJs instance.
        this.defaultColorVariation = 1;
        this.width = 1366;
        this.height = 768;
        this.hotkeys = {};
        this.hotkeysPending = [];
        this.current = null;
        this.runner = null;
    }

    // Initialize the AhkJs instance with the given AHK script and options.
    async init(path, hotkeysList, options) {
        // Set default values for hotkeysList and options if not provided.
        if (!hotkeysList) hotkeysList = [];
        if (!options) options = {};

        // If specified, use the provided default color variation; otherwise, use the default.
        if (options.defaultColorVariation) {
            this.defaultColorVariation = options.defaultColorVariation;
        }

        // Define paths for AHK scripts for both AHK versions.
        const ahkV1Path = "\\runner_ahkV1.ahk";
        const ahkV2Path = "\\runner_ahkV2.ahk";

        // Create a child process for running AHK and pass the selected script as a parameter.
        this.runner = spawn(path, [__dirname + (options.ahkv1 ? ahkV1Path : ahkV2Path)]);
        this.runner.stdin.write(process.cwd() + "\n");

        // Prepare the AHK script for hotkeys.
        var hotkeysString = `#NoTrayIcon
stdout := FileOpen("*", "w \`n")

write(x) {
  global stdout
  stdout.Write(x)
  stdout.Read(0)
}
`;

        // Loop through hotkeysList to define hotkeys in the AHK script.
        hotkeysList.forEach((x) => {
            if (x.noInterrupt) {
                hotkeysString += "~";
            }
            if (typeof x === "string") {
                hotkeysString += `${x}::write("${x}")
`;
            } else {
                if (x.keys) {
                    this.hotkeys[x.keys.join(" ")] = function () { };
                    hotkeysString += `${x.keys.join(" & ")}::write("${x.keys.join(" ")}")
`;
                } else {
                    let mod = "";
                    if (x.modifiers) {
                        mod += x.modifiers.join("")
                            .replace("win", "#")
                            .replace("alt", "!")
                            .replace("control", "^")
                            .replace("shift", "+")
                            .replace("any", "*")
                    }
                    var key = x.key
                        .replace(/\\{/g, "{{}")
                        .replace(/\\}/g, "{}}");
                    this.hotkeys[mod + key] = function () { };
                    hotkeysString += `${mod + key}:: write("${mod + key}")
`;
                }
            }
        });

        // Write the hotkeys script to a file and create a child process to run it.
        await fs.writeFile(__dirname + "\\hotkeys.ahk", hotkeysString);
        const hotkeys = spawn(path, [__dirname + "\\hotkeys.ahk"]);

        // Set up event handlers and process cleanup on exit or interruption.
        this.runner.stdout.on("end", () => {
            console.log("runner exit")
            process.exit();
        });

        hotkeys.stdout.on("end", () => {
            console.log("hotkeys exit")
            process.exit();
        });

        process.on("SIGINT", process.exit);

        process.on("exit", () => {
            console.log("process exit")
            if (!this.runner.killed) this.runner.kill();
            if (!hotkeys.killed) hotkeys.kill();
        });

        // Handle data received from the AHK runner process.
        this.runner.stdout.on("data", (data) => {
            data = data.toString();

            if (this.current) {
                this.current(data);
                this.current = null;
            }
        });

        // Handle data received from the hotkeys process and execute corresponding hotkey actions.
        hotkeys.stdout.on("data", (data) => {
            data = data.toString();
            if (this.hotkeys[data].instant) this.hotkeys[data]();
            else this.hotkeysPending.push(this.hotkeys[data]);
        });

        // Retrieve and set initial variables from AHK, such as screen dimensions.
        var initVars = JSON.parse(await this.wait());
        this.width = initVars.width;
        this.height = initVars.height;
    }

    // A utility function that returns a promise to resolve a future action.
    wait() {
        return new Promise((resolve) => {
            this.current = resolve;
        });
    }

    // Utility functions to convert coordinates between pixels and percentages.
    toPercent(x) {
        return [x[0] * 100 / this.width, x[1] * 100 / this.height];
    }

    toPx(x) {
        return [x[0] / 100 * this.width, x[1] / 100 * this.height];
    }

    // Define a custom hotkey with optional instant execution.
    setHotkey(key, run, instant = false) {
        // Ensure the 'run' parameter is a valid function
        if (typeof run !== 'function') {
            throw new Error("The 'run' parameter must be a valid function.");
        }

        // Define the hotkey in AutoHotkey script format
        const hotkeyScript = `^!${key}::\n` + // Customize the modifier (^! for Ctrl+Alt, change as needed)
            `    if GetKeyState("${key}", "P")\n` +
            `    {\n` +
            `        Run, %comspec% /c echo "Hotkey ${key} pressed" >> hotkey.log\n` + // Log the hotkey press (change this line as needed)
            `        ${instant ? "Run" : "this.hotkeysPending.push"}("${key}")\n` +
            `    }\n`;

        // Send the hotkey script to the AutoHotkey runner process
        this.runner.stdin.write(hotkeyScript);

        // Define the function to execute when the hotkey is triggered
        this.hotkeys[key] = instant ? run : async () => {
            await run();
            this.waitForInterrupt();
        };
    }

    // Utility function to introduce a delay in execution.
    sleep(x) {
        return new Promise((resolve) => {
            setTimeout(resolve, x);
        });
    }

    // Execute pending hotkeys in the queue.
    async waitForInterrupt() {
        while (this.hotkeysPending[0]) {
            await this.hotkeysPending[0]();
            this.hotkeysPending.shift();
        }
    }

    /////////////////////////////////////////////////////////
    // MOUSE INTERACTIONS
    /////////////////////////////////////////////////////////

    // Set the mouse speed in AutoHotkey.
    async setMouseSpeed(x) {
        if (!this.runner) return;

        this.runner.stdin.write(`setMouseSpeed;${x}\n`);
        await this.wait();
    }

    // Move the mouse cursor to a specified position.
    async mouseMove(x) {
        if (!this.runner) return;

        if (!x.speed) x.speed = 2;
        if (x.positioning === "%") {
            x.x = Math.floor(x.x / 100 * this.width);
            x.y = Math.floor(x.y / 100 * this.height);
        }

        if (x.relative) {
            let currentMouse = await this.getMousePos();
            x.x += currentMouse[0] ?? 0;
            x.y += currentMouse[1] ?? 0;
        }

        this.runner.stdin.write(`mouseMove;${x.x};${x.y};${x.speed}\n`);
        await this.wait();
    }

    // Simulate a mouse click and drag operation.
    async mouseClickDrag(x) {
        if (!this.runner) return;

        if (!x.x1 || !x.y1 || !x.x2 || !x.y2) return;

        if (!x.speed) x.speed = 10;
        if (!x.button) x.button = "L";

        if (x.relative) {
            let currentMouse = await this.getMousePos();
            x.x += currentMouse[0] ?? 0;
            x.y += currentMouse[1] ?? 0;
        }

        this.runner.stdin.write(`mouseClickDrag;${x.button};${x.x1};${x.y1};${x.x2};${x.y2};${x.speed}\n`);
    }

    // Simulate a mouse click at a specified position.
    async click(x) {
        if (!this.runner) return;

        if (!x) x = {};

        if (!x.x || !x.y) {
            x.x = "";
            x.y = "";
        }

        if (x.positioning === "%" && x.x) {
            x.x = Math.floor(x.x / 100 * this.width);
            x.y = Math.floor(x.y / 100 * this height);
        }

        if (x.button === "left") x.button = "L";
        else if (x.button === "middle") x.button = "M";
        else if (x.button === "right") x.button = "R";
        else x.button = "";

        if (x.state === "down") x.state = "D";
        else if (x.state === "up") x.state = "U";
        else x.state = "";

        if (!x.count) x.count = "";
        if (!x.delay) x.delay = 2;
        this.runner.stdin.write(`click;${x.x} ${x.y} ${x.button} ${x.state} ${x.count};${x.delay}\n`);

        await this.wait();
    }

    // Simulate a mouse click using the "Play" method in AutoHotkey.
    async clickPlay(x) {
        if (!this.runner) return;

        if (!x) x = {};

        if (!x.x || !x.y) {
            x.x = "";
            x.y = "";
        }

        if (x.positioning === "%" && x.x) {
            x.x = Math.floor(x.x / 100 * this.width);
            x.y = Math.floor(x.y / 100 * this.height);
        }

        if (x.button === "left") x.button = "L";
        else if (x.button === "middle") x.button = "M";
        else if (x.button === "right") x.button = "R";
        else x.button = "";

        if (x.state === "down") x.state = "D";
        else if (x.state === "up") x.state = "U";
        else x.state = "";

        if (!x.count) x.count = "";

        this.runner.stdin.write(`clickPlay;${x.x} ${x.y} ${x.button} ${x.state} ${x.count}\n`);

        await this.wait();
    }

    // Get the current mouse cursor position.
    async getMousePos(x) {
        if (!this.runner) return;

        this.runner.stdin.write(`getMousePos\n`);

        var pos = (await this.wait()).split(" ");
        pos[0] = Number(pos[0]);
        pos[1] = Number(pos[1]);

        if (x === "%") {
            pos[0] = pos[0] / ahk.width * 100;
            pos[1] = pos[1] / ahk.height * 100;
        }

        return pos;
    }

    /////////////////////////////////////////////////////////
    // KEYBOARD INTERACTIONS
    /////////////////////////////////////////////////////////

    // Set the delay between key presses and releases.
    async setKeyDelay(x) {
        if (!this.runner) return;

        if (!x.delay) x.delay = "";
        if (!x.duration) x.duration = "";
        if (x.play) x.play = "Play";
        else x.play = "";
        this.runner.stdin.write(`setKeyDelay;${x.delay};${x.duration};${x.play}\n`);
        await this.wait();
    }

    // Clean and format input for keyboard operations.
    cleanInput(x) {
        if (typeof x === "string") x = { msg: x };
        var toSend = "";
        if (x.blind) toSend += "{Blind}";
        toSend += x.msg
            .replace(/!/g, "{!}")
            .replace(/#/g, "{#}")
            .replace(/\+/g, "{+}")
            .replace(/\^/g, "{^}")
            .replace(/\\{/g, "{{}")
            .replace(/\\}/g, "{}}")
            .replace(/\n/g, "{enter}");

        return toSend;
    }

    // Simulate keyboard input using the "Send" method in AutoHotkey.
    async send(x) {
        if (!this.runner) return;
        let toSend = this.cleanInput(x);
        this.runner.stdin.write(`send;${toSend}\n`);
        await this.wait();
    }

    // Simulate keyboard input using the "SendInput" method in AutoHotkey.
    async sendInput(x) {
        if (!this.runner) return;
        let toSend = this.cleanInput(x);
        this.runner.stdin.write(`sendInput;${toSend}\n`);
        await this.wait();
    }

    // Simulate keyboard input using the "SendPlay" method in AutoHotkey.
    async sendPlay(x) {
        if (!this.runner) return;
        let toSend = this.cleanInput(x);
        this.runner.stdin.write(`sendPlay;${toSend}\n`);
        await this.wait();
    }

    /////////////////////////////////////////////////////////
    // WINDOW INTERACTIONS
    /////////////////////////////////////////////////////////

    // Get the client area position of a window.
    async winGetClientPos(x) {
        if (!this.runner) return;
        this.runner.stdin.write(`winGetClientPos;${x};\n`);
        var pos = (await this.wait()).split(" ");
        if (pos[0] === "") {
            return null;
        }
        if (x.positioning === "%") {
            pos[0] = pos[0] / this.width * 100;
            pos[1] = pos[1] / this.height * 100;
        }
        return pos;
    }

    // Check if a window with the specified title exists.
    async winExist(x) {
        if (!this.runner) return;
        this.runner.stdin.write(`winExist;${x};\n`);
        var exists = await this.wait();
        return Boolean(Number(exists));
    }

    // Activate a window with the specified title.
    async winActivate(x) {
        if (!this.runner) return;
        this.runner.stdin.write(`winActivate;${x};\n`);
    }

    ///////////////////////////////////////////////////////
    // SCREEN INTERACTIONS
    ///////////////////////////////////////////////////////

    // Get the color of a pixel at a specified location on the screen.
    async getPixelColor(x) {
        if (!this.runner) return;

        if (x.positioning === "%") {
            x.x = Math.floor(x.x / 100 * this.width);
            x.y = Math.floor(x.y / 100 * this.height);
        }

        var mode = "RGB ";

        if (x.mode === "slow") mode += "Slow";
        else if (x.mode === "alt") mode += "Alt";

        this.runner.stdin.write(`getPixelColor;${x.x};${x.y};${mode}\n`);

        return (await this.wait()).replace("0x", "");
    }

    // Search for a pixel color within a specified region on the screen.
    async pixelSearch(x) {
        if (!this.runner) return;

        if (!x.variation) x.variation = this.defaultColorVariation;

        if (x.positioning === "%") {
            x.x1 = Math.floor(x.x1 / 100 * this.width);
            x.y1 = Math.floor(x.y1 / 100 * this.height);
            x.x2 = Math.floor(x.x2 / 100 * this.width);
            x.y2 = Math.floor(x.y2 / 100 * this.height);
        }

        this.runner.stdin.write(`pixelSearch;${x.x1};${x.y1};${x.x2};${x.y2};0x${x.color};${x.variation}\n`);

        var pos = (await wait()).split(" ");

        if (pos[0] === "") {
            return null;
        }

        if (x.positioning === "%") {
            pos[0] = pos[0] / this.width * 100;
            pos[1] = pos[1] / this.height * 100;
        }

        return pos;
    }

    // Search for an image within a specified region on the screen.
    async imageSearch(x) {
        if (!this.runner) return;

        if (!x.variation) x.variation = `*${this.defaultColorVariation} `;
        else x.variation = `*${x.variation} `;

        if (!x.trans) x.trans = "";
        else x.trans = `*Trans0x${x.trans} `;

        if (x.positioning === "%") {
            x.x1 = Math.floor(x.x1 / 100 * this.width);
            x.y1 = Math.floor(x.y1 / 100 * this.height);
            x.x2 = Math.floor(x.x2 / 100 * this.width);
            x.y2 = Math.floor(x.y2 / 100 * this.height);
        }

        this.runner.stdin.write(`imageSearch;${x.x1};${x.y1};${x.x2};${x.y2};${x.variation}${x.trans}${x.imgPath}\n`);

        var pos = (await this.wait()).split(" ");

        if (pos[0] === "") {
            return null;
        }

        if (x.positioning === "%") {
            pos[0] = pos[0] / this.width * 100;
            pos[1] = pos[1] / this.height * 100;
        }

        return pos;
    }

    ///////////////////////////////////////////////////////
    // OS INTERACTIONS
    ///////////////////////////////////////////////////////

    // Run a program with the specified name.
    async runProgram(x) {
        if (!this.runner) return;
        this.runner.stdin.write(`runProgram;${x};\n`);
        await this.wait();
    }

    // Display a message box with the specified text, title, and options.
    async msgBox(x) {
        if (!this.runner) return;

        if (!x.text) x.text = "";
        if (!x.title) x.title = "";
        if (!x.options) x.options = "";

        this.runner.stdin.write(`msgBox;${x.text};${x.title};${x.options};\n`);
        var result = await this.wait();
        return result;
    }

    // Interact with the clipboard, either setting its contents or retrieving them.
    async clipboard(x) {
        if (!this.runner) return;

        if (x) {
            this.runner.stdin.write(`setClipboard;${x}\n`);
            await this.wait();
        } else {
            this.runner.stdin.write(`getClipboard\n`);
            return await this.wait();
        }
    }
}

module.exports = AhkJs;