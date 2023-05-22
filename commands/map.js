const { SlashCommandBuilder } = require('discord.js');
const Database = require('../database')
const databaseObject = new Database("Sovi")
const CrownCommonDatabase = new Database("CrownCommons")
const ChartMaker = require('../chart')
const times = ["8-AM", "9-AM", "10-AM", "11-AM", "12-AM", "1-PM", "2-PM", "3-PM", "4-PM", "5-PM"]
const days = { "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 0 }

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
    const timesNumber = [8, 9, 10, 11, 12, 1, 2, 3, 4, 5]
    const hoursOpen = []
    for (let i = 0; i < timesNumber.length; i++) {
        hoursOpen.push(await databaseObject.retrieveDocumentsByHour(timesNumber[i], "SoviOccupancy"))
    }
    return await makeTheChart(hoursOpen, times)
}

async function CrownCommonsHourlyChart() {
    const timesNumber = [8, 9, 10, 11, 12, 1, 2, 3, 4, 5]
    const hoursOpen = []
    for (let i = 0; i < timesNumber.length; i++) {
        hoursOpen.push(await CrownCommonDatabase.retrieveDocumentsByHour(timesNumber[i], "CrownCommonsHourlyData"))
    }
    return await makeTheChart(hoursOpen, times)
}

async function SoviWeeklyAverageChart(){
    const dayKeys = Object.entries(days)
    const averageValues = []
    for (const [key, value] of dayKeys) {
        console.log(key, value)
        averageValues.push(await databaseObject.getAverageOccupanysByDay(value, "TotalSoviOccupancy"))
    }
    return await makeTheChart(averageValues, Object.keys(days)).then(result => {
        console.log(result)
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