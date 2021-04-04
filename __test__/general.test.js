
const { roll } = require('../core/utils');

test('roll guarantee test', () => {
    const player = {
        version: "1.1",
        username: "TestUser",
        level: 1,
        coins: 0,
        status: "online",
        exp: 0,
        rollCounter: 0,
        role: "viewer"
    };
    player.rollCounter = 99;
    const result = roll(1, player);

    expect(result).toBeTruthy();
    expect(player.rollCounter).toBe(0);
});
