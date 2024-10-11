function endStudy() {
    isTracking = false; // Pause tracking
    plotGraph();
    downloadGraph();
}

function downloadGraph() {
    const canvas = document.getElementById('gaze-graph');
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'gaze_graph.png';
    link.click();
}
