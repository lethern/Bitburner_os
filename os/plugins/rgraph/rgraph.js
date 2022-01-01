import 'jit-yc.js'

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


	try {
		style = injectCSS()

		let servers = os.getServersManager().serversObj

		init(servers);

		contentDiv.scrollLeft = 540
		contentDiv.scrollTop = 540


    }catch(e){
		if(style)style.remove();
        infovis_div.remove();
        throw e;
    }

}


function init(servers) {
	//"$type" or "$dim" will override the "type" and "dim" parameters globally defined

	let json = [];
	for (let serv in servers) {
		let { neighbors } = servers[serv];

		let adjacencies = neighbors.map(n => ({
			"nodeTo": n,
			"data": {
				"weight": 3,
				lineWidth: 3
			}
		}));

		json.push({
			"id": serv,
			"name": serv,
			"data": {
				"$dim": 10.53272740718869,
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
		'background': {
			'CanvasStyles': {
				'strokeStyle': '#555',
				'shadowBlur': 50,
				'shadowColor': '#ccc'
			}
		},
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
			var html = "<h4>" + node.name + "</h4><b>Connections:</b>";
			html += "<ul>";
			node.eachAdjacency(function (adj) {
				var child = adj.nodeTo;
				html += "<li>" + child.name + "</li>";
			});
			html += "</ul>";
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

	rgraph.loadJSON(json, 1);

	rgraph.refresh();

	rgraph.controller.onBeforeCompute(rgraph.graph.getNode(rgraph.root));

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