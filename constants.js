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
	z-index: 9999;
}

.window--focused .window__toolbar {
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
	width: 50vw;
	padding: 2px;
	pointer-events: auto;
	background-color: white;
	user-select: none;
	resize: both;
	overflow: auto;
	min-height: 220px;
	min-width: 220px;
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

.server-list {
	align-content: flex-start;
	display: flex;
	flex-wrap: wrap;
	list-style: none;
	margin: 0;
	overflow: auto;
	padding: 0;
}
.server-list__item {
	margin-bottom: 8px;
	text-align: center;
	width: 100px;
}
.server-connect__button {
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
.server-connect__button_gold {
	align-items: center;
	fill: gold;
	color: gold;
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
.server-connect__button_orange {
	align-items: center;
	fill: orange;
	color: orange;
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
.server-connect__button_red {
	align-items: center;
	fill: red;
	color: red;
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
.server-list__bs_center {
	margin-left:-10px;
  	marin-right:-10px;
	text-align:center;
    display: flex;
	flex-direction: row;
    align-items: center;
    justify-content: center;
}
.server-run__backdoor {
	align-items: center;
	appearance: none;
	fill: red;
	color: red;
	border: 1px dotted transparent;
	border-radius: 2px;
	background: none;
	display: flex;
	flex-direction: column;
	margin: 0;
	padding: 2px;
	width: 100%;
	height: 100%;
}
.server-run__backdoor_complete svg {
    fill: green;
}
.server-run__scripts {
	align-items: center;
	appearance: none;
	border: 1px dotted transparent;
	border-radius: 2px;
	background: none;
	display: flex;
	flex-direction: column;
	margin: 0;
	padding: 2px;
	width: 100%;
	height: 100%;
}
.server-run__status {
	align-items: center;
	appearance: none;
	fill: red;
	color: red;
	border: 1px dotted transparent;
	border-radius: 2px;
	background: none;
	display: flex;
	flex-direction: column;
	margin: 0;
	padding: 2px;
	width: 100%;
	height: 100%;
}
.server-run__status_rooted {
	align-items: center;
	appearance: none;
	fill: green;
	color: green;
	border: 1px dotted transparent;
	border-radius: 2px;
	background: none;
	display: flex;
	flex-direction: column;
	margin: 0;
	padding: 2px;
	width: 100%;
	height: 100%;
}
.server-connect__button:focus {
	background: rgba(15, 75, 255, .3);
	border-color: #222;
}
.server-run__scripts:focus {
	background: rgba(15, 75, 255, .3);
	border-color: #222;
}
.server-run__status:focus {
	background: rgba(15, 75, 255, .3);
	border-color: #222;
}
.server-run__backdoor:focus {
	background: rgba(15, 75, 255, .3);
	border-color: #222;
}

.server-list__icon {
	height: 38px;
	width: 32px;
}

.server-list__label {
	color: #222;
	text-shadow: none;
	word-wrap: anywhere;
}

.block-but-hidden {
	display: block !important;
	visibility: hidden !important;
}
.debugWindow{
	display: block;
	overflow: scroll;
	height: 400px;
	width: 600px;
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
.consoleDebug{
	color: #828282;
}
.consoleInfo{
	color: #252525;
}
.consoleWarn{
	color: #9e6c12;
}
.consoleError{
	color: #ec3131;
}
`;

export const windowIcon = 'data:image/webp;base64,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'


export const icons = {
	dstar: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-labelledby="title"
aria-describedby="desc" role="img" xmlns:xlink="http://www.w3.org/1999/xlink">
  <title>Classic Computer</title>
  <desc>A line styled icon from Orion Icon Library.</desc>
  <path data-name="layer2"
  fill="none" stroke="#202020" stroke-linecap="round" stroke-linejoin="round"
  stroke-width="2" d="M6 44h52m0 18H6V2h52v60zm-8-10H38"></path>
  <rect data-name="layer1" x="14" y="10" width="36" height="26" rx="2"
  ry="2" fill="none" stroke="#202020" stroke-linecap="round" stroke-linejoin="round"
  stroke-width="2"></rect>
</svg>
	`,
	networkPC: `
		<svg class="svg-icon" viewBox="0 0 20 20">
			<path d="M17.237,3.056H2.93c-0.694,0-1.263,0.568-1.263,1.263v8.837c0,0.694,0.568,1.263,1.263,1.263h4.629v0.879c-0.015,0.086-0.183,0.306-0.273,0.423c-0.223,0.293-0.455,0.592-0.293,0.92c0.07,0.139,0.226,0.303,0.577,0.303h4.819c0.208,0,0.696,0,0.862-0.379c0.162-0.37-0.124-0.682-0.374-0.955c-0.089-0.097-0.231-0.252-0.268-0.328v-0.862h4.629c0.694,0,1.263-0.568,1.263-1.263V4.319C18.5,3.625,17.932,3.056,17.237,3.056 M8.053,16.102C8.232,15.862,8.4,15.597,8.4,15.309v-0.89h3.366v0.89c0,0.303,0.211,0.562,0.419,0.793H8.053z M17.658,13.156c0,0.228-0.193,0.421-0.421,0.421H2.93c-0.228,0-0.421-0.193-0.421-0.421v-1.263h15.149V13.156z M17.658,11.052H2.509V4.319c0-0.228,0.193-0.421,0.421-0.421h14.308c0.228,0,0.421,0.193,0.421,0.421V11.052z"></path>
		</svg>
	`,
	firewall: `
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 512.023 512.023" style="enable-background:new 0 0 512.023 512.023;" xml:space="preserve">
		<path d="M465.773,266.105c-1.707-1.707-5.12-2.56-8.533-1.707c-3.413,0.853-5.973,3.413-5.973,6.827
			c-1.707,13.653-5.973,26.453-10.24,37.547c-5.886-55.18-26.348-89.403-32.427-98.888v-65.805V75.811v-51.2
			c0-14.507-11.093-25.6-25.6-25.6H263.533H92.867H24.6C10.093-0.989-1,10.105-1,24.611v51.2v68.267v68.267v68.267v68.267v51.2
			c0,14.507,11.093,25.6,25.6,25.6h119.467h133.981c5.105,15.926,13.371,30.798,24.739,43.52
			c23.04,26.453,57.173,41.813,93.013,41.813c35.84,0,69.12-14.507,92.16-40.96C532.333,421.411,505.88,307.065,465.773,266.105z
			 M144.067,340.345H101.4v-51.2h42.667H255v51.2H144.067z M16.067,340.345v-51.2h68.267v51.2H16.067z M92.867,84.345h42.667v51.2
			H92.867h-76.8v-51.2H92.867z M263.533,84.345H306.2v51.2h-42.667H152.6v-51.2H263.533z M391.533,84.345v51.2h-68.267v-51.2
			H391.533z M92.867,272.078h-76.8v-51.2h76.8h42.667v51.2H92.867z M16.067,152.611h68.267v51.2H16.067V152.611z M144.067,152.611
			H255v51.2H144.067H101.4v-51.2H144.067z M314.733,152.611h76.8v51.2h-76.8h-42.667v-51.2H314.733z M152.6,220.878h110.933H306.2
			v51.2h-42.667H152.6V220.878z M323.267,272.078v-51.2h53.379c-15.822,15.496-28.323,32.636-37.533,51.2H323.267z M297.667,314.745
			c-2.56,0-5.973,1.707-6.827,1.707c-1.707,3.413-4.267,7.68-5.973,11.947l-1.707,3.413c-0.492,1.477-0.985,2.949-1.477,4.263
			c-0.257,0.636-0.527,1.269-0.773,1.908c-0.103,0.23-0.206,0.45-0.309,0.656h-8.533v-49.493h42.667h16.437
			c-2.344,6.384-4.63,13.361-6.197,19.627v1.707c-1.707,5.12-5.12,29.867-5.12,36.693c0,3.413,0,5.973,0,9.387
			c-1.707-3.413-4.267-7.68-5.973-11.947c-0.359-0.717-0.717-1.479-1.076-2.264c-2.885-6.754-5.565-14.059-7.457-21.629
			c-0.853-3.413-3.413-5.12-6.827-5.973H297.667z M391.533,24.611v42.667h-76.8h-42.667v-51.2H383
			C388.12,16.078,391.533,19.491,391.533,24.611z M255,67.278H144.067H101.4v-51.2H255V67.278z M16.067,24.611
			c0-5.12,3.413-8.533,8.533-8.533h59.733v51.2H16.067V24.611z M16.067,400.078v-42.667h76.8h42.667v51.2H24.6
			C19.48,408.611,16.067,405.198,16.067,400.078z M152.6,408.611v-51.2h110.933h11.523c-3.747,17.006-4.104,34.448-1.192,51.2H152.6
			z M475.16,459.811c-20.48,22.187-48.64,34.987-79.36,34.987h-0.853c-29.867-0.853-58.88-13.653-79.36-36.693
			c-10.322-11.987-17.641-25.796-21.936-40.457c0.148-1.021,0.089-2.042-0.251-3.063c-5.062-20.25-5.108-42.165,1.491-62.452
			c0.083-0.227,0.157-0.457,0.216-0.693c0-0.001,0-0.001,0.001-0.002v0l0,0c0.683-1.366,0.825-2.731,1.29-4.097
			c11.034,25.933,25.208,45.124,28.577,50.177c1.707,2.56,5.12,4.267,8.533,3.413c2.544-0.509,4.474-2.235,5.624-4.446
			c1.645-1.798,2.541-4.222,2.056-6.647c-2.56-13.653-3.413-27.307-2.56-40.96c0-5.12,3.413-29.013,4.267-33.28v-0.853
			c2.189-8.755,5.007-17.506,8.443-25.728c10.105-23.348,25.801-44.402,47.023-63.018c8.533,16.213,27.307,56.32,27.307,115.2
			c0,4.267,2.56,7.68,5.973,8.533c3.413,0.853,7.68,0,9.387-3.413c0-0.853,15.36-23.893,23.04-52.907
			C492.227,336.931,507.587,423.118,475.16,459.811z"/>
	`,
	server: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-labelledby="title"
aria-describedby="desc" role="img" xmlns:xlink="http://www.w3.org/1999/xlink">
  <title>Server</title>
  <desc>A line styled icon from Orion Icon Library.</desc>
  <rect data-name="layer2"
  x="2" y="14" width="60" height="48" rx="2" ry="2" fill="none" stroke="#202020"
  stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></rect>
  <path data-name="layer2" d="M2.4 14.8L7.4 4A3 3 0 0 1 10 2h44a2.9 2.9 0 0 1 2.5 2l5.2 10.8"
  fill="none" stroke="#202020" stroke-linecap="round" stroke-linejoin="round"
  stroke-width="2"></path>
  <path data-name="layer1" fill="none" stroke="#202020" stroke-linecap="round"
  stroke-linejoin="round" stroke-width="2" d="M54 54H34"></path>
  <path data-name="layer2" fill="none" stroke="#202020" stroke-linecap="round"
  stroke-linejoin="round" stroke-width="2" d="M2 46h60"></path>
  <path data-name="layer1" fill="none" stroke="#202020" stroke-linecap="round"
  stroke-linejoin="round" stroke-width="2" d="M54 38H34m20-16H34"></path>
  <path data-name="layer2" fill="none" stroke="#202020" stroke-linecap="round"
  stroke-linejoin="round" stroke-width="2" d="M2 30h60"></path>
  <circle data-name="layer1" cx="11" cy="22" r="2" fill="none" stroke="#202020"
  stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></circle>
  <circle data-name="layer1" cx="11" cy="38" r="2" fill="none"
  stroke="#202020" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></circle>
  <circle data-name="layer1" cx="11" cy="54" r="2" fill="none"
  stroke="#202020" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></circle>
</svg>
	`,
	noodles: `
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-labelledby="title"
aria-describedby="desc" role="img" xmlns:xlink="http://www.w3.org/1999/xlink">
  <title>Asian Cuisine</title>
  <desc>A line styled icon from Orion Icon Library.</desc>
  <path data-name="layer2"
  fill="none" stroke="#202020" stroke-linecap="round" stroke-linejoin="round"
  stroke-width="2" d="M46 2L32.1 30M58 10L40 30M22 62h20"></path>
  <path data-name="layer1" d="M2.1 30a30 30 0 0 0 59.8 0z" fill="none"
  stroke="#202020" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
</svg>
	`,
	droid: `
		<svg class="svg-icon" viewBox="0 0 20 20">
			<path fill="none" d="M18.21,16.157v-8.21c0-0.756-0.613-1.368-1.368-1.368h-1.368v1.368v1.368v6.841l-1.368,3.421h5.473L18.21,16.157z"></path>
			<path fill="none" d="M4.527,9.316V7.948V6.579H3.159c-0.756,0-1.368,0.613-1.368,1.368v8.21l-1.368,3.421h5.473l-1.368-3.421V9.316z"></path>
			<path fill="none" d="M14.766,5.895h0.023V5.21c0-2.644-2.145-4.788-4.789-4.788S5.211,2.566,5.211,5.21v0.685h0.023H14.766zM12.737,3.843c0.378,0,0.684,0.307,0.684,0.684s-0.306,0.684-0.684,0.684c-0.378,0-0.684-0.307-0.684-0.684S12.358,3.843,12.737,3.843z M10,1.448c0.755,0,1.368,0.613,1.368,1.368S10.755,4.185,10,4.185c-0.756,0-1.368-0.613-1.368-1.368S9.244,1.448,10,1.448z"></path>
			<path fill="none" d="M14.789,6.579H5.211v9.578l1.368,1.368h6.841l1.368-1.368V6.579z M12.052,12.052H7.948c-0.378,0-0.684-0.306-0.684-0.684c0-0.378,0.306-0.684,0.684-0.684h4.105c0.378,0,0.684,0.306,0.684,0.684C12.737,11.746,12.431,12.052,12.052,12.052z M12.052,9.316H7.948c-0.378,0-0.684-0.307-0.684-0.684s0.306-0.684,0.684-0.684h4.105c0.378,0,0.684,0.307,0.684,0.684S12.431,9.316,12.052,9.316z"></path>
		</svg>
	`,
	check: `
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
			<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
			<path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
		</svg>
	`,
	xmark:`
		<svg class="svg-icon" viewBox="0 0 20 20">
								<path d="M10.185,1.417c-4.741,0-8.583,3.842-8.583,8.583c0,4.74,3.842,8.582,8.583,8.582S18.768,14.74,18.768,10C18.768,5.259,14.926,1.417,10.185,1.417 M10.185,17.68c-4.235,0-7.679-3.445-7.679-7.68c0-4.235,3.444-7.679,7.679-7.679S17.864,5.765,17.864,10C17.864,14.234,14.42,17.68,10.185,17.68 M10.824,10l2.842-2.844c0.178-0.176,0.178-0.46,0-0.637c-0.177-0.178-0.461-0.178-0.637,0l-2.844,2.841L7.341,6.52c-0.176-0.178-0.46-0.178-0.637,0c-0.178,0.176-0.178,0.461,0,0.637L9.546,10l-2.841,2.844c-0.178,0.176-0.178,0.461,0,0.637c0.178,0.178,0.459,0.178,0.637,0l2.844-2.841l2.844,2.841c0.178,0.178,0.459,0.178,0.637,0c0.178-0.176,0.178-0.461,0-0.637L10.824,10z"></path>
							</svg>
		`,
	doorClosed: `
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-door-closed" viewBox="0 0 16 16">
			<path d="M3 2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v13h1.5a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1H3V2zm1 13h8V2H4v13z"/>
			<path d="M9 9a1 1 0 1 0 2 0 1 1 0 0 0-2 0z"/>
		</svg>
	`,
	doorOpen: `
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-door-open" viewBox="0 0 16 16">
			<path d="M8.5 10c-.276 0-.5-.448-.5-1s.224-1 .5-1 .5.448.5 1-.224 1-.5 1z"/>
			<path d="M10.828.122A.5.5 0 0 1 11 .5V1h.5A1.5 1.5 0 0 1 13 2.5V15h1.5a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1H3V1.5a.5.5 0 0 1 .43-.495l7-1a.5.5 0 0 1 .398.117zM11.5 2H11v13h1V2.5a.5.5 0 0 0-.5-.5zM4 1.934V15h6V1.077l-6 .857z"/>
		</svg>
	`,
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
	ihack: `
	<svg width="32px" height="32px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M 15.998047 3 C 14.225047 3 5.5352031 7.9839062 4.6582031 9.5039062 C 3.7802031 11.024906 3.7802031 20.983047 4.6582031 22.498047 C 5.5392031 24.017047 14.229047 29 15.998047 29 C 17.762047 29 26.451938 24.019953 27.335938 22.501953 C 28.222938 20.979953 28.222938 11.014047 27.335938 9.4980469 L 27.335938 9.4960938 C 26.444937 7.9790937 17.756047 3 15.998047 3 z M 15.996094 5.0117188 C 17.693094 5.3647187 24.417703 9.2167656 25.595703 10.509766 C 26.135703 12.150766 26.134703 19.844281 25.595703 21.488281 C 24.425703 22.779281 17.695094 26.636281 15.996094 26.988281 C 14.298094 26.638281 7.5723906 22.783234 6.4003906 21.490234 C 5.8653906 19.842234 5.8653906 12.155766 6.4003906 10.509766 C 7.5693906 9.2167656 14.297094 5.3617187 15.996094 5.0117188 z M 13 9 L 11 11 L 12 11 L 12 21 L 14 21 L 14 17 L 18 17 L 18 21 L 17 21 L 19 23 L 21 21 L 20 21 L 20 12 L 18 12 L 18 15 L 14 15 L 14 11 L 15 11 L 13 9 z"/></svg>
	`,
	home: `
		<svg class="svg-icon" viewBox="0 0 20 20">
		<path fill="none" d="M15.971,7.708l-4.763-4.712c-0.644-0.644-1.769-0.642-2.41-0.002L3.99,7.755C3.98,7.764,3.972,7.773,3.962,7.783C3.511,8.179,3.253,8.74,3.253,9.338v6.07c0,1.146,0.932,2.078,2.078,2.078h9.338c1.146,0,2.078-0.932,2.078-2.078v-6.07c0-0.529-0.205-1.037-0.57-1.421C16.129,7.83,16.058,7.758,15.971,7.708z M15.68,15.408c0,0.559-0.453,1.012-1.011,1.012h-4.318c0.04-0.076,0.096-0.143,0.096-0.232v-3.311c0-0.295-0.239-0.533-0.533-0.533c-0.295,0-0.534,0.238-0.534,0.533v3.311c0,0.09,0.057,0.156,0.096,0.232H5.331c-0.557,0-1.01-0.453-1.01-1.012v-6.07c0-0.305,0.141-0.591,0.386-0.787c0.039-0.03,0.073-0.066,0.1-0.104L9.55,3.75c0.242-0.239,0.665-0.24,0.906,0.002l4.786,4.735c0.024,0.033,0.053,0.063,0.084,0.09c0.228,0.196,0.354,0.466,0.354,0.76V15.408z"></path>
	</svg>
	`,
	upDirectory: `
		<svg viewBox="0 0 64 64" class="file-list__icon">
			<path d="M5 8v43a4 4 0 0 0 4 4h46a4 4 0 0 0 4-4V13H25l-5-5H5zm50 11v32H9V20l46-1zm-15.84 4-12.965 1.586 3.494 3.492C27.62 30.333 26 33.221 26 36.814 26 43.711 31 48 31 48l3-2s-3-3.977-3-8c0-2.346 1.18-4.115 3.037-5.574l3.54 3.539L39.16 23z" />
		</svg>
	`,
	directory: `
		<svg viewBox="0 0 64 64" class="file-list__icon">
			<path d="M5 8v43a4 4 0 0 0 4 4h46a4 4 0 0 0 4-4V13H25l-5-5H5zm50 11v32H9V20l46 0z" />
		</svg>
	`,
	file: `
		<svg viewBox="0 0 24 24" class="file-list__icon">
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
}
