'use strict;'

module.exports = {
  type: 'ChampionArcher',
  deps: ['DefinePlugin', 'GameBehaviour-Controller'],
  func: function(definePlugin, controller) {
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
              a.pos.y -= a.vel.y -= 0.01;
              a.pos.x += a.vel.x;
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