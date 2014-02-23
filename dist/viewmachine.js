if (ViewMachine === undefined) {
  var ViewMachine = {};
}
ViewMachine = (function (VM) {
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
      throw('Type Error: expects, (string, function)');
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

  /*
  To Do:

  Finish the event callback, for single events so they get the ViewMachine Object, not the Dom Object.

  */

  return VM;
}(ViewMachine));;if (ViewMachine === undefined) {
  var ViewMachine = {};
}

ViewMachine = (function (VM) {
  'use strict';
  var generate;
  generate = function (obj, $content) {
    var i, key, splitClass, caseItem, $item, title;
    // private function that controls the html and named elements types generation, used by the public build function
    if (Object.prototype.toString.call(obj) === '[object Array]') {
      for (i = 0; i < obj.length; i += 1) {
        $content.append(generate(obj[i], $content));
      }
    } else if (typeof obj === "string") {
      VM.makeElement(obj);
    } else {
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (key.indexOf(":") !== -1) {
            splitClass = key.split(":");
          }
          caseItem = splitClass !== undefined ? splitClass[0] : key;
          switch (caseItem) {
          case "div":
            $item = VM.makeElement(splitClass !== undefined ? splitClass[0] : key,  splitClass !== undefined ? splitClass[1] : "");
            $item.append(generate(obj[key], $item));
            break;
          case "form":
            $item = VM.makeForm(obj[key]);
            break;
          case "list":
            $item = VM.makeList(obj[key]);
            break;
          case "table":
            $item = VM.makeTable(obj[key].keyList, obj[key].data);
            break;
          case "b":
          case "p":
            $item = VM.makeElement(splitClass !== undefined ? splitClass[0] : key, splitClass !== undefined ? splitClass[1] : "");
            if (Object.prototype.toString.call(obj[key]) !== '[object Array]') {
              $item.append(obj[key]);
            }
            break;
          case "img":
            $item = ['<img ' + (splitClass !== undefined ? 'class="' + splitClass[1] + '" ' : "") + 'src="' + obj[key] + '" ' + (splitClass !== undefined ? 'title="' + splitClass[1] + '" ' : "") + 'alt="' + (splitClass !== undefined ? splitClass[1] : obj[key]) + '" />'];
            break;
          case "h1":
          case "h2":
          case "h3":
          case "h4":
            $item = VM.makeElement(splitClass !== undefined ? splitClass[0] : key, splitClass !== undefined ? splitClass[1] : "");
            $item.append(VM.cleanTitles(obj[key]));
            break;
          default:
            $item = VM.makeElement(splitClass !== undefined ? splitClass[0] : key, splitClass !== undefined ? splitClass[1] : "");
            $item.append(title);
          }
          if ($item !== undefined) {
            $content.append($item);
          }
        }
      }
    }
    return $content;
  };
  VM.build = function (obj) {
    //function to build complete templates, using the VM element types
    var cssClass, $content;
    cssClass = obj.name;
    $content = VM.makeElement("div", cssClass + " view");
    $content = generate(obj.structure, $content);
    return $content;
  };
  VM.example = {
    name: "example",
    structure: [{h1: "The Title"},
      {"div":
        {div:
          {p: 'This is an <a href="#">example<a/> of paragraph text<br>squirted into a document with <b>inner HTML</b> '},
          form: VM.exampleForm
          }
        },
      {"div:myClass": [{h3: "Sub-title"}, {"p:green": "This is a list of paragraphs"}]}
      ]
  };
  return VM;
}(ViewMachine));;if (ViewMachine === undefined) {
  var ViewMachine = {compatability: false};
}
if (jQuery === undefined) {
  console.log("Please add JS dependecy jQuery before loading this file.");
}

if (!ViewMachine.compatability) {
  var VM = ViewMachine;
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
    text: function (text) {
      this.properties.text = text;
      if (this.drawn) {
        this.draw();
      }
      return this;
    },
    getId: function () {
      //Basic function for getting unique IDs or set ones
      if (this.id) {
        return this.id;
      }
      return (Math.floor(Math.random()* 10000000 + 1)).toString();
    },
    html: function (draw) {
      //Returns HTML string of self and all child elements
      if (!this.drawn) {
        this.properties.id = this.getId();
      }
      if (draw) {
        this.drawn = true;
      }
      var el = document.createElement(this.element);
      for (var prop in this.properties) {
        if (prop === 'text') {
          el.innerHTML = this.properties[prop];
        } else if (prop === 'id' ){
            el.id = this.properties[prop];
        } else {
          el.setAttribute(prop, this.properties[prop]);
        }
      }
      for (var css in this.style) {
        el.style[css] = this.style[css];
      }
      var len = this.children.length;
      for (var n = 0; n < len; n++) {
        el.appendChild(this.children[n].html(draw));
      }
      for (var i in this.events) {
        this.events[i].id = this.properties.id;
        events.push([this.events[i], this]);
      }
      return el;
    },
    $: function () {
      if (this.drawn){
        return document.getElementById(this.properties.id);
      }
      return this.html();
    },
    draw: function () {
      //Draws element, including all children, on the DOM
      events = [];
      if (this.drawn) {
        //If already on the DOM, just redraw
        this.replace(this.html(true));
      } else {
        var el;
        if (typeof this.parent === 'string') {
          //If parent is set as a jQuery identifier (default: body), then append to that element
          el = document.getElementsByTagName(this.parent)[0];
          el.innerHTML = this.html(true).outerHTML;
          this.drawn = true;
        } else if (this.parent.drawn === true) {
          //If parent is a ViewMachine object, append self to the parent
          el = document.getElementById(this.parent.properties.id);
          el.appendChild(this.html(true));
          this.drawn = true;
        } else {
          throw('DrawError: Parent element not on page');
        }
      }
      var n = events.length;
      var str;
      function caller (id, event, callback, element){
        VM.addEventListener(document.getElementById(id), event, function (e) {
          VM.trigger(callback, element);
        });
      }
      for (var i = 0; i < n; i++) {
        if (typeof events[i][0].callback === 'function') {
          VM.addEventListener(document.getElementById(events[i][0].id), events[i][0].event, events[i][0].callback);
        }
        else {
          caller(events[i][0].id, events[i][0].event, events[i][0].callback, events[i][1]);
        }
      }
      return this;
    },
    event: function (event, callback){
      //Method for adding events, that persist after a redraw
      this.events.push({event: event, callback: callback});
      if (typeof callback === 'function') {
        if (this.drawn) {
          VM.addEventListener(document.getElementById(this.properties.id), event, callback);
        }
      } else if (typeof callback === 'string') {
        if (this.drawn) {
          var that = this;
          VM.addEventListener(document.getElementById(this.properties.id), event, function (e){
            VM.trigger(callback, that);
          });
        }
      }
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
        var len = children.length;
        for (var child = 0; child < len; child++) {
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
      //Add an element as the first child
      el.parent = this;
      this.children = [el].concat(this.children);
      if (this.drawn) {
        this.draw();
      }
      return this;
    },
    splice: function (pos, n, el) {
      //Treats an El, as if it's children are an array and can add in a new child element, uses the actal JS Splice method
      var removed;
      if (el) {
        el.parent = this;
        removed = this.children.splice(pos, n, el);
        if (this.drawn) {
          if (pos > 0) {
            $('#' + this.children[pos -1].properties.id).after(el.html());
            el.drawn = true;
          } else {
            $('#' + this.properties.id).append(el.html());
            el.drawn = true;
          }
        }
      } else {
        removed = this.children.splice(pos, n);
      }
      if (this.drawn) {
        var length = removed.length;
        for (var i = 0; i < length; i++) {
          removed[i].remove();
        }
      }
      return this;
    },
    css: function (prop, value) {
      //Enables you to specifically set CSS for an element
      if (typeof prop === 'string') {
        if (value === undefined) {
          return this.style[value];
        }
        this.style[prop] = value;
        if (this.drawn){
          document.getElementById(this.properties.id).style[prop] = value;
        }
      } else {
        for (var val in prop){
          this.style[val] = prop[val];
          if (this.drawn) {
            document.getElementById(this.properties.id).style[val] = prop[val];
          }
        }
      }
      return this;
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
      var len = arg.length;
      for (var item = 0; item<len; item++) {
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

  //Functions
  VM.getKeys = function (keyList, obj) {
    //Pass in any object, and a list of keys, and you'll get back an object containing a list the keys, and their values (lists and objects can be "found", and you'll get a list of them as a string)
    //only used for individaul Objects, so you might iterate through a list of users, as an example, and send this funcion keys to find, then process the response for each user...
    var returnObj = {}, items, key, subKey, returned;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (Object.prototype.toString.call(obj[key]) !== '[object Array]' && keyList.indexOf(key) !== -1) {
          if (typeof obj[key] === "object") {
            items = [];
            for (subKey in obj[key]) {
              if (obj[key].hasOwnProperty(subKey)) {
                items.push(subKey);
              }
            }
            returnObj[key] = items.join(", ");
            returned = VM.getKeys(keyList, obj[key]);
            for (subKey in returned) {
              if (returned.hasOwnProperty(subKey)) {
                returnObj[subKey] = returned[subKey];
              }
            }
          } else {
            returnObj[key] = obj[key];
          }
        } else if (obj.hasOwnProperty(key) && Object.prototype.toString.call(obj[key]) === '[object Array]') {
          returnObj[key] = obj[key].join(", ");
        } else if (typeof obj[key] === "object") {
          returned = VM.getKeys(keyList, obj[key]);
          for (subKey in returned) {
            if (returned.hasOwnProperty(subKey)) {
              returnObj[subKey] = returned[subKey];
            }
          }
        }
      }
    }
    return returnObj;
  };

  VM.createTemplate = function (obj) {
    //This will need work, but is the basis for template generation
    var template = {};
    if (typeof obj === 'object' && obj.type === 'ViewMachine') {
      template.element = obj.element;
      if (! $.isEmptyObject(obj.style)) {
        template.style = obj.style;
      }
      if (obj.id !== undefined) {
        template.id = obj.id;
      }
      if (! $.isEmptyObject(obj.properties)) {
        for (var key in obj.properties) {
          if (obj.properties[key] !== undefined) {
            if (key !== 'id') {
              template.properties = template.properties || {};
              template.properties[key] = obj.properties[key];
            }
          }
       }
      }
      if (obj.children.length && (obj.preserve === undefined || obj.preserve === true)) {
        template.children = [];
        for (var child in obj.children) {
          if (typeof obj === 'object' && obj.type === 'ViewMachine') {
            template.children.push(VM.createTemplate(obj.children[child]));
          }
        }
      } else if (obj.preserve === false){
        template.preserve = false;
      }
      if (VM.properties[obj.element]) {
        for (var prop in VM.properties[obj.element]) {
          if (typeof obj[VM.properties[obj.element][prop]] === 'object') {
            if (Array.isArray(obj[VM.properties[obj.element][prop]])) {
              template[VM.properties[obj.element][prop]] = [];
            } else {
              template[VM.properties[obj.element][prop]] = {};
            }
            VM.extend(template[VM.properties[obj.element][prop]], obj[VM.properties[obj.element][prop]]);
          } else {
            template[VM.properties[obj.element][prop]] = obj[VM.properties[obj.element][prop]];
          }
        }
      }
      if (obj.events.length) {
        template.events = [];
        for (var i in obj.events) {
          if (typeof obj.events[i].callback === 'string') {
            template.events.push({event: obj.events[i].event, callback: obj.events[i].callback});
          }
        }
      }
      return template;
    }
    return false;
  };

  VM.construct = function (template) {
    //Construct a ViewMachine template from a JS object
    var obj;
    if (template.preserve === false) {
      obj = new VM[template.element.substring(0, 1).toUpperCase() + template.element.substring(1, template.element.length)](template[VM.properties[template.element][0]], template[VM.properties[template.element][1]], template[VM.properties[template.element][2]], template[VM.types[template.element][3]]);
    } else {
      if (template.element === 'img' && typeof template.preload === 'string') {
        obj = new VM.Image(template.src, template.preload, template.properties);
      } else {
        obj = new VM.El(template.element, template.properties);
      }
      if (VM.properties[obj.element]) {
        for (var prop in VM.properties[obj.element]) {
          if (typeof obj[VM.properties[obj.element][prop]] === 'object') {
            obj[VM.properties[obj.element][prop]] = {};
            VM.extend(obj[VM.properties[obj.element][prop]], template[VM.properties[obj.element][prop]]);
          } else {
            obj[VM.properties[obj.element][prop]] = template[VM.properties[obj.element][prop]];
          }
        }
      }
      if (VM.types[obj.element]) {
        VM.extend(obj, VM.types[obj.element]);
      }
    }
    for (var child in template.children) {
      obj.append(VM.construct(template.children[child]));
    }
    if (template.style) {
      obj.style = template.style;
    }
    if (template.id !== undefined) {
      obj.id = template.id;
    }
    if (template.events !== undefined) {
      obj.events = template.events;
    }
    return obj;
  };

  VM.jsonTemplate = function (template) {
    //Create, or parse JSON version of template
    if (typeof template === 'string') {
      var obj = JSON.parse(template);
      //Need to run a template constructor on this.
      return VM.construct(obj);
    }
    if (typeof template === 'object' && template.type === 'ViewMachine') {
      template = VM.createTemplate(template);
    }
    return JSON.stringify(template);
  };
  return VM;
}(ViewMachine, jQuery));;if (ViewMachine === undefined) {
  var ViewMachine = {};
}
ViewMachine = (function (VM, $) {
  'use strict';
  /*
  This is the home of ViewMachine constructor functions for higher order HTML structures, such as Tables and Lists.
  */

  //When creating a constructor function, add your methods to the types object, so you can add the methods to an object, even without calling the constructor
  VM.types = VM.types || {};
  //Also register the poperties that need to be stored in order to use the above methods
  VM.properties = VM.properties || {};

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

  VM.Table = function (data, keys, headings){
    //Constructs an HTML table El, binding to data, via an array key names, and an object/array with repeated keys
    var table = new VM.El('table');
    var header = new VM.El('thead');
    var body = new VM.El('tbody');
    var rows = keys.length;
    var temp, rowdata, text;
    var theHeadings = headings || keys;
    table.currentHeadings = theHeadings;
    header.append(new VM.ParentEl('tr', 'th', theHeadings));
    for (var row in data) {
      if (data.hasOwnProperty(row)){
        temp = new VM.El('tr');
        for (var i = 0; i < rows; i++) {
          text = data[row][keys[i]];
          if (Array.isArray(text)){
            text = text.join(', ');
          }
          temp.append(new VM.El('td', {text: text } ) );
        }
        body.append(temp);
      }
    }
    table.children.push(header);
    table.append(body);
    table.preserve = false;
    table.keys = keys;
    VM.extend(table, VM.types.table);
    table.currentData = {};
    table.currentData = VM.extend(table.currentData, data);
    return table;
  };
  VM.properties.table = ['currentData', 'keys', 'currentHeadings'];
  VM.types.table = {
    data: function (data){
      //Adds a data method, allowing you to update the data for the table automatically
      var rows = this.keys.length;
      var tempData;
      if (Array.isArray(data)) {
        tempData = [];
      } else {
        tempData = {};
      }
      var i = 0, temp, v = 0, text;
      for (var missingrow in this.currentData) {
        if (data[missingrow] === undefined){
          v++;
        } else {
          if (v > 0){
            this.children[1].splice(i, v);
          }
          i++;
          v = 0;
        }
      }
      if (v > 0){
        this.children[1].splice(i, v);
      }
      i = 0;
      for (var row in data) {
        if (data.hasOwnProperty(row)) {
          tempData[row] = data[row];
          if (!this.currentData.hasOwnProperty(row)) {
            temp = new VM.El('tr');
            for (var n = 0; n < rows; n++) {
              if (data[row].hasOwnProperty(this.keys[n])) {
                text = data[row][this.keys[n]];
                if (Array.isArray(text)){
                  text = text.join(', ');
                }
                temp.append(new VM.El('td', {text: text } ) );
              } else {
                temp.append(new VM.El('td') );
              }
            }
            this.children[1].splice(i, 0, temp);
          } else if ((JSON.stringify(this.currentData[row]) !== JSON.stringify(data[row]))) {
             //JSON Stringify is not the way to do this. Need to look at ways that I can tell what has changed
            for (var x = 0; x < rows; x++) {
              if (data[row].hasOwnProperty(keys[x])) {
                if (data[row][keys[x]] !== this.currentData[row][this.keys[x]]){
                  this.cell(i, x).text(data[row][this.keys[x]]);
                }
              }
            }
          }
          i++;
        }
      }
      this.currentData = tempData;
      return this;
    },
    headings: function (keys, headings) {
      //Change the rows / order of rows for a table, using the current data 
      this.currentHeadings = headings || keys;
      var tempData = {};
      tempData = VM.extend(tempData, this.currentData);
      this.children[0].splice(0, 1, new VM.ParentEl('tr', 'th', this.currentHeadings));
      this.data([]);
      this.keys = keys;
      this.data(tempData);
      return this;
    },
    cell: function (r, c){
      //Simple way to get access to any cell
      return this.children[1].children[r].children[c];
    }
  };

  VM.Video = function (types, src, attrs) {
    var video = new VM.El('video', attrs);
    for (var type in types) {
      video.append( new VM.El( 'source', {src: src + '.' + types[type], type: 'video/' + types[type]} ) );
    }
    return video;
  };


  VM.Image = function (src, preloadSrc, attrs) {
    var img = new VM.El('img', {src: preloadSrc, 'data-img': src});
    img.preload = preloadSrc;
    img.src = src;
    for (var attr in attrs) {
      img.properties[attr] = attrs[attr];
    }
    var source = new Image();
    source.onload = function () {
      img.properties.src = img.properties['data-img'];
      if (img.drawn) {
        img.draw();
      }
    };
    source.src = src;
    return img;
  };

  VM.properties.img = ['src', 'preload'];

  return VM;
}(ViewMachine, jQuery));