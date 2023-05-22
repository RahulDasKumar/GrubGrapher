const Database = require('../database')
const SoviDatabase = new Database("Sovi")
const CrownCommonDatabase = new Database('CrownCommons')
const days = { "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 0 }
const ChartMaker = require('../chart')
const { SlashCommandBuilder } = require('discord.js')



/*
Creates the chart
args-data(for the plot lines) labels-for the x axis labels on the chart
*/
async function makeTheChart(data, labels) {
    const chartMaker = new ChartMaker()
    chartMaker.chartSettings(data, labels)
    return chartMaker.getChartUrl();
}

async function SoviWeeklyAverageChart() {
    const dayKeys = Object.entries(days)
    const averageValues = []
    for (const [key, value] of dayKeys) {
        console.log(key, value)
        averageValues.push(await SoviDatabase.getAverageOccupanysByDay(value, "TotalSoviOccupancy"))
    }
    return await makeTheChart(averageValues, Object.keys(days)).then(result => {
        console.log(result)
    })
}

async function CrownWeeklyAverageChart() {
    const dayKeys = Object.entries(days)
    const averageValues = []
    for (const [key, value] of dayKeys) {
        console.log(key, value)
        averageValues.push(await CrownCommonDatabase.getAverageOccupanysByDay(value, "CrownCommonsTotalData"))
    }
    return await makeTheChart(averageValues, Object.keys(days)).then(result => {
        console.log(result)
    })
}


module.exports = {
    data : new SlashCommandBuilder()
    .setName('weekly')
    .setDescription('Find the average occupancy throughout the whole week!')
        .addSubcommand(subcommand=>
            subcommand.setName('sovi')
            .setDescription('Find the average occupancy from Monday-Sunday in Sovi!')
    )
    .addSubcommand(subcommand=>
        subcommand.setName('crown')
            .setDescription('Find the average occupancy from Monday-Sunday in Crown Commons!')),
    async execute(interaction){
        await interaction.deferReply();
        if(interaction.options.getSubcommand() === 'sovi'){
            const url = await SoviWeeklyAverageChart()
            await interaction.editReply(`Here's the weekly average for sovi: ${url}`)
        }
        if (interaction.options.getSubcommand() === 'crown') {
            const url = await SoviWeeklyAverageChart()
            await interaction.editReply(`Here's the weekly average for crown: ${url}`)
        }
    }

}