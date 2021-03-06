const fs = require('fs');
const migrate = require('../core/migrate');
const { playerMigrations } = require('../core/migrations');

const newSchema = {
    version: "1.1",
    username: "TestUser",
    level: 1,
    coins: 0,
    status: "online",
    exp: 0,
    rollCounter: 0,
    role: "viewer"
};

test('player migration test.', () => {
    let oldSchema = {
        username: "TestUser",
        level: 1,
        coins: 0,
        status: "online",
        exp: 0,
        role: "viewer"
    };
    oldSchema = migrate(oldSchema, playerMigrations, "1.1");
    expect(oldSchema).toEqual(newSchema);
});

test('player migration test with exists database.', () => {
    const oldSchema = {
        username: "TestUser",
        level: 1,
        coins: 0,
        status: "online",
        exp: 0,
        role: "viewer"
    };
    let players = [oldSchema];
    let data = JSON.stringify(players);
    fs.writeFileSync('migrate.json', data, 'utf8');
    let load = fs.readFileSync('migrate.json', 'utf8');
    players = JSON.parse(load).map(el => migrate(el, playerMigrations, "1.1"));
    fs.unlinkSync('migrate.json');

    expect(players[0]).toEqual(newSchema);
});
