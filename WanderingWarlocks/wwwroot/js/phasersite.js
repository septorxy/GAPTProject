
//Boolean constant that controls DEBUG mode
const DEBUG = false;

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


var map;
var interactivelayer;

var game;
var text;
var textBack;
var cursors;
var keys;
var username;

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


//On connection start call method start Game 
connection.start()
    .then(() => startGame())
    .catch(error => console.error(error.message));

//On Conection end Show the error
function onConnectionError(error) {
    if (error && error.message) {
        if (DEBUG)
        {
            console.log("ENTERED hub onconnectionError");
        }
        console.error(error.message);
    }
}


//Function creating JSON to be sent to Hub
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
    //Function initiated whenever a broadcast message is received
    var broadcastCallback = function (type, inJSON) {
        var inMessage = JSON.parse(inJSON);
        if (!type) { return; }
        
        //New Player Joined game
        if (type === "newPlayer") {
            if (inMessage.key == playername) {
                return;
            }
            
            //Getting the scene
            var thisScene = [];
            thisScene = thisScene.concat(game.scene.scenes);
            
            //Adding Sprite and updating all information of the sprite
            opponent[inMessage.key] = thisScene[0].add.sprite(inMessage.x, inMessage.y, 'Down-opp-walkl').setScale(scale);
            opponent[inMessage.key].name = inMessage.key;
            opponent[inMessage.key].health = 100;
            opponent[inMessage.key].angle = inMessage.angle;
            opponent[inMessage.key].kills = 0;
            opponent[inMessage.key].playing = false;
            opponent[inMessage.key].mySpeed = inMessage.velocity;
            opponent[inMessage.key].anims.load('owalk');
            opponent[inMessage.key].anims.load('orun');
            
            //Adding Sprite health bar
            oppHealthBack[inMessage.key] = thisScene[0].add.image(inMessage.x, inMessage.y - 70, 'healthBackground');
            oppHealthBar[inMessage.key] = thisScene[0].add.image(inMessage.x, inMessage.y - 70, 'healthBar');
            oppHealthBar[inMessage.key].displayWidth = maxHealth;
            oppHealthBack[inMessage.key].displayWidth = maxHealth + 2;
            oppHealthBack[inMessage.key].setDepth(30);
            oppHealthBar[inMessage.key].setDepth(30);
            
            //Adding Sprite username
            usernames[inMessage.key] = thisScene[0].add.text(opponent[inMessage.key].x - ((inMessage.key.length / 2) * 10), opponent[inMessage.key].y - 100, inMessage.key);
            usernames[inMessage.key].alpha = 0.5;
            usernames[inMessage.key].setDepth(30);

            if (DEBUG) {
                console.log("After added new player: " + opponent[inMessage.key].toString());
            }
        }
        
        //Player State changed
        if (type === "updatePlayer") {
            
            //Updating all opponent information
            opponent[inMessage.key].x = inMessage.x;
            opponent[inMessage.key].y = inMessage.y;
            opponent[inMessage.key].health = inMessage.health;
            opponent[inMessage.key].angle = inMessage.angle;
            opponent[inMessage.key].kills = inMessage.kills;
            opponent[inMessage.key].mySpeed = inMessage.velocity;

            //Setting the running or walking animation depending on velocity
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
                //Stopping animation when velocity is 0
                opponent[inMessage.key].anims.stop();
                opponent[inMessage.key].playing = false;
            }
            
            //Getting scene
            var thisScene = [];
            thisScene = thisScene.concat(game.scene.scenes);

            //Updating opponent health bar
            oppHealthBack[inMessage.key].x = inMessage.x;
            oppHealthBack[inMessage.key].y = inMessage.y - 70;
            oppHealthBar[inMessage.key].x = inMessage.x;
            oppHealthBar[inMessage.key].y = inMessage.y - 70;

            //Updating opponent username
            usernames[inMessage.key].x = opponent[inMessage.key].x - ((inMessage.key.length / 2) * 10);
            usernames[inMessage.key].y = opponent[inMessage.key].y - 100;

        }
        //When a player disconnects 
        if (type === "disconnection") {

            if (DEBUG)
            {
                console.log("Disconnection signal received for player: " + inMessage.key);
            }
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
        //When a player shoots
        if (type === "shooting") {
            //check if shooting is from opponent
            if (opponent.hasOwnProperty(inMessage.key)) {
                
                //Get scene
                var thisScene = [];
                thisScene = thisScene.concat(game.scene.scenes);
                
                //Chack if the scene has been created yet
                if (thisScene[0] != null) {
                    
                    //Creating an opponent bullet group 
                    thisScene[0].bulletGroupOpp = new BulletGroupOpp(thisScene[0], inMessage.key);
                    thisScene[0].bulletGroupOpp.setDepth(10);
                    thisScene[0].bulletGroupOpp.fireBullet(inMessage.x - 20, inMessage.y - 20, inMessage.angle, inMessage.key);
                    thisScene[0].physics.add.collider(thisScene[0].bulletGroupOpp, interactivelayer, bulletcallback);
                    hasShot = true;
                }
            }
        }
    }
    
    //Function for when this clint joins game to get all players currently playing
    var playerCallback = function (inOpp) {
        if (DEBUG) {
            console.log("entered playercallback");
        }
        
        //If at beginning of game
        if (begining) {
            var temp;
            var i;
            if (DEBUG) {
                console.log(inOpp.length);
            }
            
            //Loop through array and handle each JSON signifying an opponent
            for (i = 0; i < inOpp.length; i++) {
                temp = JSON.parse(inOpp[i]);

                //Making sure the opponent is not the player themself and the name is not already saved 
                if (playername != temp.key && uniquename(temp.key)) {
                    //Get scene
                    var thisScene = [];
                    thisScene = thisScene.concat(game.scene.scenes);

                    //Add and set opponent object 
                    opponent[temp.key] = thisScene[0].add.sprite(temp.x, temp.y, 'Down-opp-walkl').setScale(scale);
                    opponent[temp.key].name = temp.key;
                    opponent[temp.key].angle = temp.angle;
                    opponent[temp.key].health = temp.health;
                    opponent[temp.key].kills = temp.kills;
                    opponent[temp.key].kills = temp.kills;
                    opponent[temp.key].playing = false;
                    opponent[temp.key].setDepth(10);
                    
                    //Add and set opponent Health bar
                    oppHealthBack[temp.key] = thisScene[0].add.image(temp.x, temp.y - 70, 'healthBackground');
                    oppHealthBar[temp.key] = thisScene[0].add.image(temp.x, temp.y - 70, 'healthBar');
                    oppHealthBar[temp.key].displayWidth = maxHealth;
                    oppHealthBack[temp.key].displayWidth = maxHealth + 2;
                    oppHealthBack[temp.key].setDepth(30);
                    oppHealthBar[temp.key].setDepth(30);

                    //Add and set opponent username
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
    
    //Function for when a hit happens
    var hitCallback = function (inShooterJSON, inDamagedJSON) {
        var inShooter = JSON.parse(inShooterJSON);
        var inDamaged = JSON.parse(inDamagedJSON);
        
        //updating the shooter data
        opponent[inShooter.key].x = parseFloat(inShooter.x);
        opponent[inShooter.key].y = parseFloat(inShooter.y);
        opponent[inShooter.key].angle = inShooter.angle;
        opponent[inShooter.key].health = inShooter.health;
        opponent[inShooter.key].kills = inShooter.kills;

        if (DEBUG) {
            console.log("IN HIT CALLBACK");
        }
        
        //Check if this player is hit
        if (inDamaged.key == playername) {
            var thisScene = [];
            thisScene = thisScene.concat(game.scene.scenes);
            
            //update player details
            thisScene[0].player.health = inDamaged.health;
            healthBar.displayWidth = thisScene[0].player.health;
            thisScene[0].player.x = parseFloat(inDamaged.x);
            thisScene[0].player.y = parseFloat(inDamaged.y);
            thisScene[0].player.angle = inDamaged.angle;
            thisScene[0].player.kills = inDamaged.kills;
            //If the red maks is not already active set it 
            if (maskOff) {
                maskOff = false;
                mask = thisScene[0].add.graphics();
                mask.setDepth(35);
                mask.fillStyle(0xFF0000, 0.2);
                mask.fillRect(thisScene[0].player.x - (window.innerWidth / 2), thisScene[0].player.y - (window.innerHeight / 2), window.innerWidth + 10, window.innerHeight + 10);
                //Timeout initiates function to remove the mask 
                setTimeout(endmask, 175);
            }

            //Update healthbar and bloodsplat depending on health 
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
        
        //else if opponent was hit do the same thing you did to the player but to the opponent
        else {
            opponent[name].health = inDamaged.health;
            oppHealthBar.displayWidth = myScene.player.health;
            opponent[name].x = parseFloat(inDamaged.x);
            opponent[name].y = parseFloat(inDamaged.y);
            opponent[name].angle = inDamaged.angle;
            opponent[name].kills = inDamaged.kills;

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

    //sets the functions called when receiving messages from the respective tasks
    connection.on('broadcastMessage', broadcastCallback, 0);
    connection.on('getPlayers', playerCallback, 0);
    connection.on('hit', hitCallback, 0);
    connection.onclose(onConnectionError);
}

//Function to check if a name is in opponent dictionary
function uniquename(name) {
    if (opponent.hasOwnProperty(name)) {
        return false;
    }

    return true;
}


//Function that creates the game object and gets the current opponents
function startGame() {
    game = new Phaser.Game(config);

    //populate opponent array
    connection.send('getPlayers', temporary);


}

//Config used to create game object
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




//Game preload function 
function preload() {
    //get camera dimensions
    var width = this.cameras.main.width;
    var height = this.cameras.main.height;
    
    
    //Creates progress bar graphics object for loading screen
    var progressBox = this.add.graphics();
    var progressBar = this.add.graphics();
    progressBox.fillStyle(0x8D5524);
    progressBox.fillRect((width / 2) - (160), (height / 2) - 30, 320, 50);

    //Sets new text objects
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

    //Setting function for when progress is made
    this.load.on('progress', function (value) {
        percentText.setText(parseInt(value * 100) + '%');
        progressBar.clear();
        progressBar.fillStyle(0x069a55);
        progressBar.fillRect((width / 2) + 10 - 160, (height / 2) - 20, 300 * value, 30);
    });

    //setting function for when a new file is being loaded to display on screen
    this.load.on('fileprogress', function (file) {
        assetText.setText('Loading asset: ' + file.key);
    });

    //Function for when loading is complete and removes all objects
    this.load.on('complete', function () {
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
        percentText.destroy();
        assetText.destroy();
    });

   
    //Loading assets to game
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


//Game Create function
function create() {
    //gets username from html which was set from the login 
    name = document.getElementById("name").innerHTML;
    //sets myScene to this scene as we have one scene
    myScene = this;
    //Updates this.opponents to oppoenet array so that all players are in game object
    this.opponents = opponent;

    //sets all opponent textures now that they loaded
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



    //Creating player and opponent animations
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



    //Create plyer sprite and set name
    this.player = this.physics.add.sprite(getXspawn(), getYspawn(), 'Down-warlock-walkl').setScale(scale);
    this.player.name = name;
    playername = name;
    
    //load animations to sprite
    this.player.anims.load('dwalk');
    this.player.anims.load('drun');

    //setting healt and kills to their initial state values
    this.player.health = maxHealth;
    this.player.kills = 0;

    //Creating and setting up healthbar and username of player
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

    //Creating bulletgroup for player
    this.bulletGroup = new BulletGroup(this);

    //Setting cursors which monitor up,down,left,right,space keys
    cursors = this.input.keyboard.createCursorKeys();

    //Creating keys and adding WASDQP keys to be monitored (P is only used when debugging)
    keys = this.input.keyboard.addKeys(
        {
            W: 'W',
            A: 'A',
            S: 'S',
            D: 'D',
            Q: 'Q', 
            P: 'P'
        });

    //Setting the camera to follow the player
    camera = this.cameras.main;
    camera.startFollow(this.player);

    //Creates event listener for a left click to initiate a shoot
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


    //Create map
    var map = this.make.tilemap({ key: 'map' });
    //Add Tileset to map
    var tileset = map.addTilesetImage('MyTilesSet', 'tiles');
    //Create layers 
    var groundlayer = map.createLayer('ground', tileset, 0, 0);
    interactivelayer = map.createLayer('Interactive', tileset, 0, 0);
    var skylayer = map.createLayer('Sky', tileset, 0, 0);

    //set interactive layer properties from JSON for the tiles that have the collide property set to true
    interactivelayer.setCollisionByProperty({ Collide: true });

    //Add colliders for the player to the collision objects 
    this.physics.add.collider(this.player, interactivelayer);
    //and one for bullets to the collision object which calls a function on collision
    this.physics.add.collider(this.bulletGroup, interactivelayer, bulletcallback);

    //Ensuring the sky layer is higher than the player to allow the player to hide underneth it
    this.player.setDepth(10);
    skylayer.setDepth(20);

    //Send new player message to hub
    var outMessage = sendMessage(this.player.x, this.player.y, this.player.name, this.player.angle, this.player.health, this.player.kills, this.player.velocity);
    if (outMessage) {

        connection.send('broadcastMessage', "newPlayer", outMessage, cacheCount);
    }
    updated = true;

    //Create text for the leaderboard
    text = this.add.text(0, 0, "", {
        font: "25px Arial",
        align: "center"
    });
    //Add image for leaderboard background
    textBack = this.add.image(0, 0, 'leaderboard');

    //Set properties of leaderboard
    text.setPadding(15, 15);
    text.visible = false;
    text.setDepth(30);
    textBack.visible = false;
    textBack.setDepth(29);

}



//Game Update Function
function update() {

    if (DEBUG)
    {
        //In DEBUG mode key P logs the player's x and y coordinate
        if (keys.P.isDown)
        {
            console.log("Player: " + this.player.x + " , " + this.player.y );
        }
    }
    
    //Sets the prev x and y coordinates ever 10 frames 
    if (updated) {
        curX = this.player.x;
        curY = this.player.y;
    }
    this.opponents = opponent;
    var i;

    
    //Shoots if space bar is down 
    if (cursors.space.isDown) {
        if (canShoot) {
            this.bulletGroup.fireBullet(this.player.x - 20, this.player.y - 20, this.player.angle, this.player.name);
            canShoot = false;
            setTimeout(setShot, 500);
            connection.send('broadcastMessage', "shooting", sendMessage(this.player.x, this.player.y, this.player.name, this.player.angle, this.player.health, this.player.kills, this.player.velocity), cacheCount);
        }
    }

    //Resets velocit
    this.player.setVelocity(0);
    this.player.velocity = 0;

    //Check for running and updates animation
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
    
    //Handles player angle and speed depending on what keys are being pressed in what combinations
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

    //Updates healthbar and username
    backgroundBar.x = this.player.x;
    backgroundBar.y = this.player.y - 70;
    healthBar.x = this.player.x;
    healthBar.y = this.player.y - 70;
    username.x = this.player.x - ((playername.length / 2)*10);
    username.y = this.player.y - 100;
    
    //If a mask is active updates the mask's location
    if (!maskOff)
    {
        mask.destroy();
        mask = this.add.graphics();
        mask.setDepth(35);
        mask.fillStyle(0xFF0000, 0.2);
        mask.fillRect(this.player.x - (window.innerWidth / 2), this.player.y - (window.innerHeight / 2), window.innerWidth + 10, window.innerHeight + 10);

    }

    //If leaderboard is active update location of the leaderboard
    if (textBack.visible)
    {
        text.x = (this.player.x + window.innerWidth / 2) - 400;
        text.y = (this.player.y - window.innerHeight / 2) + 20;
        textBack.x = (this.player.x + window.innerWidth / 2) - 400;
        textBack.y = (this.player.y - window.innerHeight / 2) + 20;

    }

    //Update opponent healthbars 
    for (var name in opponent) {
        
        oppHealthBack[name].x = opponent[name].x;
        oppHealthBack[name].y = opponent[name].y - 70;
        oppHealthBar[name].x = opponent[name].x;
        oppHealthBar[name].y = opponent[name].y - 70;
    }

    
    //checks if player moved 10 frames
    if (curX > this.player.x + 10 || curX < this.player.x + -10 || curY > this.player.y + 10 || curY < this.player.y - 10) {
        //Plays music on first step
        if (firstMove) {
            document.getElementById('music').play();
            firstMove = false;
        }
        //Send update player message
        connection.send('broadcastMessage', "updatePlayer", sendMessage(this.player.x, this.player.y, this.player.name, this.player.angle, this.player.health, this.player.kills, this.player.velocity), cacheCount);
        //sets cache count to update cache at a set interval
        if (cacheCount < cacheInterval) { cacheCount++; } else { cacheCount = 0; }
        updated = true;
    }
    else {
        updated = false;
    }
    
    //Update leaderboard text if it is visible
    if (textBack.visible) {
        updateText();
    }

    //Toggle leaderboard on key Q
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

//bullet class of player that sets the properties of the bullet when created 
class Bullet extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {
        super(scene, x, y, 'lightning');
        this.scene = scene;
        this.shooter = "";
        this.inX = x;
        this.inY = y;
    }
    
    //fire method called when player wants to shoot, makes the bullet visible on screen and sets the bullet's velocity and angle
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

        //fires the bullet at the angle that the player is currently in
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

    //function that runs every time before the update function
    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        //checks if the bullet has travelled a certain length, if so removes it from the screen
        if (this.y <= this.inY - 1000 || this.y >= this.inY + 1000 || this.x <= this.inX - 1000 || this.x >= this.inX + 1000) {
            this.setActive(false);
            this.setVisible(false);
            hasShot = false;
        }

        //the following code is executed every 20 frames for optimisation purposes
        if (delta % 20) {

            if (this.active == true) {
                var hit = false;
                if (this.shooter == playername) {

                    //if the bullet is still visible and the player has shot, check if the bullet has hit an opponent
                    for (var name in opponent) {
                        if (this.x <= parseInt(opponent[name].x) + 40 && this.x >= parseInt(opponent[name].x) - 40 && this.y <= parseInt(opponent[name].y) + 40 && this.y >= parseInt(opponent[name].y) - 40) {
                            hit = true;
                            if (DEBUG) {
                                console.log("HIT" + name);
                            }
                            
                            //remove bullet from the game
                            this.setActive(false);
                            this.setVisible(false);

                            //decrease opponent's health and update the health bar
                            opponent[name].health = opponent[name].health - damage;
                            oppHealthBar[name].displayWidth = opponent[name].health;

                            //checks if opponent is killed, if so update the player's kills and respawn opponent with full health
                            if (opponent[name].health <= 0) {
                                myScene.player.kills = parseInt(myScene.player.kills) + parseInt(1);
                                kill(opponent[name]);
                            }
                            //changes the colour of the health bar to red and displays blood splatter if opponent's health is less than 20
                            else if (opponent[name].health <= 20) {
                                oppHealthBar[name].setTexture('Red-health');
                                bloodsplats[bloodcount] = myScene.add.image(opponent[name].x, opponent[name].y, 'blood').setScale((maxHealth - opponent[name].health) / 100);
                                bloodsplats[bloodcount].setDepth(9);
                                setTimeout(removeBlood, 2000, bloodcount);
                                bloodcount++;
                            }
                            //changes the colour of the health bar to orange and displays blood splatter if opponent's health is less than 50
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

                            //creates the JSON object with the player's updated state
                            var shooterState = sendMessage(parseFloat(myScene.player.x), parseFloat(myScene.player.y), myScene.player.name, myScene.player.angle, myScene.player.health, myScene.player.kills, myScene.player.velocity);
                            //creates the JSON object with the opponent's updated state
                            var damagedState = sendMessage(parseFloat(opponent[name].x), parseFloat(opponent[name].y), opponent[name].name, opponent[name].angle, opponent[name].health, opponent[name].kills, opponent[name].velocity);


                            //send the message to the hub with opponent's and player's updated states
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

//class defining the player's group of bullets so they can be created and manipulated when the player shoots
class BulletGroup extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);
        this.createMultiple({
            classType: Bullet,
            frameQuantity: 15,
            active: false,
            visible: false,
            key: 'bullet',
            setScale: { x: 0.5, y: 0.5 }
        });
    }
    
    //method that is called whenever the player wants to shoots a bullet
    fireBullet(x, y, angle, name) {
        const bullet = this.getFirstDead(false);         if (bullet) {
            bullet.setDepth(10);
            //fire method in the bullet class is called and the player's  coordinates, angle and name are passed
            bullet.fire(x, y, angle, name);
        }
    }
}

//class defining the opponent's group of bullets so they can be created and manipulated when the opponent shoots
class BulletGroupOpp extends Phaser.Physics.Arcade.Group {
    constructor(scene) {
        super(scene.physics.world, scene);
        this.createMultiple({
            classType: BulletOpp,
            frameQuantity: 15,
            active: false,
            visible: false,
            key: 'bullet',
            setScale: { x: 0.5, y: 0.5 }
        });
    }

    //method that is called whenever the opponent wants to shoots a bullet
    fireBullet(x, y, angle, name) {
        const bullet = this.getFirstDead(false);         if (bullet) {
            bullet.setDepth(10);
            //fire method in the bullet class is called and the opponent's coordinates, angle and name are passed
            bullet.fire(x, y, angle, name);
        }
    }
}

/*
bullet class of opponent that sets the properties of the bullet when created - different
 bullet classes are necessary because the player bullet does functionality like changing the
 health bar and increasing the kills while the opponent's bullet is just for showing the bullets
on screen
*/
class BulletOpp extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {
        super(scene, x, y, 'lightning');
        this.scene = scene;
        this.shooter = "";
        this.inX = x;
        this.inY = y;
    }

     //fire method called when opponent wants to shoot, makes the bullet visible on screen and sets the bullet's velocity and angle
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

        //fires the bullet at the angle that the opponent is currently in
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

    //function that runs every time before the update function
    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        //checks if the bullet has travelled a certain length, if so removes it from the screen
        if (this.y <= this.inY - 1000 || this.y >= this.inY + 1000 || this.x <= this.inX - 1000 || this.x >= this.inX + 1000) {
            this.setActive(false);
            this.setVisible(false);
            hasShot = false;
        }

        //the following code is executed every 20 frames for optimisation purposes
        if (delta % 20) {

            if (this.active == true) {
                var hit = false;

                    //if the bullet is still visible and the opponent has shot, check if the bullet has hit another opponent
                for (var name in opponent) {
                    if (this.shooter != name) {
                        if (this.x <= parseInt(opponent[name].x) + 40 && this.x >= parseInt(opponent[name].x) - 40 && this.y <= parseInt(opponent[name].y) + 40 && this.y >= parseInt(opponent[name].y) - 40) {
                            hit = true;

                            //remove bullet from the game
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

                        //check if an opponent's bullet has hit the player, if so remove the bullet from the screen
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
    //remove bullet from the game
    bullet.setActive(false);
    bullet.setVisible(false);
}

//this method is called whenever the player's/opponent's health goes below 0
function kill(warlock) {

    var thisScene = [];

    thisScene = thisScene.concat(game.scene.scenes);

    //if the warlock that is killed is an opponent  
    if (warlock.name in opponent) {

        //remove the healthbar from the screen
        oppHealthBack[warlock.name].destroy();
        oppHealthBar[warlock.name].destroy();
        delete oppHealthBack[warlock.name];
        delete oppHealthBar[warlock.name];

        //respawn the warlock to a new location and set its health to 100
        warlock.x = getXspawn();
        warlock.y = getYspawn();
        warlock.health = maxHealth;

        //display the username in the player's new location
        usernames[warlock.name].x = warlock.x - ((warlock.name.length / 2) * 10);
        usernames[warlock.name].y = warlock.y - 100;

        //display the health bar in the player's new location with full health
        oppHealthBack[warlock.name] = thisScene[0].add.image(warlock.x, warlock.y - 70, 'healthBackground');
        oppHealthBar[warlock.name] = thisScene[0].add.image(warlock.x, warlock.y - 70, 'healthBar');
        oppHealthBar[warlock.name].displayWidth = maxHealth;
        oppHealthBack[warlock.name].displayWidth = maxHealth + 2;
        oppHealthBack[warlock.name].setDepth(30);
        oppHealthBar[warlock.name].setDepth(30);


    }

}

//This method is called to set the text for the leaderboard
function updateText() {
    //populate playersTemp dictionary with the kills of all of the players in the game
    var playersTemp = new Object();
    playersTemp[myScene.player.name] = myScene.player.kills;
    for (var opp in opponent) {
        playersTemp[opponent[opp].name] = opponent[opp].kills;
    }

    //converts the map to an array
    var players = Object.keys(playersTemp).map(function (key) {
        return [key, playersTemp[key]];
    });

    //sort player display according to most kills
    players.sort(function (first, second) {
        return second[1] - first[1];
    });

    /* setting the value of maxP to the number of players in the game, if it is more 
    than 10 maxP is set to 10 (used to display top 10 players on leaderboard)*/
    if (players.length >= 10) {
        var maxP = 10;
    } else {
        var maxP = players.length;
    }

    //the following code displays the leaderboard and information inside it and formats it accordingly 
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
}

/* The following two methods return the X and Y coordinate of the player's/opponent's 
new location and assures that it is in the area of the castle but not on the castle itself.
 This method is called when a player/opponent is killed */
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

//called in timeout after shooting to limit amout of shots a person can do at a time
function setShot() {
    canShoot = true;
}

//called in timeout after mask is set to destroy mask after a set amount of time
function endmask()
{
    mask.destroy();
    maskOff = true;
}

//called in timeout after bloodsplat created to remove bloodsplat after a certain amount of time
function removeBlood(bloodID)
{
    bloodsplats[bloodID].destroy();
    delete bloodsplats[bloodID];
}
