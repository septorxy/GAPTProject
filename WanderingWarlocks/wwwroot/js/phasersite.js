//import Phaser from 'phaser';
var playername;
var runspeed = 1.5;
var myScene;
var cacheCount = 0;
var cacheInterval = 30;
var begining = true;
var temporary;
var healthBar;
var backgroundBar;

var opponent = new Object();
var oppAnim = new Object();
var oppHealthBar = new Object();
var oppHealthBack = new Object();

this.bulletGroup;

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

});*/

function onConnectionError(error) {
    if (error && error.message) {
        console.error(error.message);
    }
}

var name = window.prompt("Enter your name: ");

function sendMessage(xIn, yIn, keyIn, animsIn) {
    var sendmessage = '{' +
        '"x": "' + xIn + '" ,' +
        '"y": "' + yIn + '" ,' +
        '"key": "' + keyIn + '",' +
        '"anims": "' + animsIn + '"' +
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
            opponent[inMessage.key] = thisScene[0].add.sprite(inMessage.x, inMessage.y, 'Down-warlock-walkl').setScale(0.1);
            opponent[inMessage.key].name = inMessage.key;
            opponent[inMessage.key].anims.load(inMessage.anims);
            oppAnim[inMessage.key] = inMessage.anims;
            //opponent[oCount].anims.isPlaying = true;

            oppHealthBack[inMessage.key] = thisScene[0].add.image(inMessage.x, inMessage.y - 70, 'healthBackground');
            oppHealthBar[inMessage.key] = thisScene[0].add.image(inMessage.x, inMessage.y - 70, 'healthBar');

            console.log("After added new player: " + opponent[inMessage.key].toString());
        }
        if (type === "updatePlayer") {

            opponent[inMessage.key].x = inMessage.x;
            opponent[inMessage.key].y = inMessage.y;
            opponent[inMessage.key].anims.load(inMessage.anims);

            var thisScene = [];
            thisScene = thisScene.concat(game.scene.scenes);

            oppHealthBack[inMessage.key].destroy();
            oppHealthBar[inMessage.key].destroy();
            oppHealthBack[inMessage.key] = thisScene[0].add.image(inMessage.x, inMessage.y - 70, 'healthBackground');
            oppHealthBar[inMessage.key] = thisScene[0].add.image(inMessage.x, inMessage.y - 70, 'healthBar');

        }
        if (type === "disconnection") {
            console.log("Before removing player: " + opponent[inMessage.key].toString());

            //remove sprite
            opponent[inMessage.key].destroy();
            delete opponent[inMessage.key];

            //remove health bar
            oppHealthBack[inMessage.key].destroy();
            oppHealthBar[inMessage.key].destroy();
            delete oppHealthBack[inMessage.key];
            delete oppHealthBar[inMessage.key];

            //console.log("After removing player: " + opponent.toString());
        }
        if (type === "shooting") {
            //check if shooting is from opponent
            if (opponent.hasOwnProperty(inMessage.key)) {

                console.log("Anim passed: " + inMessage.anims);
                var thisScene = [];
                thisScene = thisScene.concat(game.scene.scenes);
                thisScene[0].bulletGroup = new BulletGroup(thisScene[0]);
                thisScene[0].bulletGroup.fireBullet(inMessage.x - 20, inMessage.y - 20, inMessage.anims);

            }
        }
    }



    var playerCallback = function (inOpp) {
        console.log("entered playercallback");
        if (begining) {
            var temp;
            var i;
            for (i = 0; i < inOpp.length; i++) {
                temp = JSON.parse(inOpp[i]);
                if (playername != temp.key && uniquename(temp.key)) {
                    var thisScene = [];
                    thisScene = thisScene.concat(game.scene.scenes);
                    opponent[temp.key] = thisScene[0].add.sprite(temp.x, temp.y, 'Down-warlock-walkl').setScale(0.1);;
                    opponent[temp.key].name = temp.key;
                    opponent[temp.key].anims.load(temp.anims);
                    opponent[temp.key].anims.currentAnim = temp.anims;
                    oppAnim[temp.key] = temp.anims;

                    oppHealthBack[temp.key] = thisScene[0].add.image(temp.x, temp.y - 70, 'healthBackground');
                    oppHealthBar[temp.key] = thisScene[0].add.image(temp.x, temp.y - 70, 'healthBar');
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
    width: window.innerWidth - 20,
    height: window.innerHeight - 20,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {y:0}
        }
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
    this.load.image('lightning', 'https://spritestorage.blob.core.windows.net/bullets/lightningBolt.png');
    this.load.image('healthBar', 'https://spritestorage.blob.core.windows.net/health-bar/healthbar.png');
    this.load.image('healthBackground', 'https://spritestorage.blob.core.windows.net/health-bar/healthbackground.png');

}
function create() {
    myScene = this;
    this.opponents = opponent;
    for (var sprite in this.opponents)
    {
        sprite.frame = 'Down-warlock-walkl';
    }
    
    this.anims.create({
        key: 'lwalk',
        frames:
            this.anims.generateFrameNames('warlock', { prefix: 'Warlock-', start: 15, end: 16, zeroPad: 2 }),
        frameRate: 03,
        yoyo: true,
        repeat: -1
    });

    this.anims.create({
        key: 'rwalk',
        frames:
            this.anims.generateFrameNames('warlock', { prefix: 'Warlock-', start: 27, end: 28, zeroPad: 2 }),
        frameRate: 03,
        yoyo: true,
        repeat: -1
    });
    this.anims.create({
        key: 'dwalk',
        frames:
            this.anims.generateFrameNames('warlock', { prefix: 'Warlock-', start: 3, end: 4, zeroPad: 2 }),
        frameRate: 03,
        yoyo: true,
        repeat: -1
    });
    this.anims.create({
        key: 'uwalk',
        frames:
            this.anims.generateFrameNames('warlock', { prefix: 'Warlock-', start: 31, end: 32, zeroPad: 2 }),
        frameRate: 03,
        yoyo: true,
        repeat: -1
    });
    this.anims.create({
        key: 'ulwalk',
        frames:
            this.anims.generateFrameNames('warlock', { prefix: 'Warlock-', start: 11, end: 12, zeroPad: 2 }),
        frameRate: 03,
        yoyo: true,
        repeat: -1
    });
    this.anims.create({
        key: 'urwalk',
        frames:
            this.anims.generateFrameNames('warlock', { prefix: 'Warlock-', start: 23, end: 24, zeroPad: 2 }),
        frameRate: 03,
        yoyo: true,
        repeat: -1
    });
    this.anims.create({
        key: 'dlwalk',
        frames:
            this.anims.generateFrameNames('warlock', { prefix: 'Warlock-', start: 7, end: 8, zeroPad: 2 }),
        frameRate: 03,
        yoyo: true,
        repeat: -1
    });
    this.anims.create({
        key: 'drwalk',
        frames:
            this.anims.generateFrameNames('warlock', { prefix: 'Warlock-', start: 19, end: 20, zeroPad: 2 }),
        frameRate: 03,
        yoyo: true,
        repeat: -1
    });




    this.anims.create({
        key: 'lrun',
        frames:
            this.anims.generateFrameNames('warlock', { prefix: 'Warlock-', start: 13, end: 14, zeroPad: 2 }),
        frameRate: 05,
        yoyo: true,
        repeat: -1
    });

    this.anims.create({
        key: 'rrun',
        frames:
            this.anims.generateFrameNames('warlock', { prefix: 'Warlock-', start: 25, end: 26, zeroPad: 2 }),
        frameRate: 05,
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
    this.anims.create({
        key: 'urun',
        frames:
            this.anims.generateFrameNames('warlock', { prefix: 'Warlock-', start: 29, end: 30, zeroPad: 2 }),
        frameRate: 05,
        yoyo: true,
        repeat: -1
    });
    this.anims.create({
        key: 'ulrun',
        frames:
            this.anims.generateFrameNames('warlock', { prefix: 'Warlock-', start: 9, end: 10, zeroPad: 2 }),
        frameRate: 05,
        yoyo: true,
        repeat: -1
    });
    this.anims.create({
        key: 'urrun',
        frames:
            this.anims.generateFrameNames('warlock', { prefix: 'Warlock-', start: 21, end: 22, zeroPad: 2 }),
        frameRate: 05,
        yoyo: true,
        repeat: -1
    });
    this.anims.create({
        key: 'dlrun',
        frames:
            this.anims.generateFrameNames('warlock', { prefix: 'Warlock-', start: 5, end: 6, zeroPad: 2 }),
        frameRate: 05,
        yoyo: true,
        repeat: -1
    });
    this.anims.create({
        key: 'drrun',
        frames:
            this.anims.generateFrameNames('warlock', { prefix: 'Warlock-', start: 17, end: 18, zeroPad: 2 }),
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

    this.player = this.add.sprite(400, 300, 'Down-warlock-walkl').setScale(0.1);
    this.player.name = name;
    playername = name;
    this.player.anims.load('lwalk');
    this.player.anims.load('rwalk');
    this.player.anims.load('dwalk');
    this.player.anims.load('uwalk');
    this.player.anims.load('ulwalk');
    this.player.anims.load('urwalk');
    this.player.anims.load('dlwalk');
    this.player.anims.load('drwalk');

    this.player.anims.load('lrun');
    this.player.anims.load('rrun');
    this.player.anims.load('drun');
    this.player.anims.load('urun');
    this.player.anims.load('ulrun');
    this.player.anims.load('urrun');
    this.player.anims.load('dlrun');
    this.player.anims.load('drrun');
    //this.player.frame = 'Left-warlock-walkr.png';

    cursors = this.input.keyboard.createCursorKeys();

    // set bounds so the camera won't go outside the game world
    //this.cameras.main.setBounds(0, 0, game.width, game.height);
    // make the camera follow the player
    //this.cameras.main.startFollow(this.player);

    this.cameras.main.setBackgroundColor('#2889d4');
    var outMessage = sendMessage(this.player.x, this.player.y, this.player.name, this.player.anims.currentAnim.key);
    if (outMessage) {

        connection.send('broadcastMessage', "newPlayer", outMessage, cacheCount);
    }

    this.player.health = 100;
    this.player.maxHealth = 100;

    backgroundBar = this.add.image(this.player.x, this.player.y - 70, 'healthBackground');
    backgroundBar.fixedToCamera = true;

    healthBar = this.add.image(this.player.x, this.player.y - 70, 'healthBar');
    healthBar.fixedToCamera = true;

    /*
    player.events.onKilled.add(function () {
        //killSound.play()
        outMessage = sendMessage(this.player.x, this.player.y, this.player.name, this.player.anims.currentAnim.key);
        connection.send('broadcastMessage', "disconnection", outMessage, cacheCount);

        gameOver();

    });
    */

    this.bulletGroup = new BulletGroup(this);
    this.input.on('pointerdown', function (pointer) {
        if (pointer.leftButtonDown()) {
            //start shooting
            this.bulletGroup.fireBullet(this.player.x - 20, this.player.y - 20, this.player.anims.currentAnim.key);
            connection.send('broadcastMessage', "shooting", sendMessage(this.player.x, this.player.y, this.player.name, this.player.anims.currentAnim.key), cacheCount);
        }
    }, this);
}

class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'lightning');
        this.scene = scene;
    }

    fire(x, y, animKey) {
        this.body.reset(x, y);

        this.setActive(true);
        this.setVisible(true);

        switch (animKey) {
            case 'uwalk':
                this.setVelocityY(-600);
                break;
            case 'urun':
                this.setVelocityY(-600);
                break;
            case 'urwalk':
                this.setVelocityX(600);
                this.setVelocityY(-600);
                break;
            case 'urrun':
                this.setVelocityX(600);
                this.setVelocityY(-600);
                break;
            case 'drwalk':
                this.setVelocityX(600);
                this.setVelocityY(600);
                break;
            case 'drrun':
                this.setVelocityX(600);
                this.setVelocityY(600);
                break;
            case 'dwalk':
                this.setVelocityY(600);
                break;
            case 'drun':
                this.setVelocityY(600);
                break;
            case 'dlwalk':
                this.setVelocityX(-600);
                this.setVelocityY(600);
                break;
            case 'dlrun':
                this.setVelocityX(-600);
                this.setVelocityY(600);
                break;
            case 'ulwalk':
                this.setVelocityX(-600);
                this.setVelocityY(-600);
                break;
            case 'ulrun':
                this.setVelocityX(-600);
                this.setVelocityY(-600);
                break;
            case 'rwalk':
                this.setVelocityX(600);
                break;
            case 'rrun':
                this.setVelocityX(600);
                break;
            case 'lwalk':
                this.setVelocityX(-600);
                break;
            case 'lrun':
                this.setVelocityX(-600);
                break;
        }

    }
    /*
    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.y <= 0) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
    */
}

class BulletGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);

        this.createMultiple({
            classType: Bullet,
            frameQuantity: 30,
            active: false,
            visible: false,
            key: 'bullet',
            setScale: { x: 0.5, y: 0.5 }
        })
    }

    fireBullet(x, y, animKey) {
        const bullet = this.getFirstDead(false); //false - we can only use 30 bullets
        if (bullet) {
            bullet.fire(x, y, animKey);
            this.scene.player.anims.currentAnim.key;
        }
    }
}

function update() {
    
    var curX = this.player.x;
    var curY = this.player.y;
    this.opponents = opponent;
    var i;

    if (cursors.shift.isDown) {
        if (cursors.up.isDown && cursors.left.isDown) {
            this.player.anims.play('ulrun', 10, true);
            this.player.x -= Math.sqrt(8) * runspeed;
            this.player.y -= Math.sqrt(8) * runspeed;
        }
        else if (cursors.up.isDown && cursors.right.isDown) {
            this.player.anims.play('urrun', 10, true);
            this.player.x += Math.sqrt(8) * runspeed;
            this.player.y -= Math.sqrt(8) * runspeed;
        }
        else if (cursors.down.isDown && cursors.left.isDown) {
            this.player.anims.play('dlrun', 10, true);
            this.player.x -= Math.sqrt(8) * runspeed;
            this.player.y += Math.sqrt(8) * runspeed;
        }
        else if (cursors.down.isDown && cursors.right.isDown) {
            this.player.anims.play('drrun', 10, true);
            this.player.x += Math.sqrt(8) * runspeed;
            this.player.y += Math.sqrt(8) * runspeed;
        }
        else if (cursors.left.isDown) {
            this.player.anims.play('lrun', 10, true);
            this.player.x -= 4 * runspeed;
        }
        else if (cursors.right.isDown) {
            this.player.anims.play('rrun', 10, true);
            this.player.x += 4 * runspeed;
        }
        else if (cursors.down.isDown) {
            this.player.anims.play('drun', 10, true);
            this.player.y += 4 * runspeed;
        }
        else if (cursors.up.isDown) {
            this.player.anims.play('urun', 10, true);
            this.player.y -= 4 * runspeed;
        }
        else {
            this.player.anims.stop();
        }
    }
    else {
        if (cursors.up.isDown && cursors.left.isDown) {
            this.player.anims.play('ulwalk', 10, true);
            this.player.x -= Math.sqrt(8);
            this.player.y -= Math.sqrt(8);
        }
        else if (cursors.up.isDown && cursors.right.isDown) {
            this.player.anims.play('urwalk', 10, true);
            this.player.x += Math.sqrt(8);
            this.player.y -= Math.sqrt(8);
        }
        else if (cursors.down.isDown && cursors.left.isDown) {
            this.player.anims.play('dlwalk', 10, true);
            this.player.x -= Math.sqrt(8);
            this.player.y += Math.sqrt(8);
        }
        else if (cursors.down.isDown && cursors.right.isDown) {
            this.player.anims.play('drwalk', 10, true);
            this.player.x += Math.sqrt(8);
            this.player.y += Math.sqrt(8);
        }
        else if (cursors.left.isDown) {
            this.player.anims.play('lwalk', 10, true);
            this.player.x -= 4;
        }
        else if (cursors.right.isDown) {
            this.player.anims.play('rwalk', 10, true);
            this.player.x += 4;
        }
        else if (cursors.down.isDown) {
            this.player.anims.play('dwalk', 10, true);
            this.player.y += 4;
        }
        else if (cursors.up.isDown) {
            this.player.anims.play('uwalk', 10, true);
            this.player.y -= 4;
        }
        else {
            this.player.anims.stop();
        }
    }

    /* If the player os shot:
       healthBar.scale.setTo(player.health / player.maxHealth, 1);
    */

    backgroundBar.destroy();
    healthBar.destroy();
    backgroundBar = this.add.image(this.player.x, this.player.y - 70, 'healthBackground');
    healthBar = this.add.image(this.player.x, this.player.y - 70, 'healthBar');


    for (var name in opponent) {
        if ((!opponent[name].anims.isPlaying) && oppAnim[name] != opponent[name].anims.currentAnim) {
            opponent[name].anims.play(opponent[name].anims.currentAnim.key);
            oppAnim[name] = opponent[name].anims.currentAnim.key;
        }
    }

    if (curX != this.player.x || curY != this.player.y) {
        connection.send('broadcastMessage', "updatePlayer", sendMessage(this.player.x, this.player.y, this.player.name, this.player.anims.currentAnim.key), cacheCount);
        if (cacheCount < cacheInterval) { cacheCount++; } else { cacheCount = 0; }
    }

}

