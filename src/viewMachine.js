if (ViewMachine === undefined) {
  var ViewMachine = {};
}
if (jQuery === undefined) {
  console.log("Please add JS dependecy jQuery before loading this file.");
}

ViewMachine = (function (VM, $) {
  'use strict';
  /*
    This is a library of HTML element auto-constructors, that put single element types, or groups of elements like an unsorted list (ul, li), in the DOM (where applicable, capable of introspection, for more complex data. Designed to be used by template systems
    Depends on jQuery
  */
  //New constructor function, to begin creating DOM element object constructors and prototypes
  var events = [];
  VM.El = function (element, properties) {
    this.element = element;
    if (properties === undefined) {
      properties = {};
    }
    if (properties.id) {
      this.id = properties.id;
    }
    this.drawn = false;
    this.properties = properties;
    this.children = [];
    this.events = [];
    this.style = {};
    return this;
  };
  VM.El.prototype = {
    getId: function () {
      //Basic function for getting unique IDs or set ones
      if (this.id) {
        return this.id;
      }
      return (Math.floor(Math.random()* 10000000 + 1)).toString();
    },
    HTML: function (draw) {
      //Returns HTML string of self and all child elements
      if (!this.drawn) {
        this.properties.id = this.getId();
      }
      if (draw) {
        this.drawn = true;
      }

      var el = $("<" + this.element + ">", this.properties);

      for (var child in this.children) {
        $(el).append(this.children[child].HTML(draw));
      }
      for (var i in this.events) {
        this.events[i].id = this.properties.id;
        events.push(this.events[i]);
      }
      return el;
    },
    draw: function () {
      //Draws element, including all children, on the DOM
      events = [];
      if (this.drawn) {
        //If already on the DOM, just redraw
        this.replace(this.HTML(true));
      } else {
        var el = this.HTML(true);
        if (typeof this.parent === 'string') {
          //If parent is set as a jQuery identifier (default: body), then append to that element
          $(this.parent).append(el);
          this.drawn = true;
        } else if (this.parent.drawn === true) {
          //If parent is a ViewMachine object, append self to the parent
          $('#' + this.parent.properties.id).append(el);
          this.drawn = true;
        } else {
          throw('DrawError: Parent element not on page');
        }
      }
      var n = events.length;
      for (var i = 0; i < n; i++) {
        $('#' + events[i].id).on(events[i].event, events[i].callback);
      }
      return this;
    },
    remove: function () {
      //Removes elements from their parents and from DOM if drawn
      if (this.drawn) {
        $('#' + this.properties.id).remove();
        this.drawn = false;
      }
      this.properties.id = this.getId();
      if (typeof this.parent !== 'string') {
        this.getId();
        var children = this.parent.children;
        for (var child in children) {
          if (children[child].properties.id === this.properties.id) {
            this.parent.children.splice(child, 1);
          }
        }
      }
      return this;
    },
    replace: function (HTML) {
      //Replaces drawn elements with HTML, designed for updating DOM when 'this' is already drawn, and non-persistant replacement
      if (this.drawn) {
        $('#' + this.properties.id).replaceWith(HTML);
        return this;
      }
    },
    hide: function () {
      //Function for temporary hiding of an element, non-persistent version of removal
      if (this.drawn) {
        $('#' + this.properties.id).remove();
        this.drawn = false;
      }
      return this;
    },
    append: function (el) {
      //Sets up the parent child relationship of DOM element objects
      el.parent = this;
      this.children.push(el);
      if (this.drawn) {
        el.draw();
      }
      return this;
    },
    prepend: function (el) {
      el.parent = this;
      this.children = [el].concat(this.children);
      if (this.drawn) {
        this.draw();
      }
      return this;
    },
    splice: function (pos, n, el) {
      if (el) {
        el.parent = this;
        this.children.splice(pos, n, el);
      } else {
        this.children.splice(pos, n);
      }
      
      if (this.drawn) {
        this.draw();
      }
      return this;
    },
    css: function (prop, value) {
      if (typeof prop === 'string') {
        if (value === undefined) {
          return style[value];
        }
        this.style[prop] = value;
      } else {
        this.style = prop;
      }
      var style = '';
      for (var n in this.style) {
        style += n + ': ' + this.style[n] + '; ';
      }
      this.properties.style = style;
      if (this.drawn){
        this.draw();
      }
      return this;
    },
    event: function (event, callback){
      //Method for adding events, that persist after a redraw
      this.events.push({event: event, callback: callback});
      if (this.drawn) {
        $('#' + this.properties.id).on(event, callback);
      }
    },
    parent: 'body',
    type: 'ViewMachine'
  };

  //New version of the makeList, now a constructor for a list type
  VM.ParentEl = function (type, childType, arg) {
    //Construct html parent object (create lists, select boxes, or append a list of children to a base type)
    var el, props, parent = type;
    if (type.properties) {
      props = type.properties;
      parent = type.type;
    }
    el = new VM.El(parent, props);
    if (typeof arg === "number") {
      for (var n = 0; n < arg; n++) {
        el.append(new VM.El(childType));
      }
    } else if (Array.isArray(arg)) {
      var value, child;
      for (var item in arg) {
        if (typeof arg[item] === 'object') {
          if (arg[item].type === 'ViewMachine') {
            child = arg[item];
          } else {
           child = new VM.El(childType, arg[item]);
          }
        } else {
          child = new VM.El(childType, {text: arg[item]});
        }
        el.append(child);
      }
    }
    return el;
  };
  VM.List = function (arg) {
    //Construct html list object takes either a number, JS list, or an object with parent properties for the UL, and a child property containing a list
    var parent = 'ul', children = arg;
    if (arg.parent) {
      parent = {type: 'ul', properties: arg.parent};
      children = arg.children;
    }
    return VM.ParentEl(parent, 'li', children);
  };

  VM.Select = function (arg) {
    //Construct html Select object takes either a number, JS list, or an object with 'parent' containing properties for the select, and a child property containing a list
    var parent = 'select', children = arg;
    if (arg.parent) {
      parent = {type: 'select', properties: arg.parent};
      children = arg.children;
    }
    return VM.ParentEl(parent, 'option', children);
  };
  return VM;
}(ViewMachine, jQuery));