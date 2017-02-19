let config = {
    codeBlockSelector: ".javascript",
    indexSelector: "#content-index",
    headlineSelector: "h2"
};

function pipe(data, ...methods) {
    let result = data;

    for (let method of methods) {
        result = method.bind(this)(result);
    }

    return result;
}

class CodeConverter {
    constructor(index) {
        this.index = index;
    }

    convert(code) {
        return pipe.bind(this)(code, this.removeHtmlEntities, this.decodeEntities, this.addResultHandling);
    }

    addResultHandling(code) {
          return code
          .replace(/console/, `clearResult("${this.index}"); \nconsole`)
          .replace(/console.log\((.*)\).*/g, `
          try {
              addResult('${this.index}', '$1 -> ' + $1);
          }
          catch(e) {
              addResult('${this.index}', '$1 -> '+ e);
          }`);
	}

    decodeEntities(encodedString) {
    	let textArea = document.createElement("textarea");

        textArea.innerHTML = encodedString;

        return textArea.value;
    }

    removeHtmlEntities(text) {
        return text.replace(/<(?:.|\/)(?:.|\n)*?>/gm, '');
    }
}

class CodeBlock {
	constructor(element, index) {
    	this.index = index;
    	this.codeConverter = new CodeConverter(index)
    	this.element = element;
    	this.addFunctionalityToLangBlock();
	}

	execute() {
    	try {
      		this.convertAndExecute();
    	} catch (e) {
      		console.log(e);

			addResult(this.index, e)
    	}
  	}

  	convertAndExecute() {
    	let code = this.codeConverter.convert(this.element.innerHTML);

		eval.apply(window, [code]);
	}

	addFunctionalityToLangBlock() {
		this.addExecutionButton();
      	this.addCodeBlockClass();
      	this.addContentEditableAttribute();
	}

	addCodeBlockClass() {
    	$(this.element).addClass(`codeblock-${this.index}`);
	}

	addExecutionButton() {
    	$(this.element).parent().after(`
        	<button onclick="executeCode('${this.index}')">Evaluate</button>
        	<div class="results" id="${this.index}"></div>
		`);
	}

  	addContentEditableAttribute() {
    	$(this.element).prop("contenteditable", "true");
  	}
}

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
    	$(this.config.codeBlockSelector).each((index, element) => {
      		this.codeBlocks.set(index, new CodeBlock(element, index));
    	});
  	}

  	addIndex() {
    	$(this.config.headlineSelector).each((index, element) => {
      		$(element).wrap(`<a name="${element.innerHTML}"></a>`)
      		$(this.config.indexSelector).append(`<li><a href="#${element.innerHTML}">${element.innerHTML} </a></li>`);
    	});
	}

	addCodeHighlight() {
    	$("pre > code").each((i, block) => {
      		hljs.highlightBlock(block);
    	});
	}
}

function addResult(id, res) {
	document.getElementById(id).innerHTML += `<p>${res}</p>`;
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

const converter = new showdown.Converter();
const page = new Page(config);

$.get("README.md", data => {
    $("#content").html(converter.makeHtml(data));
});

$(document).ajaxStart(() => {
    $("#loading").show();
}).ajaxComplete(() => {
    $("#loading").hide();
    page.initialize();
});
