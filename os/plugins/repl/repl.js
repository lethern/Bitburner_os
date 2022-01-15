// based on: https://github.com/Redmega/bitburner-scripts/blob/main/dist/repl.js

/** @param {import('/os/plugins/api_adapter.js').API_Object} api */
async function mainPlugin(api){
	let repl = new REPL_API(api);
	repl.run();
}

class REPL_API {
	/** @param {import('/os/plugins/api_adapter').API_Object} api */
	constructor(api) {
		this.version = "v0.0.1";
		
		this.#api = api;
		this.#os = api.os;
		this.#doc = globalThis["document"]
	}

	run() {
		this.#createWindow();
		this.#mount();
	}

	focusInput(event) {
		this.input.focus();
	}

	formSubmit(event) {
		event.preventDefault();

		const command = this.input.value;
		this.runCommand(command);
		this.input.value = "";
		this.input.focus();
	}

	#createWindow() {
		let windowWidget = this.#api.classes.newWindowWidget(this);
		this.#windowWidget = windowWidget;
		windowWidget.init();

		let content = windowWidget.getContentDiv();
		content.classList.add('whiteScrollbar')
		content.style['background-color'] = 'black';
		content.style.height = '100%';
		content.parentNode.style['align-items'] = 'stretch'
		windowWidget.setTitle('REPL')
		windowWidget.show();
		windowWidget.addMenuItem({ label: 'About', callback: () => this.#onAboutMenuClick() })
	}

	// FIXME: Probably brittle and will break at any update (possibly even between launches)
	#mount() {

		this.wrapper = this.#doc.createElement("form");
		this.wrapper.className = "MuiCollapse-wrapperInner MuiCollapse-vertical repl-wrapper"; // css-8atqhb 
		this.wrapper.style.width = '100%'

		this.log = this.#doc.createElement("div");
		this.log.className = "MuiBox-root repl-log MuiTypography-root MuiTypography-body1"; // css-14bb8ng";
		const inputContainer = this.#doc.createElement("div");

		let foundListItem = this.#doc.querySelector('.MuiListItem-root.MuiListItem-gutters .MuiTypography-root.MuiTypography-body1');
		if (!foundListItem) {
			foundListItem = this.#doc.querySelector('.MuiTypography-root.MuiTypography-body1')
		}
		if (foundListItem) {
			foundListItem.classList.forEach(cl => {
				inputContainer.classList.add(cl)
				this.log.classList.add(cl)
			})
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

		foundListItem = this.#doc.querySelector('#terminal-input');
		if (foundListItem) {
			foundListItem.classList.forEach(cl => {
				this.input.classList.add(cl)
			})
		} else {
			this.input.style['color'] = 'rgb(0, 204, 0)';
			this.input.style['position'] = 'relative';
			this.input.style['background-color'] = 'rgb(34, 34, 34)';
		}

		this.#os.getGUI().injectCSS(REPL_css, "REPL_css");

		inputContainer.appendChild(this.input);
		this.wrapper.appendChild(this.log);
		this.wrapper.appendChild(inputContainer);
		
		this.#windowWidget.getContentDiv().appendChild(this.wrapper);
		
		this.input.addEventListener('keydown', e => e.stopPropagation());
		this.wrapper.addEventListener("click", this.focusInput);
		this.wrapper.addEventListener("submit", this.formSubmit);
		this.printLine(`BitburnerOS REPL ${this.version}`);
		this.printLine('Type "exit" to quit.');
	}

	unmount() {
		this.wrapper.removeEventListener("click", this.focusInput);
		this.wrapper.removeEventListener("submit", this.formSubmit);
		this.wrapper.remove();
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

	#windowWidget
	#aboutWindow
	#doc
	#os
	#api

	#onAboutMenuClick() {
		if (!this.#aboutWindow) {
			this.#aboutWindow = this.#os.getGUI().createAboutWindow({
				'Name': 'Bitburner REPL',
				'Description': 'Allows to execute any single line of javascript, including most of NS functions',
				'Author': 'Redmega#9832',
				'URL': 'https://github.com/Redmega/bitburner-scripts/blob/main/dist/repl.js'
			});
		}
		this.#aboutWindow.show()
	}
}

const REPL_css = `
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
`;
