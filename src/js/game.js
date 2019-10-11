var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var score = 0;
var game = new Phaser.Game(config);

function preload () {
    this.load.spritesheet('player', 'assets/dude2.png', { frameWidth: 32, frameHeight: 48 });
    
    this.load.tilemapTiledJSON('map', 'assets/map.json');
    this.load.spritesheet('tiles', 'assets/tiles.png', {frameWidth: 70, frameHeight: 70});
    this.load.image('coin', 'assets/coinGold.png');

    this.load.audio('dead', 'assets/audio/dead1.mp3');
    this.load.audio('touch', 'assets/audio/shield.mp3');
    this.load.audio('loop', 'assets/audio/loop4.mp3');
}

function create() {
    this.map = this.make.tilemap({key: 'map'});
    this.groundLayer = this.map.createDynamicLayer('World', this.map.addTilesetImage('tiles'), 0, 0);
    this.groundLayer.setCollisionByExclusion([-1]);

    // coin image used as tileset
    var coinTiles = this.map.addTilesetImage('coin');
    this.objectLayer = this.map.createDynamicLayer('Coins', coinTiles, 0, 0);

    this.physics.world.bounds.width = this.groundLayer.width;
    this.physics.world.bounds.height = this.groundLayer.height;

    this.player = this.physics.add.sprite(200, 200, 'player');
    this.player.setBounce(0.2); 
    this.player.setCollideWorldBounds(true);
    
    // small fix to our player images, we resize the physics body object slightly
    this.player.body.setSize(this.player.width, this.player.height - 8);
    this.physics.add.collider(this.groundLayer, this.player);

    this.objectLayer.setTileIndexCallback(17, collectGem, this);  
    this.physics.add.overlap(this.player, this.objectLayer);

    // This is how we select the sprites for the animations
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('player', {
            start: 0,
            end: 3
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{
            key: 'player',
            frame: 4
        }]
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('player', {
            start: 5,
            end: 8
        }),
        frameRate: 10,
        repeat: -1
    });
    
    this.cursors = this.input.keyboard.createCursorKeys();

    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.player); 
    this.cameras.main.setBackgroundColor('#afc4da');

    this.scoreText = this.add.text(20, 570, 'Score: 0', { fontSize: '32px', fill: '#ffffff' });
    this.scoreText.setScrollFactor(0);

    // Music
    this.music = this.sound.add('loop', { loop: true });
    this.hitMusic = this.sound.add('touch', { loop: false });
    this.music.play();
}

function collectGem(sprite, gem) {
    this.hitMusic.play();
    this.objectLayer.removeTileAt(gem.x, gem.y);
    score++;
    this.scoreText.setText('Score: ' + score);
    return false;
}

function update(time, delta) {
    if (this.cursors.left.isDown){
        this.player.setVelocityX(-200);
        this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(200);
        this.player.anims.play('right', true);
    } else {
        this.player.setVelocityX(0);
        this.player.anims.play('turn');
    }

    if (this.cursors.up.isDown && this.player.body.onFloor()) this.player.body.setVelocityY(-500);        
}

