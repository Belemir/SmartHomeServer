//dependencies
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const rpiDhtSensor = require('rpi-dht-sensor');

//express stuff
app.use(express.static(__dirname + '/public'));

//view engine setup
app.set('view engine', 'ejs')

//dht config
const dht = new rpiDhtSensor.DHT11(4);
let temperature = 0;
let humidity = 0;

//Routing
//handling Homepage
app.get('/', function (req, res) {
  res.send('Hello World!');
});

http.listen(8888, function(){
  console.log('listening on :8888');
});


//handling heatsensor page
app.get('/heatsensor', function(req,res){
	res.render("index");
	io.on('connection', function(socket){
		console.log('connected');
		setInterval(function(){
				const readout = dht.read();
				temperature = readout.temperature.toFixed(2);
				humidity = readout.humidity.toFixed(2) ;
 
    				console.log('Temperature: ' + readout.temperature.toFixed(2) + 'C, ' +
        '			humidity: ' + readout.humidity.toFixed(2) + '%');
					io.emit('sendingdata', 
						{temperature: temperature, humidity: humidity})
		}, 1000);
		});
})

