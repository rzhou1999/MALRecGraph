var nodes;
var edges;
var network;
var count = 0;

var font ={
            size : 8,
            color : '#ffffff'
        }

function handleRequest(dump, cid){
  //console.log("resp received");
  var json = JSON.parse(dump);
  for (var i = 0; i < json.length; i++){
    if (cid!=json[i]['sid']){
      if(addNode(json[i]['surl'],json[i]['simg'],json[i]['stitle'],json[i]['sid'], cid)==0){
        addEdge(cid, json[i]['sid'],json.length)
      }
    }
  }
}

function httpGetAsync(theUrl, callback, cid)
{
  //console.log("request sent");
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", theUrl, true); // true for asynchronous
  xmlHttp.setRequestHeader('Content-Type','text/plain');
  xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
          callback(xmlHttp.responseText, cid);
  }

  xmlHttp.send(null);

}

function addEdge(id1, id2, numAttached){
  edges.add({from: id1, to: id2, length: Math.max(numAttached * 33, 95), color:"#2B7CE9", hoverWidth : 0, selectionWidth : 0})
}

function chunk(str, n) {
  var words = str.split(" ");
  var retVal = [];
  var i = 0;
  while (words.length > 0){
    if (retVal.length == i+1){
      if ((retVal[i]+ " "+ words[0]).length < 20){
        /*console.log((retVal[i]+ " "+ words[0]).length);
        console.log(retVal[i]);
        console.log(words[0]);*/
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
  //console.log(retVal);
  return retVal;
};

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

//var starter = prompt("ID?");//37786
//this needs to be deleted someday
//httpGetAsync("http://localhost:5000/api/getinfo?malid="+starter, handleRequest, started)

function handleStarter(dump, cid){
  var json = JSON.parse(dump);
  addNode(json['surl'],json['simg'],json['stitle'],json['sid'], 0);
  $.unblockUI();
  network.focus(cid,{scale:2});
}

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

$(document).ready(function() {
        $.blockUI({ message: $('#starter'),  css: cssConst});

        $('#suggest').click(function() {
            var myEvilListOfSuggestions =
            [
              "https://myanimelist.net/anime/37786/Yagate_Kimi_ni_Naru",
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
            $.blockUI({ message: "<h1>Please wait...</h1>", css: cssConst });
            httpGetAsync("http://35.243.181.45:5000/api/getinfo?malid="+starter, handleStarter, starter)
        });

        $('#starterSubmit').click(function() {
            var starter = document.getElementById("starterid").value;
            starter = starter.substring(0,starter.lastIndexOf("/"))
            starter = starter.substring(starter.lastIndexOf("/")+1)
            $.blockUI({ message: "<h1>Please wait...</h1>", css: cssConst });
            httpGetAsync("http://35.243.181.45:5000/api/getinfo?malid="+starter, handleStarter, starter)
        });
    });



//var json = JSON.parse(dump);
//addNode(json[i]['surl'],json[i]['simg'],json[i]['stitle'],json[i]['sid'])
/*
nodes.add([
  {id: starter, label: 'Yagate Kimi ni Naru', image: 'https://myanimelist.cdn-dena.com/images/anime/1347/92092l.jpg', shape: 'image', font: font},
]);
*/


var container = document.getElementById('mynetwork');
var data = {
    nodes: nodes,
    edges: edges
};

network = new vis.Network(container, data, options);

network.on( 'click', function(properties) {
  network.redraw();
  var ids = properties.nodes;
  var clickedNodes = nodes.get(ids);
  //console.log('clicked nodes:', clickedNodes);
  if (clickedNodes.length != 0)
    httpGetAsync("http://35.243.181.45:5000/api/getrecs?malid="+clickedNodes[0]['id'], handleRequest, clickedNodes[0]['id']);
});

network.on("oncontext", function(properties) {
  var pointer = properties.pointer;
  var clickedNodes = network.getNodeAt(pointer.DOM);
  //console.log('rclicked nodes:', clickedNodes);
  window.open("https://myanimelist.net/anime/"+clickedNodes)
  //httpGetAsync("http://localhost:5000/api/getrecs?malid="+clickedNodes[0]['id'], handleRequest, clickedNodes[0]['id'])
});

function highlightNode(nodeid){
    if(nodeid!=0)nodes.update({id:nodeid, shapeProperties: { useBorderWithImage:true}});
}

function unhighlightNode(nodeid){
    if(nodeid!=0)nodes.update({id:nodeid, shapeProperties: { useBorderWithImage:false}});
}

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

function traceBackNodes(currNode, nodeFunc, edgeFunc){
  nodeFunc(currNode);
  if (currNode!=0){
    var parentId = nodes.get(currNode)['parent'];
    if(parentId!=0)edgeFunc(parentId, currNode);
    traceBackNodes(parentId, nodeFunc, edgeFunc);
  }
}

network.on("hoverNode", function(properties) {
  var hoveredNode = properties.node;
  //console.log('hovered nodes:', hoveredNode);
  traceBackNodes(hoveredNode, highlightNode, highlightEdge);
  //httpGetAsync("http://localhost:5000/api/getrecs?malid="+clickedNodes[0]['id'], handleRequest, clickedNodes[0]['id'])
});

network.on("blurNode", function(properties) {
  var unhoveredNode = properties.node;
  //console.log('unhovered nodes:', unhoveredNode);
  traceBackNodes(unhoveredNode, unhighlightNode, unhighlightEdge);
  //httpGetAsync("http://localhost:5000/api/getrecs?malid="+clickedNodes[0]['id'], handleRequest, clickedNodes[0]['id'])
});

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
