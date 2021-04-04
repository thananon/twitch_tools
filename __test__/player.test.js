const axios = require('axios');
const Player = require('../9armbot/player');

jest.mock('axios');

let player = new Player({ isMock: true, database_path: __dirname + '/players.json' });

test('create player test.', () => {
    player.create('user1');
    expect(player.isPlayerExists('user1')).toBeTruthy();
});

test('give coin test', () => {
    let _player = player.getOrCreatePlayer('user1');
    _player.coins = 0;
    player.giveCoins(_player.username, 100);
    expect(_player.coins).toBe(100);
});

test('deduct coin test', () => {
    let _player = player.getOrCreatePlayer('user1');
    _player.coins = 100;
    player.deductCoins(_player.username, 100);
    expect(_player.coins).toBe(0);
});

test('get online player test', () => {
    let mockOnlinePlayer = {
        data: {
            chatters: {
                viewers: [
                    "user1",
                    "user2",
                    "user3",
                    "user4",
                    "user5"
                ],
                moderators: []
            }
        }
    }
    axios.get.mockResolvedValue(mockOnlinePlayer);
    player.getOnlinePlayers().then(players => {
        expect(players.length).toBe(5);
    });
});

test('give coin all online player test', () => {
    let mockOnlinePlayer = {
        data: {
            chatters: {
                viewers: [
                    "user1",
                    "user2",
                    "user3",
                    "user4",
                    "user5"
                ],
                moderators: []
            }
        }
    }
    axios.get.mockResolvedValue(mockOnlinePlayer);
    player.giveCoinsAllOnline(10).then(total => {
        expect(total).toBe(5);
    });
});

test('drop player test', () => {
    [...Array(5).keys()].forEach(i => {
        player.getOrCreatePlayer(`user${i+1}`);
    });
    expect(player.drop('user3')).toBeTruthy();
    expect(player.drop('notExistsUser')).toBeFalsy();
    let players = player.getPlayers();
    expect(players.length).toBe(4);
    // drop all and save
    players.splice(0, players.length);
    player.saveData();
    expect(players.length).toBe(0);
});
