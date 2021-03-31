
const sleep = (ms = 0) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(true), ms);
    });
}

const roll = (critRate, _player = null) => {
    dice = Math.random() * 100;
    if(_player && _player.rollCounter >= 0) {
        _player.rollCounter++;
        if(_player.rollCounter >= 80) {
            let rateUp =  (_player.rollCounter == 100)? 100 : _player.rollCounter / 10;
            if(dice < critRate + rateUp) {
                _player.rollCounter = 0;
                return true;
            }
        }
    }
    return dice < critRate;
}

module.exports = {
    sleep,
    roll
};
