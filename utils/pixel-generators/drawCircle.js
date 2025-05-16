function drawCircle(centerX, centerY, radius, color, pixelData) {
    let x = radius;
    let y = 0;
    let decisionOver2 = 1 - x; // Decision criterion divided by 2

    while (x >= y) {
        pixelData.push(`${centerX + x},${centerY + y},${color}`);
        pixelData.push(`${centerX + y},${centerY + x},${color}`);
        pixelData.push(`${centerX - y},${centerY + x},${color}`);
        pixelData.push(`${centerX - x},${centerY + y},${color}`);
        pixelData.push(`${centerX - x},${centerY - y},${color}`);
        pixelData.push(`${centerX - y},${centerY - x},${color}`);
        pixelData.push(`${centerX + y},${centerY - x},${color}`);
        pixelData.push(`${centerX + x},${centerY - y},${color}`);

        y++;
        if (decisionOver2 <= 0) {
            decisionOver2 += 2 * y + 1; // Change in decision criterion for y -> y+1
        } else {
            x--;
            decisionOver2 += 2 * (y - x) + 1; // Change for y -> y+1, x -> x-1
        }
    }
}

module.exports = drawCircle;
