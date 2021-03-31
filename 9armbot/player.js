const axios = require('axios');
const fs = require('fs');
const migrate = require('../core/migrate');
const { playerMigrations } = require('../core/migrations');

class Player{

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
        sync_player_time: 15000 // milliseconds
    }
    version = "1.1";

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
                this.create(username,1,0,"online")
            }

            // set offline status
            for(let player of this.players){
                if(!chatters.viewers.find(x=>x == player.username)){
                    player.status = "offline"
                }
            }

            // save
            this.saveData()


        } catch (err) {
            console.error('[syncPlayers] Error', err)
        }
    }

    async getOnlinePlayers(){
        let { data } = await axios.get(`${process.env.twitch_api}/group/user/${this.options.channel}/chatters`)
        return data.chatters.viewers;
    }

    create(username, level = 1, coins = 0, status = "offline"){
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
        if(!this.players.find(x=>x.username == player.username)){
            this.players.push(player)
        }
    }

    getPlayers(sortBy = null, sort = "asc"){
        let players = this.players
        if(sortBy){
            sort = sort.toLocaleLowerCase()
            if(sort == "desc"){
                players.sort((a,b)=>b[sortBy]-a[sortBy]);
            }else{
                players.sort((a,b)=>a[sortBy]-b[sortBy]);
            }
        }
        return players
    }

    getCoinTop(top = 10){
        let getPlayers = this.getPlayers("coins", "desc")
        return this.cloneDeep(getPlayers.splice(0,top>0?top:0))
    }


    getPlayerByUsername(username){
        let player = this.players.find(x=>x.username == username)
        return player || null;
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
        let player = this.players.find(x=>x.username == username)
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
        if(!Number(amount)){
            return
        }
        amount = Number(amount)
        let player = this.players.find(x=>x.username == username)
        if(player){
            player.coins+=amount
        }else{
            this.create(username,1,amount, "online")
        }
    }

    deductCoins(username, amount) {
        amount = Number(amount)
        let player = this.players.find(x=>x.username == username)
        if(amount && player && player.coins >= amount){
            player.coins-=amount
            return true
        }
        return false
    }

    isAdmin(username){
        if(username == process.env.admin_username){
            return true
        }
        return false
    }

}

module.exports = Player
