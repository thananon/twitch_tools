
const { sleep } = require('../core/utils');

test('sleep test', async () => {
    const startTime = Date.now();
    await sleep(1000);
    const endTime = Date.now() - 1000;
    expect(endTime >= startTime).toBeTruthy();
});
