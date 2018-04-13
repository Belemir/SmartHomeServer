//Dependencies
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const port = process.env.PORT || 8888;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PythonShell = require('python-shell');
//const rpiDhtSensor = require('rpi-dht-sensor');
//const motionSensor = require('pi-pir-sensor');


const pyshell = new PythonShell('sensors.py');

let interval;
let lightVal;
let motionVal;
let rainVal;
let dhtVal;
let gasVal;

const lightDetected = 'Light Detected';
const lightNotDetected ='Light NOT Detected';
const rainDetected = 'Rain Detected';
const rainNotDetected = 'Rain NOT Detected';
const motionDetected = 'Motion Detected';
const motionNotDetected = 'Motion NOT Detected';
const gasDetected = 'Gas Detected';
const gasNotDetected = 'Gas NOT Detected';


//Handling sensor page

	io.on('connection', socket => {
		console.log('Client connected');

		 sendSensorData(socket);
		
		socket.on('disconnect', () => {
			console.log('Client disconnected :(');		
		});
		});

emitSocketEvent = socket => {
	try{
		socket.emit('sendingsensordata', 
			{
				dhtstatus: dhtVal,
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

			//Getting Sensor data
			pyshell.on('message',  message => {

			// received a message sent from the Python script (a simple "print" statement)

			switch(message){
				case lightDetected:
					lightVal = lightDetected;
					//emitSocketEvent(socket);
					//commented this emitSocketEvent to test out the speed 
					//of sending data through socket :)
					break;
				case lightNotDetected:
					lightVal = lightNotDetected;
					break;
				case rainDetected:
					rainVal = rainDetected;
					break;
				case rainNotDetected:
					rainVal = rainNotDetected;
					break;
				case motionDetected:
					motionVal = motionDetected;
					break;
				case motionNotDetected:
					motionVal = motionNotDetected;
					break;
				case gasDetected:
					gasVal = gasDetected;
					break;
				case gasNotDetected:
					gasVal = gasNotDetected;
				case (message.match(/^Temperature/) || {}).input:
					dhtVal = message;
					break;
				default:
					rainVal = 'Fetching Data...';
					motionVal = 'Fetching Data...';
					dhtVal = 'Fetching Data...';
					lightVal = 'Fetching Data...';
					gasVal = 'Fetching Data...';
					break;
				
			}
			emitSocketEvent(socket);
			console.log(message)
			})
		
	} catch(error){
		console.error(`Error: ${error.code}`);	
	}

}

//Listening port
server.listen(port, () => {
	console.log(`Listening on port ${port}`)
});

