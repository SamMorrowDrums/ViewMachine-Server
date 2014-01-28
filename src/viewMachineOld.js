//This file is now obsolete, as the new version of ViewMachine is taking a different approach. The contents will be removed in future versions.
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