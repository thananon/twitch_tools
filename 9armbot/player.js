const axios = require('axios')
const fs = require('fs');

class Player{

    players = []
    options = {
        database_path: "./players.json",
        channel: "armzi",
        sync_player_time: 6000 // milliseconds
    }
    constructor(options = {}) {
        this.options = {
            ...this.cloneDeep(this.options),
            ...options
        }
        try{
            let save_data = fs.readFileSync(this.options.database_path, 'utf8');
            this.players = JSON.parse(save_data);
        }catch(err){
            this.players = []
        }
        this.syncPlayers()
        setInterval(()=>{
            this.syncPlayers()
        },this.options.sync_player_time)
    }

    cloneDeep(data){
        let _data = JSON.stringify(data) 
        // *หมายเหตุ ที่ต้อง stringify ก่อนที่ retrun กลับ 
        // เพราะต้องการให้ค่า object ที่กลับออกไปไม่ให้มี reference กับ data เดิม
        // * https://lodash.com/docs/4.17.15#cloneDeep
        return JSON.parse(_data)
    }

    saveData(){
        let data = JSON.stringify(this.players);
        fs.writeFileSync(this.options.database_path, data, 'utf8');
    }

    syncPlayers(){
        axios.get(`${process.env.twitch_api}/group/user/${this.options.channel}/chatters`).then((res)=>{
            let data = res.data
            // console.log(res)
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

        }).catch((err)=>{
            console.log('[syncPlayers] Error', err)
        })
    }

    async online(){
        let { data } = await axios.get(`${process.env.twitch_api}/group/user/${this.options.channel}/chatters`)
        return data.chatters
    }

    create(username, level = 1, coins = 0, status = "offline"){
        let player = {
            username: username,
            level: level,
            coins: coins,
            status: status,
            exp: 0,
            role: "viewer"
        } 
        if(!this.players.find(x=>x.username == player.username)){
            this.players.push(player)
        }
    }

    getPlayers(sortBy = null, sort = "asc"){
        let players = this.players
        if(sortBy){
            sort = sort.toLocaleLowerCase()
            switch (sort) {
                case "asc":
                    players.sort((a,b)=>a[sortBy]-b[sortBy])
                    break;
                case "desc":
                    players.sort((a,b)=>b[sortBy]-a[sortBy])
                    break;
                default:
                    players.sort((a,b)=>a[sortBy]-b[sortBy])
                    break;
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
        if(player){
            return player
        }
        return null
    }

    giveCoinsToPayer(username, amount){
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
        if(!Number(amount)){
            return false
        }
        amount = Number(amount)
        let player = this.players.find(x=>x.username == username)
        if(player){
            if(player.coins > amount){
                player.coins-=amount
            }else{
                return false
            }
        }else{
            return false
        }

        return true
    }

}

module.exports = Player
