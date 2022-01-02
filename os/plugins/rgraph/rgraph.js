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
				"$dim": 10.53272740718869,
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
		levelDistance: 55,
		//This method is called right before plotting an edge
		onBeforePlotLine: function (adj) {
			//Add some random lineWidth to each edge.
			//            if (!adj.data.$lineWidth) 
			//                adj.data.$lineWidth = Math.random() * 5 + 1;
		},

		onBeforeCompute: function (node) {

			//Make right column relations list.
			//var html = "<h4>" + node.name + "</h4><b>Connections:</b>";
			//html += "<ul>";
			//node.eachAdjacency(function (adj) {
			//	var child = adj.nodeTo;
			//	html += "<li>" + child.name + "</li>";
			//});
			//html += "</ul>";
			//$jit.id('inner-details').innerHTML = html;
		},
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
		//This is method is useful to make some last minute changes
		//to node labels like adding some position offset.
		onPlaceLabel: function (domElement, node) {
			var style = domElement.style;
			var left = parseInt(style.left);
			var w = domElement.offsetWidth;
			style.left = (left - w / 2) + 'px';
		}
	});

	loadCustomFunctions();

	rgraph.loadJSON(json, 1);

	rgraph._refresh = rgraph.refresh;
	rgraph.refresh = function (...args) {
		if (!handlers.windowWidget.getContainer()) {
			clearInterval(handlers.loop_handler)
			handlers.loop_handler = null;
			return;
		}
		if (!handlers.windowWidget.isVisible) {
			return;
		}

		draw_lines(rgraph, attacksMonitor);
	}
	
	//rgraph.controller.onBeforeCompute(rgraph.graph.getNode(rgraph.root));
	
	loop(rgraph, handlers);

	rgraph.refresh();
}

function loop(rgraph, handlers) {
	handlers.loop_handler = setInterval(() => {
		rgraph.refresh(handlers);
	}, 1000);
}

async function draw_lines(rgraph, attacksMonitor) {

	let disableGrouping = true;
	let attacks = await attacksMonitor.populateProcesses(disableGrouping, { param: "expiry", isDescending: true, });

	rgraph._refresh(...args);

	let ctx = rgraph.canvas.getCtx();
	ctx.save();


	let min = 100;
	let max = 0;
	attacks.forEach(serv => {
		serv._scale = Math.log10(serv.threads);
		if (serv._scale > max) max = serv._scale;
		if (serv._scale && serv._scale < min) min = serv._scale;
	});

	attacks.forEach(serv => {
		let target = serv.target;

		ctx.lineWidth = Math.max((serv._scale - min) / (max - min) * 6, 0) + 0.5;
		switch (serv.type) {
			case 'weaken': ctx.strokeStyle = '#f3f330'; break;
			case 'hack': ctx.strokeStyle = '#33d833'; break;
			default: ctx.strokeStyle = '#00a5f3'; break;
		}
		
		
		serv.hosts.forEach(target2 => {
			arc_line(ctx, rgraph, target, target2);
		})
	})

	ctx.restore();
}

function arc_line(ctx, rgraph, idfrom, idto) {
	let nodeFrom = rgraph.graph.getNode(idfrom)
	let nodeTo = rgraph.graph.getNode(idto)
	let canvas = rgraph.canvas;

	var from = nodeFrom.pos.getc(),
		to = nodeTo.pos.getc();

	/*
	ctx.beginPath();
	ctx.moveTo(from.x, from.y);

	var c = (from.x + to.x) / 2;
	var d = (from.y + to.y) / 2;
	ctx.quadraticCurveTo(to.x, to.y, c, d);
	*/

	let begin = from;
	let end = to;
	var orn = "";
	let dim = (Math.abs(begin.x - end.x) + Math.abs(begin.y - end.y))/2
	if (Math.abs(begin.x - end.x) > Math.abs(begin.y - end.y)) {
		orn = (begin.x < end.x) ? "left" : "right";
	} else {
		orn = (begin.y < end.y) ? "top" : "bottom";
	}
	
	ctx.beginPath();
	ctx.moveTo(begin.x, begin.y);

	ctx.quadraticCurveTo((begin.x + end.x) / 2, (begin.y + end.y) / 2 - dim, end.x, end.y);
	/*
	switch (orn) {
		case "left":
			ctx.quadraticCurveTo((begin.x + end.x) + dim, (begin.y + end.y)/2, end.x, end.y);
			break;
		case "right":
			ctx.quadraticCurveTo((begin.x + end.x) - dim, (begin.y + end.y)/2, end.x, end.y);
			break;
		case "top":
			ctx.quadraticCurveTo((begin.x + end.x) / 2, (begin.y + end.y) / 2 + dim, end.x, end.y);
			break;
		case "bottom":
			ctx.quadraticCurveTo((begin.x + end.x) / 2, (begin.y + end.y) / 2 - dim, end.x, end.y);
			break;
	}
	//*/
	//ctx.lineTo(to.x, to.y);
	ctx.stroke();
	
	/*
	ctx.restore()
	var centerOfCircle = computeArcThroughTwoPoints(from, to);
	if (centerOfCircle.a > 1000 || centerOfCircle.b > 1000
		|| centerOfCircle.ratio < 0) {
		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.stroke();
	} else {
		var angleBegin = Math.atan2(to.y - centerOfCircle.y, to.x
			- centerOfCircle.x);
		var angleEnd = Math.atan2(from.y - centerOfCircle.y, from.x
			- centerOfCircle.x);
		var sense = sense(angleBegin, angleEnd);
		ctx.beginPath();
		ctx.arc(centerOfCircle.x, centerOfCircle.y, centerOfCircle.ratio
			, angleBegin, angleEnd, sense);
		ctx.stroke();
	}
	*/

	function computeArcThroughTwoPoints(p1, p2) {
		var aDen = (p1.x * p2.y - p1.y * p2.x), bDen = aDen;
		var sq1 = p1.squaredNorm(), sq2 = p2.squaredNorm();
		// Fall back to a straight line
		if (aDen == 0)
			return {
				x: 0,
				y: 0,
				ratio: -1
			};

		var a = (p1.y * sq2 - p2.y * sq1 + p1.y - p2.y) / aDen;
		var b = (p2.x * sq1 - p1.x * sq2 + p2.x - p1.x) / bDen;
		var x = -a / 2;
		var y = -b / 2;
		var squaredRatio = (a * a + b * b) / 4 - 1;
		// Fall back to a straight line
		if (squaredRatio < 0)
			return {
				x: 0,
				y: 0,
				ratio: -1
			};
		var ratio = Math.sqrt(squaredRatio);
		var out = {
			x: x,
			y: y,
			ratio: ratio > 1000 ? -1 : ratio,
			a: a,
			b: b
		};

		return out;
	}

	function sense(angleBegin, angleEnd) {
		return (angleBegin < angleEnd) ? ((angleBegin + Math.PI > angleEnd) ? false
			: true) : ((angleEnd + Math.PI > angleBegin) ? true : false);
	}
				//	*/
}

function loadCustomFunctions() {
	$jit.RGraph.Plot.EdgeTypes.implement({
		'curvyArrow': {
			'render': function (adj, canvas) {

				/*
				var begin = adj.nodeFrom.pos.getc(),
					end = adj.nodeTo.pos.getc(),
					dim = (Math.abs(begin.x - end.x) + Math.abs(begin.y - end.y));
				dim = dim/20 * Math.log(dim)
				var ctx = canvas.getCtx();

				var orn = "";
				if (Math.abs(begin.x - end.x) > Math.abs(begin.y - end.y)) {
					orn = (begin.x < end.x) ? "left" : "right";
				} else {
					orn = (begin.y < end.y) ? "top" : "bottom";
				}

				ctx.beginPath();
				ctx.moveTo(begin.x, begin.y);

				switch (orn) {
					case "left":
						ctx.bezierCurveTo(begin.x + dim, begin.y, end.x - dim, end.y, end.x, end.y);
						break;
					case "right":
						ctx.bezierCurveTo(begin.x - dim, begin.y, end.x + dim, end.y, end.x, end.y);
						break;
					case "top":
						ctx.bezierCurveTo(begin.x, begin.y + dim, end.x, end.y - dim, end.x, end.y);
						break;
					case "bottom":
						ctx.bezierCurveTo(begin.x, begin.y - dim, end.x, end.y + dim, end.x, end.y);
						break;
				}
				ctx.stroke();
				*/

				//*
				var from = adj.nodeFrom.pos.getc(),
					to = adj.nodeTo.pos.getc(),
					dim = 123;

				var ctx = canvas.getCtx();
				var centerOfCircle = computeArcThroughTwoPoints(from, to);
				if (centerOfCircle.a > 1000 || centerOfCircle.b > 1000
					|| centerOfCircle.ratio < 0) {
					ctx.beginPath();
					ctx.moveTo(from.x, from.y);
					ctx.lineTo(to.x , to.y);
					ctx.stroke();
				} else {
					var angleBegin = Math.atan2(to.y - centerOfCircle.y, to.x
						- centerOfCircle.x);
					var angleEnd = Math.atan2(from.y - centerOfCircle.y, from.x
						- centerOfCircle.x);
					var sense = sense(angleBegin, angleEnd);
					ctx.beginPath();
					ctx.arc(centerOfCircle.x, centerOfCircle.y, centerOfCircle.ratio
						, angleBegin, angleEnd, sense);
					ctx.stroke();
				}

				function computeArcThroughTwoPoints(p1, p2) {
					var aDen = (p1.x * p2.y - p1.y * p2.x), bDen = aDen;
					var sq1 = p1.squaredNorm(), sq2 = p2.squaredNorm();
					// Fall back to a straight line
					if (aDen == 0)
						return {
							x: 0,
							y: 0,
							ratio: -1
						};

					var a = (p1.y * sq2 - p2.y * sq1 + p1.y - p2.y) / aDen;
					var b = (p2.x * sq1 - p1.x * sq2 + p2.x - p1.x) / bDen;
					var x = -a / 2;
					var y = -b / 2;
					var squaredRatio = (a * a + b * b) / 4 - 1;
					// Fall back to a straight line
					if (squaredRatio < 0)
						return {
							x: 0,
							y: 0,
							ratio: -1
						};
					var ratio = Math.sqrt(squaredRatio);
					var out = {
						x: x,
						y: y,
						ratio: ratio > 1000 ? -1 : ratio,
						a: a,
						b: b
					};

					return out;
				}

				function sense(angleBegin, angleEnd) {
					return (angleBegin < angleEnd) ? ((angleBegin + Math.PI > angleEnd) ? false
						: true) : ((angleEnd + Math.PI > angleBegin) ? true : false);
				}
				//	*/
			},
			//optional
			'contains': function (adj, pos) {
				//return true if pos is inside the arc or false otherwise
			}
		}
	});
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