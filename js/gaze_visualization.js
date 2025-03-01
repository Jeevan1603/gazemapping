let gazeData = [];
let roi = document.getElementById('roi');

function startWebGazer() {
    webgazer.setGazeListener(function(data, elapsedTime) {
        if (data == null) return;
        gazeData.push(data);
        drawGazePoint(data.x, data.y);
        updateROI();
    }).begin();
}

function drawGazePoint(x, y) {
    const canvas = document.getElementById('gaze-points');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
}

function updateROI() {
    // Calculate the distribution of gaze positions
    const cellSize = 50;
    const numCellsX = Math.ceil(800 / cellSize);
    const numCellsY = Math.ceil(600 / cellSize);
    const gazeDistribution = Array(numCellsX).fill().map(() => Array(numCellsY).fill(0));

    for (const gaze of gazeData) {
        const cellX = Math.floor(gaze.x / cellSize);
        const cellY = Math.floor(gaze.y / cellSize);
        gazeDistribution[cellX][cellY]++;
    }

    // Identify the cell with the highest concentration of gaze positions
    let maxCount = 0;
    let roiX = 0;
    let roiY = 0;

    for (let i = 0; i < numCellsX; i++) {
        for (let j = 0; j < numCellsY; j++) {
            if (gazeDistribution[i][j] > maxCount) {
                maxCount = gazeDistribution[i][j];
                roiX = i * cellSize;
                roiY = j * cellSize;
            }
        }
    }

    // Draw a rectangle around the ROI
    roi.style.left = roiX + 'px';
    roi.style.top = roiY + 'px';
    roi.style.width = cellSize + 'px';
    roi.style.height = cellSize + 'px';
}