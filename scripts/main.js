let config = {
    codeBlockSelector: ".lang-javascript,.javascript",
    indexSelector: "#content-index",
    headlineSelector: "h2"
};

function pipe(data, ...methods) {
    let result = data;

    for (method of methods) {
        result = method.bind(this)(result)
    }

    return result;
}

class CodeConverter {
    constructor(index) {
        this.index = index;
    }

  convert(code) {
    return pipe.bind(this)(code,
      this.removeHtmlEntities,
      this.decodeEntities,
      this.addResultHandling
    );
  }

  addResultHandling(code) {
    return code
      .replace(/console/, `clearResult("${this.index}"); \nconsole`)
      .replace(/console.log\((.*)\).*/g, `
      try {
          let _______a = $1;
          if(typeof(_______a) === 'object' && _______a != window) {
              _______a = JSON.stringify(_______a)
          }
          addResult('${this.index}', '$1 -> ' + _______a);
      }
      catch(e) {
          addResult('${this.index}', '$1 -> '+ e);
      }`)

  }

  decodeEntities(encodedString) {
    let textArea = document.createElement('textarea');
    textArea.innerHTML = encodedString;
    return textArea.value;
  }


  removeHtmlEntities(text) {
    return text.replace(/<(?:.|\/)(?:.|\n)*?>/gm, '');
  }
}

/**
 * CodeBlock class, representing a code block
 */
class CodeBlock {
  constructor(element, index) {
    this.index = index;
    this.codeConverter = new CodeConverter(index)
    this.isExecutable = !element.innerHTML.includes("no-eval")
    this.element = element
    this.addFunctionalityToLangBlock();
  }

  execute() {
    try {
      this.convertAndExecute();
    } catch (e) {
      console.log(e)
      addResult(this.index, e)
    }
  }

  convertAndExecute() {
    let code = this.codeConverter.convert(this.element.innerHTML);
    eval.apply(window, [code]);
  }

  addFunctionalityToLangBlock() {
    if (this.isExecutable) {
      this.addExecutionButton();
      this.addCodeBlockClass();
      this.addContentEditableAttribute();
    } else {
      this.removeNoEval(this.element.innerHTML);
    }
  }

  addCodeBlockClass() {
    $(this.element).addClass("codeblock-" + this.index);
  }

  addExecutionButton() {
    $(this.element).parent().after(`
        <button onclick="executeCode('${this.index}')">Evaluate</button>
        <div class="results" id="${this.index}"></div>
    `)
  }

  addContentEditableAttribute() {
    $(this.element).prop('contenteditable', 'true');
  }

  /*removeNoEval(s) {
    this.element.innerHTML = this.element.innerHTML.replace(/no-eval.*\n/, "")
}*/

}

/**
 * Page class representing the entire page
 */
class Page {
  constructor(config) {
    this.config = config;
    this.codeBlocks = new Map();
  }

  initialize() {
    this.initializeCodeBlocks();
    this.addIndex();
    this.addCodeHighlight();
  }

  initializeCodeBlocks() {
    $(this.config.codeBlockSelector).each((i, element) => {
      this.codeBlocks.set(i, new CodeBlock(element, i));
    })
  }

  addIndex() {
    $(this.config.headlineSelector).each((_, element) => {
      $(element).wrap(`<a id="${element.innerHTML}"></a>`)
      $(this.config.indexSelector).append(`<li><a href="#${element.innerHTML}">${element.innerHTML} </a></li>`);

      console.log(element)
    })

    $(this.config.headlineSelector).each(function(index) {
        console.log(index);
    });
  }

  addCodeHighlight() {
    $('pre code').each(function (i, block) {
      hljs.highlightBlock(block);
    });
  }

}


// =========================================================================
// Global Methods
// =========================================================================

function addResult(id, res) {
  document.getElementById(id).innerHTML += res + "<br />";
}

function clearResult(id) {
  document.getElementById(id).innerHTML = "";
}

function executeCode(index) {
  let codeBlock = page.codeBlocks.get(parseInt(index));
  if (codeBlock) {
    codeBlock.execute();
  }

}

let converter = new showdown.Converter();

$.get("README.md", function (data) {
    $("body").append(converter.makeHtml(data));
});

var page = new Page(config);

$( document ).ajaxComplete(function() {
    page.initialize();
});
