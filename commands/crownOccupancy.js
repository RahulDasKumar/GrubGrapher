const { SlashCommandBuilder } = require('discord.js');
const puppeteer = require('puppeteer');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crown')
        .setDescription('Will tell you how many people are in crown.'),
    async execute(interaction) {
        // To ensure the commands work regardless of connection speed. Avoids DiscordAPIError[10062]: Unknown interaction
        await interaction.deferReply();
        await wait(2500);
        await interaction.editReply("There are " + String(await crown()) + " people in " + this.data.name + "!");
        //****************************************************************************************************************/
    },
};

async function crown() {
    let crownDiningHall = 'https://app.safespace.io/api/display/live-occupancy/7a9c0a24?view=number'
    let browser = await puppeteer.launch();
    let page = await browser.newPage();
    await page.goto(crownDiningHall, { waitUntil: 'domcontentloaded' })
    await wait(500)
    let data = await page.evaluate(() => {
        let occupancyData = document.querySelector('#content .text-xl').textContent;
        return occupancyData
    });
    // console.log(data)
    await browser.close();
    return data;
};