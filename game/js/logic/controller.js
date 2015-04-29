'use strict;'
var sequence = require('distributedlife-sequence');
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
            fire: function(x, y, data) {
                var get = state().get;
                var cooldown = get('cooldown');
                var rot = get('archer')('rotation') - Math.PI / 2;
                if (cooldown <= 0) {
                    var arrows = get('arrows');
                    var pos = get('archer')('pos');
                    arrows.push({
                        id: sequence.next('arrows'),
                        pos: {
                            x: pos('x'),
                            y: pos('y')
                        },
                        vel: {
                            x: Math.cos(rot) * 3.0,
                            y: -Math.sin(rot) * 3.0
                        },
                        velocity: 2.0,
                        rotation: rot
                    });
                    return {
                        cooldown: 5,
                        arrows: arrows
                    };
                }
            }
        }
    }
}