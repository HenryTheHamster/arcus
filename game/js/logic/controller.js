'use strict';

var sequence = require('distributedlife-sequence');
var SAT = require('sat');

var max_power = 250;

function left (state) {
  return ['arcus.archer.position.x', state.get('arcus.archer.position.x') - 2];
}

function right (state) {
  return ['arcus.archer.position.x', state.get('arcus.archer.position.x') + 2];
}

function cursor (state, cx, cy) {
  var pos = state.get('arcus.archer.position');
  var rotation = Math.atan2(cy - pos('y'), cx - pos('x'));

  return {
    arcus: {
      archer: {
        rotation: rotation,
        aim: {
          x: cx,
          y: cy
        }
      },
      cursor: {
        x: cx,
        y: cy
      }
    }
  };
}

function powerUp (state) {
  var power = state.get('arcus.power');
  var increment = state.get('arcus.powerIncrement');
  if((power >= max_power && increment > 0) || (power <= 0 && increment < 0)) {
      increment = -increment;
  }
  power += increment;

  return {
    arcus: {
      power: power,
      powerIncrement: increment
    }
  };
}

function fire (state) {
  var power = state.get('arcus.power');

  if(true) {
    var increment = state.get('arcus.powerIncrement');
    var rotation = state.get('arcus.archer.rotation');
    var arrows = state.get('arcus.arrows');
    var position = state.get('arcus.archer.position');
    arrows.push({
      id: sequence.next('arrows'),
      position: new SAT.Vector(position('x'), position('y')),
      velocity: {
        x: Math.cos(rotation) * power,
        y: -Math.sin(rotation) * power
      },
      rotation: rotation,
      live: true
    });
    return {
      arcus: {
        power: 0,
        powerIncrement: Math.abs(increment),
        attackCooldown: 5,
        arrows: arrows
      }
    };
  }
}

function addAlly (state) {
  var allies = state.get('arcus.allies');
  var allyCooldown = state.get('arcus.allyCooldown');
  if(allyCooldown <= 0) {
      allies.push({
          id: sequence.next('allies'),
          position: {
              x: -10,  // magic NUMBER !!
              y: 300 // magic NUMBER !!
          },
          velocity: 100.0,
          health: 25
      });
      allyCooldown = 2.0; // MAGIC NUMBER !!
  }
  return {
    arcus: {
      allies: allies,
      allyCooldown: allyCooldown
    }
  };
}

module.exports = {
  type: 'GameBehaviour-Controller',
  func: function() {
    return {
      left: left,
      right: right,
      cursor: cursor,
      powerUp: powerUp,
      fire: fire,
      addAlly: addAlly
    };
  }
};