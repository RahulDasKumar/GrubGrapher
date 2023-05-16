const { SlashCommandBuilder } = require('discord.js');
const puppeteer = require('puppeteer');
const wait = require('node:timers/promises').setTimeout;
const Database = require('../database')
const CrownCommonDatabase = new Database("CrownCommons")
const nodeCron = require("node-cron");

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

async function getDocuments(CollectionName) {
    const Collection = await CrownCommonDatabase.connectToCollection(CollectionName)
    //find all documents with the current day, prevents the bug where inconsitent data shows up
    const cursor = Collection.find({}, { day: 1 })
    const document = cursor.toArray()
    return document;
}


async function moveDataBetweenCollections(SourceCollectionName, DestinationCollectionName) {
    const documents = await getDocuments(SourceCollectionName).then(async (result) => {
        await CrownCommonDatabase.closeDatabase()
        return result;
    })
    console.log(documents)
    if (documents.length === 20) {
        const Collection = await CrownCommonDatabase.connectToCollection(SourceCollectionName)
        const FirstTenDocumentd = await Collection.find({}, { day: 1 }).limit(10).toArray()
        const documentIdsToDelete = FirstTenDocumentd.map(doc => doc._id)
        const newCollection = await CrownCommonDatabase.connectToCollection(DestinationCollectionName)
        await newCollection.insertMany(FirstTenDocumentd)
        await Collection.deleteMany({ _id: { $in: documentIdsToDelete } });
        await CrownCommonDatabase.closeDatabase()
    }
    else
        console.log("Not enough documents to do anything here")
}


const updatingHourlyOccupancy = nodeCron.schedule("30 8-17 * * *",async()=>{
    const Collection = await CrownCommonDatabase.connectToCollection("CrownCommonsHourlyData")
    //make the doc
    const doc = {
        amount: await crown(),
        month: new Date().getMonth(),
        day: new Date().getDay(),
        year: new Date().getFullYear(),
        time: new Date().toLocaleTimeString()
    }
    //add the doc to the collection
    const result = await Collection.insertOne(doc)
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
    await CrownCommonDatabase.closeDatabase()
})

const movingDataBetweenCollections = nodeCron.schedule("20 18 * * *", async () => {
    await moveDataBetweenCollections("CrownCommonsHourlyData","CrownCommonsTotalData")
})
