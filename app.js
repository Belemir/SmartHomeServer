//Dependencies
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const port = process.env.PORT || 8888;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const GpioPin = require('onoff').Gpio;
const PythonShell = require('python-shell');
const rpiDhtSensor = require('rpi-dht-sensor');
const Sensor = require('dovlet-rpi-sensors');
const room = "room";


//Configuring LEDs

const kitchenLED = new GpioPin(6, 'out');
/*const livingRoomLED = new Gpio(5, 'out');
const garageLED = new Gpio(13, 'out');
const gardenLED = new Gpio(26, 'out');*/


//Configuring Heat and Humidity sensor
const dht = new rpiDhtSensor.DHT11(4);
let temperature = 0;
let humidity = 0;

let interval;
let lightVal;
let motionVal;
let rainVal;
let gasVal;
let garageVal = false;
let kitchenLightVal = false;
let livingRoomLightVal = false;
let garageLightVal = false;
let gardenLightVal = false;

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
		socket.join(room);
		if(interval){
			clearInterval(interval);			
		}
		interval = setInterval(() => sendSensorData(socket),1000);
		
		//Handling Garage Door
		socket.on('garageDoorEvent', data => {
			garageVal = data.garageData;
			if(garageVal){
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
		
		//Handling Kitchen Light
		socket.on('kitchenLightEvent', data => {
			kitchenLightVal = data.kitchenLightData;
			if (kitchenLED.readSync() === 0) { 
			    kitchenLED.writeSync(1);
			    kitchenLightVal = true; 
			  } else {
			    kitchenLED.writeSync(0);
			    kitchenLightVal = false;
			  }
		});		

		/*
		//Handling Living Room Light
		socket.on('livingRoomLightEvent', data => {
			livingRoomLightVal = data.LivingRoomLightData;
			if (livingRoomLED.readSync() === 0) { 
			    livingRoomLED.writeSync(1);
			    livingRoomLightVal = true; 
			  } else {
			    livingRoomLED.writeSync(0);
			    livingRoomLightVal = false;
			  }
		});

		//Handling Garage Light
		socket.on('garageLightEvent', data => {
			garageLightVal = data.garageLightData;
			if (garageLED.readSync() === 0) { 
			    garageLED.writeSync(1);
			    garageLightVal = true; 
			  } else {
			    garageLED.writeSync(0);
			    garageLightVal = false;
			  }
		});	

		//Handling Garden Light
		socket.on('gardenLightEvent', data => {
			gardenLightVal = data.gardenLightData;
			if (gardenLED.readSync() === 0) { 
			    gardenLED.writeSync(1);
			    gardenLightVal = true; 
			  } else {
			    gardenLED.writeSync(0);
			    gardenLightVal = false;
			  }
		});					
		*/		
		
		socket.on('disconnect', () => {
			console.log('Client disconnected :(');		
		});
		});

	
//Emitting Socket data
emitSocketEvent = socket => {
	try{
		socket.join(room);
		io.to(room).emit('sendingsensordata',
			{
				temperature: temperature,
				humidity: humidity,
				lightStatus: lightVal,
				rainStatus: rainVal,
				motionStatus: motionVal,
				gasStatus: gasVal,
				garageStatus: garageVal,
				livingRoomLightStatus: livingRoomLightVal,
				kitchenLightStatus: kitchenLightVal,
				garageLightStatus: garageLightVal,
				gardenLightStatus: gardenLightVal
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

