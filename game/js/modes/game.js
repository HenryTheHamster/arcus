'use strict;'
var sequence = require('distributedlife-sequence');

module.exports = {
  type: 'ChampionArcher',
  deps: ['DefinePlugin', 'GameBehaviour-Controller'],
  func: function(definePlugin, controller) {
    var gravity = 50;
    var arrow_speed = 3.5;

    return function() {
      definePlugin()('StateSeed', function() {
        return {
          archer: {pos: {x: 100, y: 450},
                   rotation: 0,
                   aim: {x: 0, y: 0} },
          cursor: {x: 0, y: 0},
          arrows: [],
          attackCooldown: 90,
          enemyCooldown: 0,
          enemies: [],
          data: {},
          power: 3,
          powerInc: 2
        };
      });

      definePlugin()('ActionMap', function () {
        return {
          'cursor': [{target: controller().cursor}],
          'button1': [
            {target: controller().fire, onRelease: true},
            {target: controller().powerUp}
          ]
        };
      });

      definePlugin()('ServerSideUpdate', ['StateAccess'], function(state) {
        return function (delta) {
          var arrows = state().get('arrows');
          var attackCooldown = state().get('attackCooldown');
          var enemies = state().get('enemies');
          var enemyCooldown = state().get('enemyCooldown');

          arrows.forEach(function(a) {
            if(a.live) {
              a.vel.y -= gravity * delta;
              a.pos.y -= arrow_speed * a.vel.y * delta;
              a.pos.x += arrow_speed * a.vel.x * delta;
              a.rot = -Math.atan(a.vel.y/a.vel.x);
              for(var i = enemies.length - 1; i >= 0; i--) {
                var xDist = a.pos.x - enemies[i].pos.x;
                var yDist = a.pos.y - enemies[i].pos.y;
                if(Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2)) < 40) {
                  var e = enemies[i];
                  e.health -= 10;
                  a.live = false;
                  e.arrows.push(a);
                  if(e.health <= 0) {
                    e.arrows.forEach(function(ea) {
                      ea.destroy = true;
                    });
                    e.destroy = true;
                  }
                }
              }
              if(a.pos.y > 500) {
                a.live = false;
              }
            }
          });

          if(attackCooldown > 0) {
            attackCooldown = attackCooldown - 0.1;
          }

          if(enemyCooldown > 0) {
            enemyCooldown -= delta;
          } else {
            enemyCooldown = 5;
            enemies.push({
                        id: sequence.next('enemies'),
                        pos: {
                            x: 1200,
                            y: 500
                        },
                        col: {
                            x: 10,
                            y: 10
                        },
                        velocity: 100.0,
                        health: 20.0,
                        arrows: []
                    });
          }
          enemies.forEach(function(e) {
            e.pos.x -= e.velocity * delta;
            e.arrows.forEach(function(a) {
              a.pos.x -= e.velocity * delta;
            });
          });

          for (i = 0; i < enemies.length; ++i) {
            if (enemies[i].destroy) {
              enemies.splice(i--, 1);
            }
          }

          for (i = 0; i < arrows.length; ++i) {
            if (arrows[i].destroy) {
              arrows.splice(i--, 1);
            }
          }

          return {
            arrowsrows: arrows,
            attackCooldown: attackCooldown,
            enemies: enemies,
            enemyCooldown: enemyCooldown
          };
        };
      });
    };
  }
};