'use strict';

var $ = require('zepto-browserify').$;

module.exports = {
  type: 'View',
  deps: ['Element', 'Dimensions', 'StateTracker', 'StateTrackerHelpers'],
  func: function (element, dimensions, tracker, helpers) {
    var canvas, input, context;
    var arrows;

    var theArcher = function (state) { return state.archer; };
    var theArrows = function (state) { return state.arrows; };
    var theCooldown = function (state) { return state.cooldown; };

    return {
      setup: function () {
        var dims = dimensions().get();

        canvas = $('<canvas/>', { id: 'scene' });
        canvas[0].width = dims.usableWidth;
        canvas[0].height = dims.usableHeight;

        context = canvas[0].getContext('2d');

        $('#' + element()).append(canvas);

        var updateCursor = function (archer) {
          console.log('Cursor');
        }

        var theCursor = function (state) { return state.cursor; };
        // tracker().onChangeOf(theCursor, updateCursor);
        // tracker().onChangeOf(theArcher, updateCursor);
      },
      update: function(delta) {
        if (context === undefined) {
          return;
        }

        var archer = tracker().get(theArcher);

        context.save();
        context.clearRect(0, 0, canvas[0].width, canvas[0].height);

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

        context.beginPath();
        context.translate(archer.pos.x,archer.pos.y);
        context.rotate(archer.rotation);
        context.rect(-10, -20, 20, 40);
        context.fill();
        context.stroke();
        context.closePath();

        context.restore();

        var arrows = tracker().get(theArrows);
        arrows.forEach(function(a) {
          context.beginPath();
          context.arc(a.pos.x, a.pos.y, 10, 0, 2 * Math.PI, false);
          context.fill();
          context.stroke();
          context.closePath();
        });
      },
      screenResized: function () {
        var dims = dimensions().get();

        if (canvas !== undefined) {
          canvas[0].width = dims.usableWidth;
          canvas[0].height = dims.usableHeight;
        }
      }
    }
  }
}