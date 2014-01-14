ViewMachine
===========

VM is a plugin designed to be used with jQuery, to generate templates, with dynamically loaded content. Offering a slightly different perspective on website templating, VM is easy to use, and while currently in it's early stages, this system has proven very effective for certain types of content already, and can work well for single page apps.

Using VM enables you to keep your entire codebase in Javascript, rather than using HTML templating systems, or derivatives.

Please use, fork, improve and submit a pull request if you want to contribute. All contributions welcome.

**To Follow along with the below examples, please include the below HTML Script tags in your head, and a blank `<body></body>` tag. You can paste example code directly into the javascript console, in the eveloper tools of every major browser**

*Some browsers may not allow you to include local JS files, if you have problems, either work on a server or include the contents of the two script files in script tags in your html page.*

Usage
-----

In your HTML include:

```html
<script src="viewmachine.js"></script>
```

*or*

```html
<script src="viewmachine.min.js"></script>
```

Alternatively you can visit the JSFiddle at: http://jsfiddle.net/Vk9r9/

Then in your main JS file you can already use ViewMachine, however you can add `Viewmachine = VM` to the top of your JS file, if VM won't conflict with anything in your namespace.

If you use the JS module pattern import ViewMachine to your module like this:

```javascript
myModule = (function (VM){
  // Then access the ViewMachine methods like using just VM
}(ViewMachine));
```

Basic Types
-----------

#### Lists

To create an HTML UL element, simply call the VM.makeList method, with a list or JS object, if you are feeling adventurous (with an object you can actually then assign ID's to your elements, with keys {id: "My List"}, and lists of objects)...

```javascript
var myList = ['These', 'Are', 'List', 'Elements'];
var $list = ViewMachine.makeList(myList);

//Add it to the DOM with jQuery
$('body').append($list);
```

**Result**
```html
<body>
  <ul class="list">
    <li class="list" id="1">These</li>
    <li class="list" id="2">Are</li>
    <li class="list" id="3">List</li>
    <li class="list" id="4">Elements</li>
  </ul>
</body>
```

Here is another example, with which you could create a list based menu (the keys are IDs, so you can use JS event listeners on the IDs, rather than using hyperlinks):

```javascript
var menu = [{home: "HOME"}, {users: "Users"}, {system: 'System Settings'}, {logs: 'Logs'}];

//Generate and fire straigh into the DOM
$('body').append(ViewMachine.makeList(menu));

//Interact
$('#home').click(function(e){
  alert('You clicked on HOME');
});

```

**Result**
```html
<body>
  <ul class="list">
    <li class="item" id="home">HOME</li>
    <li class="item" id="users">Users</li>
    <li class="item" id="system">System Settings</li>
    <li class="item" id="logs">Logs</li>
  </ul>
</body>
```


If you are feeling really adventurous, you can use any depth of nested objects and lists, and VM will try it's best to do what it thinks you want, however this is not easy, as people could reasonably expect different behaviours. You could also cause a stack overflow it it's too deep an object, as VM will inspect the object recursively.


#### Tables

To create an HTML Table element, simply call the VM.makeTable method with a list of keys you want to find, and a JS object that (mostly) have values for those keys. As you can see below, this system is designed for nested objects with repeated data, as that is how tables are constructed:

```javascript
var keys = ['first name', 'last name', 'age', 'favourite fruits'];
var data = {
  'person 1': {
    'first name': 'Steve',
    'last name': 'Davis',
    'age': 20,
    'favourite fruits': ['Limes', 'Lemons', 'Pears']
  },
  'person 2': {
    'first name': 'Sam',
    'last name': 'Morrow',
    'age': 27,
    'favourite fruits': 'figs'
  },
  'person 3': {
    'first name': 'Steve',
    'last name': 'Davis',
    'age': 15,
    'favourite fruits': ['tomatoes', 'lychees']
  },
  'person x': {
    'first name': 'Kermit',
    'last name': 'The Frog',
    preferences: {
      food: 'Cookies',
      'favourite fruits': 'pineapple',
      friends: "Big Bird"
    }
  },
};
var $table = ViewMachine.makeTable(keys, data);

//Add it to the DOM with jQuery
$('body').append($table);
```

**Result**
```html
<body>
  <table class="classic">
    <thead>
      <tr class="title">
        <th class="first name">First Name</th>
        <th class="last name">Last Name</th>
        <th class="age">Age</th>
        <th class="favourite fruits">Favourite Fruits</th>
      </tr>
    </thead>
    <tbody>
      <tr class="row">
        <td class="first name">Steve</td>
        <td class="last name">Davis</td>
        <td class="age">20</td>
        <td class="favourite fruits">Limes, Lemons, Pears</td>
      </tr>
      <tr class="row">
        <td class="first name">Sam</td>
        <td class="last name">Morrow</td>
        <td class="age">27</td>
        <td class="favourite fruits">figs</td>
      </tr>
      <tr class="row">
        <td class="first name">Steve</td>
        <td class="last name">Davis</td>
        <td class="age">15</td>
        <td class="favourite fruits">tomatoes, lychees</td>
      </tr>
      <tr class="row">
        <td class="first name">Kermit</td>
        <td class="last name">The Frog</td>
        <td class="age none"></td>
        <td class="favourite fruits">pineapple</td>
      </tr>
    </tbody>
  </table>
</body>
```


If you take a look at the generated table,  and then look at 'person X' in the data, you will see that the 'Favourite Fruits' property was nested in a 'preferences' object, and there was other information beside it, but only the selected keys were found and displayed, recursively.

#### Forms

Forms have more variation, and require specific ordering. This is achieved by using objects, nested in a list. For syntax look at `machines.exampleForm`, at the bottom of the ViewMachine.js source code:

```javascript
var form = ViewMachine.exampleForm;
var $form = ViewMachine.makeForm(form);
$('body').append($form);
```

**Result**
```html
<body>
  <form class="MyForm">
    <fieldset class="myFields">
      <label class="customClass" for="myField">My Fav Textarea:</label>
      <textarea name="myField" id="myField"></textarea>
      <br>
      <label class="input" for="myField">My Fav Textarea:</label>
      <input name="myField" id="myField">
      <br>
      <label class="radio" for="Male">Male:</label>
      <input class="radio" id="Male" type="radio" name="label2" value="m"></input>
      <label class="radio" for="Female">Female:</label>
      <input class="radio" id="Female" type="radio" name="label2" value="f" checked="checked"></input>
      <br>
      <label class="checkbox" for="Male">Male:</label>
      <input class="checkbox" id="Male" type="checkbox" name="Male" value="m"></input>
      <label class="checkbox" for="Female">Female:</label>
      <input class="checkbox" id="Female" type="checkbox" name="Female" value="f" checked="checked"></input>
      <br>
      <label class="select" for="selectBox">My Select Box:</label>
      <select class="selectBox" id="selectBox">
        <option class="select" id="1" value="1">opt1</option><option class="select" id="2" value="2" selected="selected">opt2</option>
        <option class="select" id="3" value="3">opt3</option>
      </select>
      <br>
      <label class="select" for="selectBox2">Same - No Values Or Selected Specified:</label>
      <select class="selectBox2" id="selectBox2">
        <option class="select" id="opt1" value="opt1">opt1</option>
        <option class="select" id="opt2" value="opt2">opt2</option>
        <option class="select" id="opt3" value="opt3">opt3</option>
      </select>
      <br>
      <label class="select multiple" for="multipleSelect">Same - No Values Or Selected Specified:</label>
      <select class="multipleSelect" id="multipleSelect" multiple="multiple">
        <option class="select multiple" id="opt1" value="opt1">opt1</option>
        <option class="select multiple" id="opt2" value="opt2">opt2</option>
        <option class="select multiple" id="opt3" value="opt3">opt3</option>
      </select>
      <br>
      <button class="button" id="myButton" onclick="alert('I will not submit to you'); return false;">Submit Yourself!</button><br>
    </fieldset>
  </form>
</body>
```

#### General Elements

To make lower level elements you can call `VM.makeElement` directly params are (type, class, innerTXT, id, number, paramObject):

```javascript
var $el = ViewMachine.makeElement('p', 'myclass', 'Some Text', 'theid', 1, {align: 'right'});
var $el2 = ViewMachine.makeElement('div');

//put the paragraph in the div
$($el2).append($el);

//put the div in the DOM
$('body').append($el2);


//Do some stuff to it
$('.myclass').css('color', 'red');
$('theid1').css('font-size', '50pt');
$('.myclass').parent().css('width', '400px');
$('.myclass').parent().css('background-color', 'blue');
```

**Result**
```html
<body>
  <div style="width: 400px; background-color: blue;">
    <p class="myclass" id="theid1" align="right" style="color: red;">Some Text</p>
  </div>
</body>
```


Only the first parameter is required, and all of the others can be abstained from by simply usuing an empty string `''` in place of the parameter.

This is not a perfect implementation, but the number field allows you to add a generated number to each of the ids, so when you need objects with individual IDs, but the same class, you can create them purely through iteration.


Templates
---------

The best part of this system is that you can dymaically render complex templates, using these base elements as so:

```javascript

//You can create a template constructor function that you can then reuse for different applications (the methods at the bottom, enable you to change parts of the tempalte easily i.e. after an AJAX call)

var listForm = function () {
  this.name = "listForm";
  this.structure = [{"div:myclass": [{h2: "Example Template"}, {list: ViewMachine.exampleList}]}, {"div:anotherclass": [{h2: "Random Form"}, {form: ViewMachine.exampleForm}]}, {"div:x": {p: "A Paragraph"}}];
  var that = this;
  this.changeList = function (newList) {that.structure[0]["div:myclass"][1].list = newList; return; };
  this.changeForm = function (newForm) {that.structure[1]["div:anotherclass"][1].form = newForm; return; };
  this.changeName = function (name) {this.name = name; return; };
};

// When you want to use your template, use yor constructor function 
var myTemplate = new listForm();

//When you want to replace an element in the template, you can now apply one of your methods

myTemplate.changeList(['Birds', 'Bees', 'Camels', 'Tigers']);

//Render template
$template = ViewMachine.build(myTemplate);

//Now add the DOM
$('body').append($template);
```

**Result**
```html
<body>
  <div class="listForm view">
    <div class="myclass">
      <h2>Example Template</h2>
      <ul class="list">
        <li class="list" id="1">Birds</li>
        <li class="list" id="2">Bees</li>
        <li class="list" id="3">Camels</li>
        <li class="list" id="4">Tigers</li>
      </ul>
    </div>
    <div class="anotherclass">
      <h2>Random Form</h2>
      <form class="MyForm">
        <fieldset class="myFields">
          <label class="customClass" for="myField">My Fav Textarea:</label>
          <textarea name="myField" id="myField"></textarea>
          <br>
          <label class="input" for="myField">My Fav Textarea:</label>
          <input name="myField" id="myField">
          <br>
          <label class="radio" for="Male">Male:</label>
          <input class="radio" id="Male" type="radio" name="label2" value="m"></input>
          <label class="radio" for="Female">Female:</label>
          <input class="radio" id="Female" type="radio" name="label2" value="f" checked="checked"></input>
          <br>
          <label class="checkbox" for="Male">Male:</label>
          <input class="checkbox" id="Male" type="checkbox" name="Male" value="m"></input>
          <label class="checkbox" for="Female">Female:</label>
          <input class="checkbox" id="Female" type="checkbox" name="Female" value="f" checked="checked"></input>
          <br>
          <label class="select" for="selectBox">My Select Box:</label>
          <select class="selectBox" id="selectBox"><option class="select" id="1" value="1">opt1</option>
            <option class="select" id="2" value="2" selected="selected">opt2</option>
            <option class="select" id="3" value="3">opt3</option>
          </select>
          <br>
          <label class="select" for="selectBox2">Same - No Values Or Selected Specified:</label>
          <select class="selectBox2" id="selectBox2">
            <option class="select" id="opt1" value="opt1">opt1</option>
            <option class="select" id="opt2" value="opt2">opt2</option>
            <option class="select" id="opt3" value="opt3">opt3</option>
          </select>
          <br>
          <label class="select multiple" for="multipleSelect">Same - No Values Or Selected Specified:</label>
          <select class="multipleSelect" id="multipleSelect" multiple="multiple">
            <option class="select multiple" id="opt1" value="opt1">opt1</option>
            <option class="select multiple" id="opt2" value="opt2">opt2</option>
            <option class="select multiple" id="opt3" value="opt3">opt3</option>
          </select>
          <br>
          <button class="button" id="myButton" onclick="alert('I will not submit to you'); return false;">Submit Yourself!</button>
          <br>
        </fieldset>
      </form>
    </div>
    <div class="x">
      <p>A Paragraph</p>
    </div>
  </div>
</body>

```

You can now construct complex structures, with parts that are only generated after an AJAX call, and then you can use the more basic generation to replace parts later on, or to add parts.

A good example of this is you can render a form with a blank select box, then afterwards use the makeElement method to generate a list of options.

This is still a work in progress, and while it is currently useable, it may go through versions and breaking changes - so it is probably best to use this, if you feel up to editing the source yourself. If you dislike any behaviours, fix them. Then create a pull request.

Better Documentation, particularly of the templates would also be beneficial (and example files, and some generic CSS), as this does not cover all the elements that are specifically accounted for.

Please also let us know if you use it.