'use strict;'
var sequence = require('distributedlife-sequence');

var max_power = 250;
module.exports = {
  type: 'GameBehaviour-Controller',
  func: function() {
      
    return {
      left: function(state, data) {
        var pos = state.for('arcus').get('archer')('position');
        return {
          arcus: {
            archer: {
              position: {
                x: pos('x') - 2,
              }
            }
          }
        }
      },
      right: function(state, data) {
        var pos = state.for('arcus').get('archer')('position');
        return {
          arcus: {
            archer: {
              position: {
                x: pos('x') + 2,
              }
            }
          }
        }
      },
      cursor: function(state, cx, cy, data) {
        var pos = state.for('arcus').get('archer')('position');
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
      },
      powerUp: function(state, data) {
          var power = state.for('arcus').get('power');
          var increment = state.for('arcus').get('powerIncrement');
          if((power >= max_power && increment > 0) || (power <= 0 && increment < 0)) {
              increment = -increment;
          }
          power += increment;

          return {
            arcus: {
              power: power,
              powerIncrement: increment
            }
          }
      },
      fire: function(state) {
        var power = state.for('arcus').get('power');
        if(true) {
          var increment = state.for('arcus').get('powerIncrement');
          // console.log(pow);
          var rotation = state.for('arcus').get('archer')('rotation');
          var arrows = state.for('arcus').get('arrows');
          var position = state.for('arcus').get('archer')('position');
          arrows.push({
            id: sequence.next('arrows'),
            position: {
              x: position('x'),
              y: position('y')
            },
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
      },
      addAlly: function() {
          var allies = state.for('arcus').get('allies');
          var allyCooldown = state.for('arcus').get('allyCooldown');
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
    }
  }
}