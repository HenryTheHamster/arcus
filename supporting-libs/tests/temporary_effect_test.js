'use strict';

var expect = require('expect');
var sinon = require('sinon');
var assert = require('assert');
var temporaryEffect = require('../src/temporary_effect');

describe('Temporary Effect', function() {
	var effect = {};
	var progress = 0;
	var tickTock = function(dt, p) {
		progress = p;
	};
	var onCallFunction = sinon.spy();
	var onDeathFunction = sinon.spy();

	beforeEach(function () {
		onCallFunction.reset();
		onDeathFunction.reset();
		progress = 0;

		effect = Object.create(temporaryEffect(10, tickTock));
	});

	describe('each tick', function() {
		it('should increase it\'s age', function() {
			effect.tick(5);
			expect(progress).toBe(0.5);
			effect.tick(2.5);
			expect(progress).toBe(0.75);
		});

		it('should call it\'s "on tick function"', function() {
			effect = Object.create(temporaryEffect(10, onCallFunction));
			effect.tick(5);
			assert(onCallFunction.called);
		});
	});

	describe('being alive', function () {
		it('should start with a progress of zero', function() {
			expect(progress).toBe(0);
		});

		it('should be alive when the age is less than the duration', function() {
			effect.tick(5);
			assert(effect.isAlive());
			effect.tick(5);
			assert(!effect.isAlive());
		});

		it('should be alive when the duration is zero', function () {
			effect = Object.create(temporaryEffect(0, onCallFunction));
			assert(effect.isAlive());
			effect.tick(5);
			assert(effect.isAlive());
			effect.tick(5);
			assert(effect.isAlive());
		});
	});

	describe('on death', function() {
		it('should call the onDeath function once', function() {
			effect = Object.create(temporaryEffect(10, undefined, onDeathFunction));
			effect.tick(5);
			assert(!onDeathFunction.called);
			effect.tick(5);
			assert(onDeathFunction.called);

			onDeathFunction.reset();
			effect.tick(5);
			assert(!onDeathFunction.called);
		});
	});
});