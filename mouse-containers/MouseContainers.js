/**
 * Checks if a point is contained within a rectangle, including its edges.
 *
 * @param {Number} x - The x-coordinate of the point.
 * @param {Number} y - The y-coordinate of the point.
 * @param {Number} x1 - The left edge of the rectangle.
 * @param {Number} y1 - The top edge of the rectangle.
 * @param {Number} x2 - The right edge of the rectangle.
 * @param {Number} y2 - The bottom edge of the rectangle.
 *
 * @returns {Boolean} - True if the point is within the rectangle, false otherwise.
 */
const AABB = (x, y, x1, y1, x2, y2) => Boolean(x >= x1 && x <= x2 && y >= y1 && y <= y2);

/**
 * Generates a random number between min and max, inclusive.
 *
 * @param {Number} min - The minimum value.
 * @param {Number} max - The maximum value.
 *
 * @returns {Number} - A random number within the specified range.
 */
const randBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

/**
 * Clicks within a defined rectangular region from top-left to bottom-right.
 * If 'reverse' is true, clicks occur from bottom-right to top-left.
 *
 * @param {AhkNjs} ahkNjs - The automation object.
 * @param {Number} x1 - The left edge of the rectangle.
 * @param {Number} y1 - The top edge of the rectangle.
 * @param {Number} x2 - The right edge of the rectangle.
 * @param {Number} y2 - The bottom edge of the rectangle.
 * @param {Number} gap - The gap between click points.
 * @param {Number} delay - The delay between clicks.
 * @param {Boolean} reverse - Whether to reverse the click order.
 */
const clickBox = async (ahkNjs, x1, y1, x2, y2, gap, delay, reverse) => {
    if (!ahkNjs.runner) return;

    if (!x2) x2 = x1;
    if (!y2) y2 = y1;
    if (!gap) gap = 5;

    for (let i = y1; i <= y2; i += gap) {
        for (let j = x1; j <= x2; j += gap) {
            if (AABB(j, i, x1, y1, x2, y2)) {
                await ahkNjs.click({ x: j, y: i, delay: delay ?? 2 });
            }
        }
    }
};

/**
 * Generates a specified number of random clicks within a defined rectangular region.
 * Clicks occur at random positions within the rectangle, including its edges.
 *
 * @param {AhkNjs} ahkNjs - The automation object.
 * @param {Number} x1 - The left edge of the rectangle.
 * @param {Number} y1 - The top edge of the rectangle.
 * @param {Number} x2 - The right edge of the rectangle.
 * @param {Number} y2 - The bottom edge of the rectangle.
 * @param {Number} delay - The delay between clicks.
 * @param {Number} numClicks - The number of random clicks to generate.
 */
const randClickBox = async (ahkNjs, x1, y1, x2, y2, delay, numClicks) => {
    if (!ahkNjs.runner) return;

    if (!x2) x2 = x1;
    if (!y2) y2 = y1;

    let x = randBetween(x1, x2);
    let y = randBetween(y1, y2);

    for (let i = 0; i < numClicks; i++) {
        await ahkNjs.click({ x, y, delay: delay ?? 2 });
    }
};

/**
 * Drags the mouse cursor from one point to another at a set speed.
 *
 * @param {AhkNjs} ahkNjs - The automation object.
 * @param {Number} x1 - The starting x-coordinate of the drag.
 * @param {Number} y1 - The starting y-coordinate of the drag.
 * @param {Number} angle - The angle in degrees that defines the circle's path.
 * @param {Number} distance - The radius of the circle.
 * @param {Number} speed - The speed of the mouse cursor drag.
 */
const clickDragCircle = async (ahkNjs, x1, y1, angle, distance, speed) => {
    if (!ahkNjs.runner) return;

    let x2 = Math.round(Math.cos(angle * Math.PI / 180) * distance + x1);
    let y2 = Math.round(Math.sin(angle * Math.PI / 180) * distance + y1);

    await ahkNjs.mouseClickDrag({ x1, y1, x2, y2, speed });
};

module.exports = {
    clickBox, randClickBox, clickDragCircle
};
