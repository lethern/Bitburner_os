import 'jit-yc.js'
import { AttacksMonitor } from '/os/plugins/rgraph/attacks_monitor.js'

/** @param {import('/os/plugins/api_adapter.js').API_Object} api */
async function mainPlugin(api){
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
				//"$type": "li"
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
		interpolation: 'polar',
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
			var style = domElement.style;
			var left = parseInt(style.left);
			var w = domElement.offsetWidth;
			style.left = (left - w / 2) + 'px';
		}
	});


	rgraph.loadJSON(json, 1);

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

		draw_lines(rgraph, attacksMonitor, arg);
	}
	
	loop(rgraph, handlers, attacksMonitor);

	rgraph.refresh();
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
			draw_lines(rgraph, attacksMonitor);
		}
	}, 40);
}

async function draw_lines(rgraph, attacksMonitor, arg) {

	let disableGrouping = true;
	let attacks = await attacksMonitor.populateProcesses(disableGrouping, { param: "expiry", isDescending: true, });

	rgraph._refresh(arg);

	let ctx = rgraph.canvas.getCtx();
	ctx.save();
	
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

function arc_line(ctx, rgraph, idfrom, idto, time) { // dt, type
	let nodeFrom = rgraph.graph.getNode(idfrom)
	let nodeTo = rgraph.graph.getNode(idto)

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

	/*
	var gradient = ctx.createLinearGradient(begin.x, begin.y, end.x, end.y);

	let hue = '';
	switch (type) {
		case 'weaken': hue = '60'; break;
		case 'hack': hue = '120'; break;
		default: hue = '199'; break;
	}

	let light = 40;
	

	[0, 0.5, 1, 1.5, 2, 2.5, 3].forEach(p => {
		//let x = (Math.sin(Math.PI / 2 * ((p + dt) % 1)) + 1 )/2;
		let dx = 17 * (Math.sin((p + dt) * Math.PI));
		let x = Math.ceil(light + dx);
		gradient.addColorStop(p/3, 'hsl(' + hue + ', 88%, ' + x + '%)');
	});

	ctx.strokeStyle = gradient;
	//*/

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