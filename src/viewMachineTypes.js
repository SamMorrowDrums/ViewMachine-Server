(function (VM, h) {
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
      if (h.call(data, row)){
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
        if (h.call(data, row)) {
          tempData[row] = data[row];
          if (! h.call(this.currentData, row)) {
            temp = new VM.El('tr');
            for (var n = 0; n < rows; n++) {
              if (h.call(data[row], this.keys[n])) {
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
              if (h.call(data[row], this.keys[x])) {
                if (data[row][this.keys[x]] !== this.currentData[row][this.keys[x]]){
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
    return img;
  };

  VM.properties.img = ['src', 'preload'];

  return VM;
}(exports, Object.prototype.hasOwnProperty));