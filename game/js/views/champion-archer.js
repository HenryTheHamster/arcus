'use strict';



var PIXI = require('pixi.js');

module.exports = {
  type: 'View',
  deps: ['Element', 'Dimensions', 'StateTracker', 'StateTrackerHelpers', 'DefinePlugin'],
  func: function (element, dimensions, tracker, helpers, define) {
    var input, context;
    var arrows = {};
    var enemies = {};
    var $ = require('zepto-browserify').$;
    var thePower = function (state) { return state.power; };
    var theArcher = function (state) { return state.archer; };
    var theEnemies = function (state) { return state.enemies; };
    var theArrows = function (state) { return state.arrows; };
    var theData = function (state) { return state.data; };

    var updateArrow = function (current, prior) {
      arrows[current.id].position.x = current.position.x;
      arrows[current.id].position.y = current.position.y;
      arrows[current.id].rotation = current.rotation;
    };

    var updateEnemy = function (current, prior) {
      enemies[current.id].position.x = current.position.x;
      enemies[current.id].position.y = current.position.y;
    };

    var updateArcher = function (current, prior, archer, aim) {
      archer.position.x = current.position.x;
      archer.position.y = current.position.y;
      aim.position.x = current.aim.x;
      aim.position.y = current.aim.y;
      archer.rotation = current.rotation;
      console.log(current.aim.x, current.aim.y);

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


    var createArcher = function () {
      var archer = new PIXI.Graphics();
      archer.pivot.y = 8;
      archer.pivot.x = 16;
      archer.beginFill(0x252222)
      archer.drawRect(0, 0, 32, 16);
      return archer;

    }

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


    var offset;
    return function (dims) {

      var stage = new PIXI.Container();
      var renderer = PIXI.autoDetectRenderer(dims.usableWidth, dims.usableHeight);
      $('#' + element()).append(renderer.view);

      var archer = createArcher();
      var aim = createAim();

      stage.addChild(createWorld());
      stage.addChild(archer);
      stage.addChild(aim);

      tracker().onElementAdded(theArrows, addArrow, function(data){}, stage);
      tracker().onElementAdded(theEnemies, addEnemy, function(data){}, stage);
      tracker().onElementChanged(theArrows, updateArrow);
      tracker().onElementChanged(theEnemies, updateEnemy);
      tracker().onChangeOf(theArcher, updateArcher, [archer, aim]);

      define()('OnEachFrame', function () {
        return function () {
          renderer.render(stage);
        };
      });
      
    }
  }
}