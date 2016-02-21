'use strict';

module.exports = {
  type: 'ActionMap',
  deps: ['GameBehaviour-Controller'],
  func: function (controller) {
    return {
      'cursor': [{call: controller().cursor}],
      'button1': [
        {call: controller().fire, onRelease: true},
        {call: controller().powerUp}
      ],
      'left': [{call: controller().left}],
      'right': [{call: controller().right}],
      'space': [{call: controller().addAlly}]
    };
  }
};