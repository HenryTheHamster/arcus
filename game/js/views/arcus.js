'use strict';
var mixin = require('lodash').mixin;


var PIXI = require('pixi.js');

module.exports = {
  type: 'View',
  deps: ['Element', 'Dimensions', 'StateTracker', 'StateTrackerHelpers', 'DefinePlugin', 'RegisterEffect', 'Window', '$'],
  func: function (element, dimensions, tracker, helpers, define, effect, window, $) {
    var input, context;
    var tempEffect = require('../supporting-libs/temporary_effect');
    var mainTemplate = require('../../views/overlays/arcus.jade');
    var textureArray = [];
    var trunkImages = [];
    for (var i=1; i <= 5; i++) {
         var texture = PIXI.Texture.fromImage("./game/js/views/assets/horse/horse_and_body" + i + ".png");
         textureArray.push(texture);
    };
    for (var i=1; i <= 6; i++) {
         var trunkSprite = "./game/js/views/assets/background/trunk" + i + ".png";
         trunkImages.push(trunkSprite);
    };
    var arrows = {};
    var enemies = {};
    var enemyCollisions = {};
    var allies = {};
    var trunks = new Array(6);
    var thePower = function (state) { return state.arcus.power; };
    var theArcher = function (state) { return state.arcus.archer; };
    var theEnemies = function (state) { return state.arcus.enemies; };
    var theAllies = function (state) { return state.arcus.allies; };
    var theArrows = function (state) { return state.arcus.arrows; };
    var theData = function (state) { return state.arcus.data; };
    var theScore = function (state) { return state.arcus.score; };

    var updateArrow = function (current, prior) {
      arrows[current.id].position.x = current.position.x;
      arrows[current.id].position.y = current.position.y;
      arrows[current.id].rotation = current.rotation;
    };

    var updateEnemy = function (current, prior) {
      enemies[current.id].position.x = current.position.x;
      enemies[current.id].position.y = current.position.y;
    };

    var updateEnemyCollision = function (current, prior) {
      enemyCollisions[current.id].position.x = current.collision.pos.x;
      enemyCollisions[current.id].position.y = current.collision.pos.y;
    };

    var updateAlly = function (current, prior) {
      allies[current.id].position.x = current.position.x;
      allies[current.id].position.y = current.position.y;
    };

    var updatePower = function (current, prior, power) {
      power.scale.x = current;
    };

    var updateScore = function (current, prior) {
      $('#score')[0].innerText = current;
    }

    var updateLeaves = function (front, back, mountains, width) {
      if(mountains.position.x >= 0) {
        mountains.position.x = -mountains.width + width;
      }
      if(front.position.x >= 0) {
        front.position.x = -front.width + width;
      }
      if(back.position.x >= 0) {
        back.position.x = -back.width + width;
      }
      for (var i=0; i < trunks.length; i++) {
        if(trunks[i].position.x >= width) {
          trunks[i].position.x = -(Math.random() * width);
        }
        trunks[i].position.x += 1;
      }
      mountains.x += 0.2;
      front.position.x += 1;
      back.position.x += 0.5;
    }

    var updateArcher = function (current, prior, archer, horse, power) {
      archer.position.x = current.position.x - 20;
      archer.position.y = current.position.y;
      horse.position.x = current.position.x - 85;
      horse.position.y = current.position.y;
      power.position.x = current.aim.x;
      power.position.y = current.aim.y - 20;
      archer.rotation = current.rotation;
      $('#health')[0].innerText = current.health;
    }

    var createTrunk = function (width) {
      var trunk = PIXI.Sprite.fromImage(trunkImages[Math.floor((Math.random() * 6))]);
      trunk.position.x += (Math.random() * 2 * width) - width;
      trunk.scale.x = 0.8;
      trunk.scale.y = 0.8;
      return trunk;
    }

    var createMountains = function () {
      var mountains = PIXI.Sprite.fromImage('./game/js/views/assets/background/mountains.png');
      mountains.scale.x = 1.6;
      mountains.scale .y= 1.6;
      mountains.position.y += 170;
      mountains.tint = 0xABA89F;
      return mountains;
    }

    var createArrow = function () {
      var arrow = new PIXI.Graphics();
      arrow.beginFill(0x6D6B68);
      arrow.drawRect(0, 0, -20, 2);
      arrow.beginFill(0xFF0000);
      arrow.drawCircle(0,0,5);
      return arrow;
    };

    var createAim = function () {
      var aim = new PIXI.Graphics();
      aim.beginFill(0xA48262);
      aim.drawCircle(0, 0, 5);

      return aim;
    };

    var createEnemy = function () {
      var enemy = new PIXI.extras.MovieClip(textureArray);
      enemy.animationSpeed = 0.25;

      enemy.play();

      return enemy;
    };

    var createArcher = function () {
      var archer = new PIXI.Sprite.fromImage('./game/js/views/assets/archer/arms.png');
      archer.pivot.y = 32;
      archer.pivot.x = 20;
      archer.scale.x = 0.8;
      archer.scale.y = 0.8;
      return archer;

    }

    var createArchersHorseAndBody = function () {
      var horse_and_body = new PIXI.Graphics();
      var horse = new PIXI.extras.MovieClip(textureArray);
      horse.animationSpeed = 0.25;
      horse.play();
      horse_and_body.addChild(horse);
      return horse_and_body;
    }

    var createAlly = function () {
      var ally = new PIXI.Graphics();
      ally.beginFill(0xB16161);
      ally.drawCircle(0, 0, 20);

      return ally;
    };

    var createPower = function () {
      var power = new PIXI.Graphics();
      power.beginFill(0xB16161);
      power.drawRect(0, 0, 1, 5);

      return power;
    };


    var createGround = function (width, height) {
      var world = new PIXI.Graphics();
      world.beginFill(0x636363);
      world.drawRect(0, 400, width, height - 400);

      return world;
    };

    var createFrontLeaves = function () {
      var leaves = new PIXI.Sprite.fromImage('./game/js/views/assets/background/foliage01.png');
      leaves.scale.x = 1.5;
      leaves.scale.y = 1.5;
      return leaves;
    };

    var createBackLeaves = function () {
      var leaves = new PIXI.Sprite.fromImage('./game/js/views/assets/background/foliage02.png');
      leaves.scale.x = 1.5;
      leaves.scale.y = 1.5;
      return leaves;
    };

    var createWorld = function (width, height) {
      var world = new PIXI.Graphics();
      // world.beginFill(0xF2ECDE);
      world.beginFill(0x6900FF);
      world.drawRect(0, 0, width, height);

      return world;
    };

    var theWorldDimensions = function (state) {
      return state.arcus.world;
    };

    var addArrow = function (current, prior, stage) {
      arrows[current.id] = createArrow();
      stage.addChildAt(arrows[current.id], 6);
    };

    var addAlly = function (current, prior, stage) {
      allies[current.id] = createAlly();
      stage.addChild(allies[current.id]);
    };

    var addEnemy = function (current, prior, stage) {
      enemies[current.id] = createEnemy();
      stage.addChild(enemies[current.id]);
    };

    var addEnemyCollision = function (current, prior, stage) {
      var collision = new PIXI.Graphics();
      collision.moveTo(current.collision.calcPoints[0].x, current.collision.calcPoints[0].y);
      current.collision.calcPoints.forEach(function(v) {
        collision.lineStyle(2, 0xFF0000);
        collision.lineTo(v.x, v.y);
      });
      collision.lineTo(current.collision.calcPoints[0].x, current.collision.calcPoints[0].y);
      enemyCollisions[current.id] = collision;
      stage.addChild(enemyCollisions[current.id]);
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

    var killEnemyCollision = function (current, prior) {
      mixin(enemyCollisions[prior.id], tempEffect(5, 
        function() {
          enemyCollisions[prior.id].alpha -= 0.01;
        }, function() {
          delete enemyCollisions[prior.id];    
        })); 
      effect().register(enemyCollisions[prior.id]);
    };

    var killAlly = function (current, prior) {
      mixin(allies[prior.id], tempEffect(5, 
        function() {
          allies[prior.id].alpha -= 0.01;
        }, function() {
          delete allies[prior.id];    
        }));
      effect().register(allies[prior.id]);
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

      $()('#overlay').append(mainTemplate());
      var stage = new PIXI.Container();
      var renderer = PIXI.autoDetectRenderer(dims.usableWidth, dims.usableHeight);
      $()('#' + element()).append(renderer.view);

      var archer = createArcher();
      var horse_and_body = createArchersHorseAndBody();
      var aim = createAim();
      var power = createPower();
      var frontLeaves = createFrontLeaves();
      var backLeaves = createBackLeaves();
      var mountains = createMountains();
      stage.addChild(createWorld(dims.usableWidth, dims.usableHeight));
      stage.addChild(mountains);
      stage.addChild(createGround(dims.usableWidth, dims.usableHeight));
      stage.addChild(archer);
      stage.addChild(aim);
      stage.addChild(power);
      stage.addChild(horse_and_body);
      stage.addChild(backLeaves);
      for(var i = 0; i < 6; i++) {
        trunks[i] = createTrunk(renderer.width);
        stage.addChild(trunks[i], 7);
      }
      stage.addChild(frontLeaves);

      tracker().onElementAdded(theArrows, addArrow, function(data){}, stage);
      tracker().onElementAdded(theEnemies, addEnemy, function(data){}, stage);
      // tracker().onElementAdded(theEnemies, addEnemyCollision, function(data){}, stage);
      tracker().onElementAdded(theAllies, addAlly, function(data){}, stage);
      tracker().onElementChanged(theArrows, updateArrow);
      tracker().onElementRemoved(theArrows, killArrow);
      tracker().onElementChanged(theEnemies, updateEnemy);
      // tracker().onElementChanged(theEnemies, updateEnemyCollision);
      tracker().onElementRemoved(theEnemies, killEnemy);
      tracker().onElementChanged(theAllies, updateAlly);
      tracker().onElementRemoved(theAllies, killAlly);
      tracker().onElementRemoved(theEnemies, killEnemyCollision);
      tracker().onChangeOf(theArcher, updateArcher, [archer, horse_and_body, power]);
      tracker().onChangeOf(thePower, updatePower, power);
      tracker().onChangeOf(theScore, updateScore);

      define()("OnEachFrame", function () {
        return function() {
          updateLeaves(frontLeaves, backLeaves, mountains, renderer.width);
          renderer.render(stage);
        };
      });

      define()("OnResize", function () {
        return function(dims) {
          renderer.resize(dims.usableWidth, dims.usableHeight);
        };
      });
    }
  }
}