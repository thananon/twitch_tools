const MongoClient = require('mongodb').MongoClient;

var database;
class dbService {
    constructor(dbUrl, dbName) {
        this.dbUrl = dbUrl,
            this.dbName = dbName
    }

    async connect() {
        var client = await MongoClient.connect(this.dbUrl);
        database = client.db(this.dbName);
    }

    async createPlayer(_twitchUsername) {
        var user = await this.getPlayerbyUsername(_twitchUsername);
        if (user != undefined) return (undefined);

        var userData = {
            twitchUsername: _twitchUsername,
            wallets: {
                discord: 0,
                twitch: 0
            }
        };

        await database.collection("users").insertOne(userData);
        return (userData);
    }

    async removePlayer(_twitchUsername) {
        var query = { twitchUsername: _twitchUsername };
        await database.collection("users").deleteOne(query);
    }

    async getPlayerbyUsername(_twitchUsername) {
        var query = { twitchUsername: _twitchUsername }

        var res = await database.collection("users").find(query).toArray();
        if (res == undefined) return (undefined);
        if (res.lenth == 0) return (undefined);

        return (res[0]);
    }

    async getTotalCoins(_twitchUsername) {
        var query = { twitchUsername: _twitchUsername };

        var res = await database.collection("users").find(query).toArray();
        if (res == undefined) return (undefined);
        if (res.length == 0) return (undefined);

        var totalCoins = 0;
        for (var key in res[0].wallets) {
            totalCoins += res[0].wallets[key];
        }

        return (totalCoins);
    }

    async giveTwitchCoins(_twitchUsername, amount) {
        var user = await this.getPlayerbyUsername(_twitchUsername);
        if (user == undefined) return (undefined);

        var query = {
            twitchUsername: _twitchUsername
        }

        user.wallets.twitch += amount;
        var userData = {
            $set: user
        }

        await database.collection("users").updateOne(query, userData);
        return (amount);
    };

    async deductTwitchCoins(_twitchUsername, amount) {
        var user = await this.getPlayerbyUsername(_twitchUsername);
        if (user == undefined) return (undefined);

        var query = {
            twitchUsername: _twitchUsername
        }

        user.wallets.twitch -= amount;
        var userData = {
            $set: user
        }

        await database.collection("users").updateOne(query, userData);
        return (amount);
    }

    async giveTwitchCoinsToAll(amount) {
        var res = await database.collection("users").find().toArray();
        if (res == undefined) return (undefined);
        if (res.length == 0) return (undefined);

        for (var key in res) {
            var currentUser = res[key];
            await this.giveTwitchCoins(currentUser.twitchUsername, amount);
        }
    }

    async getTopTwitchCoins(n) {
        var query = [
            { $unwind: "$wallets" },
            { $sort: { "wallets.twitch": -1 } },
            {
                $group: {
                    _id: "$_id",
                    twitchUsername: { "$first": "$twitchUsername" },
                    wallets: { $push: "$wallets" }
                }
            }
        ];

        var res = await database.collection("users").aggregate(query).toArray();
        if (res == undefined) return ([]);
        if (res.length == 0) return ([]);

        res = res.splice(n);
        return(res);
    }

    async migrateDatabase(database) {

    }
}


async function main() {
    const db = new dbService("mongodb://localhost:27017/", "twitch_tools");

    await db.connect();

    await db.createPlayer("frogkungth");

    var user = await db.getPlayerbyUsername("frogkungth");
    var coins = await db.getTopTwitchCoins(1);
    console.log(coins);
}

main();