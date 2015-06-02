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
          archer: {position: {x: 100, y: 300},
                   rotation: 0,
                   aim: {x: 0, y: 0} },
          cursor: {x: 0, y: 0},
          arrows: [],
          attackCooldown: 90,
          enemyCooldown: 0,
          enemies: [],
          data: {},
          power: 3,
          powerIncrement: 2,
          world: {
            width: 1000,
            height: 800
          }
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
              a.velocity.y -= gravity * delta;
              a.position.y -= arrow_speed * a.velocity.y * delta;
              a.position.x += arrow_speed * a.velocity.x * delta;
              a.rotation = -Math.atan(a.velocity.y/a.velocity.x);
              for(var i = enemies.length - 1; i >= 0; i--) {
                var xDist = a.position.x - enemies[i].position.x;
                var yDist = a.position.y - enemies[i].position.y;
                if(Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2)) < 20) {
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
              if(a.position.y > 500) {
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
                        position: {
                            x: 1200,
                            y: 300
                        },
                        velocity: 100.0,
                        health: 20.0,
                        arrows: []
                    });
          }
          enemies.forEach(function(e) {
            e.position.x -= e.velocity * delta;
            e.arrows.forEach(function(a) {
              a.position.x -= e.velocity * delta;
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
            arrows: arrows,
            attackCooldown: attackCooldown,
            enemies: enemies,
            enemyCooldown: enemyCooldown
          };
        };
      });
    };
  }
};