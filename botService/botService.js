const dbService = require("./dbService");
const io = require("socket.io")(3000);
const db = new dbService("mongodb://localhost:27017/", "twitch_tools");

const fs = require('fs');
const twitchClientID = fs.readFileSync("twitch_client_id", "utf8");

async function main() {
    await db.connect();
    db.setTwitchAPI(twitchClientID);

    /*const fs = require("fs");
    let jsonData = fs.readFileSync("../players.json", "utf8");
    let data = JSON.parse(jsonData);
    await db.migrateDatabase(data);*/
}
main();

io.on("connection", socket => {
    socket.on("", (data) => {
        console.log(data);
    });

    socket.on("getTwitchCoinsByUsername", async (data) => {
        var user = await db.getPlayerbyUsername(data.twitchUsername);
        if (user == undefined) {
            await db.createPlayer(data.twitchUsername);
            
            socket.emit("getTwitchCoinsByUsername", {
                success: false,
                cause: `ไม่พบ username <${data.twitchUsername}> โปรดใส่ Twitch username..`,
                data: {
                    twitchUsername: data.twitchUsername,
                    channelID: data.channelID
                }
            });
            return;
        }

        if (user.twitchID == undefined) {
            let userID = await db.getIDbyUsername(data.twitchUsername);
            if (userID != undefined) await db.setPlayerTwitchID(data.twitchUsername, userID);
        }

        var coins = user.wallets.twitch;
        socket.emit("getTwitchCoinsByUsername", {
            success: true,
            data: {
                twitchUsername: data.twitchUsername,
                coins: coins,
                channelID: data.channelID
            }
        });
    });

    socket.on("getTopTwitchCoins", async (data) => {
        var top9 = await db.getTopTwitchCoins(9);
        socket.emit("getTopTwitchCoins", {
            success: true,
            data: {
                leaders: top9,
                channelID: data.channelID
            }
        });
    });
});