function generatePixels() {
    const width = 200;
    const height = 200;
    const brightness = 0.5;

    const pixelData = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const r = Math.floor(Math.random() * 256 * brightness).toString(16).padStart(2, '0');
            const g = Math.floor(Math.random() * 256 * brightness).toString(16).padStart(2, '0');
            const b = Math.floor(Math.random() * 256 * brightness).toString(16).padStart(2, '0');
            const rgb = `${r}${g}${b}`;
            pixelData.push(`${x},${y},${rgb}`);
        }
    }
    return pixelData;
}

module.exports = generatePixels;
