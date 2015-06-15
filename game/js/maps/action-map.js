'use strict';

module.exports = {
  type: 'ActionMap',
  deps: ['GameBehaviour-Controller'],
  func: function (controller) {
    return {
      'cursor': [{target: controller().cursor}],
      'button1': [
        {target: controller().fire, onRelease: true},
        {target: controller().powerUp}
      ],
      'left': [{target: controller().left}],
      'right': [{target: controller().right}],
      'space': [{target: controller().addAlly}]
    };
  }
};