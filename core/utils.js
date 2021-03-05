
const sleep = (ms = 0) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(true), ms);
    });
}

module.exports = { sleep };
