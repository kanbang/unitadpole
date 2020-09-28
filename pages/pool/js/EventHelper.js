export class EventHelper {
    constructor() {
        this._events = {};
    }

    on(eventName, callback) {
        var events = this._events;
        if (!events[eventName]) {
            events[eventName] = [];
        }
        events[eventName].push(callback);
    }

    off(eventName, callback) {
        var events = this._events;
        var callbacks = events[eventName];
        if (!callbacks) {
            return;
        }
        var index = callbacks.indexOf(callback);
        if (index >= 0) {
            callbacks.splice(index, 1);
        }
    }

    fire(eventName, args) {
        var handlers = this._events[eventName];
        if (!handlers) {
            return;
        }

        handlers.slice().forEach(function (handler) {
            handler(args);
        });
    }
}