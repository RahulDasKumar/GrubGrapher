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
    return document.then(result => {
        return result[0].amount
    });
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
    return document.then(result => {
        return result[0].amount
    });
}


/*
Creates the chart
args-data(for the plot lines) labels-for the x axis labels on the chart
*/
async function makeTheChart(data, labels) {
    const chartMaker = new ChartMaker()
    chartMaker.chartSettings(data, labels)
    return chartMaker.getChartUrl();
}

async function SoviHourlyChart() {
    const hoursOpen = [
        await retrieveDocuments(8),
        await retrieveDocuments(9),
        await retrieveDocuments(10),
        await retrieveDocuments(11),
        await retrieveDocuments(12),
        await retrieveDocuments(1),
        await retrieveDocuments(2),
        await retrieveDocuments(3),
        await retrieveDocuments(4),
        await retrieveDocuments(5),
    ]
    return makeTheChart(hoursOpen, times).then(result => {
        console.log(result)
        return result;
    })
}

async function CrownCommonsHourlyChart() {
    const hoursOpen = [
        await retrieveCrownCommonsDocuments(8),
        await retrieveCrownCommonsDocuments(9),
        await retrieveCrownCommonsDocuments(10),
        await retrieveCrownCommonsDocuments(11),
        await retrieveCrownCommonsDocuments(12),
        await retrieveCrownCommonsDocuments(1),
        await retrieveCrownCommonsDocuments(2),
        await retrieveCrownCommonsDocuments(3),
        await retrieveCrownCommonsDocuments(4),
        await retrieveCrownCommonsDocuments(5),
    ]

    return makeTheChart(hoursOpen, times).then(result => {
        console.log(result)
        return result;
    })

}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hourly')
        .setDescription('Testing hourly command')
        .addSubcommand(subcommand=>
            subcommand.setName('sovi')
            .setDescription('Displays a graph of the hourly population in Sovi Dining hall from 8am to 5pm'))
            .addSubcommand(subcommand=>
                subcommand.setName('crown')
                    .setDescription('Displays a graph of the hourly population in Crown Commons from 8am to 5pm')),
    async execute(interaction) {
        await interaction.deferReply();
        if(interaction.options.getSubcommand() === 'sovi'){
            const url = await SoviHourlyChart()
            await interaction.editReply(`Here's the chart you requested: ${url}`);
        }
        if (interaction.options.getSubcommand() === 'crown'){
            const url = await CrownCommonsHourlyChart()
            await interaction.editReply(`Heres the chart you requested: ${url} `)
        }
    },
};