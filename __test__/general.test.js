
const { sleep, roll } = require('../core/utils');

test('sleep test', async () => {
    const startTime = Date.now();
    await sleep(1000);
    const endTime = Date.now() - 1000;
    expect(endTime >= startTime).toBeTruthy();
});

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
