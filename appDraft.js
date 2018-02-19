// const setInterval = require("timers");

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");


const port = process.env.PORT || 4001;
const index = require("./routes/index");

const app = express();
app.use(index);

const server = http.createServer(app);

const io = socketIo(server); // < Interesting!

let getApiAndEmit = "TODO";

let interval;
let i=0;

io.on("connection", socket => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 1000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});



 getApiAndEmit = socket => {
    try {
    //   const res = await axios.get(
    //     "https://api.darksky.net/forecast/PUT_YOUR_API_KEY_HERE/43.7695,11.2558"
    //   ); // Getting the data from DarkSky
    // setInterval(()=> {
    //     let res = printSth();
    //     return res;
    // }, 1000);
    i++;
    res1 = printSth();
    res2 = printSthDifferent();
      socket.emit("FromAPI", {res1: res1, res2: res2}); // Emitting a new message. It will be consumed by the client
    } catch (error) {
      console.error(`Error: ${error.code}`);
    }
  };


  const printSth = () =>   {
  
      return "Hello Bro!" + i;
    
  };

const printSthDifferent= () =>   {
  
      return "Hello Dude!" + i;
    
  };
  

  server.listen(port, () => console.log(`Listening on port ${port}`));
