const express =  require("express");

const app = express();

const http =  require("http");

const WebSocket = require('ws');

const server = http.createServer(app);

const ws = new WebSocket.Server({server});



app.use(express.static('./app/public'));

function heartbeat() {
    this.isAlive = true;
  }



ws.on('connection',function(wss,req){
    var conexion;
    const ip = req.connection.remoteAddress;


    wss.on('message',function(data){
        
        ws.clients.forEach(function each(client) {

            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }   
            
        });

    })

    wss.on('pong',function(data){
         this.isAlive = true;
    });

    wss.on('close', function close() {
        console.log('disconnected');
        //clearInterval(conexion);
    });
      
    /*conexion =  setInterval(function(){

        wss.send("hola server ");

        
    },1000);*/

    const interval = setInterval(function ping() {
        ws.clients.forEach(function each(ws) {
          if (ws.isAlive === false) return ws.terminate();
      
          ws.isAlive = false;
          ws.ping();
        });
      }, 1000);
    
});





server.listen(80,function(){

    console.log("servidor listo");

});



