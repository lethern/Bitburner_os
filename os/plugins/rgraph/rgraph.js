import 'jit-yc.js'
import { AttacksMonitor } from '/os/plugins/rgraph/attacks_monitor.js'

/** @param {import('/os/plugins/api_adapter.js').API_Object} api */
async function mainPlugin(api) {

	let widget = new RGraphWidget(api);

	widget.initAll();
}

class RGraphWidget {
	constructor(api) {
		this.#api = api;
		this.#doc = globalThis['document'];
		this.renderWorld = false;
		this.nodeAlpha = 0.4;
	}

	initAll() {
		try {
			this.active = true;

			this.initWindow();

			this.#attacksMonitor = new AttacksMonitor(this.#api);

			this.injectCSS();

			this.initGraph();

			this.#contentDiv.scrollLeft = 540
			this.#contentDiv.scrollTop = 540
		} catch (e) {
			if (this.#loop_handler) {
				clearInterval(this.#loop_handler)
				this.#loop_handler = null;
			}
			this.dispose();
			if (this.#infovis_div) this.#infovis_div.remove();
			throw e;
		}
	}

	initWindow() {
		let classes = this.#api.classes;

		let windowWidget = classes.newWindowWidget();
		this.#windowWidget = windowWidget;
		windowWidget.init();

		let contentDiv = windowWidget.getContentDiv();
		this.#contentDiv = contentDiv;
		contentDiv.classList.add('greenScrollbar')
		contentDiv.classList.add('grayBackground')
		contentDiv.style['background-color'] = '#1a1a1a';

		windowWidget.setTitle('Network Graph')
		windowWidget.show();


		let infovis_div = this.#doc.getElementById('infovis');
		this.#infovis_div = infovis_div;

		if (!infovis_div) {
			infovis_div = this.#doc.createElement('div');
			infovis_div.style.width = '1200px';
			infovis_div.style.height = '900px';
			infovis_div.id = 'infovis'
		}

		infovis_div.innerHTML = '';

		contentDiv.appendChild(infovis_div);

		this.initButtons();
	}

	initButtons() {
		let btnOptions = {
			'position': 'absolute',
			'top': '50px',
			'left': '50px',
			'z-index': '10',
		}

		let gui = this.#api.os.getGUI();

		let btn = gui.createButton({ btnOptions, btnLabel: "+/- Purchased", callback: () => this.onBtn_purchased() });
		this.#contentDiv.appendChild(btn);

		btnOptions.top = '80px';
		btn = gui.createButton({ btnOptions, btnLabel: "Network/World", callback: () => this.onBtn_world() });
		this.#contentDiv.appendChild(btn);
	}

	onBtn_purchased() {
		this.#filterServers = !this.#filterServers
		this.renderGraph();
	}

	onBtn_world() {
		this.#worldRender.toggleActive();
		this.renderWorld = !this.renderWorld;
		this.nodeAlpha = (this.renderWorld) ? 0.4 : 0.8;
		this.renderGraph();
	}

	injectCSS() {
		const stylesheetId = 'rgraph-styles'

		if (this.#doc.getElementById(stylesheetId)) {
			console.log("rgraph css exists");
			return;
		}

		const stylesheet = this.#doc.createElement('style')
		stylesheet.id = stylesheetId

		stylesheet.innerHTML = RGraphCSS

		this.#doc.head.insertAdjacentElement('beforeend', stylesheet)
		this.#stylesheet = stylesheet;
	}

	initGraph() { // , attacksMonitor, handlers

		this.#createRGraph();

		this.#rgraph._refresh = this.#rgraph.refresh;
		this.#rgraph.refresh = (arg) => {
			if (!this.#windowWidget.getContainer()) {
				console.log("clearInterval")
				clearInterval(this.#loop_handler)
				this.#loop_handler = null;
				this.active = false;
				return;
			}
			if (!this.#windowWidget.isVisible) {
				return;
			}

			this.draw_lines(arg);
		}

		this.#worldRender = new WorldRender(this.#rgraph.canvas.getCtx(), this.renderWorld)

		this.renderGraph();

		this.last_time = (Date.now() / 1000);
		if (this.active) this.#loop_handler = setTimeout(() => this.loop(), 40);
	}

	renderGraph() {
		this.loadServers();

		this.#rgraph.canvas.getCtx().clearRect(0, 0, this.#rgraph.canvas.width, this.#rgraph.canvas.height);

		this.#worldRender.renderNodes(this.#rgraph);

		//rgraph.refresh(false);
		this.#rgraph.plot();
	}

	loadServers() {
		let servers = this.#api.os.getServersManager().serversObj

		let json = this.#initServersData(servers);

		this.#rgraph.loadJSON(json, 1);
	}


	dispose() {
		this.active = false;
		if (this.#stylesheet) this.#stylesheet.remove();
	}


	#doc
	#contentDiv
	#windowWidget
	#api
	#stylesheet
	#attacksMonitor
	#rgraph
	#loop_handler
	#worldRender
	#infovis_div
	#filterServers


	#initServersData(servers) {
		let json = [];
		let exclude = (serv) => false;
		let purchased = this.#api.os.getServersManager().purchasedServers;
		if (this.#filterServers) {
			exclude = (serv) => {
				if (serv.startsWith('hacknet-node-')) return true;
				return purchased.includes(serv);
			};
		}

		for (let serv in servers) {
			if (exclude(serv)) {
				continue;
			}

			let { neighbors } = servers[serv];

			let adjacencies = neighbors.map(n => ({
				"nodeTo": n,
				"data": {
					"weight": 3,
					lineWidth: 3,
					"$alpha": this.nodeAlpha,
				}
			})).filter(a => !exclude(a.nodeTo));

			json.push({
				"id": serv,
				"name": serv,
				"data": {
					"$dim": (serv == 'home') ? 20 : 10,
					"$type": (serv == 'home') ? "star" : "circle",
				},
				"adjacencies": adjacencies,
			});
		}
		return json;
	}

	#createRGraph() {
		this.#rgraph = new $jit.RGraph({
			'injectInto': 'infovis',
			width: 2000,
			height: 2000,
			Node: {
				'overridable': true,
				'color': '#cc0000'
			},
			Edge: {
				'overridable': true,
				'color': '#cccc00'
			},
			//		interpolation: 'polar',
			duration: 10, //3500,
			fps: 30, //30,
			levelDistance: 60,

			onCreateLabel: function (domElement, node) {
				domElement.innerHTML = node.name;
				domElement.onclick = function () {
					//rgraph.onClick(node.id, {
					//	hideLabels: false,
					//	onComplete: function () {
					//	}
					//});
				};
			},
		});
	}

	loop() {
		this.loop_impl();
		if (this.active) this.#loop_handler = setTimeout(() => this.loop(), 40);
	}

	loop_impl() {
		if (!this.#windowWidget.getContainer()) {
			console.log("clearInterval")
			clearInterval(this.#loop_handler)
			this.#loop_handler = null;
			return;
		}
		if (!this.#windowWidget.isVisible) {
			return;
		}

		let curr_time = (Date.now() / 1000);
		let diff = curr_time - this.last_time;
		if (diff < 0) { this.last_time = curr_time; diff = 0; }

		if (diff > 2000) {
			this.#rgraph.refresh();
		} else {
			this.draw_lines(false);
		}
	}

	async draw_lines(arg) { // rgraph, attacksMonitor, 
		let disableGrouping = true;
		let attacks = await this.#attacksMonitor.populateProcesses(disableGrouping, { param: "expiry", isDescending: true, });

		this.#rgraph._refresh(arg);

		let ctx = this.#rgraph.canvas.getCtx();
		ctx.save();

		this.#worldRender.draw();

		let min = 100;
		let max = 0;
		attacks.forEach(serv => {
			serv._scale = Math.log10(serv.threads);
			if (serv._scale > max) max = serv._scale;
			if (serv._scale && serv._scale < min) min = serv._scale;
		});

		let div = 2;
		let time = Date.now()
		let time_delta = time / 1000;
		time_delta = time_delta / div; // % (2*Math.PI);

		attacks.forEach(serv => {
			let target = serv.target;

			ctx.lineWidth = Math.max((serv._scale - min) / (max - min) * 5, 0) + 1;
			switch (serv.type) {
				case 'weaken': ctx.strokeStyle = '#f3f330'; break;
				case 'hack': ctx.strokeStyle = '#33d833'; break;
				default: ctx.strokeStyle = '#00a5f3'; break;
			}

			serv.hosts.forEach(target2 => {
				arc_line(ctx, this.#rgraph, target, target2, time); // time_delta, serv.type
			})
		})

		ctx.restore();
	}
}

class WorldRender {
	constructor(ctx, active) {
		this.active = active;
		this.ctx = ctx;
		this.arr = [];
		this.edges = [];
		this.cities = {};
		this.scale = 20;
		this.x_adjust = -600;
		this.y_adjust = -200;

		this.nodesCache = {};

		let arr = this.arr;
		let edges = this.edges;

		//#region x
		/*
		`               ,_   .  .-.-_.  .
           , _-\'    \ -     ~/      ;-'_   _       ,;_;_,   .~~-
    ~-\_/-'~'  ' \~~| ',    ,'      /  / ~|- \_/~/~.     ~~--   ~'- _
   .                -/~ '\ ,' _  ,.'V ' ~                   .     /~
    -'~\_,       '-,  '|. '   ~  ,   '~                /    /   /~
         '|        '' \~|\       _\~.        ,     C         /,.
          '\     S  /'           |        ~  \ "         ,_ / |
           |       /            ._-~'\_ _~ ..            \ ) N
            \   __-\           '/      ~ |   \_          /  ~
  .,         '\     ~-_      - |          \  ' ~|  /\  \~ ,
               ~-     ;       '\           '-,   \,' / /  |
                 '\_ ~'\_       \_ _        /'    '  |,  |'
                   /     \_       ~ |      /         \   '; -,_.
                   |       ~         |    |  ,        '-_, ,;   ~\
                    \,   A  /        \    / /|            , , ,   -,
                     |    ,/          |  |  |/          ,-   ~ \   '.
                    ,|   ,/           \ ,/              \   I   |
                    /    |             ~                 -~~-, /   _
                    |  -'                                    ~    /
                    /  '.                                     ~
                    ',   ~
                      ~'`;
		*/
		//#endregion
`               ++    + ++   +
           + + +     + +  + +             +       ++++ +   ++
     ++++++ + + ++++ +     +      +  ++ ++ +++++++    + +++  +++ +
    +               +   + +  +  ++ + + +                   + +  +
     ++++       +++  +   +   +  +  V++                +     +
         ++        +  +++      + +++      +     +  C       +
          +     +   +           +   ++   +   +         ++ +    +
           +++   S +            +++   + + ++             + ++N+
              +  ++            +   + + +   +              +  +
             +  +  +          +     +      + ++  +  ++   +
              ++              +           + + +    + +    +
                +++ +++++      ++        +     + ++   +  +
                   +     ++      + +      +     +      ++ + ++  +
                   +       +      + ++    +  +        +   +   ++ +
                    +  + A+           +   +              + ++   + +
                     +    +           +  +  ++          +    +++
                    +    +             ++              +   +I   +   +
                    +    +             +                +++ + ++   +
                    +   +                                    +
                    +   +
                    ++  +
                      ++`

			.split('\n').forEach((s, row) => {
				let a = arr[row] = [];
				s.split('').forEach((ch, col) => {
					if (!ch || ch==' ') return;

					if (['A', 'S', 'C', 'I', 'N', 'V'].includes(ch)) {
						arr[row][col] = ch;
						this.cities[ch] = [col, row];
					} else {
						for (let x = -1; x <= 0; ++x) {
							for (let y = -1; y <= 1; ++y) {
								let neigh = (x != 0 || y != 0) && arr[row + x] && arr[row + x][col + y];
								if (neigh) {
									if (!['A', 'S', 'C', 'I', 'N', 'V'].includes(neigh)) {
										connect(col + y, row + x, col, row);
									}
								}
							}
						}
						arr[row][col] = 1;
					}
				})
			});

		function connect(x1, y1, x2, y2) {
			edges.push([x1, y1, x2, y2]);
		}

	}

	renderNodes(rgraph) {
		console.log("nodes");
		if (!this.active) return;
		let scale = this.scale;
		let x_adjust = this.x_adjust;
		let y_adjust = this.y_adjust;

		for (let id in rgraph.graph.nodes) {
			let node = rgraph.graph.nodes[id];

			if (!this.nodesCache[id]) {
				if (SERV_DATA[id]) {
					if (this.cities[SERV_DATA[id]]) {
						let [col, row] = this.cities[SERV_DATA[id]];
						let randx = Math.random() * 140 - 70;
						let randy = Math.random() * 140 - 70;
						this.nodesCache[id] = [x_adjust + col * scale + randx, y_adjust + row * scale * 1.9 + randy];
					}
				}

				if (!this.nodesCache[id]) {
					let x = (12 + Math.random() * 50) * scale
					let y = (1 + Math.random() * 19) * scale * 1.9;
					this.nodesCache[id] = [x_adjust + x, y_adjust + y];
				}
			}

			let cache = this.nodesCache[id];
			node.pos.setc(cache[0], cache[1]);
		}

		if (!this.rgraph) {
			this.rgraph = rgraph;
			for (let id in rgraph.graph.nodes) {
				this._node_prototype = Object.getPrototypeOf(rgraph.graph.nodes[id]);
				break;
			}
			this._setPos = this._node_prototype.setPos;
		}

		for (let id in rgraph.graph.nodes) {
			this._node_prototype.setPos = () => { };
			break;
		}
	}

	draw() {
		if (!this.active) return;
		let ctx = this.ctx;
		let scale = this.scale;
		let x_adjust = this.x_adjust;
		let y_adjust = this.y_adjust;
		ctx.save();
		ctx.strokeStyle = 'rgb(173,216,230)';
		ctx.lineWidth = 2;
		for (let edge of this.edges) {
			ctx.beginPath();
			ctx.moveTo(x_adjust+edge[0]*scale, y_adjust+edge[1]*scale*2);
			ctx.lineTo(x_adjust+edge[2]*scale, y_adjust+edge[3]*scale*2);
			ctx.stroke();
		}
		ctx.restore();
	}

	toggleActive() {
		this.active = !this.active;
		if (this._node_prototype) {
			this._node_prototype.setPos = this._setPos;
		}
	}
}

function arc_line(ctx, rgraph, idfrom, idto, time) { // dt, type
	let nodeFrom = rgraph.graph.getNode(idfrom)
	let nodeTo = rgraph.graph.getNode(idto)
	if (!nodeFrom) { return }
	if (!nodeTo) { return }

	var from = nodeFrom.pos.getc(),
		to = nodeTo.pos.getc();

	let begin = from;
	let end = to;

	let dim = (Math.abs(begin.x - end.x) + Math.abs(begin.y - end.y))/2
	let d = Math.sqrt((begin.x - end.x) ** 2 + (begin.y - end.y) ** 2);

	let dist = 15+ d / 15;
	ctx.setLineDash([dist / 2, dist / 2])
	ctx.lineDashOffset = Math.ceil((time * Math.sqrt(d) / 400 ) % (dist));

	
	ctx.beginPath();
	ctx.moveTo(begin.x, begin.y);

	ctx.quadraticCurveTo((begin.x + end.x) / 2, (begin.y + end.y) / 2 - dim, end.x, end.y);
	ctx.stroke();
}


const RGraphCSS = `
.node {
	font-size: 14px;
	cursor: pointer;
	fontSize: 14px;
    color: #fff;
}
#infovis::-webkit-scrollbar {
	display: unset;
	border-radius: 10px;
	background-color: #4d5d4e;
}
#infovis::-webkit-scrollbar-thumb {
    -webkit-border-radius: 10px;
    border-radius: 10px;
    background: rgb(7 156 7);; 
    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.5);
}
`;

const SERV_DATA = {
	"home": "",
	"darkweb": "",
	"iron-gym": "S",
	"max-hardware": "",
	"silver-helix": "",
	"crush-fitness": "A",
	"harakiri-sushi": "",
	"CSEC": "",
	"neo-net": "",
	"hong-fang-tea": "",
	"nectar-net": "",
	"omega-net": "I",
	"avmnite-02h": "",
	"catalyst": "",
	"millenium-fitness": "V",
	"aerocorp": "A",
	"unitalife": "",
	"zeus-med": "",
	"zb-def": "",
	"johnson-ortho": "",
	"zb-institute": "V",
	"rothman-uni": "S",
	"joesguns": "S",
	"sigma-cosmetics": "",
	"foodnstuff": "S",
	"n00dles": "N",
	"zer0": "",
	"phantasy": "",
	"netlink": "A",
	"syscore": "V",
	"rho-construction": "A",
	"summit-uni": "A",
	"alpha-ent": "S",
	"snap-fitness": "A",
	"omnia": "V",
	"defcomm": "N",
	"nova-med": "I",
	"lexo-corp": "V",
	"comptek": "V",
	"the-hub": "",
	"I.I.I.I": "",
	"aevum-police": "A",
	"global-pharm": "N",
	"deltaone": "S",
	"solaris": "C",
	"infocomm": "",
	"run4theh111z": "",
	"helios": "V",
	"applied-energetics": "",
	"vitalife": "N",
	".": "",
	"nwo": "V",
	"ecorp": "A",
	"kuai-gong": "C",
	"powerhouse-fitness": "S",
	"The-Cave": "",
	"4sigma": "S",
	"clarkinc": "A",
	"blade": "S",
	"fulcrumassets": "",
	"megacorp": "S",
	"b-and-a": "A",
	"omnitek": "V",
	"fulcrumtech": "A",
	"titan-labs": "",
	"univ-energy": "S",
	"icarus": "S",
	"taiyang-digital": "",
	"microdyne": "",
	"stormtech": "I",
	"galactic-cyber": "A"
};
