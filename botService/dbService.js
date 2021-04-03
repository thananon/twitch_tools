const MongoClient = require('mongodb').MongoClient;
const request = require('request');

var database;
class dbService {
    constructor(dbUrl, dbName) {
        this.dbUrl = dbUrl,
        this.dbName = dbName,
        this.twitchAPI = {}
    }

    async connect() {
        var client = await MongoClient.connect(this.dbUrl);
        database = client.db(this.dbName);
    }

    async setTwitchAPI(clientID) {
        this.twitchAPI.clientID = clientID;
    }

    requestTwitchAPI(endpoint, method) {
        let twitchAPI = "https://api.twitch.tv/kraken/" + endpoint;
        let options = {
            url: twitchAPI,
            method: method,
            headers: {
                "Client-ID": this.twitchAPI.clientID,
                "Accept": "application/vnd.twitchtv.v5+json"
            }
        }

        return new Promise(function (resolve, reject) {
            request(options, function (error, res, body) {
                if (!error && res.statusCode == 200) {
                    resolve(body);
                } else {
                    reject(error);
                }
            });
        });
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

    async setPlayerTwitchID(_twitchUsername, twitchID) {
        var user = await this.getPlayerbyUsername(_twitchUsername);
        if (user == undefined) return (undefined);

        var query = {
            twitchUsername: _twitchUsername
        }

        user.twitchID = twitchID;
        var userData = {
            $set: user
        }

        await database.collection("users").updateOne(query, userData);
    }

    async getPlayerbyUsername(_twitchUsername) {
        var query = { twitchUsername: _twitchUsername }

        var res = await database.collection("users").find(query).toArray();
        if (res == undefined) return (undefined);
        if (res.length == 0) return (undefined);

        return (res[0]);
    }

    async getPlayerbyID(_twitchID) {
        var query = { twitchID: _twitchUsername }

        var res = await database.collection("users").find(query).toArray();
        if (res == undefined) return (undefined);
        if (res.length == 0) return (undefined);

        return (res[0]);
    }

    async getIDbyUsername(_twitchUsername) {
        if (this.twitchAPI.clientID == undefined) {
            console.log("Set Twitch client id, before request");
            return;
        }

        let res = await this.requestTwitchAPI(`users?login=${_twitchUsername}`, "GET");
        let data = JSON.parse(res);
        if (data.users == undefined) return (undefined);
        if (data.users.length == 0) return (undefined);
        return (data.users[0]._id);
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
    }

    async setTwitchCoins(_twitchUsername, amount) {
        var user = await this.getPlayerbyUsername(_twitchUsername);
        if (user == undefined) return (undefined);

        var query = {
            twitchUsername: _twitchUsername
        }

        user.wallets.twitch = amount;
        var userData = {
            $set: user
        }

        await database.collection("users").updateOne(query, userData);
        return (amount);
    }

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
            { $sort: { "wallets.twitch": -1 } }
        ];

        var res = await database.collection("users").aggregate(query).toArray();
        if (res == undefined) return ([]);
        if (res.length == 0) return ([]);

        res = res.splice(0, n);
        return (res);
    }

    async migrateDatabase(jsonDB) {
        let counter = 0;
        let size = jsonDB.length;

        for (var key in jsonDB) {
            counter++;
            await this.createPlayer(jsonDB[key].username);
            await this.setTwitchCoins(jsonDB[key].username, jsonDB[key].coins);
            console.log(`Migrating ${counter / size * 100}% (${counter}/${size})`);
        }
    }
}

module.exports = dbService
