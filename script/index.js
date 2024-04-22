document.addEventListener('DOMContentLoaded', function (){
    const socket = io();
    
    const name = prompt("Enter your name:");
    let selectedColor = '#B45F06'; //default color
    /* emit new user to server */
    socket.emit('got_a_new_user', { name: name });
    /* input player name to player list */
    socket.on('new_user', function (data){
        const playerList = document.getElementById('players');
        const listItem = document.createElement('li');
        listItem.className = 'user';
        listItem.id = data.id;
        listItem.innerText = data.name;
        playerList.appendChild(listItem);
    });
    /* remove player name to player list */
    socket.on('disconnect_user', function (data){
        const userToRemove = document.getElementById(data.id);
        if(userToRemove){
            userToRemove.remove();
        }
    });
    /* input all player name to player list */
    socket.on('all_users', function (data){
        const playerList = document.getElementById('players');
        playerList.innerHTML = '';
        for (let id in data.users) {
            if(data.users.hasOwnProperty(id)){
                const user = data.users[id];
                const listItem = document.createElement('li');
                listItem.className = 'user';
                listItem.id = id;
                if(id === socket.id){
                    listItem.innerText = user.name + " (You)";
                }else{
                    listItem.innerText = user.name;
                }
                playerList.appendChild(listItem);
            }
        }
    });
    
    /* mouse movement */
    document.addEventListener('mousemove', function (event){
        const cursorPosition = {
            x: event.clientX,
            y: event.clientY
        };
        socket.emit('mouse_move', { cursorPosition: cursorPosition });
    });

    /* update mouse position for other player */
    socket.on('update_cursor', function (data){
        const cursor = document.getElementById(data.id + '_cursor');
        if(!cursor){
            const cursor = document.createElement('div');
            cursor.className = 'cursor';
            cursor.id = data.id + '_cursor';
            cursor.style.position = 'absolute';
            cursor.style.width = '10px';
            cursor.style.height = '10px';
            cursor.style.background = 'red';
            cursor.style.borderRadius = '50%';
            document.body.appendChild(cursor);
        }
        cursor.style.left = data.cursorPosition.x + 'px';
        cursor.style.top = data.cursorPosition.y + 'px';
    });

    /* color selection */
    document.getElementById('brick').addEventListener('click', function (){
        selectedColor = '#B45F06';
    });

    document.getElementById('grass').addEventListener('click', function (){
        selectedColor = 'green';
    });

    document.getElementById('gravel').addEventListener('click', function (){
        selectedColor = '#808080';
    });
    /* clear boxes */
    document.getElementById('reset').addEventListener('click', function (){
        document.getElementById('play_area').innerHTML = ''; 
        socket.emit('clear_all_boxes'); 
    });

    /* play_area clicks */
    document.getElementById('play_area').addEventListener('click', function (event){
        const posX = event.offsetX;
        const posY = event.offsetY;
        if(selectedColor !== ''){
            const box = document.createElement('div');
            box.style.position = 'absolute';
            box.style.left = posX + 'px';
            box.style.top = posY + 'px';
            box.style.width = '50px';
            box.style.height = '50px';
            box.style.backgroundColor = selectedColor;
            document.getElementById('play_area').appendChild(box);
            socket.emit('clicked_area', { posX: posX, posY: posY, color: selectedColor });
        }
    });
    /* update all boxes to all player */
    socket.on('draw_box', function (data){
        const box = document.createElement('div');
        box.style.position = 'absolute';
        box.style.left = data.posX + 'px';
        box.style.top = data.posY + 'px';
        box.style.width = '50px';
        box.style.height = '50px';
        box.style.backgroundColor = data.color;
        document.getElementById('play_area').appendChild(box);
    });

    /* clear all boxes */
    socket.on('clear_all_boxes', function (){
        document.getElementById('play_area').innerHTML = '';
    });
});


