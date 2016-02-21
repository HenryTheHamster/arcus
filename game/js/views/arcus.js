'use strict';

var mixin = require('lodash').mixin;
var PIXI = require('pixi.js');

module.exports = {
  type: 'OnClientReady',
  deps: ['Config', 'Dimensions', 'StateTracker', 'StateTrackerHelpers', 'DefinePlugin', 'RegisterEffect', 'Window', '$'],
  func: function (config, dimensions, tracker, helpers, define, effect, window, $) {

    var tempEffect = require('../supporting-libs/temporary_effect');
    var mainTemplate = require('../../views/overlays/arcus.jade');
    var textureArray = [];
    var trunkImages = [];
    var i;
    for (i=1; i <= 5; i +=1 ) {
      textureArray.push(PIXI.Texture.fromImage('/game/assets/images/horse/horse_and_body' + i + '.png'));
    }
    for (i=1; i <= 6; i+=1) {
      trunkImages.push('/game/assets/images/background/trunk' + i + '.png');
    }

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
    var theScore = function (state) { return state.arcus.score; };

    function updateArrow (id, current) {
      arrows[id].position.x = current.position.x;
      arrows[id].position.y = current.position.y;
      arrows[id].rotation = current.rotation;
    }

    function updateEnemy (id, current) {
      enemies[id].position.x = current.position.x;
      enemies[id].position.y = current.position.y;
    }

    function updateEnemyCollision (id, current) {
      enemyCollisions[id].position.x = current.collision.pos.x;
      enemyCollisions[id].position.y = current.collision.pos.y;
    }

    function updateAlly (id, current) {
      allies[id].position.x = current.position.x;
      allies[id].position.y = current.position.y;
    }

    function updatePower (current, prior, power) {
      power.scale.x = current;
    }

    function updateScore (current) {
      $()('#score')[0].innerText = current;
    }

    function updateLeaves (front, back, mountains, width) {
      var i;

      if(mountains.position.x >= 0) {
        mountains.position.x = -mountains.width + width;
      }
      if(front.position.x >= 0) {
        front.position.x = -front.width + width;
      }
      if(back.position.x >= 0) {
        back.position.x = -back.width + width;
      }
      for (i=0; i < trunks.length; i+=1) {
        if(trunks[i].position.x >= width) {
          trunks[i].position.x = -(Math.random() * width);
        }
        trunks[i].position.x += 1;
      }
      mountains.x += 0.2;
      front.position.x += 1;
      back.position.x += 0.5;
    }

    function updateArcher (current, archer, horse, power) {
      archer.position.x = current.position.x - 20;
      archer.position.y = current.position.y;
      horse.position.x = current.position.x - 85;
      horse.position.y = current.position.y;
      power.position.x = current.aim.x;
      power.position.y = current.aim.y - 20;
      archer.rotation = current.rotation;
      $()('#health')[0].innerText = current.health;
    }

    function createTrunk (width) {
      var trunk = PIXI.Sprite.fromImage(trunkImages[Math.floor((Math.random() * 6))]);
      trunk.position.x += (Math.random() * 2 * width) - width;
      trunk.scale.x = 0.8;
      trunk.scale.y = 0.8;
      return trunk;
    }

    function createMountains () {
      var mountains = PIXI.Sprite.fromImage('/game/assets/images/background/mountains.png');
      // mountains.scale.x = 1.6;
      // mountains.scale.y= 1.6;
      // mountains.width = mountains.width * 1.6;
      // mountains.height = mountains.height * 1.6;
      mountains.position.y += 170;
      mountains.tint = 0xABA89F;
      return mountains;
    }

    function createArrow () {
      var arrow = new PIXI.Graphics();
      arrow.beginFill(0x6D6B68);
      arrow.drawRect(0, 0, -20, 2);
      arrow.beginFill(0xFF0000);
      arrow.drawCircle(0,0,5);
      return arrow;
    }

    function createAim () {
      var aim = new PIXI.Graphics();
      aim.beginFill(0xA48262);
      aim.drawCircle(0, 0, 5);

      return aim;
    }

    function createEnemy () {
      var enemy = new PIXI.extras.MovieClip(textureArray);
      enemy.animationSpeed = 0.25;

      enemy.play();

      return enemy;
    }

    function createArcher () {
      var archer = new PIXI.Sprite.fromImage('/game/assets/images/archer/arms.png');
      archer.pivot.y = 32;
      archer.pivot.x = 20;
      archer.scale.x = 0.8;
      archer.scale.y = 0.8;
      return archer;
    }

    function createArchersHorseAndBody () {
      var horse_and_body = new PIXI.Graphics();
      var horse = new PIXI.extras.MovieClip(textureArray);
      horse.animationSpeed = 0.25;
      horse.play();
      horse_and_body.addChild(horse);
      return horse_and_body;
    }

    function createAlly () {
      var ally = new PIXI.Graphics();
      ally.beginFill(0xB16161);
      ally.drawCircle(0, 0, 20);

      return ally;
    }

    function createPower () {
      var power = new PIXI.Graphics();
      power.beginFill(0xB16161);
      power.drawRect(0, 0, 1, 5);

      return power;
    }

    function createGround (width, height) {
      var world = new PIXI.Graphics();
      world.beginFill(0x636363);
      world.drawRect(0, 400, width, height - 400);

      return world;
    }

    function createFrontLeaves () {
      var leaves = new PIXI.Sprite.fromImage('/game/assets/images/background/foliage01.png');
      leaves.scale.x = 1.5;
      leaves.scale.y = 1.5;
      return leaves;
    }

    function createBackLeaves () {
      var leaves = new PIXI.Sprite.fromImage('/game/assets/images/background/foliage02.png');
      leaves.scale.x = 1.5;
      leaves.scale.y = 1.5;
      return leaves;
    }

    function createWorld (width, height) {
      var world = new PIXI.Graphics();
      // world.beginFill(0xF2ECDE);
      world.beginFill(0xEEEEEE);
      world.drawRect(0, 0, width, height);

      return world;
    }

    function addArrow (id, element, stage) {
      arrows[id] = createArrow();
      stage.addChildAt(arrows[id], 6);
    }

    function addAlly (id, element, stage) {
      allies[id] = createAlly();
      stage.addChild(allies[id]);
    }

    function addEnemy (id, element, stage) {
      enemies[id] = createEnemy();
      stage.addChild(enemies[id]);
    }

    function addEnemyCollision (id, element, stage) {
      var collision = new PIXI.Graphics();
      collision.moveTo(element.collision.calcPoints[0].x, element.collision.calcPoints[0].y);
      element.collision.calcPoints.forEach(function(v) {
        collision.lineStyle(2, 0xFF0000);
        collision.lineTo(v.x, v.y);
      });
      collision.lineTo(element.collision.calcPoints[0].x, element.collision.calcPoints[0].y);
      enemyCollisions[id] = collision;
      stage.addChild(enemyCollisions[id]);
    }

    function killEnemy (id) {
      mixin(enemies[id], tempEffect(5,
        function() {
          enemies[id].alpha -= 0.01;
        }, function() {
          delete enemies[id];
        }));
      effect().register(enemies[id]);
    }

    function killEnemyCollision (id) {
      mixin(enemyCollisions[id], tempEffect(5,
        function() {
          enemyCollisions[id].alpha -= 0.01;
        }, function() {
          delete enemyCollisions[id];
        }));
      effect().register(enemyCollisions[id]);
    }

    function killAlly (id) {
      mixin(allies[id], tempEffect(5,
        function() {
          allies[id].alpha -= 0.01;
        }, function() {
          delete allies[id];
        }));
      effect().register(allies[id]);
    }

    function killArrow (current, prior) {
      mixin(arrows[prior.id], tempEffect(5,
        function() {
          arrows[prior.id].alpha -= 0.01;
        }, function() {
          delete arrows[prior.id];
        }));
      effect().register(arrows[prior.id]);
    }

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

      var i;
      for(i = 0; i < 6; i += 1) {
        trunks[i] = createTrunk(renderer.width);
        stage.addChild(trunks[i]);
      }
      stage.addChild(frontLeaves);

      tracker().onElementAdded(theArrows, addArrow, stage);
      tracker().onElementAdded(theEnemies, addEnemy, stage);
      tracker().onElementAdded(theEnemies, addEnemyCollision, stage);
      tracker().onElementAdded(theAllies, addAlly, stage);
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

      define()('OnRenderFrame', function () {
        return function() {
          updateLeaves(frontLeaves, backLeaves, mountains, renderer.width);
          renderer.render(stage);
        };
      });

      define()('OnResize', function () {
        return function(dims) {
          renderer.resize(dims.usableWidth, dims.usableHeight);
          var ratio = Math.min(dims.screenWidth/config().client.viewportWidth,
                               dims.screenHeight/config().client.viewportHeight);
          stage.scale.x = stage.scale.y = ratio;
        };
      });
    };
  }
};