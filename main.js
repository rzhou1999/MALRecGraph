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
      if(addNode(json[i]['surl'],json[i]['simg'],json[i]['stitle'],json[i]['sid'])==0){
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
  if (id2<id1){
    var temp = id1;
    id1 = id2;
    id2 = temp;
  }
  edges.add({from: id1, to: id2, length: Math.max(numAttached * 33, 95)})
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
  console.log(retVal);
  return retVal;
};

function addNode(url,img,title,sid){
  try {
    nodes.add([
      {id: sid, label: chunk(title, 20).join('\n'), image: img, shape: 'image', font: font}
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
    }
};
nodes = new vis.DataSet(options);
var edges = new vis.DataSet();

//var starter = prompt("ID?");//37786
//this needs to be deleted someday
//httpGetAsync("http://localhost:5000/api/getinfo?malid="+starter, handleRequest, started)

function handleStarter(dump, cid){
  var json = JSON.parse(dump);
  addNode(json['surl'],json['simg'],json['stitle'],json['sid']);
  $.unblockUI();
  network.focus(cid,{scale:2});
}

var cssConst = {
  margin: 'auto',
  width: '300px',
  paddingTop: '10px',
  paddingRight: '30px',
  paddingBottom: '30px',
  paddingLeft: '30px',
}

$(document).ready(function() {
        $.blockUI({ message: $('#starter'),  css: cssConst});

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
  var ids = properties.nodes;
  var clickedNodes = nodes.get(ids);
  console.log('clicked nodes:', clickedNodes);
  httpGetAsync("http://35.243.181.45:5000/api/getrecs?malid="+clickedNodes[0]['id'], handleRequest, clickedNodes[0]['id'])
});

network.on("oncontext", function(properties) {
  var pointer = properties.pointer;
  var clickedNodes = network.getNodeAt(pointer.DOM);
  console.log('rclicked nodes:', clickedNodes);
  window.open("https://myanimelist.net/anime/"+clickedNodes)
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
