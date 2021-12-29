import 'jit-yc.js'

/** @param {NS} ns **/
async function mainPlugin(api){
    let os = api.os;
	let classes = api.classes;



	let windowWidget = classes.newWindowWidget(this);
	//windowWidget.listen("show", onShow);
	windowWidget.init();
	//windowWidget.getContentDiv().innerHTML = '<div class="plugins-list" />';
	windowWidget.getContentDiv().classList.add('greenScrollbar')
	windowWidget.getContentDiv().classList.add('grayBackground')
	windowWidget.setTitle('Network Graph')
	//let windowDiv = windowWidget.getContainer()
	windowWidget.show();



	let style;
    let doc = globalThis['document'];
	let scroll_div = doc.createElement('div');
	//scroll_div.style.position= 'fixed';
    //scroll_div.style.top= 0;
    //scroll_div.style.left= 0;
    scroll_div.style.width= '1200px';
    scroll_div.style.height= '900px';
	//scroll_div.style['z-index']= 99999;
    //scroll_div.style.overflow = 'scroll';
	scroll_div.id = 'infovis'
	//scroll_div.style['background-color']= '#1a1a1a';
	windowWidget.getContentDiv().style['background-color'] = '#1a1a1a';
	windowWidget.getContentDiv().appendChild(scroll_div);
	
//    let wrapper = doc.createElement('div');
//	scroll_div.style.width= '2000px';
//    scroll_div.style.height= '2000px';
//    scroll_div.id = 'infovis'
//    scroll_div.style['background-color']= '#1a1a1a';
//    scroll_div.appendChild(wrapper);
    

    try{
		
		let serversFound = new Set();
		let serversData = {};
		let stack = [];
		let origin = 'home';
		stack.push(origin);
		

		await os.getNS( ns=> {
			while(stack.length > 0) {
				let server = stack.pop();
				if (!serversFound.has(server)){
					serversFound.add(server);
					let neighbors = ns.scan(server);
					serversData[server] = { neighbors };
					for (let serv of neighbors) {
						if (!serversFound.has(serv))
							stack.push(serv);
					}
				}
			}
		});

		
            
        style = injectCSS()
        init();


        //while(true) await ns.sleep(1000);



function init(){
    //"$type" or "$dim" will override the "type" and "dim" parameters globally defined
    
	let json = [];
	for(let serv of serversFound){
		let { neighbors } = serversData[serv];
		
		let adjacencies = neighbors.map(n=>({
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
        onBeforePlotLine: function(adj){
            //Add some random lineWidth to each edge.
//            if (!adj.data.$lineWidth) 
//                adj.data.$lineWidth = Math.random() * 5 + 1;
        },
        
        onBeforeCompute: function(node){
            
            //Make right column relations list.
            var html = "<h4>" + node.name + "</h4><b>Connections:</b>";
            html += "<ul>";
            node.eachAdjacency(function(adj){
                var child = adj.nodeTo;
                html += "<li>" + child.name + "</li>";
            });
            html += "</ul>";
            //$jit.id('inner-details').innerHTML = html;
        },
        //Add node click handler and some styles.
        //This method is called only once for each node/label crated.
        onCreateLabel: function(domElement, node){
            domElement.innerHTML = node.name;
            domElement.onclick = function () {
                rgraph.onClick(node.id, { 
                    hideLabels: false,
                    onComplete: function() {
                    }
                });
            };
        },
        //This method is called when rendering/moving a label.
        //This is method is useful to make some last minute changes
        //to node labels like adding some position offset.
        onPlaceLabel: function(domElement, node){
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

    function injectCSS(){
		const stylesheetId = 'window-styles'

		const stylesheet = doc.createElement('style')
		stylesheet.id = stylesheetId

		stylesheet.innerHTML = 
`
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

`

		doc.head.insertAdjacentElement('beforeend', stylesheet)
		return stylesheet;
	}
	
	
	
    }catch(e){
		if(style)style.remove();
        scroll_div.remove();
        throw e;
    }

}