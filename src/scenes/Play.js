class Play extends Phaser.Scene{
    constructor(){
        super("PlayScene");
    }

    preload() {
        // Loading temporary assets
        this.load.image('player', './assets/PlayerA.png');
        this.load.image('enemy', './assets/EnemyA.png');
        this.load.image('bottle', './assets/bottle.png');
        this.load.image('crackedBottle', './assets/bottleCrak.png');
        this.load.image('footprint', './assets/footPrint.png');

        this.load.image('lever', './assets/tempLever.png');
        this.load.image('door', './assets/tempDoor.png');

        this.load.audio('bottlePickup', './assets/glassBottlePickup.mp3');
        this.load.audio('bottleBreak', './assets/glassBottleBreak.mp3');
        this.load.audio('throw', './assets/throw.mp3');
        this.load.audio('footstep', './assets/footStep1.mp3');

        // loading tilemaps
        this.load.image('tiles', './assets/VignetteEscapeTileSet.png');
        this.load.tilemapTiledJSON('level1', './assets/Level1.json');
        this.load.tilemapTiledJSON('level2', './assets/Level2.json');
        this.load.tilemapTiledJSON('level3', './assets/Level3.json');
    }

    create() {
        // Variables for player being caught and if game over has been initiated
        this.playerCaught = false;
        this.gameOver = false;

        // Fade in transition
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        
        //assign sounds
        this.bottlePickupSound = this.sound.add('bottlePickup', {
            loop: false,
            volume: 0.5
        });
        this.bottleBreakSound = this.sound.add('bottleBreak', {
            loop: false,
            volume: 0.3
        });
        this.throwSound = this.sound.add('throw', {
            loop: false,
            volume: 1
        });
        this.footStepSound = this.sound.add('footstep', {
            loop: false,
            volume: 0.15
        });

        // Set cursors
        //cursors = this.input.keyboard.createCursorKeys();
        keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        pointer = this.input.activePointer;
        
        // Create bottle, wall, and enemy group
        this.bottleGroup = this.add.group();
        this.enemyGroup = this.add.group({
            runChildUpdate: true
        });

        // Add player
        this.player = new Player(this, 430, 510, 'player').setOrigin(0.5).setScale(0.5);
        this.player.depth = 1;
        
        // Setup each level
        switch(level){
            case 1:
                this.map = this.add.tilemap('level1');
                this.tileset = this.map.addTilesetImage('VignetteEscapeTileSet', 'tiles');
                this.backgroundLayer = this.map.createLayer('Background', this.tileset, 0, 0).setPipeline('Light2D');
                this.wallLayer = this.map.createLayer('Walls', this.tileset, 0, 0).setPipeline('Light2D');
                this.wallLayer.setCollisionByExclusion(-1, true);
                this.levelOneSetup();
                break;
            case 2:
                this.map = this.add.tilemap('level2');
                this.tileset = this.map.addTilesetImage('VignetteEscapeTileSet', 'tiles');
                this.backgroundLayer = this.map.createLayer("Background", this.tileset, 0, 0).setPipeline('Light2D');
                this.wallLayer = this.map.createLayer("Walls", this.tileset, 0, 0).setPipeline('Light2D');
                this.wallLayer.setCollisionByExclusion(-1, true);
                this.levelTwoSetup();
                break;
            case 3:
                // setup following camera
                this.cameras.main.setBounds(0, 0, 1080, 1080);
                this.cameras.main.startFollow(this.player);
                this.cameras.main.setLerp(0.1, 0.1);

                this.map = this.add.tilemap('level3');
                this.tileset = this.map.addTilesetImage('VignetteEscapeTileSet', 'tiles');
                this.backgroundLayer = this.map.createLayer('Background', this.tileset, 0, 0).setPipeline('Light2D');
                this.wallLayer = this.map.createLayer('Walls', this.tileset, 0, 0).setPipeline('Light2D');
                this.map.createLayer('Grass', this.tileset, 0, 0).setPipeline('Light2D');
                this.map.createLayer('Roads/Paths', this.tileset, 0, 0).setPipeline('Light2D');
                this.map.createLayer('Physical Objects', this.tileset, 0, 0).setPipeline('Light2D');
                this.wallLayer.setCollisionByExclusion(-1, true);
                this.levelThreeSetup();
                break;
        }

        // Set Collision between wall and player
        this.physics.add.collider(this.player, this.wallLayer);

        // Enables lights and sets ambient color
        this.lights.enable().setAmbientColor(0x333333);

        // Create lights (light0 is constant light around player, light1 for player footsteps, light2 for bottle, light3 for enemy footsteps)
        this.light0 = this.lights.addLight(this.player.x, this.player.y, 50).setColor(0xffffff).setIntensity(1);

        this.light1 = this.lights.addLight(this.player.x, this.player.y, 0).setColor(0xffffff).setIntensity(2);
        this.light1New = false;
        this.light1Radius = 0;

        this.light2 = this.lights.addLight(200, 200, 0).setColor(0xffffff).setIntensity(2);
        this.light2New = false;
        this.light2Radius = 0;

        this.light3 = this.lights.addLight(200, 200, 0).setColor(0xffffff).setIntensity(2);
        this.light3New = false;
        this.light3Radius = 0;


        // Bottle pick up text for UI
        this.bottlePickupText = this.add.bitmapText(45, 500, 'customFont', "picked up bottle", 32);
        this.bottlePickupText.setAlpha(0);

        // Will create a new footstep sound wave 
        this.waveSpawnTimer = this.time.addEvent({
            delay: 1400,
            callback: this.createFootstep,
            callbackScope: this,
            loop: true,
        });

        // Sets overlap between bottle and walls
        for (var i = 0; i < this.bottleGroup.getLength(); i++) {
            var update = this.bottleGroup.getChildren()[i];
            this.physics.add.collider(update, this.wallLayer, (update, wallLayer) => {
                update.hitWall();
            });
        }
    }

    // Setup for Level One
    levelOneSetup() {
        // Spawn Player, Bottles, and Enemies in the level
        this.player.x = 450;
        this.player.y = 510;
        this.newBottle(430, 460);
        this.newBottle(200, 350);
        this.newBottle(60, 276);
        this.newBottle(60, 126);
        this.newBottle(280, 64);
        this.spawnEnemy(485, 150, false, 2);
        this.spawnEnemy(443, 150, false, 2);

        // Spawn Exit
        var exit = new Wall(this, 500, 35, 'footprint', 30,30).setOrigin(0,0);
        exit.setAlpha(1);
        // Setup Collision between Exit and Player
        var collider = this.physics.add.overlap(this.player, exit, (player, exit) => {
                console.log("Level Complete");
                this.physics.world.removeCollider(collider);
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                    level++;
                    this.scene.start('LoadScene');
                })
        });
        //this.wallGroup.add(exit);
    }

    // Setup for Level Two
    levelTwoSetup() {
        // Spawn Player, Bottles, and Enemies in the level
        this.player.x = 20;
        this.player.y = 500;
        this.newBottle(60, 500);
        this.newBottle(400, 490);
        this.newBottle(415, 325);
        this.newBottle(500, 55);
        this.newBottle(450, 55);
        this.newBottle(400, 55);
        this.spawnEnemy(40, 165, true, 2, 3);
        this.spawnEnemy(232, 330, true, 3, 4);
        this.spawnEnemy(315, 175, false, 4);
        this.spawnEnemy(315, 215, false, 4);

        // Spawn Exit
        var exit = new Wall(this, 205, 15, 'footprint', 30,30).setOrigin(0,0);
        exit.setAlpha(1);
        // Setup Collision between Exit and Player
        var collider = this.physics.add.overlap(this.player, exit, (player, exit) => {
                console.log("Level Complete");
                this.physics.world.removeCollider(collider);
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                    level++;
                    this.scene.start('LoadScene');
                })
        });
    }

    levelThreeSetup(){
        this.player.x = 105;
        this.player.y = 1025;
        this.newLeverAndDoor(270, 515, 278, 465, 4);
    }

    // Creates New Bottles at set location (x, y)
    newBottle(x, y) {
        // Add bottle
        var bottle = new Bottle(this, x, y, 'bottle').setOrigin(0.5);
        bottle.setPipeline('Light2D');
        // Create collision check between player and bottle
        var collider = this.physics.add.overlap(this.player, bottle, (player, bottle) => {
            if (this.player.hasBottle() == false) {
                this.bottlePickupText.setAlpha(1);
                this.bottlePickupSound.play();
                this.player.pickedUpBottle();
                bottle.pickedUp();
                console.log("picked up bottle");
                this.physics.world.removeCollider(collider);
            }
        });
        this.bottleGroup.add(bottle);
    }

    // Spawns new enemies (roaming: true = yes, false = no)
    // (facing: up = 1, down = 2, left = 3, right = 4)
    spawnEnemy(PosX, PosY, roaming, facing){
        let enemy = new Enemy(this, PosX, PosY, 'enemy', roaming, facing);
        enemy.setScale(0.6);
        enemy.setPipeline('Light2D')
        switch(facing){
            case 1:
                break;
            case 2:
                enemy.angle = 180;
                break;
            case 3:
                enemy.angle = -90;
                break;
            case 4:
                enemy.angle = 90;
                break;
        }
        // player and enemy collision will cause a game over
        this.physics.add.overlap(this.player, enemy, () => {
            if(!this.playerCaught){
                this.playerCaught = true;
            }
        });
        
        // enemy turn around if collided with a wall
        if(roaming){
            this.physics.add.collider(enemy, this.wallLayer, (enemy) => {
                enemy.turnAround();
            })
        }
        this.enemyGroup.add(enemy);
    }

    // Creates a door and a lever that open/closes that door
    // (facing: up = 1, down = 2, left = 3, right = 4)
    newLeverAndDoor(leverX, leverY, doorX, doorY, facing) {
        var door = new Door(this, doorX, doorY, 'door');
        var lever = new Lever(this, leverX, leverY, 'lever');
        door.setPipeline('Light2D')
        lever.setPipeline('Light2D')
        switch(facing){
            case 1:
                break;
            case 2:
                door.angle = 180;
                lever.angle = 180;
                break;
            case 3:
                door.angle = -90;
                door.rotateHitbox();
                lever.angle = -90;
                lever.rotateHitbox();
                break;
            case 4:
                door.angle = 90;
                door.rotateHitbox();
                lever.angle = 90;
                lever.rotateHitbox();
                break;
        }
        var collider = this.physics.add.collider(this.player, door);
        this.physics.add.overlap(this.player, lever, () => {
            if(keyE.isDown && lever.isPlayerUsing() == false) {
                // Play lever animation with a delay on the next time you can use the lever 
                lever.useLever(this.time);
                // Play door animation and set the door state
                door.openCloseDoor();
                // If the door is closed, add the collider else the door is open - remove the collider
                if(door.isOpen() == false) {
                    this.physics.add.collider(this.player, door);
                } else {
                    this.physics.world.removeCollider(collider);
                }
            }
        });
    }

    //generates player footsteps
    createFootstep(){
        this.light1New = true;
        this.light1Radius = 0;
        this.light1.setPosition(this.player.x, this.player.y);
        this.time.addEvent({
            delay: 700,
            callback: () => {
                this.light1New = false;
            }
        })
        this.footStepSound.play();
        console.log("footstep created");
    }

    // generates bottle sound wave
    createBottleWave(bottle){
        this.light2New = true;
        this.light2Radius = 0;
        this.light2.setPosition(bottle.x, bottle.y);
        this.bottleBreakSound.play();
        this.time.addEvent({
            delay: 1200,
            callback: () => {
                this.light2New = false;
            }
        })

        console.log("bottle wave created");
    }

    // generates enemy footsteps
    createEnemyFootstep(enemy){ 
        this.light3New = true;
        this.light3Radius = 0;
        this.light3.setPosition(enemy.x, enemy.y);
        this.time.addEvent({
            delay: 250,
            callback: () => {
                this.light3New = false;
            }
        })
    }

    update() {
        // End game when player gets caught
        if(!this.gameOver && this.playerCaught){
            console.log("death fade out")
            this.gameOver = true;
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('GameOverScene');
            })
        }

        // Updates player
        this.player.update();

        // Update bottles in bottle group
        for (var i = 0; i < this.bottleGroup.getLength(); i++) {
            var update = this.bottleGroup.getChildren()[i];
            update.update(this.player.x, this.player.y);

            // If bottle has been thrown
            if(update.hasThrown() == true) {
                this.player.thrownBottle();
                this.bottlePickupText.setAlpha(0);
                //this.throwSound.play();
                // Set a delay for throwing the next bottle
                for (var j = 0; j < this.bottleGroup.getLength(); j++) {
                    var delayCall = this.bottleGroup.getChildren()[j];
                    delayCall.delay(this.time);
                }
            }
            // checks if bottle has landed
            if(update.landedCheck()){
                console.log('bottle landed');
                // Add cracked bottle where the bottle lands
                this.add.image(update.bottleX(), update.bottleY(), 'crackedBottle');
                if(!this.light2New){
                    this.createBottleWave(update);
                }
            }
        }

        // Keep Light0 on player
        this.light0.x = this.player.x;
        this.light0.y = this.player.y;

        // Wave effect for Footstep Lights
        if(this.light1New){
            this.light1Radius += 1.8
            this.light1.setRadius(this.light1Radius);
        } else {
            this.light1Radius -= 1.8
            this.light1.setRadius(this.light1Radius);
            if(this.light1Radius <= 0){
                this.light1.setRadius(0);
            }
        } 

        // Wave effect for Bottle Lights
        if(this.light2New){
            this.light2Radius += 1.8
            this.light2.setRadius(this.light2Radius);
        } else {
            this.light2Radius -= 1.8
            this.light2.setRadius(this.light2Radius);
            if(this.light2Radius <= 0){
                this.light2.setRadius(0);
            }
        }

        // Wave effect for Enemy Lights
        if(this.light3New){
            this.light3Radius += 1.8
            this.light3.setRadius(this.light3Radius);
        } else {
            this.light3Radius -= 1.8
            this.light3.setRadius(this.light3Radius);
            if(this.light3Radius <= 0){
                this.light3.setRadius(0);
            }
        }
    
        if(keySPACE.isDown){
            console.log(this.player.x);
            console.log(this.player.y);
        } 
    }
}