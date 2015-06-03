'use strict';

var entryPoint = require('ensemblejs-client');
entryPoint.loadWindow(require('window'));
entryPoint.loadDefaults();
entryPoint.load(require('./views/arcus'));
entryPoint.run();