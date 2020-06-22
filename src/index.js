const path = require('path')
const http = require('http')
const express  = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')

//important
const app = express()
const server = http.createServer(app)
const io = socketio(server)//our server supports web sockets

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New Websocket connection');
   
    // setting a listener for join 
    socket.on('join', ({ username, room }) => {
        socket.join(room)

        socket.emit('message', generateMessage('Welcome!'))
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`))

        //socket.emit sends event to a specific client
        //io.to.emit emits event to everybody in a specific room
        //io.emit sends event to a every connected  client
        //socket.broadcast.emit sends event to every connected client except the sender
        //io.to.emit.broadcast.to.emit sends event to every connected client except the sender but its limiting it to a specific chat room
    })


    // this emits event to every single client 
        //here we are setting alistener for sendmessage
        socket.on('sendMessage', (message, callback) => { //socket is on trying to listen  to emited files in the chat.js
            const filter = new Filter()
            if(filter.isProfane(message)){
                return callback('Profanity is not allowed')
            }
            io.to('Center city').emit('message', generateMessage(message)) //this sends message to all connected users
            callback()
        })

    // here we are setting a listener for sendlocation 
    socket.on('sendLocation', (coords, callback) =>{
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
    socket.on('disconnect', () =>{
        io.emit('message', generateMessage('A user has left'))//this emits the message when someone leaves the chat
    })
})
server.listen(port, () => {
    console.log(`Server is up on port ${port}!`);
})