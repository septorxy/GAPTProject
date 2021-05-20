//import Phaser from 'phaser';
//import { Anims } from './anims';

var playername;
var runspeed = 1.5;
var myScene;
var cacheCount = 0;
var cacheInterval = 30;
var begining = true;
var temporary;
var updated = true;
var curX, curY;
var scale = 0.078;

var opponent = new Object();
var oppAnim = new Object();
//hello

var connection = new signalR.HubConnectionBuilder()
    .withUrl('/war')
    .build();
bindConnectionMessage();

connection.start()
    .then(() => startGame())
    .catch(error => console.error(error.message));

/*connection.onclose(error => {
    console.assert(connection.state === signalR.HubConnectionState.Disconnected);

    //var disconnectedPlayer = new newMessage(player.x, player.y, player.name);
    //connection.send('broadcastMessage', "disconnection", disconnectedPlayer);
newMessa
});*/

function onConnectionError(error) {
    if (error && error.message) {
        console.error(error.message);
    }
}

var name = window.prompt("Enter your name: ");

function sendMessage(xIn, yIn, keyIn, angle) {
    var sendmessage = '{' +
        '"x": "' + xIn + '" ,' +
        '"y": "' + yIn + '" ,' +
        '"key": "' + keyIn + '",' +
        '"angle": "' + angle + '"' +
        '}';
    return sendmessage;
}




//RECEIVE FROM HUB
function bindConnectionMessage() {
    var messageCallback = function (type, inJSON) {
        var inMessage = JSON.parse(inJSON);
        if (!type) { return; }
        if (type === "newPlayer") {
            console.log("Before added new player: " + opponent[inMessage.key]/*.toString()*/);

            console.log("key: " + inMessage.key);
            console.log("player name: " + playername);
            if (inMessage.key == playername) {
                return;
            }
            //opponent[oCount] = this.add.sprite(400, 300, inMessage.name, 'Down-warlock-walkl').setScale(0.1);
            //opponent[oCount].newPos();
            //opponent[oCount].update();
            //opponent[oCount].update();
            //alert(opponent[oCount].x);
            //alert(opponent[oCount].gamearea.id);
            var thisScene = [];
            //thisScene.add(game.scene.scenes);
            thisScene = thisScene.concat(game.scene.scenes);
            opponent[inMessage.key] = thisScene[0].add.sprite(inMessage.x, inMessage.y, 'Down-warlock-walkl').setScale(scale);
            opponent[inMessage.key].name = inMessage.key;
            opponent[inMessage.key].angle = inMessage.angle;
            //opponent[oCount].anims.isPlaying = true;

            console.log("After added new player: " + opponent[inMessage.key].toString());
        }
        if (type === "updatePlayer") {
            opponent[inMessage.key].x = inMessage.x;
            opponent[inMessage.key].y = inMessage.y;
            opponent[inMessage.key].angle = inMessage.angle;

            //opponent[j].anims.isPlaying = true;
            //opponent[j].speed = inMessage.speed;
            //opponent[j].bool = inMessage.bool;
            //opponent[j].direction = inMessage.direction;

            //alert(opponent[j].name);

                }
        if (type === "disconnection") {
            console.log("Before removing player: " + opponent[inMessage.key].toString());

            opponent[inMessage.key].destroy();

            delete opponent[inMessage.key];

            //console.log("After removing player: " + opponent.toString());
        }
    }



    var playerCallback = function (inOpp) {
        console.log("entered playercallback");
        if (begining) {
            var temp;
            var i;
            console.log(inOpp.length);
            for (i = 0; i < inOpp.length; i++) {
                temp = JSON.parse(inOpp[i]);
                
                if (playername != temp.key && uniquename(temp.key)) {
                    var thisScene = [];
                    //thisScene.add(game.scene.scenes);
                    thisScene = thisScene.concat(game.scene.scenes);
                    
                    opponent[temp.key] = thisScene[0].add.sprite(inMessage.x, inMessage.y, 'Down-warlock-walkl').setScale(scale);
                    opponent[temp.key].name = temp.key;
                    opponent[temp.key].angle = temp.angle;
                    opponent[temp.key].setDepth(10);
                    
                    console.log(opponent[temp.key].name, opponent[temp.key].x, opponent[temp.key].y, opponent[temp.key].angle );
                }
            }
            begining = false;
        }

    }

    connection.on('broadcastMessage', messageCallback, 0);
    connection.on('getPlayers', playerCallback, 0);
    //connection.on('echo', messageCallback);
    connection.onclose(onConnectionError);
}

function uniquename(name) {
    if (opponent.hasOwnProperty(name)) {
        return false;
    }

    return true;
}

function startGame() {
    game = new Phaser.Game(config);

    //populate opponent array
    connection.send('getPlayers', temporary);


}





var config = {
    type: Phaser.AUTO,
    width: window.innerWidth - 10,
    height: window.innerHeight - 10,
    pixelArt: true,
    physics: {
        default: 'arcade',
  
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game;


var cursors;

function preload() {
    //this.load.atlas('player', 'warlock.png' , 'warlock.json');
    //this.load.path = 'sprites/';
    //this.load.multiatlas('player', 'spritesheet.json');
    this.load.image('Down-warlock-walkl', 'https://spritestorage.blob.core.windows.net/warlock/Down-warlock-walkl.png');
    this.load.atlas('warlock', 'https://spritestorage.blob.core.windows.net/warlock/warlock.png', 'https://spritestorage.blob.core.windows.net/warlock/warlock.json');
    //this.load.tilemapTiledJSON('map', 'https://spritestorage.blob.core.windows.net/map/MyMap.json');
    this.load.tilemapTiledJSON('map', 'https://spritestorage.blob.core.windows.net/map/Updated.json');
    this.load.image('tiles', 'https://spritestorage.blob.core.windows.net/map/TileSet.png');
}

var map;
var interactivelayer;

function create() {

    
    myScene = this;
    this.opponents = opponent;

    for (opp in this.opponents)
    {
        opp.setTexture('Down-warlock-walkl');
    }
    for (opp in opponents) {
        opp.setTexture('Down-warlock-walkl');
    }

    console.log(this.opponents);


  
    

    this.anims.create({
        key: 'dwalk',
        frames:
            this.anims.generateFrameNames('warlock', { prefix: 'Warlock-', start: 3, end: 4, zeroPad: 2 }),
        frameRate: 03,
        yoyo: true,
        repeat: -1
    });
    this.anims.create({
        key: 'drun',
        frames:
            this.anims.generateFrameNames('warlock', { prefix: 'Warlock-', start: 1, end: 2, zeroPad: 2 }),
        frameRate: 05,
        yoyo: true,
        repeat: -1
    });


    /*The following code doesn't work and broke the program so fix if using again
     * var i;
    for (i = 0; i < this.opponents.length; i++)
    {
        this.opponents[i].texture = 'Down-warlock-walkl';
        this.opponents[i].frame = 'Down-warlock-walkl';
    }*/

    this.player = this.physics.add.sprite(4869, 4869, 'Down-warlock-walkl').setScale(scale);
    this.player.name = name;
    playername = name;
    this.player.anims.load('dwalk');
    this.player.anims.load('drun');

    //this.player.frame = 'Left-warlock-walkr.png';

    cursors = this.input.keyboard.createCursorKeys();

    camera = this.cameras.main;
    camera.startFollow(this.player);


    var map = this.make.tilemap({ key: 'map' });
        var tileset = map.addTilesetImage('MyTilesSet', 'tiles');
        var groundlayer = map.createLayer('ground', tileset, 0, 0);
        interactivelayer = map.createLayer('Interactive', tileset, 0, 0);
        var skylayer = map.createLayer('Sky', tileset, 0, 0);
    
        interactivelayer.setCollisionByProperty({ Collide: true });
    
    this.physics.add.collider(this.player, interactivelayer);
    
        this.player.setDepth(10);
        skylayer.setDepth(20);
    

    // set bounds so the camera won't go outside the game world
    //this.cameras.main.setBounds(0, 0, game.width, game.height);
    // make the camera follow the player
    //this.cameras.main.startFollow(this.player);

    //this.cameras.main.setBackgroundColor('#2889d4');
    var outMessage = sendMessage(this.player.x, this.player.y, this.player.name, this.player.angle);
    if (outMessage) {

        connection.send('broadcastMessage', "newPlayer", outMessage, cacheCount);
    }
    updated = true;


}
function update() {

    if (updated) {
        curX = this.player.x;
        curY = this.player.y;
    }
    this.opponents = opponent;
    var i;

    this.player.setVelocity(0);

    if (cursors.shift.isDown) {
        this.player.anims.play('drun', 10, true);
        runspeed = 150;
    }
    else {
        this.player.anims.play('dwalk', 10, true);
        runspeed = 80;
    }
    if (cursors.up.isDown && cursors.left.isDown) {

        this.player.setAngle(135);
        this.player.setVelocityX(-Math.sqrt(8) * runspeed);
        this.player.setVelocityY(-Math.sqrt(8) * runspeed);

    }
    else if (cursors.up.isDown && cursors.right.isDown) {
        this.player.setAngle(-135);
        this.player.setVelocityX(Math.sqrt(8) * runspeed);
        this.player.setVelocityY(-Math.sqrt(8) * runspeed);
    }
    else if (cursors.down.isDown && cursors.left.isDown) {

        this.player.setAngle(45);
        this.player.setVelocityX(-Math.sqrt(8) * runspeed);
        this.player.setVelocityY(Math.sqrt(8) * runspeed);
    }
    else if (cursors.down.isDown && cursors.right.isDown) {
        this.player.setAngle(-45);
        this.player.setVelocityX(Math.sqrt(8) * runspeed);
        this.player.setVelocityY(Math.sqrt(8) * runspeed);
    }
    else if (cursors.left.isDown) {
        this.player.setAngle(90);
        this.player.setVelocityX(- 4 * runspeed);
    }
    else if (cursors.right.isDown) {
        this.player.setAngle(-90);
        this.player.setVelocityX(4 * runspeed);
    }
    else if (cursors.down.isDown) {
        this.player.setAngle(0);
        this.player.setVelocityY(4 * runspeed);
    }
    else if (cursors.up.isDown) {
        this.player.setAngle(180);
        this.player.setVelocityY(-4 * runspeed);
    }
    else {
        this.player.anims.stop();
    }


    for (var name in opponent) {
        //TODO
    }

    if (curX > this.player.x + 20 || curX < this.player.x + -20 || curY > this.player.y +20 || curY < this.player.y -20) {
        connection.send('broadcastMessage', "updatePlayer", sendMessage(this.player.x, this.player.y, this.player.name, this.player.angle), cacheCount);
        if (cacheCount < cacheInterval) { cacheCount++; } else { cacheCount = 0; }
        updated = true;
    }
    else {
        updated = false;
    }

}



