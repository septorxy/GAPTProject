const DEBUG = true;

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
var hasShot = true;
var maxHealth = 100;
var damage = 10;
var canShoot = true;
var firstMove = true;
var mask;
var maskOff = true;

var maxSpawnX = 5534;
var minSpawnY = 5149;
var maxSpawnY = 3787;
var minSpawnX = 4563;

var maxSpawnXC = 4650;
var minSpawnYC = 4850;
var maxSpawnYC = 4349;
var minSpawnXC = 5450;


var bloodcount = 0;

//shooting 
var healthBar;
var backgroundBar;


//Dictionaries
var opponent = new Object();
var oppAnim = new Object();
var usernames = new Object();
var bloodsplats = new Object();


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

function sendMessage(xIn, yIn, keyIn, angle, health, kills, velocity) {
    var sendmessage = '{' +
        '"x": "' + xIn + '" ,' +
        '"y": "' + yIn + '" ,' +
        '"key": "' + keyIn + '",' +
        '"angle": "' + angle + '",' +
        '"velocity": "' + velocity + '",' +
        '"health": "' + health + '",' +
        '"kills": "' + kills + '"' +
        '}';
    return sendmessage;
}

//RECEIVE FROM HUB
function bindConnectionMessage() {
    var broadcastCallback = function (type, inJSON) {
        var inMessage = JSON.parse(inJSON);
        if (!type) { return; }
        if (type === "newPlayer") {
            //console.log("Before added new player: " + opponent[inMessage.key]/*.toString()*/);

            //console.log("key: " + inMessage.key);
            //console.log("player name: " + playername);
            if (inMessage.key == playername) {
                return;
            }
            var thisScene = [];
            thisScene = thisScene.concat(game.scene.scenes);
            opponent[inMessage.key] = thisScene[0].add.sprite(inMessage.x, inMessage.y, 'Down-opp-walkl').setScale(scale);
            opponent[inMessage.key].name = inMessage.key;
            opponent[inMessage.key].health = 100;
            opponent[inMessage.key].angle = inMessage.angle;
            opponent[inMessage.key].kills = 0;
            opponent[inMessage.key].playing = false;
            opponent[inMessage.key].mySpeed = inMessage.velocity;
            opponent[inMessage.key].anims.load('owalk');
            opponent[inMessage.key].anims.load('orun');
            oppHealthBack[inMessage.key] = thisScene[0].add.image(inMessage.x, inMessage.y - 70, 'healthBackground');
            oppHealthBar[inMessage.key] = thisScene[0].add.image(inMessage.x, inMessage.y - 70, 'healthBar');
            oppHealthBar[inMessage.key].displayWidth = maxHealth;
            oppHealthBack[inMessage.key].displayWidth = maxHealth + 2;
            oppHealthBack[inMessage.key].setDepth(30);
            oppHealthBar[inMessage.key].setDepth(30);

            usernames[inMessage.key] = thisScene[0].add.text(opponent[inMessage.key].x - ((inMessage.key.length / 2) * 10), opponent[inMessage.key].y - 100, inMessage.key);
            usernames[inMessage.key].alpha = 0.5;
            usernames[inMessage.key].setDepth(30);

            if (DEBUG) {
                console.log("After added new player: " + opponent[inMessage.key].toString());
            }
        }
        if (type === "updatePlayer") {
            opponent[inMessage.key].x = inMessage.x;
            opponent[inMessage.key].y = inMessage.y;
            opponent[inMessage.key].health = inMessage.health;
            opponent[inMessage.key].angle = inMessage.angle;
            opponent[inMessage.key].kills = inMessage.kills;
            opponent[inMessage.key].mySpeed = inMessage.velocity;

            
            if (opponent[inMessage.key].mySpeed >= 150) {
                if (opponent[inMessage.key].playing == false) {
                    opponent[inMessage.key].anims.play('orun', 10, true);
                    opponent[inMessage.key].playing = true;
                }
            }
            else if (opponent[inMessage.key].mySpeed > 0) {
                if (opponent[inMessage.key].playing == false) {
                    opponent[inMessage.key].anims.play('owalk', 10, true);
                    opponent[inMessage.key].playing = true;
                }
            }
            else {
                opponent[inMessage.key
                ].anims.stop();
                opponent[inMessage.key].playing = false;
            }
            //console.log(opponent[inMessage.key].kills);

            var thisScene = [];
            thisScene = thisScene.concat(game.scene.scenes);

            oppHealthBack[inMessage.key].x = inMessage.x;
            oppHealthBack[inMessage.key].y = inMessage.y - 70;
            oppHealthBar[inMessage.key].x = inMessage.x;
            oppHealthBar[inMessage.key].y = inMessage.y - 70;

            usernames[inMessage.key].x = opponent[inMessage.key].x - ((inMessage.key.length / 2) * 10);
            usernames[inMessage.key].y = opponent[inMessage.key].y - 100;

        }
        if (type === "disconnection") {

            //remove sprite
            opponent[inMessage.key].destroy();
            delete opponent[inMessage.key];

            //remove health bar
            oppHealthBack[inMessage.key].destroy();
            oppHealthBar[inMessage.key].destroy();
            usernames[inMessage.key].destroy();
            delete oppHealthBack[inMessage.key];
            delete oppHealthBar[inMessage.key];
            delete usernames[inMessage.key];

        }
        if (type === "shooting") {
            //check if shooting is from opponent

            if (opponent.hasOwnProperty(inMessage.key)) {
                //console.log(inMessage.key, "shot");
                var thisScene = [];
                thisScene = thisScene.concat(game.scene.scenes);
                if (thisScene[0] != null) {
                    thisScene[0].bulletGroupOpp = new BulletGroupOpp(thisScene[0], inMessage.key);
                    thisScene[0].bulletGroupOpp.setDepth(10);
                    thisScene[0].bulletGroupOpp.fireBullet(inMessage.x - 20, inMessage.y - 20, inMessage.angle, inMessage.key);
                    thisScene[0].physics.add.collider(thisScene[0].bulletGroupOpp, interactivelayer, bulletcallback);
                    hasShot = true;
                }
            }
        }
    }
    var playerCallback = function (inOpp) {
        if (DEBUG) {
            console.log("entered playercallback");
        }
        if (begining) {
            var temp;
            var i;
            if (DEBUG) {
                console.log(inOpp.length);
            }
            for (i = 0; i < inOpp.length; i++) {
                temp = JSON.parse(inOpp[i]);

                if (playername != temp.key && uniquename(temp.key)) {
                    var thisScene = [];
                    //thisScene.add(game.scene.scenes);
                    thisScene = thisScene.concat(game.scene.scenes);

                    opponent[temp.key] = thisScene[0].add.sprite(temp.x, temp.y, 'Down-opp-walkl').setScale(scale);
                    opponent[temp.key].name = temp.key;
                    opponent[temp.key].angle = temp.angle;
                    opponent[temp.key].health = temp.health;
                    opponent[temp.key].kills = temp.kills;
                    opponent[temp.key].kills = temp.kills;
                    opponent[temp.key].playing = false;
                    opponent[temp.key].setDepth(10);
                    oppHealthBack[temp.key] = thisScene[0].add.image(temp.x, temp.y - 70, 'healthBackground');
                    oppHealthBar[temp.key] = thisScene[0].add.image(temp.x, temp.y - 70, 'healthBar');
                    oppHealthBar[temp.key].displayWidth = maxHealth;
                    oppHealthBack[temp.key].displayWidth = maxHealth + 2;
                    oppHealthBack[temp.key].setDepth(30);
                    oppHealthBar[temp.key].setDepth(30);


                    usernames[temp.key] = thisScene[0].add.text(opponent[temp.key].x - ((temp.key.length / 2) * 10), opponent[temp.key].y - 100, temp.key);
                    usernames[temp.key].alpha = 0.5;
                    usernames[temp.key].setDepth(30);
                    if (DEBUG) {
                        console.log(opponent[temp.key].name, opponent[temp.key].x, opponent[temp.key].y, opponent[temp.key].angle);
                    }
                }
            }
            begining = false;
        }

    }

    var hitCallback = function (inShooterJSON, inDamagedJSON) {
        var inShooter = JSON.parse(inShooterJSON);
        var inDamaged = JSON.parse(inDamagedJSON);

        opponent[inShooter.key].x = parseFloat(inShooter.x);
        opponent[inShooter.key].y = parseFloat(inShooter.y);
        opponent[inShooter.key].angle = inShooter.angle;
        opponent[inShooter.key].health = inShooter.health;
        opponent[inShooter.key].kills = inShooter.kills;

        if (DEBUG) {
            console.log("IN HIT CALLBACK");
        }

        if (inDamaged.key == playername) {
            var thisScene = [];
            thisScene = thisScene.concat(game.scene.scenes);
            
            
            thisScene[0].player.health = inDamaged.health;
            healthBar.displayWidth = thisScene[0].player.health;
            thisScene[0].player.x = parseFloat(inDamaged.x);
            thisScene[0].player.y = parseFloat(inDamaged.y);
            thisScene[0].player.angle = inDamaged.angle;
            thisScene[0].player.kills = inDamaged.kills;
            if (maskOff) {
                maskOff = false;
                mask = thisScene[0].add.graphics();
                mask.setDepth(35);
                mask.fillStyle(0xFF0000, 0.2);
                mask.fillRect(thisScene[0].player.x - (window.innerWidth / 2), thisScene[0].player.y - (window.innerHeight / 2), window.innerWidth + 10, window.innerHeight + 10);
                setTimeout(endmask, 175);
            }

            //if (myScene.player.health <= 0) {
            //     kill(opponent[name]);
            //}
            //else 
            if (thisScene[0].player.health <= 20) {
                healthBar.setTexture('Red-health');
                bloodsplats[bloodcount] = thisScene[0].add.image(thisScene[0].player.x, thisScene[0].player.y, 'blood').setScale((maxHealth - thisScene[0].player.health)/100);
                setTimeout(removeBlood, 2000, bloodcount);
                bloodcount++;
            }
            else if (thisScene[0].player.health <= 50) {
                healthBar.setTexture('Orange-health');
                bloodsplats[bloodcount] = thisScene[0].add.image(thisScene[0].player.x, thisScene[0].player.y, 'blood').setScale((maxHealth - thisScene[0].player.health) / 100);
                setTimeout(removeBlood, 2000, bloodcount);
                bloodcount++;
            }
            else
            {
                healthBar.setTexture('healthBar');

            }

        }
        else {
            opponent[name].health = inDamaged.health;
            oppHealthBar.displayWidth = myScene.player.health;
            opponent[name].x = parseFloat(inDamaged.x);
            opponent[name].y = parseFloat(inDamaged.y);
            opponent[name].angle = inDamaged.angle;
            opponent[name].kills = inDamaged.kills;

            //if (myScene.player.health <= 0) {
            //     kill(opponent[name]);
            //}
            //else 
            if (opponent[name].health <= 20) {
                oppHealthBar[name].setTexture('Red-health');
                bloodsplats[bloodcount] = myScene.add.image(opponent[name].x, opponent[name].y, 'blood').setScale((maxHealth - opponent[name].health) / 100);
                bloodsplats[bloodcount].setDepth(9);
                setTimeout(removeBlood, 2000, bloodcount);

                bloodcount++;
            }
            else if (opponent[name].health <= 50) {
                oppHealthBar[name].setTexture('Orange-health');
                bloodsplats[bloodcount] = myScene.add.image(opponent[name].x, opponent[name].y, 'blood').setScale((maxHealth - opponent[name].health) / 100);
                bloodsplats[bloodcount].setDepth(9);
                setTimeout(removeBlood, 2000, bloodcount);
                bloodcount++;
            }
            else {
                oppHealthBar[name].setTexture('healthBar');
            }
        }


    }


    connection.on('broadcastMessage', broadcastCallback, 0);
    connection.on('getPlayers', playerCallback, 0);
    connection.on('hit', hitCallback, 0);
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

var text;
var textBack;
var cursors;
var keys;
var username;

function preload() {

    
    
    var width = this.cameras.main.width;
    var height = this.cameras.main.height;
    
    var progressBox = this.add.graphics();
    var progressBar = this.add.graphics();
    progressBox.fillStyle(0x8D5524);
    progressBox.fillRect((width / 2) - (160), (height / 2) - 30, 320, 50);

    
    var loadingText = this.make.text({
        x: width / 2,
        y: height / 2 - 50,
        text: 'Loading...',
        style: {
            font: '20px monospace',
            fill: '#ffffff'
        }
    });
    loadingText.setOrigin(0.5, 0.5);

    var percentText = this.make.text({
        x: width / 2,
        y: height / 2 - 5,
        text: '0%',
        style: {
            font: '18px monospace',
            fill: '#ffffff'
        }
    });
    percentText.setOrigin(0.5, 0.5);

    var assetText = this.make.text({
        x: width / 2,
        y: height / 2 + 50,
        text: '',
        style: {
            font: '18px monospace',
            fill: '#ffffff'
        }
    });

    assetText.setOrigin(0.5, 0.5);

    this.load.on('progress', function (value) {
        percentText.setText(parseInt(value * 100) + '%');
        progressBar.clear();
        progressBar.fillStyle(0x069a55);
        progressBar.fillRect((width / 2) + 10 - 160, (height / 2) - 20, 300 * value, 30);
    });

    this.load.on('fileprogress', function (file) {
        assetText.setText('Loading asset: ' + file.key);
    });

    this.load.on('complete', function () {
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
        percentText.destroy();
        //loading.destroy();
        assetText.destroy();
    });

    //this.load.atlas('player', 'warlock.png' , 'warlock.json');
    //this.load.path = 'sprites/';
    //this.load.multiatlas('player', 'spritesheet.json');
    this.load.image('Down-warlock-walkl', 'https://warlockstorageacc.blob.core.windows.net/warlock/Down-warlock-walkl.png');

    this.load.atlas('warlock', 'https://warlockstorageacc.blob.core.windows.net/warlock/warlock.png', 'https://warlockstorageacc.blob.core.windows.net/warlock/warlock.json');

    this.load.image('Down-opp-walkl', 'https://warlockstorageacc.blob.core.windows.net/warlock/Down-opp-walkl.png');
    this.load.atlas('opponent', 'https://warlockstorageacc.blob.core.windows.net/warlock/opponent.png', 'https://warlockstorageacc.blob.core.windows.net/warlock/warlock.json');

    this.load.tilemapTiledJSON('map', 'https://warlockstorageacc.blob.core.windows.net/map/Updated.json');
    this.load.image('tiles', 'https://warlockstorageacc.blob.core.windows.net/map/TileSet.png');

    this.load.image('lightning', 'https://warlockstorageacc.blob.core.windows.net/bullets/lightningBolt.png');
    this.load.image('healthBar', 'https://warlockstorageacc.blob.core.windows.net/health-bar/healthbar.png');
    this.load.image('healthBackground', 'https://warlockstorageacc.blob.core.windows.net/health-bar/healthbackground.png');

    this.load.image('Orange-health', 'https://warlockstorageacc.blob.core.windows.net/health-bar/orange-healthbar.png');
    this.load.image('Red-health', 'https://warlockstorageacc.blob.core.windows.net/health-bar/red-healthbar.png');

    this.load.image('leaderboard', 'https://warlockstorageacc.blob.core.windows.net/background/LeaderboardBack.png');

    this.load.image('blood', 'https://warlockstorageacc.blob.core.windows.net/warlock/blood.png');
    
    


}

var map;
var interactivelayer;

function create() {

    name = document.getElementById("name").innerHTML;
    myScene = this;
    this.opponents = opponent;

    for (var opp in this.opponents) {

        this.opponents[opp].setTexture('Down-opp-walkl');
        this.opponents[opp].setDepth(10);
    }
    for (var opp in opponent) {
        opponent[opp].setTexture('Down-opp-walkl');
        opponent[opp].setDepth(10);
        opponent[opp].anims.load('owalk');
        opponent[opp].anims.load('orun');
    }

    for (var front in oppHealthBar) {
        oppHealthBar[front].setTexture('healthBar');
        oppHealthBar[front].displayWidth = opponent[front].health;
        oppHealthBar[front].setDepth(30);
    }

    for (var back in oppHealthBack) {
        oppHealthBack[back].setTexture('healthBackground');
        oppHealthBack[back].displayWidth = maxHealth + 2;
        oppHealthBack[back].setDepth(30);
    }

    //console.log(this.opponents);



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

    this.anims.create({
        key: 'owalk',
        frames:
            this.anims.generateFrameNames('opponent', { prefix: 'Warlock-', start: 3, end: 4, zeroPad: 2 }),
        frameRate: 03,
        yoyo: true,
        repeat: -1
    });
    this.anims.create({
        key: 'orun',
        frames:
            this.anims.generateFrameNames('opponent', { prefix: 'Warlock-', start: 1, end: 2, zeroPad: 2 }),
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

    //this.loading.destroy();
    this.player = this.physics.add.sprite(getXspawn(), getYspawn(), 'Down-warlock-walkl').setScale(scale);
    this.player.name = name;
    playername = name;
    this.player.anims.load('dwalk');
    this.player.anims.load('drun');

    this.player.health = 100;
    this.player.kills = 0;

    backgroundBar = this.add.image(this.player.x, this.player.y - 70, 'healthBackground');
    backgroundBar.fixedToCamera = true;
    backgroundBar.displayWidth = maxHealth + 2;


    healthBar = this.add.image(this.player.x, this.player.y - 70, 'healthBar');
    healthBar.displayWidth = maxHealth;
    healthBar.fixedToCamera = true;

    username = this.add.text(this.player.x - ((playername.length / 2) * 10), this.player.y - 100, playername);
    username.alpha = 0.5;
    username.setDepth(30);
    backgroundBar.setDepth(30);
    healthBar.setDepth(30);

    this.bulletGroup = new BulletGroup(this);





    //this.player.frame = 'Left-warlock-walkr.png';

    cursors = this.input.keyboard.createCursorKeys();

    keys = this.input.keyboard.addKeys(
        {
            W: 'W',
            A: 'A',
            S: 'S',
            D: 'D',
            Q: 'Q', 
            P: 'P'
        });

    camera = this.cameras.main;
    camera.startFollow(this.player);


    this.input.on('pointerdown', function (pointer) {
        if (pointer.leftButtonDown()) {
            //start shooting
            if (canShoot) {
                this.bulletGroup.fireBullet(this.player.x - 20, this.player.y - 20, this.player.angle, this.player.name);
                canShoot = false;
                setTimeout(setShot, 500);
                connection.send('broadcastMessage', "shooting", sendMessage(this.player.x, this.player.y, this.player.name, this.player.angle, this.player.health, this.player.kills, this.player.velocity), cacheCount);
            }
        }
    }, this);



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
    var outMessage = sendMessage(this.player.x, this.player.y, this.player.name, this.player.angle, this.player.health, this.player.kills, this.player.velocity);
    if (outMessage) {

        connection.send('broadcastMessage', "newPlayer", outMessage, cacheCount);
    }
    updated = true;

    text = this.add.text(0, 0, "", {
        font: "25px Arial",
        align: "center"
    });
    textBack = this.add.image(0, 0, 'leaderboard');

    text.setPadding(15, 15);
    text.visible = false;
    text.setDepth(30);
    textBack.visible = false;
    textBack.setDepth(29);

}
function update() {

    if (DEBUG)
    {
        if (keys.P.isDown)
        {
            console.log("Player: " + this.player.x + " , " + this.player.y );
        }
    }

    if (updated) {
        curX = this.player.x;
        curY = this.player.y;
    }
    this.opponents = opponent;
    var i;

    

    if (cursors.space.isDown) {
        if (canShoot) {
            this.bulletGroup.fireBullet(this.player.x - 20, this.player.y - 20, this.player.angle, this.player.name);
            canShoot = false;
            setTimeout(setShot, 500);
            connection.send('broadcastMessage', "shooting", sendMessage(this.player.x, this.player.y, this.player.name, this.player.angle, this.player.health, this.player.kills, this.player.velocity), cacheCount);
        }
    }


    this.player.setVelocity(0);
    this.player.velocity = 0;

    if (cursors.shift.isDown) {
        this.player.anims.play('drun', 10, true);
        runspeed = 150;

        this.player.velocity = 150;
    }
    else {
        this.player.anims.play('dwalk', 10, true);
        runspeed = 80;

        this.player.velocity = 80;
    }
    if ((cursors.up.isDown || keys.W.isDown) && (cursors.left.isDown || keys.A.isDown)) {

        this.player.setAngle(135);
        this.player.setVelocityX(-Math.sqrt(8) * runspeed);
        this.player.setVelocityY(-Math.sqrt(8) * runspeed);

    }
    else if ((cursors.up.isDown || keys.W.isDown) && (cursors.right.isDown || keys.D.isDown)) {
        this.player.setAngle(-135);
        this.player.setVelocityX(Math.sqrt(8) * runspeed);
        this.player.setVelocityY(-Math.sqrt(8) * runspeed);
    }
    else if ((cursors.down.isDown || keys.S.isDown) && (cursors.left.isDown || keys.A.isDown)) {

        this.player.setAngle(45);
        this.player.setVelocityX(-Math.sqrt(8) * runspeed);
        this.player.setVelocityY(Math.sqrt(8) * runspeed);
    }
    else if ((cursors.down.isDown || keys.S.isDown) && (cursors.right.isDown || keys.D.isDown)) {
        this.player.setAngle(-45);
        this.player.setVelocityX(Math.sqrt(8) * runspeed);
        this.player.setVelocityY(Math.sqrt(8) * runspeed);
    }
    else if (cursors.left.isDown || keys.A.isDown) {
        this.player.setAngle(90);
        this.player.setVelocityX(- 4 * runspeed);
    }
    else if (cursors.right.isDown || keys.D.isDown) {
        this.player.setAngle(-90);
        this.player.setVelocityX(4 * runspeed);
    }
    else if (cursors.down.isDown || keys.S.isDown) {
        this.player.setAngle(0);
        this.player.setVelocityY(4 * runspeed);
    }
    else if (cursors.up.isDown || keys.W.isDown) {
        this.player.setAngle(180);
        this.player.setVelocityY(-4 * runspeed);
    }
    else {
        this.player.anims.stop();

        this.player.velocity = 0;
    }


    backgroundBar.x = this.player.x;
    backgroundBar.y = this.player.y - 70;
    healthBar.x = this.player.x;
    healthBar.y = this.player.y - 70;
    username.x = this.player.x - ((playername.length / 2)*10);
    username.y = this.player.y - 100;
    
    if (!maskOff)
    {
        mask.destroy();
        mask = this.add.graphics();
        mask.setDepth(35);
        mask.fillStyle(0xFF0000, 0.2);
        mask.fillRect(this.player.x - (window.innerWidth / 2), this.player.y - (window.innerHeight / 2), window.innerWidth + 10, window.innerHeight + 10);

    }

    if (textBack.visible)
    {
        text.x = (this.player.x + window.innerWidth / 2) - 400;
        text.y = (this.player.y - window.innerHeight / 2) + 20;
        textBack.x = (this.player.x + window.innerWidth / 2) - 400;
        textBack.y = (this.player.y - window.innerHeight / 2) + 20;

    }

    for (var name in opponent) {
        
        oppHealthBack[name].x = opponent[name].x;
        oppHealthBack[name].y = opponent[name].y - 70;
        oppHealthBar[name].x = opponent[name].x;
        oppHealthBar[name].y = opponent[name].y - 70;
        
        

    }

    if (curX > this.player.x + 10 || curX < this.player.x + -10 || curY > this.player.y + 10 || curY < this.player.y - 10) {
        if (firstMove) {
            document.getElementById('music').play();
            firstMove = false;
        }

        connection.send('broadcastMessage', "updatePlayer", sendMessage(this.player.x, this.player.y, this.player.name, this.player.angle, this.player.health, this.player.kills, this.player.velocity), cacheCount);
        if (cacheCount < cacheInterval) { cacheCount++; } else { cacheCount = 0; }
        updated = true;
    }
    else {
        updated = false;
    }
    if (textBack.visible) {
        updateText();
    }

    if (keys.Q.isDown) {

        text.x = (this.player.x + window.innerWidth / 2) - 400;
        text.y = (this.player.y - window.innerHeight / 2) + 20;
        textBack.x = (this.player.x + window.innerWidth / 2) - 400;
        textBack.y = (this.player.y - window.innerHeight / 2) + 20;
        textBack.visible = !textBack.visible;
        text.visible = !text.visible;
        keys.Q.isDown = false;
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
                this.setVelocityY(4 *-150);
                break;
            case -135:
                this.setVelocityX(Math.sqrt(8) * 150);
                this.setVelocityY(Math.sqrt(8) * -150);
                break;
            case -45.00000000000006:
                this.setVelocityX(Math.sqrt(8) * 150);
                this.setVelocityY(Math.sqrt(8) * 150);
                break;
            case -45:
                this.setVelocityX(Math.sqrt(8) * 150);
                this.setVelocityY(Math.sqrt(8) * 150);
                break;
            case 0:
                this.setVelocityY(4 * 150);
                break;
            case 45:
                this.setVelocityX(Math.sqrt(8) * -150);
                this.setVelocityY(Math.sqrt(8) * 150);
                break;
            case 135:
                this.setVelocityX(Math.sqrt(8) * -150);
                this.setVelocityY(Math.sqrt(8) * -150);
                break;
            case -90:
                this.setVelocityX(4 * 150);
                break;
            case 90:
                this.setVelocityX(4 * -150);

                break;

        }




    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.y <= this.inY - 1000 || this.y >= this.inY + 1000 || this.x <= this.inX - 1000 || this.x >= this.inX + 1000) {
            this.setActive(false);
            this.setVisible(false);
            hasShot = false;
        }

        if (delta % 20) {

            if (this.active == true) {
                var hit = false;
                if (this.shooter == playername) {
                    for (var name in opponent) {
                        if (this.x <= parseInt(opponent[name].x) + 40 && this.x >= parseInt(opponent[name].x) - 40 && this.y <= parseInt(opponent[name].y) + 40 && this.y >= parseInt(opponent[name].y) - 40) {
                            hit = true;
                            if (DEBUG) {
                                console.log("HIT" + name);
                            }

                            this.setActive(false);
                            this.setVisible(false);
                            opponent[name].health = opponent[name].health - damage;
                            oppHealthBar[name].displayWidth = opponent[name].health;

                            if (opponent[name].health <= 0) {
                                myScene.player.kills = parseInt(myScene.player.kills) + parseInt(1);
                                kill(opponent[name]);
                            }
                            else if (opponent[name].health <= 20) {
                                oppHealthBar[name].setTexture('Red-health');
                                bloodsplats[bloodcount] = myScene.add.image(opponent[name].x, opponent[name].y, 'blood').setScale((maxHealth - opponent[name].health) / 100);
                                bloodsplats[bloodcount].setDepth(9);
                                setTimeout(removeBlood, 2000, bloodcount);
                                bloodcount++;
                            }
                            else if (opponent[name].health <= 50) {
                                oppHealthBar[name].setTexture('Orange-health');
                                bloodsplats[bloodcount] = myScene.add.image(opponent[name].x, opponent[name].y, 'blood').setScale((maxHealth - opponent[name].health) / 100);
                                bloodsplats[bloodcount].setDepth(9);
                                setTimeout(removeBlood, 2000, bloodcount);
                                bloodcount++;
                            }
                            if (DEBUG) {
                                console.log("shooter: " + myScene.player.x + " , " + myScene.player.y);
                                console.log("damaged: " + opponent[name].x + " , " + opponent[name].y);
                            }


                            var shooterState = sendMessage(parseFloat(myScene.player.x), parseFloat(myScene.player.y), myScene.player.name, myScene.player.angle, myScene.player.health, myScene.player.kills, myScene.player.velocity);
                            var damagedState = sendMessage(parseFloat(opponent[name].x), parseFloat(opponent[name].y), opponent[name].name, opponent[name].angle, opponent[name].health, opponent[name].kills, opponent[name].velocity);



                            connection.send('hit', shooterState, damagedState);

                            if (DEBUG) {
                                console.log("shooter: " + myScene.player.x + " , " + myScene.player.y);
                                console.log("damaged: " + opponent[name].x + " , " + opponent[name].y);
                            }

                            hasShot = false;

                        }

                    }
                }

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
            frameQuantity: 15,
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

class BulletGroupOpp extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);
        //        this.shooter = name;
        this.createMultiple({
            classType: BulletOpp,
            frameQuantity: 15,
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

class BulletOpp extends Phaser.Physics.Arcade.Sprite {

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
                this.setVelocityY(4 * -150);
                break;
            case -135:
                this.setVelocityX(Math.sqrt(8) * 150);
                this.setVelocityY(Math.sqrt(8) * -150);
                break;
            case -45.00000000000006:
                this.setVelocityX(Math.sqrt(8) * 150);
                this.setVelocityY(Math.sqrt(8) * 150);
                break;
            case -45:
                this.setVelocityX(Math.sqrt(8) * 150);
                this.setVelocityY(Math.sqrt(8) * 150);
                break;
            case 0:
                this.setVelocityY(600);
                break;
            case 45:
                this.setVelocityX(Math.sqrt(8) * -150);
                this.setVelocityY(Math.sqrt(8) * 150);
                break;
            case 135:
                this.setVelocityX(Math.sqrt(8) * -150);
                this.setVelocityY(Math.sqrt(8) * -150);
                break;
            case -90:
                this.setVelocityX(4 * 150);
                break;
            case 90:
                this.setVelocityX(4 * -150);

                break;

        }




    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.y <= this.inY - 1000 || this.y >= this.inY + 1000 || this.x <= this.inX - 1000 || this.x >= this.inX + 1000) {
            this.setActive(false);
            this.setVisible(false);
            hasShot = false;
        }

        if (delta % 20) {

            if (this.active == true) {
                var hit = false;
                for (var name in opponent) {
                    if (this.shooter != name) {
                        if (this.x <= parseInt(opponent[name].x) + 40 && this.x >= parseInt(opponent[name].x) - 40 && this.y <= parseInt(opponent[name].y) + 40 && this.y >= parseInt(opponent[name].y) - 40) {
                            hit = true;

                            this.setActive(false);
                            this.setVisible(false);

                            hasShot = false;

                        }
                    }
                }
                if (myScene != null) {

                    if (this.shooter != playername && !hit) {
                        var thisScene = [];
                        thisScene = thisScene.concat(game.scene.scenes);
                        if (this.x <= thisScene[0].player.x + 40 && this.x >= thisScene[0].player.x - 40 && this.y <= thisScene[0].player.y + 40 && this.y >= thisScene[0].player.y - 40) {

                            this.setActive(false);
                            this.setVisible(false);

                            hasShot = false;
                        }
                    }
                }
            }
        }
    }
}



function bulletcallback(bullet, layer) {
    bullet.setActive(false);
    bullet.setVisible(false);
}


function kill(warlock) {

    var thisScene = [];

    thisScene = thisScene.concat(game.scene.scenes);
    if (warlock.name in opponent) {
        oppHealthBack[warlock.name].destroy();
        oppHealthBar[warlock.name].destroy();
        delete oppHealthBack[warlock.name];
        delete oppHealthBar[warlock.name];

        warlock.x = getXspawn();
        warlock.y = getYspawn();
        warlock.health = maxHealth;

        usernames[warlock.name].x = warlock.x - ((warlock.name.length / 2) * 10);
        usernames[warlock.name].y = warlock.y - 100;

        oppHealthBack[warlock.name] = thisScene[0].add.image(warlock.x, warlock.y - 70, 'healthBackground');
        oppHealthBar[warlock.name] = thisScene[0].add.image(warlock.x, warlock.y - 70, 'healthBar');
        oppHealthBar[warlock.name].displayWidth = maxHealth;
        oppHealthBack[warlock.name].displayWidth = maxHealth + 2;
        oppHealthBack[warlock.name].setDepth(30);
        oppHealthBar[warlock.name].setDepth(30);


    }
    // else if (warlock.name == playername) {
    //    healthBar.destroy();
    //    backgroundBar.destroy();

    //    warlock.x = getXspawn();
    //    warlock.y = getYspawn();
    //    warlock.health = maxHealth;


    //    backgroundBar = thisScene[0].add.image(warlock.x, warlock.y - 70, 'healthBackground');
    //    backgroundBar.fixedToCamera = true;
    //    backgroundBar.displayWidth = maxHealth + 2;

    //    healthBar = thisScene[0].add.image(warlock.x, warlock.y - 70, 'healthBar');
    //    healthBar.displayWidth = maxHealth;
    //    healthBar.fixedToCamera = true;

    //    backgroundBar.setDepth(30);
    //    healthBar.setDepth(30);
    //}



}

function updateText() {
    var playersTemp = new Object();
    playersTemp[myScene.player.name] = myScene.player.kills;
    for (var opp in opponent) {
        playersTemp[opponent[opp].name] = opponent[opp].kills;
    }

    var players = Object.keys(playersTemp).map(function (key) {
        return [key, playersTemp[key]];
    });

    players.sort(function (first, second) {
        return second[1] - first[1];
    });



    if (players.length >= 10) {
        var maxP = 10;
    } else {
        var maxP = players.length;
    }

    var i;
    var leads = "";
    var maxlength = 0;
    for (i = 0; i < maxP; i++) {
        var j = i + 1;
        if (players[i][0].length > maxlength)
        {
            maxlength = players[i][0].length;
        }
        if (j == 1) {
            leads = leads + j + "st: " + players[i][1] + " kills " + players[i][0] + "\n";
        }
        else if (j == 2) {
            leads = leads + j + "nd: " + players[i][1] + " kills " + players[i][0] + "\n";
        }
        else if (j == 3) {
            leads = leads + j + "rd: " + players[i][1] + " kills " + players[i][0] + "\n";
        }
        else {
            leads = leads + j + "th: " + players[i][1] + " kills " + players[i][0] + "\n";
        }
    }
    text.x = text.x - (maxlength * 5);
    text.setText("LEADERBOARD\n\n" + leads);
    
    textBack.displayHeight = (maxP * 30) + 150;
    textBack.displayWidth = (maxlength * 20) + (14 * 10);
    
    textBack.y = text.y + (textBack.displayHeight / 2);
    textBack.x = text.x + (textBack.displayWidth / 2) - 10;
    //return players.splice(0, maxP);
}

function getXspawn() {
    var min = Math.ceil(minSpawnX);
    var max = Math.floor(maxSpawnX);
    var ret = Math.floor(Math.random() * (max - min) + min);
    if (ret < minSpawnXC && ret > maxSpawnXC)
    {
        var min = Math.ceil(minSpawnXC);
        ret = Math.floor(Math.random() * (max - min) + min);
    }
    return ret;
}
function getYspawn() {
    var min = Math.ceil(minSpawnY);
    var max = Math.floor(maxSpawnY);
    var ret = Math.floor(Math.random() * (max - min) + min);
    if (ret < minSpawnYC && ret > maxSpawnYC) {
        var min = Math.ceil(minSpawnYC);
        ret = Math.floor(Math.random() * (max - min) + min);
    }
    return ret;
}


function setShot() {
    canShoot = true;
}

function endmask()
{
    mask.destroy();
    maskOff = true;
}

function removeBlood(bloodID)
{
    bloodsplats[bloodID].destroy();
    delete bloodsplats[bloodID];
}