'use strict';
var mixin = require('lodash').mixin;


var PIXI = require('pixi.js');

module.exports = {
  type: 'View',
  deps: ['Element', 'Dimensions', 'StateTracker', 'StateTrackerHelpers', 'DefinePlugin', 'RegisterEffect'],
  func: function (element, dimensions, tracker, helpers, define, effect) {
    var input, context;
    var tempEffect = require('../../../supporting-libs/src/temporary_effect');
    var mainTemplate = require('../../views/overlays/arcus.jade');
    var arrows = {};
    var enemies = {};
    var $ = require('zepto-browserify').$;
    var thePower = function (state) { return state.power; };
    var theArcher = function (state) { return state.archer; };
    var theEnemies = function (state) { return state.enemies; };
    var theArrows = function (state) { return state.arrows; };
    var theData = function (state) { return state.data; };
    var theScore = function (state) { return state.score; };

    var updateArrow = function (current, prior) {
      arrows[current.id].position.x = current.position.x;
      arrows[current.id].position.y = current.position.y;
      arrows[current.id].rotation = current.rotation;
    };

    var updateEnemy = function (current, prior) {
      enemies[current.id].position.x = current.position.x;
      enemies[current.id].position.y = current.position.y;
    };

    var updatePower = function (current, prior, power) {
      power.scale.x = current;
    };

    var updateScore = function (current, prior) {
      $('#score')[0].innerText = current;
    }

    var updateArcher = function (current, prior, archer, power) {
      archer.position.x = current.position.x;
      archer.position.y = current.position.y;
      power.position.x = current.aim.x;
      power.position.y = current.aim.y - 20;
      archer.rotation = current.rotation;
      $('#health')[0].innerText = current.health;
      // console.log(current.aim.x, current.aim.y);

    }

    var createArrow = function () {
      var arrow = new PIXI.Graphics();
      arrow.beginFill(0x6D6B68);
      arrow.drawRect(0, 0, 20, 2);
      return arrow;
    };

    var createAim = function () {
      var aim = new PIXI.Graphics();
      aim.beginFill(0xA48262);
      aim.drawCircle(0, 0, 5);

      return aim;
    };

    var createEnemy = function () {
      var enemy = new PIXI.Graphics();
      enemy.beginFill(0xB16161);
      enemy.drawCircle(0, 0, 20);

      return enemy;
    };

    var createPower = function () {
      var power = new PIXI.Graphics();
      power.beginFill(0xB16161);
      power.drawRect(0, 0, 1, 5);

      return power;
    };

    var createArcher = function () {
      var archer = new PIXI.Graphics();
      archer.pivot.y = 8;
      archer.pivot.x = 16;
      archer.beginFill(0x252222)
      archer.drawRect(0, 0, 32, 16);
      return archer;

    }

    var createGround = function () {
      var world = new PIXI.Graphics();
      world.beginFill(0x636363);
      world.drawRect(0, 400, tracker().get(theWorldDimensions).width, tracker().get(theWorldDimensions).height - 400);

      return world;
    };

    var createWorld = function () {
      var world = new PIXI.Graphics();
      world.beginFill(0xF2ECDE);
      world.drawRect(0, 0, tracker().get(theWorldDimensions).width, tracker().get(theWorldDimensions).height);

      return world;
    };

    var theWorldDimensions = function (state) {
      return state.world;
    };

    var addArrow = function (current, prior, stage) {
      arrows[current.id] = createArrow();
      stage.addChild(arrows[current.id]);
    };

    var addEnemy = function (current, prior, stage) {
      enemies[current.id] = createEnemy();
      stage.addChild(enemies[current.id]);
    };

    var killEnemy = function (current, prior) {
      mixin(enemies[prior.id], tempEffect(5, 
        function() {
          enemies[prior.id].alpha -= 0.01;
        }, function() {
          delete enemies[prior.id];    
        }));
      effect().register(enemies[prior.id]);
    };

    var killArrow = function (current, prior) {
      mixin(arrows[prior.id], tempEffect(5, 
        function() {
          arrows[prior.id].alpha -= 0.01;
        }, function() {
          delete arrows[prior.id];    
        }));
      effect().register(arrows[prior.id]);
    };


    var offset;
    return function (dims) {

      $('#overlay').append(mainTemplate());
      var stage = new PIXI.Container();
      var renderer = PIXI.autoDetectRenderer(dims.usableWidth, dims.usableHeight);
      $('#' + element()).append(renderer.view);

      var archer = createArcher();
      var aim = createAim();
      var power = createPower();

      stage.addChild(createWorld());
      stage.addChild(createGround());
      stage.addChild(archer);
      stage.addChild(aim);
      stage.addChild(power);

      tracker().onElementAdded(theArrows, addArrow, function(data){}, stage);
      tracker().onElementAdded(theEnemies, addEnemy, function(data){}, stage);
      tracker().onElementChanged(theArrows, updateArrow);
      tracker().onElementChanged(theEnemies, updateEnemy);
      tracker().onElementRemoved(theEnemies, killEnemy);
      tracker().onElementRemoved(theArrows, killArrow);
      tracker().onChangeOf(theArcher, updateArcher, [archer, power]);
      tracker().onChangeOf(thePower, updatePower, power);
      tracker().onChangeOf(theScore, updateScore);

      define()('OnEachFrame', function () {
        return function () {
          renderer.render(stage);
        };
      });
      
    }
  }
}