'use strict';

module.exports = function (duration, onTickFunction, onDeathFunction) {
    onTickFunction = onTickFunction || function () {};
    onDeathFunction = onDeathFunction || function () {};

    var age = 0;
    var progress = function () {
        return duration === 0 ? 0.0 : age / duration;
    };

    return {
        tick: function (dt) {
            if (this.isAlive()) {
                age += dt;
                onTickFunction(dt, progress());

                if (!this.isAlive()) {
                    onDeathFunction();
                }
            }
        },
        isAlive: function () {
            return (age < duration || duration === 0);
        }
    };
};