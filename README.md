# AHKJS

This library encapsulates interactions with AutoHotkey (AHK) scripts, utilizing JavaScript instead of AutoHotkey's own language.
Provides a structured way to communicate with AHK scripts and perform various actions like mouse movements, keyboard input, window operations, screen interactions, and more.


Requirements:

AutoHotkey v2.0
Windows 10+

## Compiling

To utilize this library, import the AhkJs file into your own project and initialize a new AhkJs object.

```javascript
import AhkJs from './AhkJs.js';

const ahkJs = new AhkJs();
```

## Usage

Creating a new `AhkJs` object provides access to various functions and capabilities for interacting with AutoHotkey (AHK) scripts and automating tasks. Below is an overview of the available functions and their use cases:

### `init(path, hotkeysList, options)`

The `init` method initializes an `AhkJs` instance with the provided AHK script path, list of hotkeys, and optional options. It sets up communication with AutoHotkey and prepares the environment for automation.

- `path`: The path to the AutoHotkey executable. 
- `hotkeysList`: An array of hotkeys you want to define.
- `options` (optional): An object that allows you to customize the initialization, including the default color variation.

### `setHotkey(key, run, instant = false)`

The `setHotkey` method is used to define a custom hotkey with an optional execution function. When the specified hotkey is triggered, the associated function is executed.

- `key`: The key combination for the hotkey (e.g., `"K"` for a single key or `"Ctrl+Alt+K"` for a combination).
- `run`: The function to execute when the hotkey is triggered.
- `instant` (optional): A boolean flag that determines whether the execution is instant (non-blocking) or not.

### `waitForInterrupt()`

The `waitForInterrupt` method allows you to execute pending hotkeys in the queue. This is useful for ensuring that all hotkeys are processed before exiting the script.

### Mouse Interactions

#### `setMouseSpeed(speed)`

The `setMouseSpeed` method sets the mouse cursor speed in AutoHotkey.

- `speed`: The speed at which the mouse cursor moves.

#### `mouseMove(options)`

The `mouseMove` method moves the mouse cursor to a specified position on the screen.

- `options`: An object containing the position and optional parameters.

#### `mouseClickDrag(options)`

The `mouseClickDrag` method simulates a mouse click and drag operation, allowing you to interact with graphical user interfaces.

- `options`: An object specifying the coordinates and behavior of the click and drag operation.

#### `click(options)`

The `click` method simulates a mouse click at a specified position on the screen. It provides fine-grained control over the click behavior.

- `options`: An object specifying the click position, button, state, count, and delay.

#### `clickPlay(options)`

The `clickPlay` method simulates a mouse click using the "Play" method in AutoHotkey. It offers a simplified way to perform mouse clicks.

- `options`: An object specifying the click position, button, state, and count.

#### `getMousePos()`

The `getMousePos` method retrieves the current position of the mouse cursor, allowing you to track its location on the screen.

### Keyboard Interactions

#### `setKeyDelay(options)`

The `setKeyDelay` method sets the delay between key presses and releases, controlling the speed of keyboard input.

- `options`: An object specifying the key delay, duration, and play option.

#### `send(text)`

The `send` method simulates keyboard input using the "Send" method in AutoHotkey. It allows you to send text and key combinations.

- `text`: The text or key combination to send.

#### `sendInput(text)`

The `sendInput` method simulates keyboard input using the "SendInput" method in AutoHotkey. It provides a faster input method for automation.

- `text`: The text or key combination to send.

#### `sendPlay(text)`

The `sendPlay` method simulates keyboard input using the "SendPlay" method in AutoHotkey. It offers another way to send keyboard input.

- `text`: The text or key combination to send.

### Window Interactions

#### `winGetClientPos(options)`

The `winGetClientPos` method retrieves the client area position of a window with the specified title.

- `options`: An object containing the window title and optional positioning.

#### `winExist(title)`

The `winExist` method checks if a window with the specified title exists.

- `title`: The title of the window to check for existence.

#### `winActivate(title)`

The `winActivate` method activates a window with the specified title, bringing it to the foreground.

- `title`: The title of the window to activate.

### Screen Interactions

#### `getPixelColor(options)`

The `getPixelColor` method retrieves the color of a pixel at a specified location on the screen.

- `options`: An object specifying the pixel coordinates and color mode.

#### `pixelSearch(options)`

The `pixelSearch` method searches for a pixel color within a specified region on the screen and returns the position if found.

- `options`: An object specifying the search region, target color, and color variation.

#### `imageSearch(options)`

The `imageSearch` method searches for an image within a specified region on the screen and returns the position if found.

- `options`: An object specifying the search region, image path, and optional parameters.

### OS Interactions

#### `runProgram(name)`

The `runProgram` method runs a program with the specified name or path.

- `name`: The name or path of the program to run.

#### `msgBox(options)`

The `msgBox` method displays a message box with the specified text, title, and options.

- `options`: An object containing the message text, title, and message box options.

#### `clipboard(text)`

The `clipboard` method allows you to interact with the clipboard, either setting its contents or retrieving them.

- `text` (optional): The text to set in the clipboard. If not provided, it retrieves the current clipboard contents.

These functions empower you to automate a wide range of tasks, from controlling the mouse and keyboard to interacting with windows and performing screen-based actions. Customize these functions to suit your automation needs and streamline your workflow with the `AhkJs` library.

## Mouse Containers

The `MouseContainers.js` file provides utility functions for mouse interactions, allowing you to perform various actions within defined regions or shapes. These functions include:

### `clickBox(left, top, right, bottom, reverse = false)`

The `clickBox` function performs mouse clicks within a defined rectangular region. You specify the coordinates of the top-left and bottom-right corners of the rectangle. If the `reverse` parameter is set to `true`, the clicks occur from the bottom-right corner to the top-left corner.

- `left`: The X-coordinate of the top-left corner of the rectangle.
- `top`: The Y-coordinate of the top-left corner of the rectangle.
- `right`: The X-coordinate of the bottom-right corner of the rectangle.
- `bottom`: The Y-coordinate of the bottom-right corner of the rectangle.
- `reverse` (optional): A boolean flag that determines the order of clicks within the rectangle.

### `randClickBox(left, top, right, bottom, count)`

The `randClickBox` function generates a specified number of random clicks within a defined rectangular region. These clicks occur at random positions within the rectangle, including its edges.

- `left`: The X-coordinate of the top-left corner of the rectangle.
- `top`: The Y-coordinate of the top-left corner of the rectangle.
- `right`: The X-coordinate of the bottom-right corner of the rectangle.
- `bottom`: The Y-coordinate of the bottom-right corner of the rectangle.
- `count`: The number of random clicks to generate.

### `clickDragCircle(x1, y1, x2, y2, speed, angle)`

The `clickDragCircle` function drags the mouse cursor from one point to another at a specified speed. The release point is determined by drawing a circle from the starting point and releasing the mouse at its edge in a given angle.

- `x1`: The X-coordinate of the starting point.
- `y1`: The Y-coordinate of the starting point.
- `x2`: The X-coordinate of the release point (will be calculated).
- `y2`: The Y-coordinate of the release point (will be calculated).
- `speed`: The speed of the mouse cursor during the drag operation.
- `angle`: The angle at which the cursor is released from the starting point.

These utility functions enhance your ability to perform precise mouse interactions within defined regions or along specific paths. Whether you need to click within a rectangle, generate random clicks, or create a dragging motion with precision, the `MouseContainers.js` file offers the necessary tools to streamline your mouse-based automation tasks.


