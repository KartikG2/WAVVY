import { Server } from "socket.io";

let connections = {}
let messages = {}
let timeOnline = {}

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });


    io.on("connection", (socket) => {

        console.log("SOMEONE CONNECTED")

        socket.on("join-call", (path) => {    //When the frontend tells the backend:  “I want to join room 12345” That 12345 is the path.

            if (connections[path] === undefined) {  //“If this room is new, create it.”
                connections[path] = []
            }
            connections[path].push(socket.id) //Then add this user’s socket ID to the room.

            timeOnline[socket.id] = new Date();       //Save what time this user joined.



            // -------------------------------    tell everyone else in the room: that “ A new user has joined. Here’s their socket ID.


            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])

                // io.to(<id or room>)   means -> I want to send a message to a particular socket ID or room name.
                // .emit(<event>, <data>) means -> Send this event and data to that socket or room.    

            }

            // If there are older messages, send them to the new user.
            if (messages[path] !== undefined) {
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit("chat-message", messages[path][a]['data'],
                        messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
                }
            }

        })



        // ====================== WebRTC Signaling ================================
        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })


        // ========================== Chat messages =====================================
        socket.on("chat-message", (data, sender) => {

            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {


                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }

                    return [room, isFound];

                }, ['', false]);

            if (found === true) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = []
                }

                messages[matchingRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id })
                console.log("message", matchingRoom, ":", sender, data)

                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id)
                })
            }

        })
 


        // ====================  User Disconnects ===========================================
        socket.on("disconnect", () => {

            var diffTime = Math.abs(timeOnline[socket.id] - new Date());

            var key;

            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {    //k = room name && v = list of users in that room.

                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) {
                        key = k

                        for (let a = 0; a < connections[key].length; ++a) {
                            io.to(connections[key][a]).emit('user-left', socket.id)
                        }

                        var index = connections[key].indexOf(socket.id)

                        connections[key].splice(index, 1)


                        if (connections[key].length === 0) {
                            delete connections[key]
                        }
                    }
                }

            }


        })


    })


    return io;
}
