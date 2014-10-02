/*********************************************************
Author: admin@web-tinker.com
Latest: 2014-09-25
Require: EventModel.1.1.js

WorkerClient: Interface Constructor
  Parameters: 1. The URL as the first argument of SharedWorker
              2. The handle of "connect" event
              3. The handle of "disonnect" event
              4. The handle of "data" event
Instance of WorkerClient:
  Methods:
    send: To send data
      Parameters: 1. The data
  Events:
    connect: When this connection established
      Arguments: 1. The ID of this connection
    disconnect: When this connection disconnect
    data: When data received
      Arguments: 1. Received data
*********************************************************/

var WorkerClient=function(){
  return WorkerClient;
  function WorkerClient(url,con,dis,dat){
    var client=EventModel(this);
    con&&client.on("connect",con);
    dis&&client.on("disconnect",dis);
    dat&&client.on("data",dat);
    var port=new SharedWorker(url).port;
    console.log("connecting...");
    var itv=setInterval(function(){
      port.postMessage({
        name:"ping",value:setTimeout(function(){
          console.log("broken!!");
          port.close();
          clearInterval(itv);
          client.emit("disconnect");
        },1000)
      });
      //console.log("ping");
    },2000);
    Object.defineProperties(this,{
      send:{value:function(data){
        port.postMessage({name:"data",value:data});
      }}
    });
    port.onmessage=function(e){
      var name=e.data.name,value=e.data.value;
      switch(name){
        case "pong":
          clearTimeout(value);
          //console.log("pong");
          break;
        case "connected":
          console.log("connected");
          client.emit("connect",value);
          break;
        case "data":
          client.emit("data",value);
      };
    };
  };
}();
