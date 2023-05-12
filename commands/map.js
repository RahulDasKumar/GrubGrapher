const QuickChart = require('quickchart-js');
const { SlashCommandBuilder } = require('discord.js');
const { MongoClient } = require('mongodb');
const config = require('../config.json');
const chart = new QuickChart();
/*
Gets the documents from a collection, and find a certain document by the hour
args-hour(which hour of the day do you want the collection from)
*/
async function retrieveDocuments(hour) {
    const uri = config.mongoDBURI
    const client = new MongoClient(uri)
    const regexPattern = `^${hour}`;
    const regex = new RegExp(regexPattern);
    //exclude id and include amount, making only the amount showing up
    const options = {
        projection: { _id: 0, amount: 1 }
    }
    console.log(regex)
    await client.connect()
    const db = client.db("Sovi")
    const Collection = db.collection("SoviOccupancy")
    const cursor = Collection.find({ time: { $regex: regex } }, options)
    const document = cursor.toArray()
    if (await Collection.countDocuments
        ({ time: { $regex: regex } }) === 0) {
        console.log("No documents found")
    }

    await client.close()

    return document;
}

async function getOccupancyByHour(hour) {
    return retrieveDocuments(hour).then(result => {
        return result[0].amount
    })
}

// Create the chart
// const chart = new QuickChart();
// chart.setConfig({
//     type: 'bar',
//     data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
// });

async function makeTheChart() {
    chart.setWidth(500)
    chart.setHeight(300);
    chart.setVersion('2');
    const hoursOpen = {
        "8am": await getOccupancyByHour(8),
        "9am": await getOccupancyByHour(9),
        "10am": await getOccupancyByHour(10),
        "11am": await getOccupancyByHour(11),
        "12pm": await getOccupancyByHour(12),
        "1pm": await getOccupancyByHour(1),
        "2pm": await getOccupancyByHour(2),
        "3pm": await getOccupancyByHour(3),
        "4pm": await getOccupancyByHour(4),
        "5pm": await getOccupancyByHour(5)

    }
    chart.setConfig({
        "type": "line",
        "data": {
            "datasets": [
                {
                    "label": "Number of People",
                    "data": [
                        hoursOpen['8am'],
                        hoursOpen['9am'],
                        hoursOpen['10am'],
                        hoursOpen['11am'],
                        hoursOpen['12pm'],
                        hoursOpen['1pm'],
                        hoursOpen['2pm'],
                        hoursOpen['3pm'],
                        hoursOpen['4pm'],
                        hoursOpen['5pm']
                    ],
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
            "labels": [
                "8-AM",
                "9-AM",
                "10-AM",
                "11-AM",
                "12-AM",
                "1-PM",
                "2-PM",
                "3-PM",
                "4-PM",
                "5-PM"
            ],

        },
        "backgroundColor": "#282b30"

    });
    console.log(chart.getUrl())
    return chart.getUrl();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('map')
        .setDescription('Testing map command'),
    async execute(interaction) {
        await interaction.deferReply();
        await makeTheChart()
        const url = await chart.getShortUrl();
        await interaction.editReply(`Here's the chart you requested: ${url}`);
    },
};