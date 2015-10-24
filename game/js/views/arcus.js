'use strict';
var mixin = require('lodash').mixin;


var PIXI = require('pixi.js');

module.exports = {
  type: 'OnClientReady',
  deps: ['Config', 'Dimensions', 'StateTracker', 'StateTrackerHelpers', 'DefinePlugin', 'RegisterEffect', 'Window', '$'],
  func: function (config, dimensions, tracker, helpers, define, effect, window, $) {
    var input, context;
    var tempEffect = require('../supporting-libs/temporary_effect');
    var mainTemplate = require('../../views/overlays/arcus.jade');
    var textureArray = [];
    var trunkImages = [];
    for (var i=1; i <= 5; i++) {
         var texture = PIXI.Texture.fromImage("/game/images/horse/horse_and_body" + i + ".png");
         textureArray.push(texture);
    };
    for (var i=1; i <= 6; i++) {
         var trunkSprite = "/game/images/background/trunk" + i + ".png";
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

    var updateArrow = function (id, current, prior) {
      arrows[id].position.x = current.position.x;
      arrows[id].position.y = current.position.y;
      arrows[id].rotation = current.rotation;
    };

    var updateEnemy = function (id, current, prior) {
      enemies[id].position.x = current.position.x;
      enemies[id].position.y = current.position.y;
    };

    var updateEnemyCollision = function (id, current, prior) {
      enemyCollisions[id].position.x = current.collision.pos.x;
      enemyCollisions[id].position.y = current.collision.pos.y;
    };

    var updateAlly = function (id, current, prior) {
      allies[id].position.x = current.position.x;
      allies[id].position.y = current.position.y;
    };

    var updatePower = function (id, current, prior, power) {
      power.scale.x = current;
    };

    var updateScore = function (id, current, prior) {
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

    var updateArcher = function (id, element, archer, horse, power) {
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
      var mountains = PIXI.Sprite.fromImage('/game/images/background/mountains.png');
      // mountains.scale.x = 1.6;
      // mountains.scale .y= 1.6;
      // mountains.width = mountains.width * 1.6;
      // mountains.height = mountains.height * 1.6;
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
      var archer = new PIXI.Sprite.fromImage('/game/images/archer/arms.png');
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
      var leaves = new PIXI.Sprite.fromImage('/game/images/background/foliage01.png');
      leaves.scale.x = 1.5;
      leaves.scale.y = 1.5;
      return leaves;
    };

    var createBackLeaves = function () {
      var leaves = new PIXI.Sprite.fromImage('/game/images/background/foliage02.png');
      leaves.scale.x = 1.5;
      leaves.scale.y = 1.5;
      return leaves;
    };

    var createWorld = function (width, height) {
      var world = new PIXI.Graphics();
      // world.beginFill(0xF2ECDE);
      world.beginFill(0xEEEEEE);
      world.drawRect(0, 0, width, height);

      return world;
    };

    var theWorldDimensions = function (state) {
      return state.arcus.world;
    };

    var addArrow = function (id, element, stage) {
      arrows[id] = createArrow();
      stage.addChildAt(arrows[id], 6);
    };

    var addAlly = function (id, element, stage) {
      allies[id] = createAlly();
      stage.addChild(allies[id]);
    };

    var addEnemy = function (id, element, stage) {
      console.log(arguments);
      enemies[id] = createEnemy();
      stage.addChild(enemies[id]);
    };

    var addEnemyCollision = function (id, element, stage) {
      var collision = new PIXI.Graphics();
      collision.moveTo(element.collision.calcPoints[0].x, element.collision.calcPoints[0].y);
      element.collision.calcPoints.forEach(function(v) {
        collision.lineStyle(2, 0xFF0000);
        collision.lineTo(v.x, v.y);
      });
      collision.lineTo(element.collision.calcPoints[0].x, element.collision.calcPoints[0].y);
      enemyCollisions[id] = collision;
      stage.addChild(enemyCollisions[id]);
    };

    var killEnemy = function (id, element) {
      mixin(enemies[id], tempEffect(5, 
        function() {
          enemies[id].alpha -= 0.01;
        }, function() {
          delete enemies[id];    
        }));
      effect().register(enemies[id]);
    };

    var killEnemyCollision = function (id, element) {
      mixin(enemyCollisions[id], tempEffect(5, 
        function() {
          enemyCollisions[id].alpha -= 0.01;
        }, function() {
          delete enemyCollisions[id];    
        })); 
      effect().register(enemyCollisions[id]);
    };

    var killAlly = function (id, element) {
      mixin(allies[id], tempEffect(5, 
        function() {
          allies[id].alpha -= 0.01;
        }, function() {
          delete allies[id];    
        }));
      effect().register(allies[id]);
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
      stage.width = dims.usableWidth;
      stage.height = dims.usableHeight;
      $()('#' + config().client.element).append(renderer.view);

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

      tracker().onElementAdded(theArrows, addArrow, function(data){data.forEach(addArrow)}, stage);
      tracker().onElementAdded(theEnemies, addEnemy, function(data){data.forEach(addEnemy)}, stage);
      tracker().onElementAdded(theEnemies, addEnemyCollision, function(data){data.forEach(addEnemyCollision)}, stage);
      tracker().onElementAdded(theAllies, addAlly, function(data){data.forEach(addAlly)}, stage);
      tracker().onElementChanged(theArrows, updateArrow);
      tracker().onElementRemoved(theArrows, killArrow);
      tracker().onElementChanged(theEnemies, updateEnemy);
      tracker().onElementChanged(theEnemies, updateEnemyCollision);
      tracker().onElementRemoved(theEnemies, killEnemy);
      tracker().onElementChanged(theAllies, updateAlly);
      tracker().onElementRemoved(theAllies, killAlly);
      tracker().onElementRemoved(theEnemies, killEnemyCollision);
      tracker().onChangeOf(theArcher, updateArcher, [archer, horse_and_body, power]);
      tracker().onChangeOf(thePower, updatePower, power);
      tracker().onChangeOf(theScore, updateScore);

      define()("OnRenderFrame", function () {
        return function() {
          updateLeaves(frontLeaves, backLeaves, mountains, renderer.width);
          renderer.render(stage);
        };
      });

      define()("OnResize", function () {
        return function(dims) {
          renderer.resize(dims.usableWidth, dims.usableHeight);
          var ratio = Math.min(dims.screenWidth/config().client.viewportWidth, 
                               dims.screenHeight/config().client.viewportHeight);
          stage.scale.x = stage.scale.y = ratio;
        };
      });
    }
  }
}