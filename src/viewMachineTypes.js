if (ViewMachine === undefined) {
  var ViewMachine = {};
}
ViewMachine = (function (VM, $) {
  'use strict';

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

  VM.Table = function (keys, data, headings){
    //Constructs an HTML table El, binding to data, via an array key names, and an object/array with repeated keys
    var table = new VM.El('table');
    var header = new VM.El('thead');
    var body = new VM.El('tbody');
    var rows = keys.length;
    var temp, rowdata, text;
    var theHeadings = headings || keys;
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
    table.currentData = {};
    $.extend(table.currentData, data);
    table.keys = keys;
    table.data = function (data){
      //Adds a data method, allowing you to update the data for the table automatically
      var i = 0, temp, v = 0, tempData = {};
      for (var missingrow in this.currentData) {
        if (data[missingrow] === undefined){
          v++;
        } else {
          if (v > 0){
            this.children[1].splice(i, v);
            console.log(v);
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
    };

    table.headings = function (keys, headings) {
      //Change the rows / order of rows for a table, using the current data 
      headings = headings || keys;
      console.log(this.keys);
      var tempData = {};
      $.extend(tempData, this.currentData);
      this.children[0].splice(0, 1, new VM.ParentEl('tr', 'th', headings));
      this.data([]);
      this.keys = keys;
      this.data(tempData);
      return this;
    };

    table.cell = function (r, c){
      //Simple way to get access to any cell
      return this.children[1].children[r].children[c];
    };
    return table;
  };

  return VM;
}(ViewMachine, jQuery));