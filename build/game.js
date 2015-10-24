'use strict';

var entryPoint = require('ensemblejs/client');
entryPoint.loadWindow(require('window'));
entryPoint.loadDefaults();
entryPoint.loadClientFolder(require('../game/js/logic/**/*.js', {mode: 'hash'} ));
entryPoint.loadClientFolder(require('../game/js/maps/**/*.js', {mode: 'hash'} ));
entryPoint.loadClientFolder(require('../game/js/events/**/*.js', {mode: 'hash' }));
entryPoint.loadClientFolder(require('../game/js/views/**/*.js', {mode: 'hash' }));
entryPoint.set("GameMode", "game");entryPoint.set("Commit", "7f58a18d3a70e05a25e41dd770bee6803d8b2890");
entryPoint.run();