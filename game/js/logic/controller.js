'use strict;'
var sequence = require('distributedlife-sequence');

var max_power = 250;
module.exports = {
    type: 'GameBehaviour-Controller',
    deps: ['StateAccess'],
    func: function(state) {
        
        return {
            left: function(data) {
                var get = state().get;
                var pos = get('archer')('position');
                return {
                    archer: {
                        position: {
                            x: pos('x') - 2,
                        }
                    }
                }
            },
            right: function(data) {
                var get = state().get;
                var pos = get('archer')('position');
                return {
                    archer: {
                        position: {
                            x: pos('x') + 2,
                        }
                    }
                }
            },
            cursor: function(cx, cy, data) {
                var get = state().get;
                var pos = get('archer')('position');
                var rotation = Math.atan2(cy - pos('y'), cx - pos('x'));
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
                
                var get = state().get;
                var power = get('power');
                var increment = get('powerIncrement');
                if((power >= max_power && increment > 0) || (power <= 0 && increment < 0)) {
                    increment = -increment;
                }
                power += increment;

                return {
                    power: power,
                    powerIncrement: increment
                }
            },
            fire: function() {
                
                var get = state().get;
                var power = get('power');
                if(true) {
                    var increment = get('powerIncrement');
                    // console.log(pow);
                    var rotation = get('archer')('rotation');
                    var arrows = get('arrows');
                    var position = get('archer')('position');
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
                        power: 0,
                        powerIncrement: Math.abs(increment),
                        attackCooldown: 5,
                        arrows: arrows
                    };
                }
            },
            addAlly: function() {
                var get = state().get;
                var allies = get('allies');
                var allyCooldown = get('allyCooldown');
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
                    allies: allies,
                    allyCooldown: allyCooldown
                };
            }
        }
    }
}