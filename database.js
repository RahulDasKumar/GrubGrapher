const { MongoClient } = require('mongodb');
const config = require('./config.json')
class Database {
    constructor(dbName) {
        this.dbName = dbName
        this.uri = "mongodb+srv://rahulDas:Redbud11@cluster0.zyyhnk9.mongodb.net/?retryWrites=true&w=majority"
        this.client = new MongoClient(this.uri)

    }

    async connectToCollection(CollectionName) {
        try {
            const newMongoClient = await this.client.connect()
            const db = newMongoClient.db(this.dbName)
            const Collection = db.collection(CollectionName)
            return Collection;
        }
        catch (error) {
            console.error('Connection to database failed', error)
            process.exit();
        }
    }


    async getAverageOccupanysByDay(dayIndex, CollectionName) {
        let average = 0;
        const options = {
            projection: { _id: 1, amount: 1, day: 1 }
        }
        await this.client.connect()
        const db = this.client.db(this.dbName)
        const Collection = db.collection(CollectionName)
        const cursor = Collection.find({ day: dayIndex })
        const document = cursor.toArray()
        await Collection.countDocuments()
        await this.client.close()
        return document.then(result => {
            for (let i = 0; i < result.length; i++) {
                average += parseFloat(result[i].amount)
            }
            console.log(average / result.length)
            return average / result.length
        })
    }

    async retrieveDocumentsByHour(hour, CollectionName) {
        const regexPattern = `^${hour}`;
        const regex = new RegExp(regexPattern);
        const options = {
            projection: { _id: 0, amount: 1, day: 1 }
        }
        await this.client.connect()
        const db = this.client.db(this.dbName)
        const Collection = db.collection(CollectionName)
        const cursor = Collection.find({ time: { $regex: regex } }, options)
        const document = await cursor.toArray()
        await Collection.countDocuments()
        return document[0].amount;
    }




    async closeDatabase() {
        await this.client.close()
    }





}

module.exports = Database