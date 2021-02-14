'use strict';
import { io } from "socket.io-client";

let isChannelReady = false;
let isInitiator = false;
let isStarted = false; // before creating a peer connection
let localStream: MediaStream;
let pc: RTCPeerConnection;
let remoteStream: MediaStream;
let turnReady;
const localVideo: HTMLVideoElement = document.querySelector('#localVideo');
const remoteVideo: HTMLVideoElement = document.querySelector('#remoteVideo');


///////////////////////////////
// Socket.IO Joinning a room //
///////////////////////////////

const path = window.location.pathname;
const pathElems = path.split('/');
const room = pathElems.length === 2 ? pathElems[1] : "";

const socket = io();

if (room !== ""){
  socket.emit('create or join', room);
  console.log(`Attempted to create or join room ${room}`);
}

socket.on('created', function(room: string, clientId: string){
  console.log(`Created room ${room}`);
  isInitiator = true;
})

socket.on('full', function(room: string) {
  console.log(`Room ${room} is full :^(`);
})

socket.on('join', function(room: string) {
  console.log(`Another peer made a request to join room ${room}`);
  console.log(`Channel is ready so let's start!`);
  isChannelReady = true;
})

socket.on('joined', function(room: string, clientId: string){
  console.log(`joined ${room}`);
  isInitiator = false;
})

socket.on('log', function(array: any[]){
  console.log.apply(console, array);
})

/////////////////////////////////////////////
// By here, the variables below are fixed. //
// isInitiator: boolean                    //
// isChannelReady: boolean = true          //
/////////////////////////////////////////////

//////////////////////////////////////
// Reactive code.                   //
// Active code is below this block. //
//////////////////////////////////////

function sendMessage(message) {
  console.log(`Client sending message: ${message}`);
  socket.emit('message', message);
}

// This client receives a message
socket.on('message', message => {
  console.log(`Client received message: ${message}`);
  if (message === 'got user media') {
    maybeStart();
  } else if (message.type === 'offer') {
    if (!isInitiator && !isStarted) {
      maybeStart();
    }
    pc.setRemoteDescription(new RTCSessionDescription(message));
    doAnswer();
  } else if (message.type === 'answer' && isStarted) {
    pc.setRemoteDescription(new RTCSessionDescription(message));
  } else if (message.type === 'candidate' && isStarted) {
    //
  }
});

function maybeStart() {
  console.log(`>>>>>>> maybeStart(): isStarted=${isStarted} localStream=${localStream} isChannelReady=${isChannelReady}`);
  if(!isStarted && typeof localStream !== 'undefined' && isChannelReady) {
    console.log(`>>>>>>> creating peer connection`);
    createPeerConnection();
  }
}

function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(null);
    pc.onicecandidate = handle
  }
}

/////////////////
// Active code //
/////////////////

navigator.mediaDevices.getUserMedia({
  audio: false,
  video: true
})
.then(gotStream)
.catch(e => {
  alert(`getUserMedia() error: ${e.name}`)
})

function gotStream(stream: MediaStream) {
  console.log(`Adding local stream.`);
  localStream = stream;
  localVideo.srcObject = stream;
  sendMessage("got user media");
  if (isInitiator) {
    // The following call works only if the peer
    // joined the room right after you.
    maybeStart();
  }
}