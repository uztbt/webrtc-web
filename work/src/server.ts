import * as os from "os";
import * as httpModule from "http";
import * as express from "express";
import * as socketioModule from "socket.io";

const port = 3000;
const app = express();
const http = new httpModule.Server(app);
const io = new socketioModule.Server(http);

app.use(express.static("."));

http.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

const roomOf = (socket: socketioModule.Socket): string => {
  for (const room of socket.rooms) {
    if (room !== socket.id) {
      return room
    }
  }
}

io.sockets.on("connection", (socket: socketioModule.Socket) => {
  const log = (...args: any[]) => {
    const array = ["Message from server:"];
    array.push.apply(array, args);
    socket.emit('log', array);
  }

  // when a client sends a message to the server
  socket.on('message', (message: string) => {
    log('Client said: ', message);

    // Get ready to emit the message to all the rooms, which the socket belongs to
    // let readyToSend = socket;
    // for (const room of socket.rooms) {
    //   readyToSend = readyToSend.to(room)  
    // }
    const room = roomOf(socket);
    socket.in(room).emit('message', message);
  })

  // when a client enters a room id, and tries to create or join it
  socket.on('create or join', (room: string) => {
    log(`Received request to create or join room ${room}`);

    const clientsInRoom = io.sockets.adapter.rooms.get(room);
    const numClients = clientsInRoom ? clientsInRoom.size : 0;

    log(`Room ${room} now has ${numClients} client(s)`);

    switch (numClients) {
      case 0:
        socket.join(room);
        log(`Client ID ${socket.id} created room ${room}`);
        socket.emit('created', room, socket.id);
        break;
      case 1:
        socket.join(room);
        // Notify all the clients in the room that socket.id has joined
        log(`Client ID ${socket.id} joined room ${room}`);
        // 'join' event is currently not handled on the client side 
        io.to(room).emit('join', socket.id);
        // Notify only to the joiner
        socket.emit('joined', room, socket.id);
        // 'ready' event is currently not handled on the client side 
        io.to(room).emit('ready');
        break;
      default:
        socket.emit("full", room);
        break;
    }
  });

  socket.on('apaddr', () => {
    const ifaces = os.networkInterfaces();
    for(const dev in ifaces) {
      ifaces[dev].forEach(details => {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1'){
          socket.emit('ipaddr', details.address);
        }
      })
    }
  });
})