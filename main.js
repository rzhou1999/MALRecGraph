var nodes;
var edges;
var network;
var count = 0;
var clickedIds = [];

var font ={
            size : 8,
            color : '#ffffff'
        }

//handles non-starter request reponses
function handleRequest(dump, cid){
  var json = JSON.parse(dump);
  for (var i = 0; i < json.length; i++){
    if (cid!=json[i]['sid']){
      if(addNode(json[i]['surl'],json[i]['simg'],json[i]['stitle'],json[i]['sid'], cid)==0){
        addEdge(cid, json[i]['sid'],json.length)
      }
    }
  }
  document.getElementById("progress"+cid).outerHTML = "";
}

//wrapper for sending requests to backend
//cid stands for "caller id"-- i.e. the parent of every node retrieved from the response.
function httpGetAsync(theUrl, callback, cid)
{
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", theUrl, true);
  xmlHttp.setRequestHeader('Content-Type','text/plain');
  xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
          callback(xmlHttp.responseText, cid);
  }

  xmlHttp.send(null);

}

//wrapper for adding edge from id1 to id2
function addEdge(id1, id2, numAttached){
  edges.add({from: id1, to: id2, length: Math.max(numAttached * 33, 95), color:"#2B7CE9", hoverWidth : 0, selectionWidth : 0})
}

//splits up string into (usually) <20 char chunks so long titles actually look nice
function chunk(str, n) {
  var words = str.split(" ");
  var retVal = [];
  var i = 0;
  while (words.length > 0){
    if (retVal.length == i+1){
      if ((retVal[i]+ " "+ words[0]).length < 20){
        retVal[i] += " " + words.shift();

      }
      else{
        i++;
      }
    }
    else{
      retVal.push(words.shift())
    }
  }
  return retVal;
};

//helper function for creating node
function genNode(sid, title, img, parent){
  return {
    id: sid,
    label: chunk(title, 20).join('\n'),
    image: img,
    parent: parent,
    shape: 'image',
    font: font,
    borderWidth : 5,
    borderWidthSelected : 5,
    color:{
      border:"#f7ff23",
      hover:{border:"#f7ff23"},
      highlight:{border:"#f7ff23"}
    }
  };
};

//wrapper function for adding node using genNode
//catches error and logs it if one is thrown (usually duplicate nodes are the culprit)
function addNode(url,img,title,sid,parent){
  try {
    nodes.add([
      genNode(sid, title, img, parent)
    ]);
    return 0;
}
catch(err) {
  return -1;
    console.log(err);
}

}


var options = {
    nodes: {
        shape: 'dot',
        size: 30,
        font: {
            size: 32,
            color: '#ffffff'
        },
        borderWidth: 2
    },
    edges: {
        width: 2
    },
      physics:{
        solver: 'repulsion',
    },
    interaction:{
      hover: true,
      hoverConnectedEdges: false,
    }
};
nodes = new vis.DataSet(options);
var edges = new vis.DataSet();

//handles starter request responses
function handleStarter(dump, cid){
  var json = JSON.parse(dump);
  addNode(json['surl'],json['simg'],json['stitle'],json['sid'], 0);
  $.unblockUI();
  network.focus(cid,{scale:2});
}

//css for modal dialogues
var cssConst = {
  margin: 'auto',
  width: '400px',
  paddingTop: '10px',
  paddingRight: '30px',
  paddingBottom: '30px',
  paddingLeft: '30px',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
}

//blocks with modal dialogue when loaded
$(document).ready(function() {
        //blocks ui with div "starter", uses cssConst from above for styling
        $.blockUI({ message: $('#starter'),  css: cssConst});

        //picks a random anime from the list below, parses it and sends a starter request to the backend
        $('#suggest').click(function() {
            var myEvilListOfSuggestions =
            [
              "https://myanimelist.net/anime/37786/Yagate_Kimi_ni_Naru",
              "https://myanimelist.net/anime/14741/Chuunibyou_demo_Koi_ga_Shitai",
              "https://myanimelist.net/anime/20457/Inari_Konkon_Koi_Iroha",
              "https://myanimelist.net/anime/13333/Tari_Tari",
              "https://myanimelist.net/anime/32281/Kimi_no_Na_wa",
              "https://myanimelist.net/anime/31043/Boku_dake_ga_Inai_Machi",
              "https://myanimelist.net/anime/23289/Gekkan_Shoujo_Nozaki-kun",
              "https://myanimelist.net/anime/12189/Hyouka",
              "https://myanimelist.net/anime/11887/Kokoro_Connect",
              "https://myanimelist.net/anime/34822/Tsuki_ga_Kirei",
              "https://myanimelist.net/anime/37497/Irozuku_Sekai_no_Ashita_kara",
              "https://myanimelist.net/anime/14355/Yama_no_Susume",
            ]

            starter = myEvilListOfSuggestions[Math.floor(Math.random() * myEvilListOfSuggestions.length)];;
            starter = starter.substring(0,starter.lastIndexOf("/"))
            starter = starter.substring(starter.lastIndexOf("/")+1)
            $.blockUI({ message: "<h1>Please wait...</h1><div class=progress></div>", css: cssConst });
            httpGetAsync("http://35.243.181.45:5000/api/getinfo?malid="+starter, handleStarter, starter)
        });

        //reads input from starterid textbox, parses it and sends a starter request to the backend
        $('#starterSubmit').click(function() {
            var starter = document.getElementById("starterid").value;
            starter = starter.substring(0,starter.lastIndexOf("/"))
            starter = starter.substring(starter.lastIndexOf("/")+1)
            $.blockUI({ message: "<h1>Please wait...</h1>", css: cssConst });
            httpGetAsync("http://35.243.181.45:5000/api/getinfo?malid="+starter, handleStarter, starter)
        });
    });

var container = document.getElementById('mynetwork');
var data = {
    nodes: nodes,
    edges: edges
};

network = new vis.Network(container, data, options);

var currentReqs = []

//network clicked, tries to find clicked node (if any) and sends a request to backend to load recommended shows if one is found
network.on( 'click', function(properties) {
  var ids = properties.nodes;
  var clickedNodes = nodes.get(ids);
  if (clickedNodes.length != 0 && !clickedIds.includes(clickedNodes[0]['id'])){
    clickedIds.push(clickedNodes[0]['id']);

    temp =  '<div id="progress' + clickedNodes[0]['id'] + '" class="progress-container">' +
            '<div class="progress"></div>' +
            '<h3 id="currentReq">' + "Loading recs for: " + clickedNodes[0]['label'].replace(/(\r\n\t|\n|\r\t)/gm," ") + '</h3>' +
            '</div>'

    document.getElementById("progress-master").innerHTML += temp;

    httpGetAsync("http://35.243.181.45:5000/api/getrecs?malid="+clickedNodes[0]['id'], handleRequest, clickedNodes[0]['id']);
  }
});

//network rightclicked, tries to find rightclicked node (if any) and opens MAL link if one is found
//note that because vis.js does not natively support something like properties.nodes, the node in question
//must be found by using calling getNodeAt() with pointer.DOM.
network.on("oncontext", function(properties) {
  var pointer = properties.pointer;
  var clickedNodes = network.getNodeAt(pointer.DOM);;
  if(clickedNodes != undefined) window.open("https://myanimelist.net/anime/"+clickedNodes);
});

//highlights node with nodeid
function highlightNode(nodeid){
    if(nodeid!=0)nodes.update({id:nodeid, shapeProperties: { useBorderWithImage:true}});
}

//unhighlights node with nodeid
function unhighlightNode(nodeid){
    if(nodeid!=0)nodes.update({id:nodeid, shapeProperties: { useBorderWithImage:false}});
}

//searches the edges DataSet and highlights the first edge that passes the filter
//note that the length of edgeList should always be one because duplicate edges are not supported
function highlightEdge(fromId, toId){
    var edgeList =
      edges.get({
        filter: function (item) {
          return (item.from == fromId && item.to == toId);
        }
      });
    edge = edgeList[0];
    edge.color = "#f7ff23";
    edge.width = 3;
    edges.update(edge);
}

//searches the edges DataSet and unhighlights the first edge that passes the filter
//note that the length of edgeList should always be one because duplicate edges are not supported
function unhighlightEdge(fromId, toId){
    var edgeList =
      edges.get({
        filter: function (item) {
          return (item.from == fromId && item.to == toId);
        }
      });
    edge = edgeList[0];
    edge.color = "#2B7CE9";
    edge.width = 1;
    edges.update(edge);
}

//recursively traces back nodes to the starter node, applying nodeFunc to all nodes in the way and
//edgeFunc to all edges in the way, by using each node's "parent".
function traceBackNodes(currNode, nodeFunc, edgeFunc){
  nodeFunc(currNode);
  if (currNode!=0){
    var parentId = nodes.get(currNode)['parent'];
    if(parentId!=0)edgeFunc(parentId, currNode);
    traceBackNodes(parentId, nodeFunc, edgeFunc);
  }
}

//detects when node is hovered over and calls traceBackNodes() to highlight the path back to the starter node
network.on("hoverNode", function(properties) {
  var hoveredNode = properties.node;
  traceBackNodes(hoveredNode, highlightNode, highlightEdge);
});

//detects when node is unhovered and calls traceBackNodes() to unhighlight the path back to the starter node
network.on("blurNode", function(properties) {
  var unhoveredNode = properties.node;
  traceBackNodes(unhoveredNode, unhighlightNode, unhighlightEdge);
});

//buttons in top left
window.onload = function(){
  var meButton = document.getElementById('me');
  meButton.onclick = function(event) {
    window.open("https://github.com/rzhou1999");
  };


  var githubButton = document.getElementById('github');
  githubButton.onclick = function(event) {
    window.open("https://github.com/rzhou1999/MALRecGraph");
  };

  var faqButton = document.getElementById('faq');
  faqButton.onclick = function(event) {
    window.open("https://github.com/rzhou1999/MALRecGraph/blob/master/README.md#faq");
  };
};
