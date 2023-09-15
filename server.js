const express = require("express");
const http = require("http");
const path = require("path");
const { Console } = require("console");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve the React build files
app.use(express.static(path.join(__dirname, "/build/")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/build/index.html"));
});

const port = process.env.PORT || 8800; // Use the port provided by the environment or default to 3000
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

/*const io = require("socket.io")(8123, {
  //8123 is the local port we are binding the demo server to
  pingInterval: 30005, //An interval how often a ping is sent
  pingTimeout: 5000, //The time a client has to respont to a ping before it is desired dead
  upgradeTimeout: 3000, //The time a client has to fullfill the upgrade
  allowUpgrades: true, //Allows upgrading Long-Polling to websockets. This is strongly recommended for connecting for WebGL builds or other browserbased stuff and true is the default.
  cookie: false, //We do not need a persistence cookie for the demo - If you are using a load balöance, you might need it.
  serveClient: true, //This is not required for communication with our asset but we enable it for a web based testing tool. You can leave it enabled for example to connect your webbased service to the same server (this hosts a js file).
  allowEIO3: false, //This is only for testing purpose. We do make sure, that we do not accidentially work with compat mode.
  cors: {
    origin: "*", //Allow connection from any referrer (most likely this is what you will want for game clients - for WebGL the domain of your sebsite MIGHT also work)
  },
});*/

// App Code starts here

console.log("Starting Socket.IO demo server");
const connectedUsersRoom1 = new Map();
const connectedUsersRoom2 = new Map();

let countArray1 = [];
let countArray2 = [];
io.on("connection", (socket) => {
  // Handle new connection
  console.log("New user connected:", socket.id);

  // Store the connected user with payload data
  const user = {
    payload: [false, false, false, false],
  };

  // Send the list of currently connected users to the client
  //const users = Array.from(connectedUsers.keys());
  //socket.emit("users", users);
  //console.log("Users:", users);

  // Log the current size of connectedUsers
  console.log(
    "Current size of connectedUsers Room1 :",
    connectedUsersRoom1.size
  );
  console.log(
    "Current size of connectedUsers Room2 :",
    connectedUsersRoom2.size
  );
  socket.on("disconnect", (data) => {
    // Remove the disconnected user
    user.payload[false, false, false, false];
    /*likely throws an error check*/
    connectedUsersRoom1.delete(socket.id);
    connectedUsersRoom2.delete(socket.id);

    console.log("User disconnected:", socket.id);

    // Notify other clients about the user disconnection
    io.emit("userDisconnected", socket.id);
  });

  socket.on("joinRoom", (roomName) => {
    socket.join(roomName);
    //console.log(`User joined room: ${roomName}`);
  });

  //recive a message called arrow and then brodcast pong to all clients
  //Check which button is pressed an then asignes it to user array
  //output: user.payload: [false, false, false, false]
  socket.on("arrow", (data) => {
    //console.log(data[0]);
    const option = data[0];
    const status = data[1];
    const roomName = data[2];

    if (roomName == "team1") {
      // Store the connected user
      connectedUsersRoom1.set(socket.id, user);
    } else if (roomName == "team2") {
      connectedUsersRoom2.set(socket.id, user);
    }

    switch (option) {
      case "a":
        user.payload[0] = status;
        break;
      case "b":
        user.payload[1] = status;
        break;
      case "c":
        user.payload[2] = status;
        break;
      case "d":
        user.payload[3] = status;
        break;
    }
    console.log(
      `Received payload from user ${socket.id}:`,
      JSON.stringify(data)
    );

    //console.log(brodcastVertHorz(roomName));

    socket.broadcast.emit("unityArrow", brodcastVertHorz(roomName));
  });

  //arrow down
  //arrow up
});

function brodcastVertHorz(roomName) {
  //console.log("List of all users' payload data:", connectedUsers.size);
  let room1 = "team1";
  let room2 = "team2";

  // Get the payload data of all users set to array
  //Out put users
  let allRoom1Payload = [];
  let allRoom2Payload = [];
  let currentRoomPayload = [];
  if (roomName == room1) {
    connectedUsersRoom1.forEach((user, userId) => {
      //console.log(`User ${userId}:`, user);
      allRoom1Payload.push(user.payload);
      currentRoomPayload = allRoom1Payload;
      // console.log("room 1 added");
    });
  } else if (roomName == room2) {
    connectedUsersRoom2.forEach((user, userId) => {
      //console.log(`User ${userId}:`, user);
      allRoom2Payload.push(user.payload);
      currentRoomPayload = allRoom2Payload;
      // console.log("room 2 added");
    });
  }

  console.log("team1", allRoom1Payload);
  console.log("team2", allRoom2Payload);

  //Current total number of arrows pressed
  //Crete an array with the number of arrows pressed per type (A,B,C,D)

  //Error may live here

  let currentArray = [];
  for (let i = 0; i < 4; i++) {
    if (roomName == room1) {
      if (i == 0) {
        countArray1 = [];
      }
      countArray1.push(countTrueItems(allRoom1Payload, i));
      currentArray = countArray1;
    } else if (roomName == room2) {
      if (i == 0) {
        countArray2 = [];
      }
      countArray2.push(countTrueItems(allRoom2Payload, i));
      currentArray = countArray2;
    }
  }
  console.log("countArray1", countArray1);

  //console.log(vertHorz(connectedUsers.size, countArray));
  return vertHorz(
    connectedUsersRoom1.size,
    connectedUsersRoom2.size,
    countArray1,
    countArray2,
    roomName
  );
}
// This function checks to see if the array is valid
// then counts the number of 'true' items in the specified index
function countTrueItems(array, index) {
  let count = 0;

  if (array && Array.isArray(array) && array.length > 0) {
    array.forEach((interiorArray) => {
      if (Array.isArray(interiorArray) && interiorArray.length > 0) {
        if (interiorArray[index] === true) {
          count++;
        }
      }
    });
  }

  return count;
}

// Calculate Vertical And Horizantal
// return Vertical And Horizontal average

function vertHorz(
  totalUsers1 = 1,
  totalUsers2 = 1,
  countTrueArr1,
  countTrueArr2,
  roomName
) {
  let horzVertArr = [];
  let userTotal = totalUsers1;

  let up = countTrueArr1[0];
  let down = countTrueArr1[1];
  let left = countTrueArr1[2];
  let right = countTrueArr1[3];

  let up2 = countTrueArr2[0];
  let down2 = countTrueArr2[1];
  let left2 = countTrueArr2[2];
  let right2 = countTrueArr2[3];


 console.log("Total Users 1: " + totalUsers1);
  console.log("Total Users 2: " + totalUsers2);
  //if (userTotal != 0) {
  //count all up arrwos
  horzVertArr.push(
    isNaN((up - down) / totalUsers1) ? 0 : (up - down) / totalUsers1
  );

  horzVertArr.push(
    isNaN((right - left) / totalUsers1) ? 0 : (right - left) / totalUsers1
  );
  //p2

  horzVertArr.push(
    isNaN((up2 - down2) / totalUsers2) ? 0 : (up2 - down2) / totalUsers2
  );

  horzVertArr.push(
    isNaN((right2 - left2) / totalUsers2) ? 0 : (right2 - left2) / totalUsers2
  );

  horzVertArr.push(roomName);
  // }
  console.log(horzVertArr);

  return horzVertArr;
}
