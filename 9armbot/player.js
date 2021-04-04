const axios = require('axios');
const fs = require('fs');
const migrate = require('../core/migrate');
const { playerMigrations } = require('../core/migrations');

class Player {

    players = []
    raffleList = []
    rafflePrice = 10
    raffleOn = false

    auctionOn = false
    auctionBid = 0
    auctionLeader = ""

    options = {
        database_path: "./players.json",
        channel: `${process.env.tmi_channel_name}`,
        sync_player_time: 15000, // milliseconds
        isMock: false // for testing.
    }
    version = "1.1";

    static #instance = null

    constructor(options = {}) {
        this.options = {
            ...this.cloneDeep(this.options),
            ...options
        }
        try {
            let save_data = fs.readFileSync(this.options.database_path, 'utf8');
            this.players = JSON.parse(save_data).map(el => migrate(el, playerMigrations, this.version));
        } catch(err) {
            this.players = []
        }
        this.syncPlayers()
        setInterval(()=>{
            this.syncPlayers()
        },this.options.sync_player_time)
    }

    static getInstance() {
        if (this.#instance === null) {
            this.#instance = new Player()
        }
        return this.#instance
    }

    cloneDeep(data){
        let _data = JSON.stringify(data) 
        return JSON.parse(_data)
    }

    saveData(){
        let data = JSON.stringify(this.players);
        fs.writeFileSync(this.options.database_path, data, 'utf8');
    }

    async syncPlayers(){
        try {
            const {data} = await axios.get(`${process.env.twitch_api}/group/user/${this.options.channel}/chatters`);
            // console.log(data)
            // let chatter_count = data.chatter_count
            let chatters = data.chatters
            for(let username of chatters.viewers){
                let player = this.getOrCreatePlayer(username);
                player.role = 'viewer';
            }
            // moderator users
            for (let username of chatters.moderators) {
                if (username === process.env.tmi_username) {
                    continue;
                }
                let player = this.getOrCreatePlayer(username);
                player.role = 'moderator';
            }

            // set offline status
            const onlineUsers = [...chatters.viewers, ...chatters.moderators];
            for (let p of this.players) {
                if (onlineUsers.some(x => x.toLowerCase() === p.username)) {
                    p.status = "online";
                } else {
                    p.status = "offline";
                }
            }

            // save
            this.saveData()


        } catch (err) {
            if (!this.options.isMock) // for ignore mock test
                console.error('[syncPlayers] Error', err);
        }
    }

    async getOnlinePlayers(){
        await this.syncPlayers();
        return this.players.filter(x => x.status === "online");
    }

    // useful when custom create
    isPlayerExists(username) {
        username = username.toLowerCase()
        return this.players.some(x => x.username === username);
    }

    create(username, level = 1, coins = 0, status = "online") {
        username = username.toLowerCase()
        const player = {
            version: this.version,
            username: username,
            level: level,
            coins: coins,
            status: status,
            exp: 0,
            rollCounter: 0,
            role: "viewer"
        };
        this.players.push(player);
        return player;
    }

    drop(username) {
        username = username.toLowerCase()
        return this.players.some((p, i) => {
            return p.username === username && this.players.splice(i, 1);
        });
    }

    getPlayers(sortBy = null, sort = "asc"){
        let players = this.players
        if(sortBy){
            sort = sort.toLocaleLowerCase()
            if(sort === "desc"){
                players.sort((a,b)=>b[sortBy]-a[sortBy]);
            }else{
                players.sort((a,b)=>a[sortBy]-b[sortBy]);
            }
        }
        return players
    }

    getCoinTop(top = 10){
        return this.getPlayers("coins", "desc").slice(0, top);
    }

    getOrCreatePlayer(username) {
        return this.getOrNullPlayer(username) || this.create(username);
    }

    getOrNullPlayer(username) {
        username = username.toLowerCase()
        let player = this.players.find(x => x.username === username);
        return player || null
    }

    startRaffle(amount) {
        this.raffleList = []
        this.rafflePrice = Number(amount)
        this.raffleOn = true
        console.log (`raffle started with ${amount} per entry.`)
        // TODO: ANNOUCE ON KILLFEED
    }

    endRaffle() {
        this.raffleOn = false;
    }

    joinRaffle(username, total_tickets) {
        let purchased = 0
        while (this.deductCoins(username, this.rafflePrice) && purchased < total_tickets) {
            this.raffleList.push(username)
            purchased++
        }
        console.log(`${username} purchased ${purchased} raffle tickets`)
        return purchased
    }

    drawRaffle() {
        let rand = Math.floor(Math.random() * this.raffleList.length)
        let winner = this.raffleList[rand]
        console.log(`winner is ${winner}`)
        this.raffleList.splice(rand, 1)
        return winner
    }

    openAuction() {
        this.auctionOn = true
        this.auctionBid = 0
        this.auctionLeader = "armzi"
    }

    closeAuction() {
        this.auctionOn = false
    }

    auction(username, amount) {
        amount = Number(amount)
        let player = this.getOrNullPlayer(username);
        if (!player) return false
        if (player.coins && player.coins >= amount && amount > this.auctionBid) {
            this.auctionLeader = username
            this.auctionBid = amount
            return true
        }
        return false
    }

    giveCoins(username, amount){
        username = username.toLocaleLowerCase()
        amount = Number(amount)
        let player = this.getOrCreatePlayer(username);
        if (amount && amount > 0) {
            player.coins += amount;
            return true;
        }
        return false;
    }

    async giveCoinsAllOnline(amount) {
        amount = Number(amount);
        let ps = await this.getOnlinePlayers();
        return ps.filter(p => this.giveCoins(p.username, amount)).length;
    }

    deductCoins(username, amount) {
        amount = Number(amount);
        let player = this.getOrCreatePlayer(username);
        if (amount && player.coins >= amount) {
            player.coins -= amount;
            return true;
        }
        return false;
    }

    isAdmin(username){
        return username === process.env.admin_username;
    }

    isMod(username) {
        return username === process.env.tmi_username || this.players.some(p => p.username === username && p.role === "moderator");
    }
}

module.exports = Player
