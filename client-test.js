
var player;
var keys = {};

function startGame() {
    type = "circle"
    
    color = getColor();
    player = new component(30, 30, color, 60, 60, type);
    myGameArea.start();
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {

        this.canvas.width = 1500;
        this.canvas.height = 800;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 20);

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
    clear : function(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

function component(width, height, color, x, y, type) {
    this.gamearea = myGameArea;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;    
    this.x = x;
    this.y = y;
    this.type = type  
    if(this.type == "circle")
    {
        this.update = function() {
            ctx = myGameArea.context;
            
            ctx.beginPath();            
            ctx.arc(this.x, this.y, this.width, 0, 2*Math.PI);
            ctx.fillStyle = color;
            ctx.fill()
            
        }
    }
    else if (this.type == "rectangle"){  
        this.update = function() {
            ctx = myGameArea.context;
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;        
    }
}

function updateGameArea() {
    myGameArea.clear();
    player.speedX = 0;
    player.speedY = 0;    
    if  ((37 in keys || 65 in keys) && !( (38 in keys || 87 in keys) || ( 40 in keys || 83 in keys))) {
        if (player.x - player.speedX > player.width) {
            if(16 in keys){
                player.speedX = -10;
            }
            else{
            player.speedX = -5; 
            }
        }
    }
    if ((39 in keys||  68 in keys) && !( (38 in keys || 87 in keys) || ( 40 in keys || 83 in keys))) {
        if (player.x + player.speedX < myGameArea.canvas.width- player.width) {
            if(16 in keys){
                player.speedX = 10;
            }
            else{
                player.speedX = 5; 
            }
        }
    }
    if  ((38 in keys || 87 in keys) && !( (65 in keys || 37 in keys) || ( 39 in keys || 68 in keys))) {
        if (player.y - player.speedY > player.height) {
            if(16 in keys){
                player.speedY = -10;
            }
            else{
                player.speedY = -5; 
            }
        }
    }
    if (( 40 in keys || 83 in keys)  && !( (65 in keys || 37 in keys) || ( 39 in keys || 68 in keys))) {
        if (player.y + player.speedY < myGameArea.canvas.height- player.height) {
            if(16 in keys){
                player.speedY = 10;
            }
            else{
                player.speedY = 5; 
            }
        }
    }

    if ((38 in keys || 87 in keys)  && (65 in keys || 37 in keys) ) {
        if (player.y - player.speedY > player.height) {
            if(16 in keys){
                player.speedY = -10/2;
            }
            else{
                player.speedY = -5/2; 
            }
        }
        if (player.x - player.speedX > player.width) {
            if(16 in keys){
                player.speedX = -10/2;
            }
            else{
            player.speedX = -5/2; 
            }
        }
    }

    if ((38 in keys || 87 in keys)  && ( 39 in keys || 68 in keys) ) {
        if (player.y - player.speedY > player.height) {
            if(16 in keys){
                player.speedY = -10/2;
            }
            else{
                player.speedY = -5/2; 
            }
        }
        if (player.x + player.speedX < myGameArea.canvas.width- player.width) {
            if(16 in keys){
                player.speedX = 10/2;
            }
            else{
                player.speedX = 5/2; 
            }
        }
    }

    if (( 40 in keys || 83 in keys)  && (65 in keys || 37 in keys) ) {
        if (player.y + player.speedY < myGameArea.canvas.height- player.height) {
            if(16 in keys){
                player.speedY = 10/2;
            }
            else{
                player.speedY = 5/2; 
            }
        }
        if (player.x - player.speedX > player.width) {
            if(16 in keys){
                player.speedX = -10/2;
            }
            else{
            player.speedX = -5/2; 
            }
        }
    }
    if (( 40 in keys || 83 in keys)  && ( 39 in keys || 68 in keys) ) {
        if (player.y + player.speedY < myGameArea.canvas.height- player.height) {
            if(16 in keys){
                player.speedY = 10/2;
            }
            else{
                player.speedY = 5/2; 
            }
        }
        if (player.x + player.speedX < myGameArea.canvas.width- player.width) {
            if(16 in keys){
                player.speedX = 10/2;
            }
            else{
                player.speedX = 5/2; 
            }
        }
    }



    player.newPos();    
    player.update();
}

function getColor()
{
    var color = "black"
    
    var people = window.location.search.split("=")[1];
        switch(people)
        {
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

