if (ViewMachine === undefined) {
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
      //Enables you to specifically set CSS for an element
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

  VM.Table = function (keys, data){
    //Constructs an HTML table El, binding to data, via an array key names, and an object/array with repeated keys
    var table = new VM.El('table');
    var header = new VM.El('thead');
    var body = new VM.El('tbody');
    var rows = keys.length;
    var temp, rowdata;
    header.append(new VM.ParentEl('tr', 'th', keys));
    for (var row in data) {
      if (data.hasOwnProperty(row)){
        temp = new VM.El('tr');
        for (var i = 0; i < rows; i++) {
          temp.append(new VM.El('td', {text: data[row][keys[i]] } ) );
        }
        body.append(temp);
      }
    }
    table.children.push(header);
    table.append(body);
    table.currentData = {};
    $.extend(table.currentData, data);
    table.keys = keys;
    table.data = function (data){
      //Adds a data method, allowing you to update the data for the table automatically
      var i = 0, temp;
      for (var missingrow in this.currentData) {
        if (data[missingrow] === undefined){
          this.children[1].splice(i, 1);
        } else {
          i++;
        }
      }
      i = 0;
      for (var row in data) {
        if (data.hasOwnProperty(row)) {
          if (!this.currentData.hasOwnProperty(row)) {
          temp = [];
          for (var n = 0; n < rows; n++) {
            if (data[row].hasOwnProperty(keys[n])) {
              temp.push(data[row][keys[n]]);
            } else {
              temp.push(undefined);
            }
            }
            this.children[1].splice(i, 0, new VM.ParentEl('tr', 'td', temp));
          } else if ((JSON.stringify(this.currentData[row]) !== JSON.stringify(data[row]))) {
             //JSON Stringify is not the way to do this. Need to look at ways that I can tell what has changed
            for (var x = 0; x < rows; x++) {
              if (data[row].hasOwnProperty(keys[x])) {
                if (data[row][keys[x]] !== this.currentData[row][keys[x]]){
                  this.cell(i, x).text(data[row][keys[x]]);
                }
              }
            }
          }
          i++;
        }
      }
      this.currentData = {};
      $.extend(this.currentData, data);
      return this;
    };
    table.cell = function (r, c){
      //Simple way to get access to any cell
      return this.children[1].children[r].children[c];
    };
    return table;
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

  return VM;
}(ViewMachine, jQuery));;//This file is now obsolete, as the new version of ViewMachine is taking a different approach. The contents will be removed in future versions.
if (ViewMachine === undefined) {
  var ViewMachine = {};
}
if (jQuery === undefined) {
  console.log("Please add JS dependecy jQuery before loading this file.");
} else {
  var $ = jQuery;
}
ViewMachine = (function (machines) {
  'use strict';
  machines.titles = {example: "Example"};
  machines.cleanTitles = function (title, replacement) {
  // Function to provide replacements for object keys used in templates, enables multi-language/clean titles for elements like tables, generated from JS objects
    var i, cleanTitle;
    if (replacement !== undefined) {
      this.titles[title] = replacement;
      return;
    }
    if (this.titles[title] === undefined && title.length) {
      cleanTitle = title.toLowerCase().replace(/_/g, ' ').split(' ');
      for (i = 0; i < cleanTitle.length; i += 1) {
        if (this.titles[cleanTitle[i]] !== undefined) {
          cleanTitle[i] = this.titles[cleanTitle[i]];
        }
        cleanTitle[i] = cleanTitle[i][0].toUpperCase() + cleanTitle[i].substring(1);
      }
      cleanTitle = cleanTitle.join(" ");
    } else if (!title.length) {
      cleanTitle = title;
    } else {
      cleanTitle = this.titles[title];
    }
    return cleanTitle;
  };
  machines.makeElement = function (el, cssClass, text, id, i,  extraProperties) {
    //function takes html element name, class, [optional text, id, object containing custom properties] and returns jQuery DOM elements
    var date, $createdEl, key, properties;
    i = i !== undefined ? i : "";
    id = id !== undefined ? id : "";
    cssClass = cssClass !== undefined ? cssClass : "";
    properties = {
    };
    if (cssClass.length) {
      properties["class"] = cssClass;
    }
    if (id.length || i.length || typeof id === 'number' || typeof i === 'number') {
      properties.id = id + i;
    }
    if (text !== undefined) {
      if (text !== null && text.length === 19) {
        date = text.replace(/\D/g, ' ');
        date = date.split(' ');
        if (date.length === 6) {
          text = new Date(date[0], date[1] - 1, date[2], date[3], date[4], date[5]).toDateString();
        }
      }
      properties.text = text;
    }
    $createdEl = $("<" + el + ">", properties);
    if (typeof extraProperties === 'object') {
      for (key in extraProperties) {
        if (extraProperties.hasOwnProperty(key)) {
          $createdEl.attr(key, extraProperties[key]);
        }
      }
    }
    return $createdEl;
  };
  machines.makeList = function (obj, $el) {
    //function takes an object of any depth, and produces an HTML list (also accepts flat lists, even in objects)
    var key, $item, $subEl, cssClass, i, id;
    $el = $el !== undefined ? $el :  machines.makeElement("ul", "list");
    if (Object.prototype.toString.call(obj) !== '[object Array]') {
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] !== 'object') {
            $item = machines.makeElement("li", "item", obj[key], key);
            $el.append($item);
          } else if (obj[key] !== null) {
            $subEl = machines.makeElement("ul", key.split(' ')[0] + " list");
            $el.append($subEl);
            $item = machines.makeElement("h3", "title", machines.cleanTitles(key));
            $subEl.append($item);
            machines.makeList(obj[key], $subEl);
          }
        }
      }
    } else {
      if (typeof obj[0] !== 'object') {
        id = $el !== undefined ? $el.attr("id") : "item";
        cssClass = $el !== undefined ? $el.attr("class") : "item";
        for (i = 0; i < obj.length; i += 1) {
          $item = machines.makeElement("li", cssClass, obj[i], id, i + 1);
          $el.append($item);
        }
      } else {
        for (i = 0; i < obj.length; i += 1) {
          $el.append(machines.makeList(obj[i], $el));
        }
      }
    }
    return $el;
  };
  machines.makeCells = function (obj, $row, keyList) {
    //function to create cells to populate, that will seek out the keys in objects, and will return jQuery cells in an Object (array nodes converted to strings)
    var rowObj = {}, returned, subKey, key, asString;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] !== 'object' && Object.prototype.toString.call(obj[key]) !== '[object Array]' && keyList.indexOf(key) !== -1) {
          if (obj[key] === null) {
            rowObj[key] = (machines.makeElement("td", 'none', ''));
          } else {
            rowObj[key] = (machines.makeElement("td", key, obj[key]));
          }
        } else if (Object.prototype.toString.call(obj[key]) === '[object Array]') {
          asString = obj[key].join(", ");
          rowObj[key] = (machines.makeElement("td", key, asString));
        } else if (typeof obj[key] === "object") {
          returned = machines.makeCells(obj[key], $row, keyList);
          for (subKey in returned) {
            if (returned.hasOwnProperty(subKey)) {
              rowObj[subKey] = returned[subKey];
            }
          }
        }
      }
    }
    return rowObj;
  };
  machines.makeTable = function (keyList, obj) {
    //function to auto generate tables, taking an array of keys, and then an object containing those keys
    var $table, i, title, key, $row, $rowObj, $thead;
    $table = machines.makeElement("table", "classic");
    function makeTR(cssClass) {
      return machines.makeElement("tr", cssClass);
    }
    $row = makeTR("title");
    for (i = 0; i < keyList.length; i += 1) {
      title = machines.cleanTitles(keyList[i]);
      $row.append(machines.makeElement("th", keyList[i], title));
    }
    $thead = machines.makeElement("thead");
    $thead.append($row);
    $table.append($thead);
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        $row = makeTR("row");
        $rowObj = machines.makeCells(obj[key], $row, keyList);
        for (i = 0; i < keyList.length; i += 1) {
          if ($rowObj.hasOwnProperty(keyList[i])) {
            $row.append($rowObj[keyList[i]]);
          } else {
            $row.append(machines.makeElement("td", keyList[i] + " none", ""));
          }
        }
        $table.append($row);
      }
    }
    return $table;
  };
  machines.makeForm = function (obj) {
    //A function to generate full HTML forms, or fieldsets
    var fieldsetName, $fieldSet, items, $select, label, $input, actions, $form, i, x, htmlName, cssClass, values;
    if (obj.fieldsetName === undefined) {
      fieldsetName = obj.formName !== undefined ? obj.formName : "";
    } else {
      fieldsetName = obj.fieldsetName;
    }
    $fieldSet = machines.makeElement("fieldset", fieldsetName);
    items = obj.form;
    for (i = 0; i < items.length; i += 1) {
      htmlName = items[i].hasOwnProperty("name") ?  items[i].name : items[i].label;
      cssClass = items[i].hasOwnProperty("cssClass") ?  items[i].cssClass : items[i].elementType;
      switch (items[i].elementType) {
      case "input":
      case "textarea":
        label = machines.cleanTitles(items[i].label);
        $fieldSet.append(machines.makeElement("label", cssClass, label + ":", "", "", {"for": htmlName}));
        $input = ['<' + items[i].elementType + ' name="' + htmlName + '"' + ' id="' + htmlName + '"' + ' />'];
        $fieldSet.append($input);
        break;
      case "checkbox":
      case "radio":
        for (x = 0; x < items[i].options.length; x += 1) {
          label = machines.cleanTitles(items[i].options[x]);
          $fieldSet.append(machines.makeElement("label", cssClass, label + ":", "", "", {"for": items[i].options[x]}));
          values = {type: items[i].elementType, name: items[i].elementType === "radio" ? htmlName : items[i].options[x] };
          values.value = items[i].value !== undefined ? items[i].value[x] : items[i].options[x];
          if (items[i].selected === items[i].options[x]) {
            values.checked = "checked";
          }
          $fieldSet.append(machines.makeElement("input", cssClass, "", items[i].options[x], "", values));
        }
        break;
      case "select multiple":
      case "select":
        label = machines.cleanTitles(items[i].label);
        $fieldSet.append(machines.makeElement("label", cssClass, label + ":", "", "", {"for": htmlName}));
        $select = machines.makeElement('select', htmlName, "", htmlName, "", (items[i].elementType === "select multiple" ? {multiple: 'multiple'} : ''));
        if (items[i].options !== undefined) {
          for (x = 0; x < items[i].options.length; x += 1) {
            values = {};
            values.value = items[i].value !== undefined ? items[i].value[x] : items[i].options[x];
            if (items[i].selected === items[i].options[x]) {
              values.selected = "selected";
            }
            $select.append(machines.makeElement("option", cssClass, items[i].options[x], values.value, "", values));
          }
        }
        $fieldSet.append($select);
        break;
      case "button":
        label = machines.cleanTitles(items[i].text);
        $fieldSet.append(machines.makeElement("button", cssClass, label, htmlName, "", {onclick: items[i].onclick}));
        break;
      }
      $fieldSet.append("<br />");
    }
    if (obj.formName) {
      if (obj.action && obj.formName) {
        actions = {action: obj.action, method: obj.method};
      }
      $form = machines.makeElement("form", obj.formName, "", "", "", actions);
      return $form.append($fieldSet);
    }
    return $fieldSet;
  };
  machines.exampleForm = {
    // If formName isn't present - IT IS ASSUMED THAT YOU Don't Want the encapsulating form tag created, as you may need a more complex layout
    action: "", //optional
    method: "", //optional
    formName: "MyForm",
    fieldsetName: "myFields", // optional, but can be used to identify multiple fieldsets, in a larger form
    form : [
      {name: "myField", // This will be the html valid name, else label will be used, and must be a single word
        label: "My Fav Textarea",
        elementType: "textarea",
        defaultText: "Prefill text...",
        cssClass: "customClass" //optional gives class to this element - default is no specific class
        },
      {name: "myField", // This will be the html valid name, else label will be used, and must be a single word
        label: "My Fav Textarea",
        elementType: "input",
        defaultText: "Prefill text..."
        },
      {label: "label2",
        elementType: "radio",
        options: ["Male", "Female"],
        selected: "Female", // optional
        value: ["m", "f"] //optional
        },
      {label: "label2",
        elementType: "checkbox",
        options: ["Male", "Female"],
        selected: "Female", // optional
        value: ["m", "f"] //optional
        },
      {name: "selectBox",
        label: "My Select Box",
        elementType: "select",
        options: ["opt1", "opt2", "opt3"],
        selected: "opt2", //optional
        value: [1, 2, 3] //optional
        },
      {name: "selectBox2",
        label: "Same - No Values or selected specified",
        elementType: "select",
        options: ["opt1", "opt2", "opt3"]
        },
      {name: "multipleSelect",
        label: "Same - No Values or selected specified",
        elementType: "select multiple",
        options: ["opt1", "opt2", "opt3"]
        },
      {
        label: "myButton",
        elementType: "button",
        text: "Submit yourself!",
        onclick: "alert('I will not submit to you'); return false;"
      }
    ]
  };
  machines.exampleList = ["Apples", "Pears", "Limes", "Oranges", "Plums"];
  machines.exampleTable = {keyList: ["Apples", "Pears", "Limes", "Oranges", "Plums"], data: {fruits1: {"Apples": 10, "Pears": 20, "Limes": 100, "Oranges": 15, "Plums": 4}, fruits2: {"Apples": 2, "Pears": 4, "Limes": 8, "Oranges": 16, "Plums": 32}, fruits3: {"Apples": 64, "Pears": 128, "Limes": 256, "Plums": 1024}}};
  return machines;
}(ViewMachine));