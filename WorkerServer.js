importScripts("http://www.web-tinker.com/files/EventModel.1.1.js");

/*********************************************************
Author: admin@web-tinker.com
Latest: 2014-09-25
Require: EventModel.1.1.js

WorkerServer: Interface Constructor
  Parameters: 1. The handle of "connect" event
              2. The handle of "disonnect" event
              3. The handle of "data" event
Instance of WorkerServer:
  Methods:
    forEach: For each connection object call the callback
      Parameters: 1. Callback function
    terminate: To terminate the current instance
  Events:
    connect: When new connection established
      Arguments: 1. The target connection object
    disconnect: When any connection disconnect
      Arguments: 1. The target connection object
    data: When data received from any connection
      Arguments: 1. The target connection object
                 2. Received data
Instance of Connection:
  Methods:
    send: To send data
      Parameters: 1. The data
    close: To close this connection
  Events:
    disconnect: When this connection disconnect
    data: When data received
      Arguments: 1. Received data
*********************************************************/

var WorkerServer=function(){
  var uid=1;
  return WorkerServer;
  function Connection(port){
    var connection=EventModel(this);
    resetTimeout();
    Object.defineProperties(this,{
      send:{value:function(data){
        port.postMessage({name:"data",value:data});
      }},close:{value:function(){
        port.clsoe();
        connection.emit("disconnect");
      }},id:{value:uid++}
    });
    port.onmessage=(/*"message",*/function(e){
      var name=e.data.name,value=e.data.value;
      switch(name){
        case "data":
          connection.emit("data",value);
          break;
        case "ping":
          port.postMessage({name:"pong",value:value});
      };
    });
    function resetTimeout(){
      clearTimeout(resetTimeout.id);
      resetTimeout.id=setTimeout(function(){
        connection.close();
      },10000);
    };
    port.postMessage({name:"connected",value:this.id});
  };
  function WorkerServer(con,dis,dat){
    var workerserver=EventModel(this);
    con&&workerserver.on("connect",con);
    dis&&workerserver.on("disconnect",dis);
    dat&&workerserver.on("data",dat);
    var pool={};
    Object.defineProperties(this,{
      terminate:{value:function(){
        removeEventListener("connect",onconnect);
      }},forEach:{value:function(callback){
        for(var i in pool)callback(pool[i]);
      }}
    });
    addEventListener("connect",onconnect);
    function onconnect(e){
      var connection=new Connection(e.ports[0]);
      pool[connection.id]=connection;
      connection.on({
        disconnect:function(){
          delete pool[connection.id];
          workerserver.emit("disconnect",connection);
        },data:function(data){
          workerserver.emit("data",connection,data);
        }
      });
      workerserver.emit("connect",connection);
    };
  };
}();
