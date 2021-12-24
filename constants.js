export const DOM_CONSTANTS = {
	terminalInputId: 'terminal-input',
	siblingBtnSelector: '.MuiList-root .MuiButtonBase-root',
	terminalBtnSelector: '.MuiList-root .MuiList-root .MuiButtonBase-root',
	siblingButtonLabel: 'Active Scripts',
	fileExplorerBtnId: 'file-explorer-button',
	hiddenClass: 'block-but-hidden',
	myCustomWindowId: 'custom-window',
};


export const INJECTED_CSS = `
.btn {
	background-color: #d6cec8;
	border: none;
	box-shadow: inset -1px -1px #404040,inset 1px 1px #fff,inset -2px -2px gray,inset 2px 2px #eceae7;
	font-size: 13px;
	height: 26px;
	padding: 4px 6px;
	text-decoration: none;
	vertical-align: middle;
}

.btn:active {
	box-shadow: inset -1px -1px #fff,inset 1px 1px #404040,inset -2px -2px #eceae7,inset 2px 2px gray;
	padding: 5px 5px 3px 7px;
}

.btn--small {
	font-size: 10px;
	height: 18px;
	min-width: 18px;
}

.btn--small, .btn--small:active {
	padding: 3px;
}

.btn > * {
	pointer-events: none;
}

.window-container {
	bottom: 0;
	left: 0;
	pointer-events: none;
	position: fixed;
	top: 0;
	width: 100%;
	z-index: 1200;
	user-select: none;
}

.window-container--focused .window__toolbar {
	background: linear-gradient(to right,#0A246A 0%,#A6CAF0 100%);
	color: #fff;
}

.window-container * {
	box-sizing: border-box;
}

.window {
	align-items: center;
	box-shadow: inset -1px -1px #404040,inset 1px 1px #eceae7,inset -2px -2px gray,inset 2px 2px #fff;
	display: inline-flex;
	flex-wrap: wrap;
	font-family: Tahoma, "Segoe UI", Geneva, sans-serif;
	max-width: 65vw;
	min-width: 35vw;
	padding: 2px;
	pointer-events: auto;
}

.window__toolbar {
	background: gray;
	border: 1px solid #D4D0C8;
	display: flex;
	padding: 3px 3px 3px 8px;
	user-select: none;
	width: 100%;
}

.window__icon {
	align-self: center;
	max-height: 16px;
	margin-right: 6px;
	object-fit: contain;
	width: 16px;
}

.window__title {
	align-self: center;
	flex: 0 1 100%;
	font-size: 13px;
	font-weight: bold;
	line-height: 20px;
	margin: 0 20px 0 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.window__cta-group {
	align-items: center;
	display: flex;
	flex: 1 0 auto;
	margin-left: auto;
}

.window__cta-group > * {
	background-position: 50% 50%;
	background-size: 14px auto;
}

.window__cta-close {
	background-image:  url('data:image/svg+xml;base64,PCFET0NUWVBFIGh0bWw+DQo8aHRtbCB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCI+PGhlYWQ+PG1ldGEgbmFtZT0idmlld3BvcnQiIGNvbnRlbnQ9IndpZHRoPWRldmljZS13aWR0aCIgLz48dGl0bGU+aHR0cHM6Ly93aWdnbHliZWVzLmNvbS9hc3NldHMvY2xvc2UuMmJiZGU5ZDguc3ZnPC90aXRsZT48bGluayByZWw9InN0eWxlc2hlZXQiIHR5cGU9InRleHQvY3NzIiBocmVmPSJyZXNvdXJjZTovL2NvbnRlbnQtYWNjZXNzaWJsZS92aWV3c291cmNlLmNzcyIgLz48L2hlYWQ+PGJvZHkgaWQ9InZpZXdzb3VyY2UiIGNsYXNzPSJ3cmFwIGhpZ2hsaWdodCIgc3R5bGU9InRhYi1zaXplOiA0Ij48cHJlIGlkPSJsaW5lMSI+PHNwYW4+PC9zcGFuPjxzcGFuPiZsdDs8c3BhbiBjbGFzcz0ic3RhcnQtdGFnIj5zdmc8L3NwYW4+IDxzcGFuIGNsYXNzPSJhdHRyaWJ1dGUtbmFtZSI+eG1sbnM8L3NwYW4+PSI8YSBjbGFzcz0iYXR0cmlidXRlLXZhbHVlIj5odHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZzwvYT4iIDxzcGFuIGNsYXNzPSJhdHRyaWJ1dGUtbmFtZSI+dmlld0JveDwvc3Bhbj49IjxhIGNsYXNzPSJhdHRyaWJ1dGUtdmFsdWUiPjAgMCAxOCAxODwvYT4iJmd0Ozwvc3Bhbj48c3Bhbj4NCjxzcGFuIGlkPSJsaW5lMiI+PC9zcGFuPgk8L3NwYW4+PHNwYW4+Jmx0OzxzcGFuIGNsYXNzPSJzdGFydC10YWciPmc8L3NwYW4+IDxzcGFuIGNsYXNzPSJhdHRyaWJ1dGUtbmFtZSI+c3Ryb2tlPC9zcGFuPj0iPGEgY2xhc3M9ImF0dHJpYnV0ZS12YWx1ZSI+IzAwMDwvYT4iIDxzcGFuIGNsYXNzPSJhdHRyaWJ1dGUtbmFtZSI+c3Ryb2tlLXdpZHRoPC9zcGFuPj0iPGEgY2xhc3M9ImF0dHJpYnV0ZS12YWx1ZSI+MS41PC9hPiImZ3Q7PC9zcGFuPjxzcGFuPg0KPHNwYW4gaWQ9ImxpbmUzIj48L3NwYW4+CQk8L3NwYW4+PHNwYW4+Jmx0OzxzcGFuIGNsYXNzPSJzdGFydC10YWciPmxpbmU8L3NwYW4+IDxzcGFuIGNsYXNzPSJhdHRyaWJ1dGUtbmFtZSI+eDE8L3NwYW4+PSI8YSBjbGFzcz0iYXR0cmlidXRlLXZhbHVlIj4zPC9hPiIgPHNwYW4gY2xhc3M9ImF0dHJpYnV0ZS1uYW1lIj55MTwvc3Bhbj49IjxhIGNsYXNzPSJhdHRyaWJ1dGUtdmFsdWUiPjM8L2E+IiA8c3BhbiBjbGFzcz0iYXR0cmlidXRlLW5hbWUiPngyPC9zcGFuPj0iPGEgY2xhc3M9ImF0dHJpYnV0ZS12YWx1ZSI+MTU8L2E+IiA8c3BhbiBjbGFzcz0iYXR0cmlidXRlLW5hbWUiPnkyPC9zcGFuPj0iPGEgY2xhc3M9ImF0dHJpYnV0ZS12YWx1ZSI+MTU8L2E+IiA8c3Bhbj4vPC9zcGFuPiZndDs8L3NwYW4+PHNwYW4+DQo8c3BhbiBpZD0ibGluZTQiPjwvc3Bhbj4JCTwvc3Bhbj48c3Bhbj4mbHQ7PHNwYW4gY2xhc3M9InN0YXJ0LXRhZyI+bGluZTwvc3Bhbj4gPHNwYW4gY2xhc3M9ImF0dHJpYnV0ZS1uYW1lIj54Mjwvc3Bhbj49IjxhIGNsYXNzPSJhdHRyaWJ1dGUtdmFsdWUiPjM8L2E+IiA8c3BhbiBjbGFzcz0iYXR0cmlidXRlLW5hbWUiPnkxPC9zcGFuPj0iPGEgY2xhc3M9ImF0dHJpYnV0ZS12YWx1ZSI+MzwvYT4iIDxzcGFuIGNsYXNzPSJhdHRyaWJ1dGUtbmFtZSI+eDE8L3NwYW4+PSI8YSBjbGFzcz0iYXR0cmlidXRlLXZhbHVlIj4xNTwvYT4iIDxzcGFuIGNsYXNzPSJhdHRyaWJ1dGUtbmFtZSI+eTI8L3NwYW4+PSI8YSBjbGFzcz0iYXR0cmlidXRlLXZhbHVlIj4xNTwvYT4iIDxzcGFuPi88L3NwYW4+Jmd0Ozwvc3Bhbj48c3Bhbj4NCjxzcGFuIGlkPSJsaW5lNSI+PC9zcGFuPgk8L3NwYW4+PHNwYW4+Jmx0Oy88c3BhbiBjbGFzcz0iZW5kLXRhZyI+Zzwvc3Bhbj4mZ3Q7PC9zcGFuPjxzcGFuPg0KPHNwYW4gaWQ9ImxpbmU2Ij48L3NwYW4+PC9zcGFuPjxzcGFuPiZsdDsvPHNwYW4gY2xhc3M9ImVuZC10YWciPnN2Zzwvc3Bhbj4mZ3Q7PC9zcGFuPjxzcGFuPg0KPHNwYW4gaWQ9ImxpbmU3Ij48L3NwYW4+PC9zcGFuPjwvcHJlPjwvYm9keT48L2h0bWw+');
}

/* TODO: buttons */

.window__content {
	background: #FFF;
	border: 2px solid #D4D0C8;
	border-top: none;
	display: flex;
	flex: 1 0 auto;
	height: inherit;
	max-height: 75vh;
	min-height: 27vh;
	padding: 6px;
	width: 100%;
}

.file-list {
	align-content: flex-start;
	display: flex;
	flex-wrap: wrap;
	list-style: none;
	margin: 0;
	overflow: auto;
	padding: 0;
}

.file-list__item {
	margin-bottom: 8px;
	text-align: center;
	width: 100px;
}

.file-list__button {
	align-items: center;
	appearance: none;
	border: 1px dotted transparent;
	border-radius: 2px;
	background: none;
	display: flex;
	flex-direction: column;
	margin: 0;
	padding: 2px;
	width: inherit;
}

.file-list__button:focus {
	background: rgba(15, 75, 255, .3);
	border-color: #222;
}

.file-list__icon {
	height: 38px;
	width: 32px;
}

.file-list__label {
	color: #222;
	text-shadow: none;
	word-wrap: anywhere;
}

.block-but-hidden {
	display: block !important;
	visibility: hidden !important;
}
`;

export const directorySvg = `
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 64 64"
		class="file-list__icon"
	>
		<path
			d="M5 8v43a4 4 0 0 0 4 4h46a4 4 0 0 0 4-4V13H25l-5-5H5zm50 11v32H9V20l46-1zm-15.84 4-12.965 1.586 3.494 3.492C27.62 30.333 26 33.221 26 36.814 26 43.711 31 48 31 48l3-2s-3-3.977-3-8c0-2.346 1.18-4.115 3.037-5.574l3.54 3.539L39.16 23z"
		/>
	</svg>
`
export const jsSvg = `
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		class="file-list__icon"
	>
		<path
			fill="#5B5B5B"
			d="M11.5 12h-3a.5.5 0 0 0 0 1H11v3.5c0 .827-.673 1.5-1.5 1.5S8 17.327 8 16.5a.5.5 0 0 0-1 0C7 17.879 8.121 19 9.5 19s2.5-1.121 2.5-2.5v-4a.5.5 0 0 0-.5-.5zM14.736 13H16.5c.275 0 .5.225.5.5a.5.5 0 0 0 1 0c0-.827-.673-1.5-1.5-1.5h-1.764c-.957 0-1.736.779-1.736 1.736 0 .661.368 1.256.96 1.553l2.633 1.316A.737.737 0 0 1 16.264 18H14.5a.501.501 0 0 1-.5-.5.5.5 0 0 0-1 0c0 .827.673 1.5 1.5 1.5h1.764c.957 0 1.736-.779 1.736-1.736a1.73 1.73 0 0 0-.96-1.553l-2.633-1.316A.737.737 0 0 1 14.736 13z"
		/>
		<path
			fill="#5B5B5B"
			d="M22.5 10H21V1.5a.5.5 0 0 0-.5-.5h-11c-.023 0-.044.01-.066.013a.509.509 0 0 0-.288.133l-5 5a.505.505 0 0 0-.133.289C4.01 6.457 4 6.477 4 6.5V10H2.5a.5.5 0 0 0-.5.5v10a.5.5 0 0 0 .5.5H4v2.5a.5.5 0 0 0 .5.5h16a.5.5 0 0 0 .5-.5V21h1.5a.5.5 0 0 0 .5-.5v-10a.5.5 0 0 0-.5-.5zM9 2.707V6H5.707L9 2.707zM5 7h4.5a.5.5 0 0 0 .5-.5V2h10v8H5V7zm15 16H5v-2h15v2zm2-3H3v-9h19v9z"
		/>
	</svg>
`

export const windowIcon = 'data:image/webp;base64,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'
