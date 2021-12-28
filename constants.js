/** @type { { terminalInputId: string, siblingBtnSelector: string, terminalBtnSelector: string, siblingButtonLabel: string, fileExplorerBtnId: string, hiddenClass: string, myCustomWindowId: string, windowFocusedClass: string} } */
export const DOM_CONSTANTS = {
	terminalInputId: 'terminal-input',
	siblingBtnSelector: '.MuiList-root .MuiButtonBase-root',
	terminalBtnSelector: '.MuiList-root .MuiList-root .MuiButtonBase-root',
	siblingButtonLabel: 'Active Scripts',
	fileExplorerBtnId: 'file-explorer-button',
	hiddenClass: 'block-but-hidden',
	myCustomWindowId: 'custom-window',
	windowFocusedClass: 'window--focused'
};


export const GENERAL_CSS = `
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

.block-but-hidden {
	display: block !important;
	visibility: hidden !important;
}

.whiteScrollbar::-webkit-scrollbar {
	display: unset;
	background-color: #DFDFDF;
}
.greenScrollbar::-webkit-scrollbar {
	display: unset;
	background-color: #4d5d4e;
}
.whiteScrollbar::-webkit-scrollbar-thumb {
	-webkit-border-radius: 10px;
    background: rgb(150 150 150);
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5);
}
.greenScrollbar::-webkit-scrollbar-thumb {
	-webkit-border-radius: 10px;
    background: rgb(7 156 7);
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5);
}
`;

export const WINDOW_WIDGET_CSS = `
.window-container {
	bottom: 0;
	left: 0;
	pointer-events: none;
	position: fixed;
	top: 0;
	width: 100%;
	z-index: 9999;
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
	width: 50vw;
	padding: 2px;
	pointer-events: auto;
	background-color: white;
	user-select: none;
	resize: both;
	overflow: auto;
	min-height: 220px;
	min-width: 220px;
	max-height: 95vh;
	max-width: 95vw;
}

.window__toolbar {
	background: gray;
	border: 1px solid #D4D0C8;
	display: flex;
	padding: 3px 3px 3px 8px;
	width: 100%;
}

.window__icon {
	align-self: center;
	max-height: 16px;
	margin-right: 6px;
	object-fit: contain;
	width: 16px;
}

.window__menu{
	width: 100%;
	background: rgb(212, 208, 200);
	color: #333;
	padding-left: 5px;
	padding-bottom: 3px;
}
.window__menu span{
	padding: 0 1px;
	margin-right: 12px;
	font-size: 15px;
	border: 1px inset transparent;
	cursor: pointer;
	overflow: hidden;
}
.window__menu span:hover{
	border: 1px inset #bdbdbd;
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

.window--focused .window__toolbar {
	background: linear-gradient(to right,#0A246A 0%,#A6CAF0 100%);
	color: #fff;
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
	background: #f1f1f1;
	border: 2px solid #D4D0C8;
	border-top: none;
	display: flex;
	flex: 1 0 auto;
	height: calc(100% - 50px);
	padding: 6px;
	width: 100%;
	overflow-x: auto;
}
`;


export const windowIcon = 'data:image/webp;base64,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'


export const icons = {
	refresh: `
		<svg class="svg-icon" viewBox="0 0 20 20">
			<path fill="none" d="M19.305,9.61c-0.235-0.235-0.615-0.235-0.85,0l-1.339,1.339c0.045-0.311,0.073-0.626,0.073-0.949
				c0-3.812-3.09-6.901-6.901-6.901c-2.213,0-4.177,1.045-5.44,2.664l0.897,0.719c1.053-1.356,2.693-2.232,4.543-2.232
				c3.176,0,5.751,2.574,5.751,5.751c0,0.342-0.037,0.675-0.095,1l-1.746-1.39c-0.234-0.235-0.614-0.235-0.849,0
				c-0.235,0.235-0.235,0.615,0,0.85l2.823,2.25c0.122,0.121,0.282,0.177,0.441,0.172c0.159,0.005,0.32-0.051,0.44-0.172l2.25-2.25
				C19.539,10.225,19.539,9.845,19.305,9.61z M10.288,15.752c-3.177,0-5.751-2.575-5.751-5.752c0-0.276,0.025-0.547,0.062-0.813
				l1.203,1.203c0.235,0.234,0.615,0.234,0.85,0c0.234-0.235,0.234-0.615,0-0.85l-2.25-2.25C4.281,7.169,4.121,7.114,3.961,7.118
				C3.802,7.114,3.642,7.169,3.52,7.291l-2.824,2.25c-0.234,0.235-0.234,0.615,0,0.85c0.235,0.234,0.615,0.234,0.85,0l1.957-1.559
				C3.435,9.212,3.386,9.6,3.386,10c0,3.812,3.09,6.901,6.902,6.901c2.083,0,3.946-0.927,5.212-2.387l-0.898-0.719
				C13.547,14.992,12.008,15.752,10.288,15.752z"></path>
		</svg>
	`,
	forward: `
		<svg class="svg-icon" viewBox="0 0 20 20">
			<path fill="none" d="M1.729,9.212h14.656l-4.184-4.184c-0.307-0.306-0.307-0.801,0-1.107c0.305-0.306,0.801-0.306,1.106,0
			l5.481,5.482c0.018,0.014,0.037,0.019,0.053,0.034c0.181,0.181,0.242,0.425,0.209,0.66c-0.004,0.038-0.012,0.071-0.021,0.109
			c-0.028,0.098-0.075,0.188-0.143,0.271c-0.021,0.026-0.021,0.061-0.045,0.085c-0.015,0.016-0.034,0.02-0.051,0.033l-5.483,5.483
			c-0.306,0.307-0.802,0.307-1.106,0c-0.307-0.305-0.307-0.801,0-1.105l4.184-4.185H1.729c-0.436,0-0.788-0.353-0.788-0.788
			S1.293,9.212,1.729,9.212z"></path>
		</svg>
	`,
	backward: `
		<svg class="svg-icon" viewBox="0 0 20 20">
			<path fill="none" d="M18.271,9.212H3.615l4.184-4.184c0.306-0.306,0.306-0.801,0-1.107c-0.306-0.306-0.801-0.306-1.107,0
			L1.21,9.403C1.194,9.417,1.174,9.421,1.158,9.437c-0.181,0.181-0.242,0.425-0.209,0.66c0.005,0.038,0.012,0.071,0.022,0.109
			c0.028,0.098,0.075,0.188,0.142,0.271c0.021,0.026,0.021,0.061,0.045,0.085c0.015,0.016,0.034,0.02,0.05,0.033l5.484,5.483
			c0.306,0.307,0.801,0.307,1.107,0c0.306-0.305,0.306-0.801,0-1.105l-4.184-4.185h14.656c0.436,0,0.788-0.353,0.788-0.788
			S18.707,9.212,18.271,9.212z"></path>
		</svg>
	`,
	
	home: `
		<svg class="svg-icon" viewBox="0 0 20 20">
		<path fill="none" d="M15.971,7.708l-4.763-4.712c-0.644-0.644-1.769-0.642-2.41-0.002L3.99,7.755C3.98,7.764,3.972,7.773,3.962,7.783C3.511,8.179,3.253,8.74,3.253,9.338v6.07c0,1.146,0.932,2.078,2.078,2.078h9.338c1.146,0,2.078-0.932,2.078-2.078v-6.07c0-0.529-0.205-1.037-0.57-1.421C16.129,7.83,16.058,7.758,15.971,7.708z M15.68,15.408c0,0.559-0.453,1.012-1.011,1.012h-4.318c0.04-0.076,0.096-0.143,0.096-0.232v-3.311c0-0.295-0.239-0.533-0.533-0.533c-0.295,0-0.534,0.238-0.534,0.533v3.311c0,0.09,0.057,0.156,0.096,0.232H5.331c-0.557,0-1.01-0.453-1.01-1.012v-6.07c0-0.305,0.141-0.591,0.386-0.787c0.039-0.03,0.073-0.066,0.1-0.104L9.55,3.75c0.242-0.239,0.665-0.24,0.906,0.002l4.786,4.735c0.024,0.033,0.053,0.063,0.084,0.09c0.228,0.196,0.354,0.466,0.354,0.76V15.408z"></path>
	</svg>
	`,
	
}
