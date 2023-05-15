const { MongoClient } = require('mongodb');
const config = require('./config.json')
class Database {
    constructor(dbName) {
        this.dbName = dbName
        this.uri = config.mongoDBURI
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


    async closeDatabase() {
        await this.client.close()
    }





}

module.exports = Database