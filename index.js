const express =  require("express");

const app = express();

const http =  require("http");

const WebSocket = require('ws');

const server = http.createServer(app);

const ws = new WebSocket.Server({server});

var μs = require('microseconds');


app.use(express.static('./app/public'));


var clientbage = 0;


ws.on('connection',function(wss,req){
    //conteo de clientes en conexion
    clientbage++;
    
    
    const ip = req.connection.remoteAddress;
    wss.on('message',function(data){
        
        
        ws.clients.forEach(function each(client) {

            if (client !== ws && client.readyState === WebSocket.OPEN) {
                
                //se agrega control de tiempo por cliente para moderar el trafico
                //La resolucion del relog es es microsegundos
                // inicialmente es un segundo por cada cliente conectado

                if(!client.time){
                    
                    //se crea cliente si no existe
                    client.time = {"time":μs.now()}
                }else{

                    //se optiene el tiempo actual
                    var clientEspera = ( ((μs.now() - client.time.time) / 1000) / 1000);
                    
                    //clientbage contiene un conteo bago de los clientes conectados
                    //si el tiempo de espera de cliente es mayor el mensaje se envia a todos los clientes

                    if(clientEspera > clientbage){

                        //se envia el mensaje y el tiemp de espera
                        client.send( JSON.stringify({"mensaje":data,"server_sleep":clientEspera -clientbage} ));

                    }else{

                        //se envia el mensaje con null y el tiemp de espera
                        client.send( JSON.stringify({"mensaje":null,"server_sleep": clientbage - clientEspera} ))
                    }
                    
                    // se actualiza el tiempo de cliente
                    client.time = {"time":μs.now()}
                }   

               
            }   
            
        });

    })

    wss.on('pong',function(data){
         this.isAlive = true;
    });

    wss.on('close', function close() {
        console.log('disconnected');
        //clearInterval(conexion);
        //conteo de clientes desconectados
        clientbage--;
    });
      
    /*conexion =  setInterval(function(){

        wss.send("hola server ");

        
    },1000);*/
    
    //se verifica el ping de los clientes para saber conexion o desconexion
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



