'use strict';
var sequence = require('distributedlife-sequence');
var SAT = require('sat');
var gravity = 50;
var arrow_speed = 3.5;

module.exports = {
  type: 'ServerSideUpdate',
  func: function() {

    var hitEnemy = function(arrow, enemy) {
      return SAT.pointInPolygon(arrow.position, enemy.collision);
    }

    var updateArrow = function(arrow, delta) {
      arrow.velocity.y -= gravity * delta;
      arrow.position.y -= arrow_speed * arrow.velocity.y * delta;
      arrow.position.x += arrow_speed * arrow.velocity.x * delta;
      arrow.rotation = -Math.atan(arrow.velocity.y/arrow.velocity.x);
      return arrow;
    }

    return function (state, delta) {

      var arrows = state.for('arcus').get('arrows');
      var attackCooldown = state.for('arcus').get('attackCooldown');
      var enemies = state.for('arcus').get('enemies');
      var allies = state.for('arcus').get('allies');
      var archer = state.for('arcus').get('archer');
      var health = state.for('arcus').get('archer')('health');
      var score = state.for('arcus').get('score');
      var enemyCooldown = state.for('arcus').get('enemyCooldown');
      var allyCooldown = state.for('arcus').get('allyCooldown');
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
        attackCooldown = attackCooldown - 0.1; // MAGIC NUMBER !!
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
                        y: 350 // MAGIC NUMBER !!
                    },
                    collision: new SAT.Polygon(new SAT.Vector(0,0), [
                      new SAT.Vector(0,0),
                      new SAT.Vector(100,0),
                      new SAT.Vector(50,75)
                    ]),
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
          // e.collision.position.x -= e.velocity * delta;
          e.collision.pos.x = e.position.x;
          e.collision.pos.y = e.position.y;
          e.arrows.forEach(function(a) {
            a.position.x -= e.velocity * delta;
          });
        }
        e.attackCooldown -= delta; // MAGIC NUMBER !!
      });

      for (var i = 0; i < allies.length; ++i) {
        if (allies[i].destroy) {
          allies.splice(i--, 1);
        }
      }

      for (var i = 0; i < enemies.length; ++i) {
        if (enemies[i].destroy) {
          enemies.splice(i--, 1);
        }
      }

      for (var i = 0; i < arrows.length; ++i) {
        if (arrows[i].destroy) {
          arrows.splice(i--, 1);
        }
      }

      return {
        arcus: {
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
        }
      };

    }
  }
}
