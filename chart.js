const QuickChart = require('quickchart-js');


class chart {
    constructor() {
        this.chart = new QuickChart()
        this.chart.setWidth(500)
        this.chart.setHeight(300);
        this.chart.setVersion('2');
    }


    chartSettings(data, label) {
        this.chart.setConfig({
            "type": "line",
            "data": {
                "datasets": [
                    {
                        "label": "Number of People",
                        "data": data
                        ,
                        "fill": true,
                        "spanGaps": false,
                        "lineTension": 0.4,
                        "pointRadius": 3,
                        "pointHoverRadius": 3,
                        "categoryPercentage": 0.8,
                        "type": "line",
                        "borderColor": "rgb(64 78 237)",
                        "backgroundColor": "rgba(0, 231, 255, 0.09)",
                        "borderWidth": 3
                    }
                ],
                "labels": label,

            },
            "backgroundColor": "#282b30"
        })
    }

    async getChartUrl() {
        return await this.chart.getShortUrl()
    }

    getLongerChartUrl() {
        return this.chart.getUrl()
    }


}


module.exports = chart