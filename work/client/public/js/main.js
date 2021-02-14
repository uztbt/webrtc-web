'use strict';
import * as io from "socket.io-client";
let isChannelReady = false;
let isInitiator;
let pc; // PeerConnection
//////////////////////////////
// Socket.IO signaling part //
//////////////////////////////
const path = window.location.pathname;
const pathElems = path.split('/');
const room = pathElems.length === 2 ? pathElems[1] : "";
const socket = io.connect();
if (room !== "") {
    socket.emit('create or join', room);
    console.log(`Attempted to create or join room ${room}`);
}
socket.on('created', function (room, clientId) {
    console.log(`Created room ${room}`);
    isInitiator = true;
});
socket.on('full', function (room) {
    console.log(`Room ${room} is full :^(`);
});
socket.on('join', function (room) {
    console.log(`Another peer made a request to join room ${room}`);
    console.log(`This peer is the initiator of room ${room}!`);
    isChannelReady = true;
});
socket.on('joined', function (room, clientId) {
    console.log(`joined ${room}`);
    isInitiator = false;
});
socket.on('log', function (array) {
    console.log.apply(console, array);
});
//////////////////////////////////////////////////
function sendMessage(message) {
    console.log(`Client sending message: ${message}`);
    socket.emit('message', message);
}
// This client receives a message
socket.on('message', message => {
    console.log(`Client received message: ${message}`);
    if (message === 'got user media') {
        maybeStart();
    }
    else if (message.type === 'offer') {
        if (!isInitiator && !isStarted) {
            maybeStart();
        }
        pc.setRemoteDescription(new RTCSessionDescription(message));
        doAnswer();
    }
    else if (message.type === 'answer' && isStarted) {
        pc.setRemoteDescription(new RTCSessionDescription(message));
    }
    else if (message.type === 'candidate' && isStarted) {
        //
    }
});
