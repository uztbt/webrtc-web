# Read time communication with WebRTC

## 7 - Set up a signaling service to exchange messages

### Bonus Points

> 1. What alternative messaging mechanisms might be possible? What problems might you encounter using ‘pure' WebSocket?

The pure WebSocket does not have a notion of rooms.
That makes matching peers more difficult because the server has to know which the pair in another means.

> 2. What issues might be involved with scaling this application? Can you develop a method for testing thousands or millions of simultaneous room requests?

I guess WebSocket based solutions in general suffer from the socket shortage.
I need to come back and test.

> 3. This app uses a JavaScript prompt to get a room name. Work out a way to get the room name from the URL. For example localhost:8080/foo would give the room name foo.

Done😎