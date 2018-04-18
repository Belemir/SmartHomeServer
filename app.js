//Dependencies
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const port = process.env.PORT || 8888;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PythonShell = require('python-shell');
const rpiDhtSensor = require('rpi-dht-sensor');
const Sensor = require('dovlet-rpi-sensors');

/*
//Garage door configuration
const openGarageDoor = new PythonShell('opengarage.py');
const closeGarageDoor = new PythonShell('closegarage.py');
*/

//Configuring Heat and Humidity sensor
const dht = new rpiDhtSensor.DHT11(4);
let temperature = 0;
let humidity = 0;

let interval;
let lightVal;
let motionVal;
let rainVal;
let gasVal;
let garageStatus;

//Motion Sensor Configuration
const motionSensor = new Sensor({
	pinNumber: 18,
	loopInterval: 500
});

motionSensor.on('detection', () => {
	console.log('Motion Detected');
	motionVal = 'Motion Detected';
});

motionSensor.startDetection();

//Light Sensor Configuration
const lightSensor = new Sensor({
	pinNumber: 27,
	loopInterval: 500
});

lightSensor.on('detection', () => {
	console.log('Light Detected');
	lightVal = 'Light Detected';
});

lightSensor.startDetection();

//Gas Sensor Configuration
const gasSensor = new Sensor({
	pinNumber: 19,
	loopInterval: 500
});

gasSensor.on('detection', () => {
	console.log('Gas Detected');
	gasVal = 'Gas Detected';
});

gasSensor.startDetection();

//Rain Sensor Configuration
const rainSensor = new Sensor({
	pinNumber: 17,
	loopInterval: 500
});

rainSensor.on('detection', () => {
	console.log('Rain Detected');
	rainVal = 'Rain Detected';
});

rainSensor.startDetection();

//Updating sensor values every 4 seconds
setInterval(() => {
	motionVal = 'Fetching Data ...',
	lightVal = 'Fetching Data ...',
	rainVal = 'Fetching Data ...',
	gasVal = 'Fetching Data ...'
},4000);

//Handling sensor page

	io.on('connection', socket => {
		console.log('Client connected');
		if(interval){
			clearInterval(interval);			
		}
		interval = setInterval(() => sendSensorData(socket),1000);
		
		socket.on('garageDoorEvent', data => {
			garageStatus = data.garageData;
			if(garageStatus){
				PythonShell.run('opengarage.py', err => {
					if( err ) throw err;
					console.log('Garage door is open');
				});
			} else {
				PythonShell.run('closegarage.py', err => {
					if( err ) throw err;
					console.log('Garage door  is closed');
				});
			}		
				
		});
		socket.on('disconnect', () => {
			console.log('Client disconnected :(');		
		});
		});

//Controlling garage door

	

emitSocketEvent = socket => {
	try{
		socket.emit('sendingsensordata', 
			{
				temperature: temperature,
				humidity: humidity,
				lightstatus: lightVal,
				rainstatus: rainVal,
				motionstatus: motionVal,
				gasstatus: gasVal
			})
	}catch(error){
		console.error(`Error: ${error.code}`);	
	}
}

sendSensorData = socket => {
	try{
			
			const readout = dht.read();
 			temperature = readout.temperature.toFixed(2);
 			humidity = readout.humidity.toFixed(2) ;
  
     			console.log('Temperature: ' + readout.temperature.toFixed(2) + 'C, ' +
         '		humidity: ' + readout.humidity.toFixed(2) + '%');
			
			emitSocketEvent(socket);

		
	} catch(error){
		console.error(`Error: ${error.code}`);	
	}

}

//Listening port
server.listen(port, () => {
	console.log(`Listening on port ${port}`)
});

