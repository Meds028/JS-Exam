const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require('body-parser');
const server = app.listen(8000);
const io = require('socket.io')(server);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "styles")));
app.use(express.static(path.join(__dirname, "script")));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res){
    res.render("index");
});

let connectedUsers = {};

io.on('connection', (socket) => {
    socket.on('got_a_new_user', (data) => {
        connectedUsers[socket.id] = { name: data.name, cursorPosition: { x: 0, y: 0 } };
        io.emit('new_user', { name: data.name, id: socket.id });
        io.emit('all_users', { users: connectedUsers });
    });

    socket.on('disconnect', () => {
        if(connectedUsers[socket.id]){
            delete connectedUsers[socket.id];
            io.emit('disconnect_user', { id: socket.id });
            io.emit('all_users', { users: connectedUsers });
        }
    });
    
    socket.on('mouse_move', (data) => {
        if(connectedUsers[socket.id]){
            connectedUsers[socket.id].cursorPosition = data.cursorPosition;
            socket.broadcast.emit('update_cursor', { id: socket.id, cursorPosition: data.cursorPosition });
        }
    });
    
    socket.on('clicked_area', (data) => {
        io.emit('draw_box', { posX: data.posX, posY: data.posY, color: data.color });
    });

    socket.on('clear_all_boxes', () => {
        io.emit('clear_all_boxes');
    });
});



