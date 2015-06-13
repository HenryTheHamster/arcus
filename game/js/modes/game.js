'use strict;'
var sequence = require('distributedlife-sequence');

module.exports = {
  type: 'Arcus',
  deps: ['DefinePlugin', 'GameBehaviour-Controller'],
  func: function(definePlugin, controller) {
    var gravity = 50;
    var arrow_speed = 3.5;

    return function() {
      definePlugin()('StateSeed', function() {
        return {
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
        };
      });

      definePlugin()('ActionMap', function () {
        return {
          'cursor': [{target: controller().cursor}],
          'button1': [
            {target: controller().fire, onRelease: true},
            {target: controller().powerUp}
          ],
          'left': [{target: controller().left}],
          'right': [{target: controller().right}],
          'space': [{target: controller().addAlly}]
        };
      });

      definePlugin()('ServerSideUpdate', ['StateAccess'], function(state) {

        var updateArrow = function(arrow, delta) {
          arrow.velocity.y -= gravity * delta;
          arrow.position.y -= arrow_speed * arrow.velocity.y * delta;
          arrow.position.x += arrow_speed * arrow.velocity.x * delta;
          arrow.rotation = -Math.atan(arrow.velocity.y/arrow.velocity.x);
          return arrow;
        }

        var hitEnemy = function(arrow, enemy) {
          var xDist = arrow.position.x - enemy.position.x;
          var yDist = arrow.position.y - enemy.position.y;
          if(Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2)) < 20) { // MAGIC NUMBER!!
            return true;
          }
          return false;
        }

        return function (delta) {
          var arrows = state().get('arrows');
          var attackCooldown = state().get('attackCooldown');
          var enemies = state().get('enemies');
          var allies = state().get('allies');
          var archer = state().get('archer');
          var health = state().get('archer')('health');
          var score = state().get('score');
          var enemyCooldown = state().get('enemyCooldown');
          var allyCooldown = state().get('allyCooldown');
          arrows.forEach(function(a) {
            if(a.live) {
              a = updateArrow(a, delta);
              for(var i = enemies.length - 1; i >= 0; i--) {
                var e = enemies[i];
                if(hitEnemy(a, e)) {
                  e.health -= 10; // MAGIC NUMBER !!
                  a.live = false;
                  e.arrows.push(a);
                  if(e.health <= 0) {
                    score += 10; // MAGIC NUMBER !!
                    e.arrows.forEach(function(ea) {
                      ea.destroy = true;
                    });
                    e.destroy = true;
                  }
                }
              }
              if(a.position.y > 400) {
                a.live = false;
              }
            }
          });

          if(attackCooldown > 0) {
            attackCooldown = attackCooldown - 0.1;
          }
          allyCooldown -= delta;
          if(enemyCooldown > 0) {
            enemyCooldown -= delta;
          } else {
            enemyCooldown = 5;
            enemies.push({
                        id: sequence.next('enemies'),
                        position: {
                            x: 1200, // MAGIC NUMBER !!
                            y: 300
                        },
                        velocity: 100.0,
                        health: 20.0,
                        arrows: [],
                        attackCooldown: 0.0
                    });
          }

          var enemyFrontline = 1200; // MAGIC NUMBER !!
          if(enemies.length > 0) {
            enemyFrontline = enemies[0].position.x;
          }

          var allyFrontline = archer('position')('x');
          if(allies.length > 0 && allies[0].position.x > allyFrontline) {
            allyFrontline = allies[0].position.x;
          }

          allies.forEach(function(a) {
            if(enemyFrontline - a.position.x < 10) {
              if(a.attackCooldown <= 0.0 ) {
                enemies[0].health -= 5; // MAGIC NUMBER !!
                if(enemies[0].health <= 0) {
                  enemies[0].arrows.forEach(function(ea) {
                    ea.destroy = true;
                  });
                  enemies[0].destroy = true;
                }
                a.attackCooldown = 2.0; // MAGIC NUMBER !!
              }
            } else {
              a.position.x += a.velocity * delta;

            }
          });

          enemies.forEach(function(e) {
            if(e.position.x - allyFrontline < 10) {
              if(e.attackCooldown <= 0.0 ) {
                if(archer('position')('x') == allyFrontline) {
                  health -= 10; // MAGIC NUMBER !!
                } else {
                  allies[0].health -= 10; // MAGIC NUMBER !!
                  if(allies[0].health <= 0) {
                    allies[0].destroy = true;
                  }
                }
                e.attackCooldown = 2.0; // MAGIC NUMBER !!
              }
            } else {
              e.position.x -= e.velocity * delta;
              e.arrows.forEach(function(a) {
                a.position.x -= e.velocity * delta;
              });
            }
            e.attackCooldown -= delta; // MAGIC NUMBER !!
          });

          for (i = 0; i < allies.length; ++i) {
            if (allies[i].destroy) {
              allies.splice(i--, 1);
            }
          }

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
            score: score,
            archer: {
              health: health
            },
            arrows: arrows,
            attackCooldown: attackCooldown,
            enemies: enemies,
            allies: allies,
            enemyCooldown: enemyCooldown,
            allyCooldown: allyCooldown
          };
        };
      });
    };
  }
};