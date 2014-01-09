var ViewMachine = (function (VM) {
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
}(ViewMachine));