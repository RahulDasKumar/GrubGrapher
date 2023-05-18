const { SlashCommandBuilder } = require('discord.js');
const puppeteer = require('puppeteer');
const wait = require('node:timers/promises').setTimeout;
const nodeCron = require("node-cron");
const { MongoClient } = require('mongodb');
const config = require('../config.json');
const Database = require('../database')
const SoviDatabase = new Database("Sovi")
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
    await wait(750)
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
Retireves all documents from a Collection
args-CollectionName
*/
async function getDocuments(CollectionName) {
    const Collection = await SoviDatabase.connectToCollection(CollectionName)
    //find all documents with the current day, prevents the bug where inconsitent data shows up
    const cursor = Collection.find({}, { day: 1 })
    const document = cursor.toArray()
    return document;
}
/*
Allocates data so the database for daily hours stays updated
args-SourceCollectionName(Collection where data is being taken from), 
DestinationCollectionName(Collection where data is being inputed to)
*/
async function moveDataBetweenCollections(SourceCollectionName, DestinationCollectionName) {
    const documents = await getDocuments(SourceCollectionName).then(async (result) => {
        await SoviDatabase.closeDatabase()
        return result;
    })
    if (documents.length === 20) {
        const Collection = await SoviDatabase.connectToCollection(SourceCollectionName)
        const FirstTenDocumentd = await Collection.find({}, { day: 1 }).limit(10).toArray()
        const documentIdsToDelete = FirstTenDocumentd.map(doc => doc._id)
        const newCollection = await SoviDatabase.connectToCollection(DestinationCollectionName)
        await newCollection.insertMany(FirstTenDocumentd)
        await Collection.deleteMany({ _id: { $in: documentIdsToDelete } });
        await SoviDatabase.closeDatabase()
    }
    else
        console.log("Not enough documents to do anything here")
}
/*
This function while run every hour that sovi is open, from 8am to 5pm
*/
const insertingData = nodeCron.schedule("0 8-17 * * *", async () => {
    console.log("Inserting data")
    const Collection = await SoviDatabase.connectToCollection("SoviOccupancy")
    const doc = {
        amount: await Sovi().then(result=>{
            return result;
        }),
        month: new Date().getMonth(),
        day: new Date().getDay(),
        year: new Date().getFullYear(),
        time: new Date().toLocaleTimeString()
    }
    console.log(doc['amount'])
    const result = await Collection.insertOne(doc)
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
    await SoviDatabase.closeDatabase()

})
/*
Runs at 6pm everyday to check if database needs relocating
*/
const movingDataBetweenCollections = nodeCron.schedule("0 18 * * *", async () => {
    await moveDataBetweenCollections("SoviOccupancy", "TotalSoviOccupancy")
})
