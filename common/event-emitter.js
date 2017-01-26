(function(global) { 'use strict'; define(({ // This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
	'node_modules/es6lib/concurrent': { PromiseCapability, },
	'node_modules/es6lib/object': { Class, setConst, },
}) => {

const now = Promise.resolve();

const EventEmitter = new Class({
	constructor: (x, Private) => (function EventEmitter() {
		const self = Private(this);
		self.on = { };
	}),

	public: Private => ({
		on(name, cb) {
			Private(this).add(name, cb, false);
			return cb;
		},
		once(name, cb) {
			Private(this).add(name, cb, true);
			return cb;
		},
		off(name, cb) {
			const self = Private(this);
			const on = self.on && self.on[name];
			if (!on) { return this; }
			on.delete(cb);
			!on.size && delete self.on[name];
			return this;
		},
		promise(name, cancel) {
			const self = Private(this);
			cancel = cancel || EventEmitter.destroyed;
			const { promise, resolve, reject, } = new PromiseCapability;
			const good = value => { self.on && self.on[cancel].delete(bad); resolve(value); };
			const bad = value => { self.on && self.on[name].delete(good); reject(value); };
			self.add(name, good, true);
			self.add(cancel, bad, true);
			return promise;
		},
	}),

	protected: Private => ({
		emit(name, value) {
			if (name === EventEmitter.destroyed) { throw new Error('Cannot emit EventEmitter.destroyed'); }
			const self = Private(this);
			const on = self.on && self.on[name];
			if (!on) { return; }
			on.forEach((once, cb) => {
				now.then(() => cb(value)).catch(error => { console.error('"'+ name +'" event handler threw:', error); });
				once && on.delete(cb);
			});
			!on.size && delete self.on[name];
		},
		emitSync(name, value) {
			if (name === EventEmitter.destroyed) { throw new Error('Cannot emit EventEmitter.destroyed'); }
			const self = Private(this);
			const on = self.on && self.on[name];
			const cbs = [ ];
			if (!on) { return cbs; }
			on.forEach((once, cb) => {
				cbs.push(cb);
				once && on.delete(cb);
			});
			!on.size && delete self.on[name];
			return cbs.map(cb => { try { return cb(value); } catch (error) { // TODO: this should still catch async errors
				console.error('"'+ name +'" event handler threw:', error);
				return null;
			} });
		},
		clear(name) {
			const self = Private(this);
			const on = self.on && self.on[name];
			if (!on) { return 0; }
			const { size, } = on;
			on.clear();
			delete self.on[name];
			return size;
		},
		destroy(error) {
			const self = Private(this);
			if (!self.on) { return; }
			const on = self.on[EventEmitter.destroyed];
			self.on = null;
			on && on.forEach((once, cb) => {
				try { cb(error); } catch (error) { console.error('EventEmitter.destroyed event handler threw:', error); }
			});
		},
	}),

	private: () => ({
		add(key, value, once) {
			if (!this.on) { return; }
			let on = this.on[key];
			if (!on) { on = this.on[key] = new Map; }
			on.set(value, once);
		},
	}),
});
setConst(EventEmitter, 'destroyed', Symbol.for('destroyed'));

return (EventEmitter.EventEmitter = EventEmitter);

}); })(this);
