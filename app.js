//Dependencies
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const port = process.env.PORT || 8888;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const rpiDhtSensor = require('rpi-dht-sensor');

let interval;

//Dht config
const dht = new rpiDhtSensor.DHT11(4);
let temperature = 0;
let humidity = 0;


//Handling heatsensor page

	io.on('connection', socket => {
		console.log('Client connected');
		if(interval){
			clearInterval(interval);			
		}
		interval = setInterval(() => getHeatData(socket),1000);
		socket.on('disconnect', () => {
			console.log('Client disconnected :(');		
		});
		});


getHeatData = socket => {
	try{
		const readout = dht.read();
				temperature = readout.temperature.toFixed(2);
				humidity = readout.humidity.toFixed(2) ;
 
    				console.log('Temperature: ' + readout.temperature.toFixed(2) + 'C, ' +
        '			humidity: ' + readout.humidity.toFixed(2) + '%');
					socket.emit('sendingheatdata', 
						{temperature: temperature, humidity: humidity})
	} catch(error){
		console.error(`Error: ${error.code}`);	
	}

}

//Listening port
server.listen(port, () => {
	console.log(`Listening on port ${port}`)
});

