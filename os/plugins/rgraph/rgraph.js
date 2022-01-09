import 'jit-yc.js'
import { AttacksMonitor } from '/os/plugins/rgraph/attacks_monitor.js'

/** @param {import('/os/plugins/api_adapter.js').API_Object} api */
async function mainPlugin(api) {
    let os = api.os;
	let classes = api.classes;

	let windowWidget = classes.newWindowWidget(this);
	windowWidget.init();
	let contentDiv = windowWidget.getContentDiv();
	contentDiv.classList.add('greenScrollbar')
	contentDiv.classList.add('grayBackground')
	contentDiv.style['background-color'] = '#1a1a1a';
	windowWidget.setTitle('Network Graph')
	windowWidget.show();

	let doc = globalThis['document'];
	let infovis_div = doc.getElementById('infovis');

	if (!infovis_div) {
		infovis_div = doc.createElement('div');
		infovis_div.style.width = '1200px';
		infovis_div.style.height = '900px';
		infovis_div.id = 'infovis'
	}

	infovis_div.innerHTML = '';

	let btnOptions = {
		'position': 'absolute',
		'top': '50px',
		'left': '50px',
		'z-index': '10',
	}
	let btn = os.getGUI().createButton({ btnOptions, btnLabel: "Test", callback: () => console.log("OK") });
	
	contentDiv.appendChild(btn);


	contentDiv.appendChild(infovis_div);
	
	let style;
	let handlers = { windowWidget };

	try {
		let attacksMonitor = new AttacksMonitor(api);

		style = injectCSS()

		let servers = os.getServersManager().serversObj

		init(servers, attacksMonitor, handlers);

		contentDiv.scrollLeft = 540
		contentDiv.scrollTop = 540


	} catch (e) {
		if (handlers.loop_handler) {
			clearInterval(handlers.loop_handler)
			handlers.loop_handler = null;
		}
		if(style)style.remove();
        infovis_div.remove();
        throw e;
    }

}


function init(servers, attacksMonitor, handlers) {
	//"$type" or "$dim" will override the "type" and "dim" parameters globally defined

	let json = [];
	for (let serv in servers) {
		let { neighbors } = servers[serv];

		let adjacencies = neighbors.map(n => ({
			"nodeTo": n,
			"data": {
				"weight": 3,
				lineWidth: 3,
				"$alpha": 0.4,
			}
		}));

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



	var rgraph = new $jit.RGraph({
		'injectInto': 'infovis',
		//Optional: Add a background canvas
		//that draws some concentric circles.
		width: 2000,
		height: 2000,
		//'background': {
		//	'CanvasStyles': {
		//		'strokeStyle': '#555',
		//		'shadowBlur': 50,
		//		'shadowColor': '#ccc'
		//	}
		//},
		//Nodes and Edges parameters, can be overridden if defined in the JSON input data
		Node: {
			'overridable': true,
			'color': '#cc0000'
		},
		Edge: {
			'overridable': true,
			'color': '#cccc00'
		},
		//Set polar interpolation, Default's linear
//		interpolation: 'polar',
		//Change the transition effect from linear to elastic
		//      transition: $jit.Trans.Elastic.easeOut,
		duration: 10, //3500,
		fps: 30, //30,
		//Change father-child distance
		levelDistance: 60,

		//Add node click handler and some styles.
		//This method is called only once for each node/label crated.
		onCreateLabel: function (domElement, node) {
			domElement.innerHTML = node.name;
			domElement.onclick = function () {
				rgraph.onClick(node.id, {
					hideLabels: false,
					onComplete: function () {
					}
				});
			};
		},
		//This method is called when rendering/moving a label.
		//This method is useful to make some last minute changes
		//to node labels like adding some position offset.
		onPlaceLabel: function (domElement, node) {
			/*
			var style = domElement.style;
			var left = parseInt(style.left);
			var w = domElement.offsetWidth;
			style.left = (left - w / 2) + 'px';
			*/
		}
	});

	handlers.worldRender = new WorldRender(rgraph.canvas.getCtx())

	rgraph.loadJSON(json, 1);

	handlers.worldRender.renderNodes(rgraph);

	rgraph._refresh = rgraph.refresh;
	rgraph.refresh = function (arg) {
		if (!handlers.windowWidget.getContainer()) {
			console.log("clearInterval")
			clearInterval(handlers.loop_handler)
			handlers.loop_handler = null;
			return;
		}
		if (!handlers.windowWidget.isVisible) {
			return;
		}

		draw_lines(rgraph, attacksMonitor, arg, handlers.worldRender);
	}
	
	loop(rgraph, handlers, attacksMonitor);

	//rgraph.refresh(false);
	rgraph.plot();
}

function loop(rgraph, handlers, attacksMonitor) {
	let last_time = (Date.now() / 1000);
	handlers.loop_handler = setInterval(() => {

		if (!handlers.windowWidget.getContainer()) {
			console.log("clearInterval")
			clearInterval(handlers.loop_handler)
			handlers.loop_handler = null;
			return;
		}
		if (!handlers.windowWidget.isVisible) {
			return;
		}

		let curr_time = (Date.now() / 1000);
		let diff = curr_time - last_time;
		if (diff < 0) { last_time = curr_time; diff = 0; }

		if (diff > 2000) {
			rgraph.refresh(handlers);
		} else {
			draw_lines(rgraph, attacksMonitor, false, handlers.worldRender);
		}
	}, 40);
}

async function draw_lines(rgraph, attacksMonitor, arg, worldRender) {

	let disableGrouping = true;
	let attacks = await attacksMonitor.populateProcesses(disableGrouping, { param: "expiry", isDescending: true, });

	rgraph._refresh(arg);

	let ctx = rgraph.canvas.getCtx();
	ctx.save();

	worldRender.draw();

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
			arc_line(ctx, rgraph, target, target2, time); // time_delta, serv.type
		})
	})

	ctx.restore();
}

class WorldRender {
	constructor(ctx) {
		this.ctx = ctx;
		this.arr = [];
		this.edges = [];
		this.cities = {};
		this.scale = 20;
		this.x_adjust = -400;
		this.y_adjust = -200;

		let arr = this.arr;
		let edges = this.edges;

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
                   +     ++      + +      +     +      ++ + ++ +
                   +       +      + ++    +  +        +   +   + +
                    +  + A+           +   +              + ++    +
                     +    +           +  +  ++          +    +++   
                    +    +             ++              +   +I   +
                    +    +             +                +++ + ++   
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
		let scale = this.scale;
		let x_adjust = this.x_adjust;
		let y_adjust = this.y_adjust;

		for (let id in rgraph.graph.nodes) {
			let node = rgraph.graph.nodes[id];
			if (SERV_DATA[id]) {
				if (this.cities[SERV_DATA[id]]) {
					let [col, row] = this.cities[SERV_DATA[id]];
					let randx = Math.random() * 140 - 70;
					let randy = Math.random() * 140 - 70;
					node.pos.setc(x_adjust + col * scale+randx, y_adjust+row * scale*1.9+randy)
				}
			} else {
				let x = (12 + Math.random() * 50) * scale
				let y = (1 + Math.random() * 19) * scale*1.9;
				node.pos.setc(x_adjust + x, y_adjust + y);
			}
			
		}
		if (!this.rgraph) {
			this.rgraph = rgraph;
			for (let id in rgraph.graph.nodes) {
				Object.getPrototypeOf(rgraph.graph.nodes[id]).setPos = () => { };
				break;
			}
		}
	}

	draw() {
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

function injectCSS() {
	const stylesheetId = 'rgraph-styles'

	if (doc.getElementById(stylesheetId)) {
		console.log("rgraph css exists");
		return;
	}

	const stylesheet = doc.createElement('style')
	stylesheet.id = stylesheetId

	stylesheet.innerHTML = RGraphCSS

	doc.head.insertAdjacentElement('beforeend', stylesheet)
	return stylesheet;
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
