// Kalman Filter implementation
class KalmanFilter {
    constructor({ R = 1, Q = 1, A = 1, B = 0, C = 1 } = {}) {
        this.R = R; // noise power desirable
        this.Q = Q; // noise power estimated
        this.A = A;
        this.B = B;
        this.C = C;
        this.cov = NaN;
        this.x = NaN; // estimated signal without noise
    }

    filter(z, u = 0) {
        if (isNaN(this.x)) {
            this.x = (1 / this.C) * z;
            this.cov = (1 / this.C) * this.Q * (1 / this.C);
        } else {
            // Compute prediction
            const predX = (this.A * this.x) + (this.B * u);
            const predCov = ((this.A * this.cov) * this.A) + this.R;

            // Kalman gain
            const K = predCov * this.C * (1 / ((this.C * predCov * this.C) + this.Q));

            // Correction
            this.x = predX + K * (z - (this.C * predX));
            this.cov = predCov - (K * this.C * predCov);
        }
        return this.x;
    }
}

const THRESHOLD_DISTANCE = 50; // Example threshold distance in pixels

const kalmanFilterX = new KalmanFilter();
const kalmanFilterY = new KalmanFilter();

window.onload = async function() {
    await webgazer.setRegression('ridge')
        .setTracker('clmtrackr')
        .setGazeListener(function(data, clock) {
            if (data && data.x !== null && data.y !== null) {
                const filteredData = filterGazePoint(data.x, data.y);
                if (filteredData) {
                    const smoothedX = kalmanFilterX.filter(filteredData.x);
                    const smoothedY = kalmanFilterY.filter(filteredData.y);
                    console.log({ x: smoothedX, y: smoothedY });
                    console.log(clock);
                    // Update scatter plot with filtered and smoothed data
                    updateScatterPlot([smoothedX], [smoothedY]);
                }
            }
        })
        .saveDataAcrossSessions(true)
        .begin();

    webgazer.showVideoPreview(true) /* shows all video previews */
        .showPredictionPoints(true) /* shows a square every 100 milliseconds where current prediction is */
        .applyKalmanFilter(true); /* Kalman Filter defaults to on. Can be toggled by user. */

    //Set up the webgazer video feedback.
    var setup = function() {
        //Set up the main canvas. The main canvas is used to calibrate the webgazer.
        var canvas = document.getElementById("plotting_canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = 'fixed';
    };
    setup();
};

// Set to true if you want to save the data even if you reload the page.
window.saveDataAcrossSessions = true;

window.onbeforeunload = function() {
    webgazer.end();
}

/**
 * Restart the calibration process by clearing the local storage and reseting the calibration point
 */
function Restart() {
    document.getElementById("Accuracy").innerHTML = "<a>Not yet Calibrated</a>";
    webgazer.clearData();
    ClearCalibration();
    PopUpInstruction();
}

/**
 * Filter gaze point with threshold distance
 */
function filterGazePoint(x, y) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    if (distance < THRESHOLD_DISTANCE) {
        return { x, y };
    }
    return null;
}

/**
 * Update scatter plot with gaze position data
 */
function updateScatterPlot(x, y) {
    var layout = {
        title: 'Live Gaze Position Scatter Plot',
        xaxis: { title: 'X Position' },
        yaxis: { title: 'Y Position' }
    };

    var trace = {
        x: x,
        y: y,
        mode: 'markers',
        type: 'scatter'
    };

    Plotly.newPlot('plotting_canvas', [trace], layout);
}
