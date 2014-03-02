(function (VM) {
  'use strict';

  VM.extend = function(out) {
    out = out || {};
    for (var i = 1; i < arguments.length; i++) {
      var obj = arguments[i];
      if (!obj)
        continue;
      if (Array.isArray(obj)){
        out = [];
        for (var n = 0; n < obj.length; n++) {
          if (typeof obj[n] === 'object') {
            out.push({});
            VM.extend(out[i], obj[i]);
          } else {
            out.push(obj[i]);
          }
        }
      }
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'object')
            VM.extend(out[key], obj[key]);
          else
            out[key] = obj[key];
        }
      }
    }
    return out;
  };

  VM.event = {};

  VM.addEventListener = function (el, eventName, handler) {
    if (el.addEventListener) {
      el.addEventListener(eventName, handler);
    } else {
      el.attachEvent('on' + eventName, handler);
    }
  };

  VM.on = function (event, callback, data) {
    if (typeof event === 'string' && typeof callback === 'function') {
      if (VM.event[event] ===  undefined) {
        VM.event[event] = [];
      }
      VM.event[event].push([callback, data]);
    } else {
      throw('Type Error: VM.on expects, (string, function)');
    }
  };

  VM.trigger = function (event, data) {
    if (VM.event[event] !== undefined) {
      var info = {
        event: event,
        timestamp: new Date().getTime()
      };
      for (var i = 0; i < VM.event[event].length; i++) {
        if (VM.event[event][i].length === 2) {
          info.data = VM.event[event][i][1];
        }
        VM.event[event][i][0](info, data);
      }
    }
  };

  VM.removeAllListeners = function (event) {
    if (VM.event[event] !== undefined) {
      delete VM.event[event];
    }
  };
  var h = Object.prototype.hasOwnProperty;
  VM.isEmpty = function (obj) {
    if (obj == null) return true;
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (h.call(obj, key)) return false;
    }

    return true;
  };
  return VM;
}(exports));