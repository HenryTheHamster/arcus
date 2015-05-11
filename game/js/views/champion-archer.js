'use strict';


var $ = require('zepto-browserify').$;

module.exports = {
  type: 'View',
  deps: ['Element', 'Dimensions', 'StateTracker', 'StateTrackerHelpers', 'DefinePlugin'],
  func: function (element, dimensions, tracker, helpers, define) {
    var input, context;
    var arrows;
    var $ = require('zepto-browserify').$;
    var thePower = function (state) { return state.power; };
    var theArcher = function (state) { return state.archer; };
    var theEnemies = function (state) { return state.enemies; };
    var theArrows = function (state) { return state.arrows; };
    var theData = function (state) { return state.data; };

    return function (newDims) {
      var canvas = $('<canvas/>', { id: 'scene' });
      canvas[0].width = newDims.usableWidth;
      canvas[0].height = newDims.usableHeight;

      context = canvas[0].getContext('2d');
      
      $('#' + element()).append(canvas);
      var setup = function () {
      };
      var update = function(delta) {
      };
      var screenResized = function () {
        var dims = dimensions().get();

      };
      define()('OnEachFrame', function () {
        return function () {
          

          context.clearRect(0, 0, canvas[0].width, canvas[0].height);

          var power = tracker().get(thePower);

          var archer = tracker().get(theArcher);
          var arrows = tracker().get(theArrows);
          arrows.forEach(function(a) {
            context.save();
            context.beginPath();
            context.translate(a.pos.x,a.pos.y);
            context.rotate(a.rot);
            context.rect(0, 0, 20, 2);
            context.stroke();
            context.closePath();
            context.restore();
          });

          context.beginPath();
          context.rect(archer.aim.x - 10, archer.aim.y - 10, power, 10);
          context.fill();
          context.stroke();
          context.closePath();




          var enemies = tracker().get(theEnemies);
          enemies.forEach(function(e) {
            context.beginPath();
            context.arc(e.pos.x, e.pos.y, 20, 0, 2 * Math.PI, false);
            context.fill();
            context.stroke();
            context.closePath();
          });

          context.strokeStyle = 'green';
          enemies.forEach(function(e) {
            context.beginPath();
            context.rect(e.pos.x - e.col.x, e.pos.y - e.col.y, e.col.x*2, e.col.y * 2, 0, 2 * Math.PI, false);
            context.stroke();
            context.closePath();
          });

          context.fillStyle = 'red';
          context.strokeStyle = '#660000';
          context.lineWidth = 2;

          context.beginPath();
          context.arc(archer.aim.x, archer.aim.y, 10, 0, 2 * Math.PI, false);
          context.fill();
          context.stroke();
          context.closePath();

          context.fillStyle = 'green';
          context.strokeStyle = '#003300';
          context.save();
          context.beginPath();
          context.translate(archer.pos.x,archer.pos.y);
          context.rotate(archer.rotation);
          context.rect(-10, -20, 20, 40);
          context.fill();
          context.stroke();
          context.closePath();

          context.restore();
        };
      });
      define()('OnResize', function () {
        return function (newDims) {
          canvas[0].width = newDims.usableWidth;
          canvas[0].height = newDims.usableHeight;
        };
      });
    }
  }
}