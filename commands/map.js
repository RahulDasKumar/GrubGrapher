const { SlashCommandBuilder } = require('discord.js');
const Database = require('../database')
const databaseObject = new Database("Sovi")
const CrownCommonDatabase = new Database("CrownCommons")
const ChartMaker = require('../chart')
const times = ["8-AM", "9-AM", "10-AM", "11-AM", "12-AM", "1-PM", "2-PM", "3-PM", "4-PM", "5-PM"]


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
    return makeTheChart(hoursOpen, times).then(result => {
        console.log(result)
        return result;
    })
}

async function CrownCommonsHourlyChart() {
    const timesNumber = [8, 9, 10, 11, 12, 1, 2, 3, 4, 5]
    const hoursOpen = []
    for (let i = 0; i < timesNumber.length; i++) {
        hoursOpen.push(await CrownCommonDatabase.retrieveDocumentsByHour(timesNumber[i], "CrownCommonsHourlyData"))
    }
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