const QuickChart = require('quickchart-js');
const { SlashCommandBuilder } = require('discord.js');
const { MongoClient } = require('mongodb');
const config = require('../config.json');
const chart = new QuickChart();
const Database = require('../database')
const databaseObject = new Database("Sovi")
const CrownCommonDatabase = new Database("CrownCommons")
const ChartMaker = require('../chart')
const times = ["8-AM", "9-AM", "10-AM", "11-AM", "12-AM", "1-PM", "2-PM", "3-PM", "4-PM", "5-PM"]
/*
Gets the documents from a collection, and find a certain document by the hour
args-hour(which hour of the day do you want the collection from)
*/
async function retrieveDocuments(hour) {
    const regexPattern = `^${hour}`;
    const regex = new RegExp(regexPattern);
    const options = {
        projection: { _id: 0, amount: 1, day: 1 }
    }
    const Collection = await databaseObject.connectToCollection("SoviOccupancy")
    const cursor = Collection.find({ time: { $regex: regex } }, options)
    const document = cursor.toArray()
    if (await Collection.countDocuments
        ({ time: { $regex: regex } }) === 0) {
        console.log("No documents found")
    }
    await databaseObject.closeDatabase()
    return document;
}

async function getOccupancyByHour(hour) {
    return retrieveDocuments(hour).then(result => {
        return result[0].amount
    })
}

async function retrieveCrownCommonsDocuments(hour) {
    const regexPattern = `^${hour}`;
    const regex = new RegExp(regexPattern);
    const options = {
        projection: { _id: 0, amount: 1, day: 1 }
    }
    const Collection = await CrownCommonDatabase.connectToCollection("CrownCommonsHourlyData")
    const cursor = Collection.find({ time: { $regex: regex } }, options)
    const document = cursor.toArray()
    if (await Collection.countDocuments
        ({ time: { $regex: regex } }) === 0) {
        console.log("No documents found")
    }
    await databaseObject.closeDatabase()
    return document;
}



async function makeTheChart(data, labels) {
    const chartMaker = new ChartMaker()
    chartMaker.chartSettings(data, labels)
    return  chartMaker.getChartUrl();
}

async function getChartResultHourly() {
    const hoursOpen = [
        await getOccupancyByHour(8),
        await getOccupancyByHour(9),
        await getOccupancyByHour(10),
        await getOccupancyByHour(11),
        await getOccupancyByHour(12),
        await getOccupancyByHour(1),
        await getOccupancyByHour(2),
        await getOccupancyByHour(3),
        await getOccupancyByHour(4),
        await getOccupancyByHour(5)
    ]
    return makeTheChart(hoursOpen, times).then(result => {
        console.log(result)
        return result;
    })
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('map')
        .setDescription('Testing map command'),
    async execute(interaction) {
        await interaction.deferReply();
        const url = await getChartResultHourly()
        await interaction.editReply(`Here's the chart you requested: ${url}`);
    },
};