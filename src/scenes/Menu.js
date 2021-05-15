class Menu extends Phaser.Scene{
    constructor(){
        super("MenuScene");
    }

    preload() {
        // Load custom bitmap font
        this.load.bitmapFont('customFont', './assets/CustomFont.png', './assets/CustomFont.fnt');
        // Load Popup
        this.load.image('popup', './assets/tempPopup.png');
    }

    // Function for arrows to appear on hover of a menu label (label, left arrow, right arrow)
    menuInteraction(label, left, right) {
        label.setInteractive({useHandCursor: true});
        label.on("pointerover", ()=> {
            left.setVisible(true);
            right.setVisible(true);
            left.x = label.x - label.width;
            left.y = label.y;
            right.x = label.x + label.width;
            right.y = label.y;
        });
        label.on("pointerout", ()=> {
            left.setVisible(false);
            right.setVisible(false);
        });
    }

    openSettings() {
        // Temporarily disables menu buttons
        this.start.setVisible(false);
        this.controls.setVisible(false);
        this.settings.setVisible(false);

        // Add popup content
        var popup = this.add.group();
        var popupBack = this.add.sprite(centerWidth, centerHeight, 'popup').setOrigin(0.5);
        var text1 = this.add.bitmapText(popupBack.x, popupBack.y-100, 'customFont', "Settings", 36).setOrigin(0.5);
        var close = this.add.bitmapText(popupBack.x, popupBack.y+100, 'customFont', 'Close', 28).setOrigin(0.5);
        popup.add(popupBack);
        popup.add(text1);
        popup.add(close);

        // Set Close button interaction
        close.setInteractive({useHandCursor: true});
        close.on("pointerup", ()=> {
            popup.destroy(true);
            this.start.setVisible(true);
            this.controls.setVisible(true);
            this.settings.setVisible(true);
        });
    }

    openControls() {
        // Temporarily disables menu buttons
        this.start.setVisible(false);
        this.controls.setVisible(false);
        this.settings.setVisible(false);

        // Add popup content
        var popup = this.add.group();
        var popupBack = this.add.sprite(centerWidth, centerHeight, 'popup').setOrigin(0.5);
        var text1 = this.add.bitmapText(popupBack.x, popupBack.y-100, 'customFont', "Controls", 36).setOrigin(0.5);
        var close = this.add.bitmapText(popupBack.x, popupBack.y+100, 'customFont', 'Close', 28).setOrigin(0.5);
        popup.add(popupBack);
        popup.add(text1);
        popup.add(close);

        // Set Close button interaction
        close.setInteractive({useHandCursor: true});
        close.on("pointerup", ()=> {
            popup.destroy(true);
            this.start.setVisible(true);
            this.controls.setVisible(true);
            this.settings.setVisible(true);
        });
    }
    
    create() {
        // Add Menu text
        this.title = this.add.bitmapText(centerWidth, centerHeight/2, 'customFont', 'Final Game', 60).setOrigin(0.5);
        this.start = this.add.bitmapText(centerWidth, centerHeight-25, 'customFont', 'START', 28).setOrigin(0.5);
        this.settings = this.add.bitmapText(centerWidth, centerHeight+25, 'customFont', 'SETTINGS', 28).setOrigin(0.5);
        this.controls = this.add.bitmapText(centerWidth, centerHeight+75, 'customFont', 'CONTROLS', 28).setOrigin(0.5);

        // Initialize label markers
        this.markerLeft = this.add.bitmapText(0, 0, 'customFont', '>', 28).setOrigin(0.5);
        this.markerRight = this.add.bitmapText(0, 0, 'customFont', '<', 28).setOrigin(0.5);
        this.markerLeft.setVisible(false);
        this.markerRight.setVisible(false);

        // Set Background Color
        this.cameras.main.setBackgroundColor('rgba(0, 20, 20, 0.5)');

        // Set keys
        cursors = this.input.keyboard.createCursorKeys();
        
        // Initialize variables
        this.clicked = false;
        this.nextScene = false;

        // Set cursor hover interaction
        this.menuInteraction(this.start, this.markerLeft, this.markerRight);
        this.menuInteraction(this.controls, this.markerLeft, this.markerRight);
        this.menuInteraction(this.settings, this.markerLeft, this.markerRight);
        
        // Set interaction on clicking label
        this.start.on("pointerup", ()=> {
            this.nextScene = true;
        });
        this.settings.on("pointerup", ()=> {
            this.openSettings();
        });
        this.controls.on("pointerup", ()=> {
            this.openControls();
        });
    }

    update() {
        // Go to play scene
        if (this.nextScene == true && this.clicked == false) {
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                level = 1;
                this.scene.start('PlayScene');
            })
            this.clicked = true;
        }
    }
}