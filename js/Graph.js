function plotGraph() {
    const ctx = document.getElementById('gaze-graph').getContext('2d');
    const timeData = gazeData.map(data => data.time);
    const xData = gazeData.map(data => data.x);
    const yData = gazeData.map(data => data.y);

    const gazeTimePeriod = Date.now() - startTime;
    const gazeTimePeriodElement = document.getElementById('gaze-time-period');
    gazeTimePeriodElement.textContent = 'Gaze Time Period: ' + gazeTimePeriod + 'ms';

    const chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Gaze Position',
                data: gazeData.map(data => ({ x: data.x, y: data.y })),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom'
                },
                y: {
                    type: 'linear',
                    position: 'left'
                }
            }
        },
        plugins: [ChartDataLabels],
    });

    const downloadButton = document.createElement('button');
    downloadButton.textContent = 'Download as PDF';
    downloadButton.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        const pdf = new jsPDF();

        canvas.width = chart.width;
        canvas.height = chart.height;

        const canvasContext = canvas.getContext('2d');
        canvasContext.drawImage(chart.canvas, 0, 0, chart.width, chart.height);

        html2canvas(canvas).then((canvas) => {
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            pdf.addImage(imgData, 'JPEG', 0, 0, chart.width, chart.height);
            pdf.save('gaze_graph.pdf');
        });
    });

    document.body.appendChild(downloadButton);
}
