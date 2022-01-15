// based on: https://github.com/Redmega/bitburner-scripts/blob/main/dist/repl.js

/** @param {import('/os/plugins/api_adapter.js').API_Object} api */
async function mainPlugin(api){
	let repl = new REPL_API(api);
	repl.run();
}

class REPL_API {
    constructor(api) {
		this.version = "v0.0.1";
        this.focusInput = (event) => {
            this.input.focus();
        };
        this.formSubmit = (event) => {
            event.preventDefault();
            const command = this.input.value;
            this.runCommand(command);
            this.input.value = "";
            this.input.focus();
		};
		this.#api = api;
		this.#os = api.os;
		this.#doc = globalThis["document"]
	}

	run() {
		this.#render();
		this.#mount();
	}

	#render() {
		let classes = this.#api.classes;
		let windowWidget = classes.newWindowWidget(this);
		windowWidget.init();
		let content = windowWidget.getContentDiv();
		content.classList.add('whiteScrollbar')
		content.style['background-color'] = 'black';
		content.style.height = '100%';
		content.parentNode.style['align-items'] = 'stretch'
		windowWidget.setTitle('REPL')
		windowWidget.show();
		windowWidget.addMenuItem({ label: 'About', callback: () => this.#onAboutMenuClick() })

		this.#windowWidget = windowWidget;
	}

    // FIXME: Probably brittle and will break at any update (possibly even between launches)
	#mount() {

		let x = this.#doc.querySelector('.MuiListItem-root.MuiListItem-gutters .MuiTypography-root.MuiTypography-body1');
		if (!x) {
			x = this.#doc.querySelector('.MuiTypography-root.MuiTypography-body1')
		}
        this.wrapper = this.#doc.createElement("form");
		this.wrapper.className = "MuiCollapse-wrapperInner MuiCollapse-vertical repl-wrapper"; // css-8atqhb 
		this.wrapper.style.width = '100%'
        this.log = this.#doc.createElement("div");
		this.log.className = "MuiBox-root repl-log MuiTypography-root MuiTypography-body1"; // css-14bb8ng";
		const inputContainer = this.#doc.createElement("div");
		if (x) {
			x.classList.forEach(cl => {
				inputContainer.classList.add(cl)
				this.log.classList.add(cl)
			})
			//inputContainer.className
		} else {
			inputContainer.style['color'] = 'rgb(0, 204, 0)';
			inputContainer.style['position'] = 'relative';
			inputContainer.style['background-color'] = 'rgb(34, 34, 34)';
			this.log.style['color'] = 'rgb(0, 204, 0)';
			this.log.style['position'] = 'relative';
			this.log.style['background-color'] = 'rgb(34, 34, 34)';
		}
        //inputContainer.className = "MuiTypography-root MuiTypography-body1 css-14bb8ng repl-input-wrapper";
        const replPreText = this.#doc.createElement("span");
		replPreText.textContent = "REPL >>";
		replPreText.style['white-space'] = 'nowrap';
		replPreText.style['margin-right'] = '8px';
        inputContainer.appendChild(replPreText);
        this.input = this.#doc.createElement("input");
        this.input.type = "text";
        this.input.id = "repl-input";
        //this.input.className = "repl-input";

		x = this.#doc.querySelector('#terminal-input');
		if (x) {
			x.classList.forEach(cl => {
				this.input.classList.add(cl)
			})
		} else {
			this.input.style['color'] = 'rgb(0, 204, 0)';
			this.input.style['position'] = 'relative';
			this.input.style['background-color'] = 'rgb(34, 34, 34)';
		}
		

        this.addStyleSheet("repl", `
.repl-wrapper {
	border-right: 1px solid rgb(68, 68, 68);
	display: flex;
	flex-direction: column;
	max-height: 312px;
	padding: 0 0.5rem;
}

.repl-log {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	user-select: text;
}

.repl-line {
	white-space: pre-wrap;
	overflow-wrap: anywhere;
	margin: 0;
}

.repl-line.error {
	color: #c00;
}

.repl-line.info {
	color: #36c;
}

.repl-line.success {
	color: #0c0;
}

.repl-line.warn {
	color: #cc0;
}

.repl-input-wrapper {
	display: flex;
	align-items: baseline;
	gap: 0.5rem;
}

.repl-input-wrapper > span {
    white-space: nowrap
}

.repl-input {
}
      `);
        inputContainer.appendChild(this.input);
        this.wrapper.appendChild(this.log);
        this.wrapper.appendChild(inputContainer);
        //this.menu = this.#doc.querySelector("div.MuiPaper-root.MuiPaper-elevation.MuiPaper-elevation1 div.MuiCollapse-wrapper.MuiCollapse-vertical.css-hboir5");
        //this.menu.children[0].classList.remove("css-8atqhb"); // Remove the width: 100%; from the other menu piece
        //this.menu.parentElement.parentElement.style.left = "0";
        //this.menu.prepend(this.wrapper);
		
		
		this.#windowWidget.getContentDiv().appendChild(this.wrapper);
		
		//this.#doc.addEventListener("keydown", this.overrideKeydown);
		this.input.addEventListener('keydown', e => e.stopPropagation());
        this.wrapper.addEventListener("click", this.focusInput);
        this.wrapper.addEventListener("submit", this.formSubmit);
        this.printLine(`BitburnerOS REPL ${this.version}`);
        this.printLine('Type "exit" to quit.');
    }

	unmount() {
        this.removeStyleSheet("repl");
        //this.menu.children[0].classList.add("css-8atqhb");
        //this.menu.parentElement.parentElement.style.left = null;
        this.wrapper.removeEventListener("click", this.focusInput);
        this.wrapper.removeEventListener("submit", this.formSubmit);
        this.wrapper.remove();
        //this.#doc.removeEventListener("keydown", this.overrideKeydown);
    }

	async runCommand(command) {
		console.log("runCommand");
        try {
			if (command === "exit") {
				this.#api.exit();
				return;
			}
            
			let result = await this.#os.getNS(async ns=> {
				return await eval(command);
			});
            
			this.printLine(result);

        }
        catch (error) {
			globalThis["window"].console.error(error);
            this.printLine(error.toString(), "error");
        }
    }

	printLine(value, className) {
        let text;
        if (typeof value === "object") {
            text = JSON.stringify(value);
        }
        else {
            text = value;
        }
        const line = this.#doc.createElement("p");
        line.className = "MuiTypography-root MuiTypography-body1 css-18ubon4 repl-line";
        line.classList.add(className);
        line.textContent = text;
        this.log.appendChild(line);
		this.#windowWidget.getContentDiv().scrollTo({ top: this.#windowWidget.getContentDiv().scrollHeight });
        // @TODO: Clear log when reaching line cap (1000?)
    }

	addStyleSheet(key, content) {
        let sheet = this.#doc.querySelector(`style[data-key="${key}"]`);
        if (!sheet) {
            sheet = this.#doc.createElement("style");
            sheet.dataset.key = key;
            this.#doc.head.appendChild(sheet);
        }
        sheet.textContent = content;
    }

	removeStyleSheet(key) {
        var _a;
        (_a = this.#doc.querySelector(`style[data-key="${key}"]`)) === null || _a === void 0 ? void 0 : _a.remove();
	}

	#windowWidget
	#aboutWindow
	#doc
	#os
	#api

	#onAboutMenuClick() {
		if (!this.#aboutWindow) {
			this.#aboutWindow = this.#os.getGUI().createAboutWindow({
				'Name': 'Bitburner REPL',
				'Author': 'Redmega#9832',
				'URL': 'https://github.com/Redmega/bitburner-scripts/blob/main/dist/repl.js'
			});
		}
		this.#aboutWindow.show()
	}
}