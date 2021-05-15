class Play extends Phaser.Scene{
    constructor(){
        super("PlayScene");
    }

    preload() {
        // Loading temporary assets
        this.load.image('map1', './assets/Map01.png');
        this.load.image('map2', './assets/Map02.png');
        this.load.image('player', './assets/PlayerA.png');
        this.load.image('wave', './assets/wave2.png');
        this.load.image('bottle', './assets/bottle.png');
        this.load.image('wall', './assets/wallTest.png')
    }

    create() {

        // Fade in transition and camera zoom
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        //this.cameras.main.setZoom(0.5);

        // Set cursors
        //cursors = this.input.keyboard.createCursorKeys();
        keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        pointer = this.input.activePointer;

        // Enables lights and sets ambient color
        this.lights.enable().setAmbientColor(0x000000);
        //this.lights.enable();
        this.radiuslight = 10;
        
        // Add bottle Group
        this.bottleGroup = this.add.group({
            //runChildUpdate: true
        });

        // Add player
        this.player = new Player(this, 430, 510, 'player').setOrigin(0.5).setScale(0.5);
        this.player.depth = 1;

        // Setup each level
        switch(level){
            case 1:
                this.background = this.add.image(0, 0, 'map1').setOrigin(0);
                this.levelOneSetup();
                break;
            case 2:
                this.background = this.add.image(0, 0, 'map2').setOrigin(0);
                this.levelTwoSetup();
                break;
        }
        this.background.setPipeline('Light2D');
        

        // Create lights (light1 for player footsteps, light2 for enemy footsteps, light3 for bottle)
        this.light1 = this.lights.addLight(this.player.x, this.player.y, 0).setColor(0xffffff).setIntensity(3);
        this.light1New = true;
        this.light1Radius = 0;

        this.light2 = this.lights.addLight(200, 200, 0).setColor(0xffffff).setIntensity(3);
        this.light2New = false;
        this.light1Radius = 0;

        // Will create a new footstep sound wave every 2 seconds
        /*this.waveSpawnTimer = this.time.addEvent({
            delay: 1000,
            callback: this.createFootstep,
            callbackScope: this,
            loop: true,
        });
        */
    }

    levelOneSetup() {
        this.newBottle(430, 460);
        this.newBottle(200, 350);
        this.wall1 = new Wall(this, -270,585, 'wall', 745, 225).setOrigin(0,0);
        this.physics.add.collider(this.player, this.wall1);
    }

    // Creates New Bottles at set location (x, y)
    newBottle(x, y) {
        // Add bottle
        var bottle = new Bottle(this, x, y, 'bottle', this.player).setOrigin(0.5);
        // Create collision check between player and bottle
        var collider = this.physics.add.overlap(this.player, bottle, (player, bottle) => {
            if (this.player.hasBottle() == false) {
                this.player.pickedUpBottle();
                bottle.pickedUp();
                console.log("picked up bottle");
                this.physics.world.removeCollider(collider);
            }
        });
        this.bottleGroup.add(bottle);
    }

    //generates footsteps
    createFootstep(){
        this.light1New = true;
        this.light1Radius = 0;
        this.light1.setPosition(this.player.x, this.player.y);
        this.time.addEvent({
            delay: 800,
            callback: () => {
                this.light1New = false;
            }
        })
        // Play audio footstep
        console.log("footstep created");
    }

    // generates bottle sound wave
    createBottleWave(bottle){
        this.light2New = true;
        this.light2Radius = 0;
        this.light2.setPosition(bottle.x, bottle.y);
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.light2New = false;
            }
        })

        console.log("bottle wave created");
    }

    update() {
        this.player.update();

        // Update bottles in bottle group
        for (var i = 0; i < this.bottleGroup.getLength(); i++) {
            var update = this.bottleGroup.getChildren()[i];
            update.update(this.player.x, this.player.y);
            // If bottle has been thrown
            if(update.hasThrown() == true) {
                this.player.thrownBottle();
                // Set a delay for throwing the next bottle
                for (var j = 0; j < this.bottleGroup.getLength(); j++) {
                    var delayCall = this.bottleGroup.getChildren()[j];
                    delayCall.delay(this.time);
                }
            }
            // checks if bottle has landed
            if(update.landedCheck()){
                console.log('bottle landed');
                if(!this.light2New){
                    this.createBottleWave(update);
                } else {
                    this.light2Radius += 3.5;
                    this.light2.setRadius(this.light2Radius);
                }
            } else {
                this.light2.setRadius(0);
            }
        }

        /* Wave effect for Lights
        if(this.light1New){
            this.light1Radius += 3.5
            this.light1.setRadius(this.light1Radius);
        } else {
            this.light1.setRadius(0);
        }
        */

        /*if(this.player.isMoving()){
            console.log(this.player.x);
            console.log(this.player.y);
        }*/
    }
}