﻿
var player;
var keys = {};
var opponent;
var oCount = 0;
var walk = 0;


var connection = new signalR.HubConnectionBuilder()
    .withUrl('/chat')
    .build();
bindConnectionMessage();

connection.start()
    .then(() => startGame())
    .catch(error => console.error(error.message));



//RECEIVING FROM HUB
function bindConnectionMessage()
{
    var messageCallback = function (type, inMessage)
    {
        if (!type) return;
        if (type === "newPlayer")
        {
            if (inMessage.name == player.name) { return; }
            color = getColor(inMessage.name);
            opponent[oCount] = new component(30, 30, color, 100, 60, "circle", inMessage.name);
            //opponent[oCount].newPos();
            opponent[oCount].update();
            //opponent[oCount].update();
            //alert(opponent[oCount].x);
            //alert(opponent[oCount].gamearea.id);
            oCount++;
        }
        if (type === "updatePlayer")
        {
            var j;
            for (j = 0; j < opponent.length; j++)
            {
                if(opponent[j].name == inMessage.name)
                {
                    
                    opponent[j].newX = inMessage.x;
                    opponent[j].newY = inMessage.y;
                    opponent[j].speed = inMessage.speed;
                        //alert(opponent[j].name);
                    
                }
            }
        }
        
    }


    connection.on('broadcastMessage', messageCallback);
    connection.on('echo', messageCallback);
    connection.onclose(onConnectionError);
}

function onConnectionError(error) {
    if (error && error.message) {
        console.error(error.message);
    }
}


function startGame() {
    opponent = [];
    console.log('Connection and game started');
    
    type = "sprite";

    var name = window.prompt("Enter your name: ");
    color = getColor(name);
    

    myGameArea.start(name);

    player = new component(30, 30, color, 60, 60, type, name);
    //alert("player created");
    //Sending to hub
    var newPlayerSend = new newMessage(player.x, player.y, player.name);
    connection.send('broadcastMessage', "newPlayer", newPlayerSend);

    
}

function newMessage(x, y, name, speed)
{
    this.x = x; 
    this.y = y;
    this.name = name;
    this.speed = speed;
}

var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function (name) {
        this.id = name;
        this.canvas.width = 1500;
        this.canvas.height = 800;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 40);
        //alert("Game area id", this.id);
        window.addEventListener('keydown', function (e) {
            //Right now just latest keydown is active

            /*if( e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40 || e.keyCode == 87 || e.keyCode == 65 || e.keyCode == 83 || e.keyCode == 68 ){
                if(37 in keys){
                    delete keys[37];
                }
                else if(38 in keys){
                    delete keys[38];
                }
                else if(39 in keys){
                    delete keys[39];
                }
                else if(40 in keys){
                    delete keys[40];
                }
                else if(87 in keys){
                    delete keys[87];
                }
                else if(65 in keys){
                    delete keys[65];
                }
                else if(83 in keys){
                    delete keys[83];
                }
                else if(68 in keys){
                    delete keys[68];
                }
            }
            */

            keys[e.keyCode] = true;
            e.preventDefault();
        })
        window.addEventListener('keyup', function (e) {
            delete keys[e.keyCode];

        })
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function component(width, height, color, x, y, type , name) {
    this.gamearea = myGameArea;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.speed = 0;
    this.name = name;
    this.x = x;
    this.y = y;
    this.newX = x;
    this.newY = y;
    this.type = type
    this.direction = "";
    this.bool = false;


    if (this.type == "circle") {
        this.update = function () {
            ctx = myGameArea.context;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill()

        }
    }
    else if (this.type == "sprite")
    {
        
        this.update = function () {
            ctx = myGameArea.context;
            var img = new Image();
            switch (this.direction) {
                case "U":
                    if (this.speed == 10) {
                        if (this.bool) {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\Up-warlock-runl.png";
                        }
                        else {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\Up-warlock-runr.png";
                        }
                    }
                    else {
                        if (this.bool) {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\Up-warlock-walkl.png";
                        }
                        else {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\Up-warlock-walkr.png";
                        }
                    }
                    break;
                case "RU":
                    if (this.speed == 10) {
                        if (this.bool) {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\RU-warlock-runl.png";
                        }
                        else {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\RU-warlock-runr.png";
                        }
                    }
                    else {
                        if (this.bool) {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\RU-warlock-walkl.png";
                        }
                        else {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\RU-warlock-walkr.png";
                        }
                    }
                    break;
                case "LU":
                    if (this.speed == 10) {
                        if (this.bool) {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\LU-warlock-runl.png";
                        }
                        else {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\LU-warlock-runr.png";
                        }
                    }
                    else {
                        if (this.bool) {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\LU-warlock-walkl.png";
                        }
                        else {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\LU-warlock-walkr.png";
                        }
                    }
                    break;
                case "D":
                    if (this.speed == 10) {
                        if (this.bool) {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\Down-warlock-runl.png";
                        }
                        else {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\Down-warlock-runr.png";
                        }
                    }
                    else {
                        if (this.bool) {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\Down-warlock-walkl.png";
                        }
                        else {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\Down-warlock-walkr.png";
                        }
                    }
                    break;
                case "RD":
                    if (this.speed == 10) {
                        if (this.bool) {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\RD-warlock-runl.png";
                        }
                        else {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\RD-warlock-runr.png";
                        }
                    }
                    else {
                        if (this.bool) {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\RD-warlock-walkl.png";
                        }
                        else {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\RD-warlock-walkr.png";
                        }
                    }
                    break;
                case "LD":
                    if (this.speed == 10) {
                        if (this.bool) {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\LD-warlock-runl.png";
                        }
                        else {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\LD-warlock-runr.png";
                        }
                    }
                    else {
                        if (this.bool) {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\LD-warlock-walkl.png";
                        }
                        else {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\LD-warlock-walkr.png";
                        }
                    }
                    break;
                case "L":
                    if (this.speed == 10) {
                        if (this.bool) {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\Left-warlock-runl.png";
                        }
                        else {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\Left-warlock-runr.png";
                        }
                    }
                    else {
                        if (this.bool) {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\Left-warlock-walkl.png";
                        }
                        else {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\Left-warlock-walkr.png";
                        }
                    }
                    break;
                case "R":
                    if (this.speed == 10) {
                        if (this.bool) {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\Right-warlock-runl.png";
                        }
                        else {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\Right-warlock-runr.png";
                        }
                    }
                    else {
                        if (this.bool) {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\Right-warlock-walkl.png";
                        }
                        else {
                            img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\Right-warlock-walkr.png";
                        }
                    }
                    break;
                default:
                    if (this.bool) {
                        img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\Down-warlock-walkl.png";
                    }
                    else {
                        img.src = "C:\Users\kriss\Desktop\GAPT\GAPTProject\media\Down-warlock-walkr.png";
                    }
                    break;

            }

            ctx.drawImage(img, this.x, this.y, this.width, this.height);


        }

    }
    else if (this.type == "rectangle") {
        this.update = function () {
            ctx = myGameArea.context;
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    this.newPos = function () {
        this.x += this.speedX;
        this.y += this.speedY;

        var newPlayerUpdate = new newMessage(this.x, this.y, this.name, this.speed);
        connection.send('broadcastMessage', "updatePlayer", newPlayerUpdate);

    }

    this.interpolate = function ()
    {
        var d = Math.hypot(this.newX - this.x, this.newY, this.y);

        //find equation of line  y=mx+b

        var m = (this.newY - this.y) / (this.newX - this.x);

        var b = this.y - (m * this.x);



        if (d > this.speed * 4 && this.speed != 0) {
            var i;
            for (i = 0; i < d / this.speed; i++) {
                if (this.newX < this.x) {
                    this.x = this.x - this.speed;
                    this.y = (m * this.x) + b;
                    this.update();
                }
                else if (this.newX > this.x) {
                    this.x = this.x + this.speed;
                    this.y = (m * this.x) + b;
                    this.update();
                }
                else {
                    if (this.newY < this.y) {
                        this.y = this.y - this.speed;
                        this.update();
                    }
                    else if (this.newY > this.y) {
                        this.y = this.y + this.speed;
                        this.update();
                    }

                }
            }

        }
        
            this.x = this.newX;
            this.y = this.newY;

            this.update();
        
    }
}

function updateGameArea() {
    myGameArea.clear();
    player.speedX = 0;
    player.speedY = 0;
    player.direction = "";

    if ((37 in keys || 65 in keys) && !((38 in keys || 87 in keys) || (40 in keys || 83 in keys))) {
        if (player.x - player.speedX > player.width) {
            if (16 in keys) {
                player.speedX = -10;
            }
            else {
                player.speedX = -5;
            }
        }
        player.direction = "L";
    }
    if ((39 in keys || 68 in keys) && !((38 in keys || 87 in keys) || (40 in keys || 83 in keys))) {
        if (player.x + player.speedX < myGameArea.canvas.width - player.width) {
            if (16 in keys) {
                player.speedX = 10;
            }
            else {
                player.speedX = 5;
            }
        }
        player.direction = "R";
    }
    if ((38 in keys || 87 in keys) && !((65 in keys || 37 in keys) || (39 in keys || 68 in keys))) {
        if (player.y - player.speedY > player.height) {
            if (16 in keys) {
                player.speedY = -10;
            }
            else {
                player.speedY = -5;
            }
        }
        player.direction = "U";
    }
    if ((40 in keys || 83 in keys) && !((65 in keys || 37 in keys) || (39 in keys || 68 in keys))) {
        if (player.y + player.speedY < myGameArea.canvas.height - player.height) {
            if (16 in keys) {
                player.speedY = 10;
            }
            else {
                player.speedY = 5;
            }
        }
        player.direction = "D";
    }

    if ((38 in keys || 87 in keys) && (65 in keys || 37 in keys)) {
        if (player.y - player.speedY > player.height) {
            if (16 in keys) {
                player.speedY = -10 / 2;
            }
            else {
                player.speedY = -5 / 2;
            }
        }
        if (player.x - player.speedX > player.width) {
            if (16 in keys) {
                player.speedX = -10 / 2;
            }
            else {
                player.speedX = -5 / 2;
            }
        }
        player.direction = "LU";
    }

    if ((38 in keys || 87 in keys) && (39 in keys || 68 in keys)) {
        if (player.y - player.speedY > player.height) {
            if (16 in keys) {
                player.speedY = -10 / 2;
            }
            else {
                player.speedY = -5 / 2;
            }
        }
        if (player.x + player.speedX < myGameArea.canvas.width - player.width) {
            if (16 in keys) {
                player.speedX = 10 / 2;
            }
            else {
                player.speedX = 5 / 2;
            }
        }
        player.direction = "RU";
    }

    if ((40 in keys || 83 in keys) && (65 in keys || 37 in keys)) {
        if (player.y + player.speedY < myGameArea.canvas.height - player.height) {
            if (16 in keys) {
                player.speedY = 10 / 2;
            }
            else {
                player.speedY = 5 / 2;
            }
        }
        if (player.x - player.speedX > player.width) {
            if (16 in keys) {
                player.speedX = -10 / 2;
            }
            else {
                player.speedX = -5 / 2;
            }
        }
        player.direction = "LD";
    }
    if ((40 in keys || 83 in keys) && (39 in keys || 68 in keys)) {
        if (player.y + player.speedY < myGameArea.canvas.height - player.height) {
            if (16 in keys) {
                player.speedY = 10 / 2;
            }
            else {
                player.speedY = 5 / 2;
            }
        }
        if (player.x + player.speedX < myGameArea.canvas.width - player.width) {
            if (16 in keys) {
                player.speedX = 10 / 2;
            }
            else {
                player.speedX = 5 / 2;
            }
        }
        player.direction = "RD";
    }
    if (16 in keys) {
        player.speed = 10;
    }
    else
    {
        player.speed = 5;
    }


    if (player.speedX != 0 || player.speedY != 0)
    {
        if (walk >= 4) {
            player.bool = !player.bool;
            walk = 0;
        }
        else
        {
            walk++;
        }

    }

    player.newPos();
    player.update();

    var j;
    for (j = 0; j < opponent.length; j++)
    {
        opponent[j].interpolate();
    }

}

function getColor(name) {
    var color = "black"

    switch (name) {
        case "Cristina":
            color = "#C27BA0";
            break;
        case "Liam":
            color = "#FBBC04";
            break;
        case "Luke":
            color = "#4A86E8";
            break;
        case "Kristina":
            color = "#46BDC6";
            break;
        default:
            color = "black"
            break;
    }


    return color;
}
