'use strict;'

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
          cooldown: 0
        };
      });

      definePlugin()('ActionMap', function () {
        return {
          'cursor': [{target: controller().cursor}],
          'button1': [{target: controller().fire}]
        };
      });

      definePlugin()('ServerSideUpdate', ['StateAccess'], function(state) {
        return function (delta) {
          var arrows = state().get('arrows');
          var cooldown = state().get('cooldown');
          arrows.forEach(function(a) {
            if(a.pos.y < 500) {
              a.vel.y -= gravity * delta;
              a.pos.y -= arrow_speed * a.vel.y * delta;
              a.pos.x += arrow_speed * a.vel.x * delta;
            }
          });

          if(cooldown > 0) {
            cooldown = cooldown - 0.1;
          }

          return {
            arrows: arrows,
            cooldown: cooldown
          };
        };
      });
    };
  }
};