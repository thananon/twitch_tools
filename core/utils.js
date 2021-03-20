
const sleep = (ms = 0) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(true), ms);
    });
}

const roll = (critRate, _player = null) => {
    dice = Math.random() * 100;
    if (!_player) {
        return dice < critRate;
    } else {
        _player.rollCounter++;
        if (_player.rollCounter == 100) {
            _player.rollCounter = 0;
            return true; // 100% guarantee rate
        }
        let rateUp = 0;
        if (_player.rollCounter >= 80) {
            rateUp = _player.rollCounter / 10;
        }
        let catchIt = dice < (critRate + rateUp);
        if (catchIt) {
            // reset roll counter
            _player.rollCounter = 0;
        }
        return catchIt;
    }
}

module.exports = {
    sleep,
    roll
};
