'use strict';

module.exports = {
  type: 'StateSeed',
  func: function () {
    return {
      arcus: {
        archer: {position: {x: 100, y: 340},
                 rotation: 0,
                 aim: {x: 0, y: 0},
                 health: 100 }, 
        cursor: {x: 0, y: 0},
        arrows: [],
        attackCooldown: 90,
        enemyCooldown: 0,
        allyCooldown: 0,
        enemies: [],
        allies: [],
        data: {},
        power: 3,
        powerIncrement: 2,
        score: 0,
        world: {
          width: 1000,
          height: 800
        }
      }
    };
  }
};

