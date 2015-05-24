'use strict;'
var sequence = require('distributedlife-sequence');

var max_power = 250;
module.exports = {
    type: 'GameBehaviour-Controller',
    deps: ['StateAccess'],
    func: function(state) {
        
        return {
            cursor: function(cx, cy, data) {
                var get = state().get;
                var pos = get('archer')('pos');
                var rotation = Math.atan2(cy - pos('y'), cx - pos('x')) + Math.PI / 2;
                return {
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
                    },
                };
            },
            powerUp: function(data) {
                // console.log('fire');
                var get = state().get;
                var pow = get('power');
                var inc = get('powerInc');
                if((pow >= max_power && inc > 0) || (pow <= 0 && inc < 0)) {
                    inc = -inc;
                }
                pow += inc;

                return {
                    power: pow,
                    powerInc: inc
                }
            },
            fire: function() {
                console.log('Not Fire');
                var get = state().get;
                var pow = get('power');
                if(true) {
                    var inc = get('powerInc');
                    // console.log(pow);
                    var rot = get('archer')('rotation') - Math.PI / 2;
                    var arrows = get('arrows');
                    var pos = get('archer')('pos');
                    arrows.push({
                        id: sequence.next('arrows'),
                        pos: {
                            x: pos('x'),
                            y: pos('y')
                        },
                        vel: {
                            x: Math.cos(rot) * pow,
                            y: -Math.sin(rot) * pow
                        },
                        rot: rot,
                        live: true
                    });
                    return {
                        power: 0,
                        powerInc: Math.abs(inc),
                        attackCooldown: 5,
                        arrows: arrows
                    };
                }
            }
        }
    }
}