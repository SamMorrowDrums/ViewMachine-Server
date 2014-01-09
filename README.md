ViewMachine
===========

VM is a plugin designed to be used with jQuery, to generate templates, with dynamically loaded content. Offering a slightly different perspective on website templating, VM is easy to use, and while currently in it's early stages, this system has proven very effective for certain types of content already, and can work well for single page apps.

Using VM enables you to keep your entire codebase in Javascript, rather than using HTML templating systems, or derivatives.

Please use, fork, improve and submit a pull request if you want to contribute. All contributions welcome.

Usage
-----

In your HTML include:

```html
<script src="js/viewMachine.js"></script>
<script src="js/templateMachine.js"></script>
```

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

If you take a look at the generated table,  and then look at 'person X' in the data, you will see that the 'Favourite Fruits' property was nested in a 'preferences' object, and there was other information beside it, but only the selected keys were found and displayed, recursively.

#### Forms

Forms have more variation, and require specific ordering. This is achieved by using objects, nested in a list. For syntax look at `machines.exampleForm`, at the bottom of the ViewMachine.js source code:

```javascript
var form = ViewMachine.exampleForm;
var $form = ViewMachine.makeForm(form);
$('body').append($form);
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

You can now construct complex structures, with parts that are only generated after an AJAX call, and then you can use the more basic generation to replace parts later on, or to add parts.

A good example of this is you can render a form with a blank select box, then afterwards use the makeElement method to generate a list of options.

This is still a work in progress, and while it is currently useable, it may go through versions and breaking changes - so it is probably best to use this, if you feel up to editing the source yourself. If you dislike any behaviours, fix them. Then create a pull request.

Better Documentation, particularly of the templates would also be beneficial (and example files, and some generic CSS), as this does not cover all the elements that are specifically accounted for.

Please also let us know if you use it.