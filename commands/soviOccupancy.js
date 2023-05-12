const { SlashCommandBuilder } = require('discord.js');
const puppeteer = require('puppeteer');
const wait = require('node:timers/promises').setTimeout;
const nodeCron = require("node-cron");
const { MongoClient } = require('mongodb');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sovi')
        .setDescription('Will tell you how many people are in sovi.'),
    async execute(interaction) {
        // To ensure the commands work regardless of connection speed. Avoids DiscordAPIError[10062]: Unknown interaction
        await interaction.deferReply();
        await wait(2500);
        await interaction.editReply("There are " + String(await Sovi()) + " people in " + this.data.name + "!");
        //***************************************************************************************************************/
    },
};


async function Sovi() {
    //placeholder for link
    let soviDiningHall = 'https://app.safespace.io/api/display/live-occupancy/15da3cfa?view=percent--'
    //launches the browser
    let browser = await puppeteer.launch();
    //opens a new page
    let page = await browser.newPage();
    //goes to the link, waits for the dom content to be loaded(dynamicalled loaded elements)
    await page.goto(soviDiningHall, { waitUntil: 'domcontentloaded' })
    //uses promises to fix the issue of no data popping up
    await wait(500)
    //selects the number value in the website
    let data = await page.evaluate(() => {
        let occupancyData = document.querySelector('#content .text-xl').textContent;
        return occupancyData
    });
    await browser.close();
    //returns the data scraped
    return data;
}
/*
This function while run every hour that sovi is open, from 8am to 5pm
*/
const insertingData = nodeCron.schedule("0 8-17 * * *", async () => {
    const client = new MongoClient(config.mongoDBURI)
    await client.connect()
    //create new instance of a database
    const database = client.db("Sovi")
    //make the collection
    const Collection = database.collection("SoviOccupancy")
    //make the doc
    const doc = {
        amount: await Sovi(),
        month: new Date().getMonth(),
        day: new Date().getDay(),
        year: new Date().getFullYear(),
        time: new Date().toLocaleTimeString()
    }
    //add the doc to the collection
    const result = await Collection.insertOne(doc)
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
    await client.close()
})