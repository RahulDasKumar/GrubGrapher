const QuickChart = require('quickchart-js');
const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

// Create the chart
const chart = new QuickChart();
chart.setConfig({
    type: 'bar',
    data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
});


module.exports = {
    data: new SlashCommandBuilder()
        .setName('map')
        .setDescription('Testing map command'),
    async execute(interaction) {
        const url = await chart.getShortUrl();
        // To ensure the commands work regardless of connection speed. Avoids DiscordAPIError[10062]: Unknown interaction
        await interaction.deferReply();
        await wait(2500);
        await interaction.editReply(`Here's the chart you requested: ${url}`);
        //***************************************************************************************************************/
    },
};