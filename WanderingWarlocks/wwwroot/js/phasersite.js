
//import Phaser from 'phaser';
//import { Anims } from './anims';

//Variables
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
var hasShot = false;
var maxHealth = 100;
var damage = 5;

//shooting 
var healthBar;
var backgroundBar;


//Dictionaries
var opponent = new Object();
var oppAnim = new Object();

//shooting
var oppHealthBar = new Object();
var oppHealthBack = new Object();
this.bulletGroup;


//SignalR connection
var connection = new signalR.HubConnectionBuilder()
    .withUrl('/war')
    .build();
bindConnectionMessage();

connection.start()
    .then(() => startGame())
    .catch(error => console.error(error.message));


function onConnectionError(error) {
    if (error && error.message) {
        console.error(error.message);
    }
}

var name = window.prompt("Enter your name: ");

function sendMessage(xIn, yIn, keyIn, angle, health) {
    var sendmessage = '{' +
        '"x": "' + xIn + '" ,' +
        '"y": "' + yIn + '" ,' +
        '"key": "' + keyIn + '",' +
        '"angle": "' + angle + '",' +
        '"health": "' + health + '"' +
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
            var thisScene = [];
            thisScene = thisScene.concat(game.scene.scenes);
            opponent[inMessage.key] = thisScene[0].add.sprite(inMessage.x, inMessage.y, 'Down-warlock-walkl').setScale(scale);
            opponent[inMessage.key].name = inMessage.key;
            opponent[inMessage.key].health = 100;
            opponent[inMessage.key].angle = inMessage.angle;
            oppHealthBack[inMessage.key] = thisScene[0].add.image(inMessage.x, inMessage.y - 70, 'healthBackground');
            oppHealthBar[inMessage.key] = thisScene[0].add.image(inMessage.x, inMessage.y - 70, 'healthBar');
            oppHealthBar[inMessage.key].displayWidth = maxHealth;
            oppHealthBack[temp.key].setDepth(30);
            oppHealthBar[temp.key].setDepth(30);

            console.log("After added new player: " + opponent[inMessage.key].toString());
        }
        if (type === "updatePlayer") {
            opponent[inMessage.key].x = inMessage.x;
            opponent[inMessage.key].y = inMessage.y;
            opponent[inMessage.key].health = inMessage.health;
            opponent[inMessage.key].angle = inMessage.angle;

            var thisScene = [];
            thisScene = thisScene.concat(game.scene.scenes);

            oppHealthBack[inMessage.key].x = inMessage.x;
            oppHealthBack[inMessage.key].y = inMessage.y - 70;
            oppHealthBar[inMessage.key].x = inMessage.x;
            oppHealthBar[inMessage.key].y = inMessage.y - 70;
        }
        if (type === "disconnection") {

            //remove sprite
            opponent[inMessage.key].destroy();
            delete opponent[inMessage.key];

            //remove health bar
            oppHealthBack[inMessage.key].destroy();
            oppHealthBar[inMessage.key].destroy();
            delete oppHealthBack[inMessage.key];
            delete oppHealthBar[inMessage.key];

        }
        if (type === "shooting") {
            //check if shooting is from opponent

            if (opponent.hasOwnProperty(inMessage.key)) {
                console.log(inMessage.key, "shot");
                var thisScene = [];
                thisScene = thisScene.concat(game.scene.scenes);
                if (thisScene[0] != null) {
                    thisScene[0].bulletGroup = new BulletGroup(thisScene[0], inMessage.key);
                    thisScene[0].bulletGroup.setDepth(10);
                    thisScene[0].bulletGroup.fireBullet(inMessage.x - 20, inMessage.y - 20, inMessage.angle, inMessage.key);
                    thisScene[0].physics.add.collider(thisScene[0].bulletGroup, interactivelayer, bulletcallback);
                    hasShot = true;
                }
            }
        }
        if (type === "health") {
            if (opponent.hasOwnProperty(inMessage.key)) {
                opponent[inMessage.key].health = opponent[inMessage.key].health - damage;
                oppHealthBar[inMessage.key].displayWidth = opponent[inMessage.key].health ;
            }
            else if (playername == inMessage.key) {
                
                var thisScene = [];
                thisScene = thisScene.concat(game.scene.scenes);
                if (thisScene[0].player != null) {
                    thisScene[0].player.health = thisScene[0].player.health - damage;
                    healthBar.displayWidth = thisScene[0].player.health;
                }
            }
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

                    opponent[temp.key] = thisScene[0].add.sprite(temp.x, temp.y, 'Down-warlock-walkl').setScale(scale);
                    opponent[temp.key].name = temp.key;
                    opponent[temp.key].angle = temp.angle;
                    opponent[temp.key].health = temp.health;
                    opponent[temp.key].setDepth(10);
                    oppHealthBack[temp.key] = thisScene[0].add.image(temp.x, temp.y - 70, 'healthBackground');
                    oppHealthBar[temp.key] = thisScene[0].add.image(temp.x, temp.y - 70, 'healthBar');
                    oppHealthBar[temp.key].displayWidth = maxHealth;
                    oppHealthBack[temp.key].setDepth(30);
                    oppHealthBar[temp.key].setDepth(30);
                    console.log(opponent[temp.key].name, opponent[temp.key].x, opponent[temp.key].y, opponent[temp.key].angle);
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
        default: 'arcade'
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

    this.load.tilemapTiledJSON('map', 'https://spritestorage.blob.core.windows.net/map/Updated.json');
    this.load.image('tiles', 'https://spritestorage.blob.core.windows.net/map/TileSet.png');

    this.load.image('lightning', 'https://spritestorage.blob.core.windows.net/bullets/lightningBolt.png');
    this.load.image('healthBar', 'https://spritestorage.blob.core.windows.net/health-bar/healthbar.png');
    this.load.image('healthBackground', 'https://spritestorage.blob.core.windows.net/health-bar/healthbackground.png');


}

var map;
var interactivelayer;

function create() {


    myScene = this;
    this.opponents = opponent;

    for (var opp in this.opponents) {
        this.opponents[opp].setTexture('Down-warlock-walkl');
    }
    for (var opp in opponent) {
        opponent[opp].setTexture('Down-warlock-walkl');
    }

    for (var front in oppHealthBar)
    {
        oppHealthBar[front].setTexture('healthBar');
        oppHealthBar[front].displayWidth = opponent[front].health;
    }

    for (var back in oppHealthBack)
    {
        oppHealthBack[back].setTexture('healthBackground');
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

    this.player.health = 100;



    backgroundBar = this.add.image(this.player.x, this.player.y - 70, 'healthBackground');
    backgroundBar.fixedToCamera = true;

    healthBar = this.add.image(this.player.x, this.player.y - 70, 'healthBar');
    healthBar.displayWidth = maxHealth;
    healthBar.fixedToCamera = true;

    backgroundBar.setDepth(30);
    healthBar.setDepth(30);

    this.bulletGroup = new BulletGroup(this);
    this.input.on('pointerdown', function (pointer) {
        if (pointer.leftButtonDown()) {
            //start shooting
            this.bulletGroup.fireBullet(this.player.x - 20, this.player.y - 20, this.player.angle, this.player.name);
            hasShot = true;
            connection.send('broadcastMessage', "shooting", sendMessage(this.player.x, this.player.y, this.player.name, this.player.angle, this.player.health), cacheCount);
        }
    }, this);


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
    this.physics.add.collider(this.bulletGroup, interactivelayer, bulletcallback);
    // this.physics.add.collider(this.bulletGroup, this.player, bulletcallback)


    this.player.setDepth(10);
    skylayer.setDepth(20);


    // set bounds so the camera won't go outside the game world
    //this.cameras.main.setBounds(0, 0, game.width, game.height);
    // make the camera follow the player
    //this.cameras.main.startFollow(this.player);

    //this.cameras.main.setBackgroundColor('#2889d4');
    var outMessage = sendMessage(this.player.x, this.player.y, this.player.name, this.player.angle, this.player.health);
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


    backgroundBar.x = this.player.x;
    backgroundBar.y = this.player.y - 70;
    healthBar.x = this.player.x;
    healthBar.y = this.player.y - 70;

    for (var name in opponent) {
        oppHealthBack[name].x = opponent[name].x;
        oppHealthBack[name].y = opponent[name].y - 70;
        oppHealthBar[name].x = opponent[name].x;
        oppHealthBar[name].y = opponent[name].y - 70;
        //TODO
    }

    if (curX > this.player.x + 10 || curX < this.player.x + -10 || curY > this.player.y + 10 || curY < this.player.y - 10) {
        connection.send('broadcastMessage', "updatePlayer", sendMessage(this.player.x, this.player.y, this.player.name, this.player.angle, this.player.health), cacheCount);
        if (cacheCount < cacheInterval) { cacheCount++; } else { cacheCount = 0; }
        updated = true;
    }
    else {
        updated = false;
    }

}






class Bullet extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {
        super(scene, x, y, 'lightning');
        this.scene = scene;
        this.shooter = "";
        this.inX = x;
        this.inY = y;
    }

    fire(x, y, angle, shooter) {
        this.inX = x;
        this.inY = y;
        hasShot = true;
        var ang;
        this.body.reset(x, y);

        this.shooter = shooter;

        this.setDepth(10);
        this.setActive(true);
        this.setVisible(true);

        if (typeof (angle) == "string") {
            ang = parseInt(angle);
        }
        else {
            ang = angle;
        }

        switch (ang) {
            case -180:
                this.setVelocityY(-600);
                break;
            case -135:
                this.setVelocityX(600);
                this.setVelocityY(-600);
                break;
            case -45.00000000000006:
                this.setVelocityX(600);
                this.setVelocityY(600);
                break;
            case -45:
                this.setVelocityX(600);
                this.setVelocityY(600);
                break;
            case 0:
                this.setVelocityY(600);
                break;
            case 45:
                this.setVelocityX(-600);
                this.setVelocityY(600);
                break;
            case 135:
                this.setVelocityX(-600);
                this.setVelocityY(-600);
                break;
            case -90:
                this.setVelocityX(600);
                break;
            case 90:
                this.setVelocityX(-600);

                break;

        }




    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.y <= this.inY - 1000 || this.y >=this.inY+1000 || this.x <=this.inX-1000 || this.x >= this.inX+1000) {
            this.setActive(false);
            this.setVisible(false);
        }


        var hit = false;
            for (var name in opponent) {
                if (this.shooter != name) {
                    if (this.x <= parseInt(opponent[name].x) + 40 && this.x >= parseInt(opponent[name].x) - 40 && this.y <= parseInt(opponent[name].y) + 40 && this.y >= parseInt(opponent[name].y) - 40) {
                        hit = true;
                        console.log("HIT" + name);

                        this.setActive(false);
                        this.setVisible(false);
                        connection.send('broadcastMessage', "health", sendMessage(opponent[name].x, opponent[name].y, opponent[name].name, opponent[name].angle, opponent[name].health + damage), cacheCount);

                        opponent[name].health = opponent[name].health - damage;
                        oppHealthBar[name].displayWidth = opponent[name].health;
                    }
                }
            }//}
        
        if (this.shooter != playername && !hit)
        {
            var thisScene = [];
                thisScene = thisScene.concat(game.scene.scenes);
                if (this.x <= thisScene[0].player.x + 40 && this.x >= thisScene[0].player.x - 40 && this.y <= thisScene[0].player.y + 40 && this.y >= thisScene[0].player.x - 40) {
                        console.log("HIT" + name);

                        this.setActive(false);
                        this.setVisible(false);
                        connection.send('broadcastMessage', "health", sendMessage(thisScene[0].player.x, thisScene[0].player.y, thisScene[0].player.name, thisScene[0].player.angle, thisScene[0].player.health + damage), cacheCount);

                        thisScene[0].player.health = thisScene[0].player.health - damage;
                        healthBar.displayWidth = thisScene[0].player.health;
                        
                    }
        }

    }
}






class BulletGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);
        //        this.shooter = name;
        this.createMultiple({
            classType: Bullet,
            frameQuantity: 30,
            active: false,
            visible: false,
            key: 'bullet',
            setScale: { x: 0.5, y: 0.5 }
        });
    }

    fireBullet(x, y, angle, name) {
        const bullet = this.getFirstDead(false); //false - we can only use 30 bullets
        if (bullet) {
            bullet.setDepth(10);
            bullet.fire(x, y, angle, name);
        }
    }
}


function bulletcallback(bullet, layer) {
    bullet.setActive(false);
    bullet.setVisible(false);
}