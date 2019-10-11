var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
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
var timeLeft = 10;
var timedLoop;
var game = new Phaser.Game(config);

function preload () {
    this.load.image('background', 'assets/bg-game.jpg');
    this.load.spritesheet('bug', 'assets/beetle.png', { frameWidth: 41, frameHeight: 36 });
    this.load.image('brick', 'assets/ladrillo.png');

    this.load.image('coin', 'assets/coinGold.png');

    this.load.audio('dead', 'assets/audio/dead1.mp3');
    this.load.audio('loop', 'assets/audio/ItchyBits.mp3');
}

function create () {
    /* We create our world */
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(0, 250, 'ground');

    this.add.image(400, 300, 'background');

    /* We create our this.player */

    this.player = this.physics.add.sprite(400, 600, 'bug'); //Spritesheet
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // This is how we select the sprites for the animations
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('bug', {
            start: 0,
            end: 3
        }),
        frameRate: 5,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{
            key: 'bug',
            frame: 4
        }]
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('bug', {
            start: 5,
            end: 8
        }),
        frameRate: 5,
        repeat: -1
    });

    // We create some stars
    this.bricks = this.physics.add.group();
    createBody(this.bricks, 'brick');

    this.coins = this.physics.add.group();
    createBody(this.coins, 'coin');

    // Add physics colliders
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.bricks, this.platforms);
    this.physics.add.collider(this.player, this.bricks, collideBrick, null, this);

    this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#ff0066' });
    this.timeLeftText = this.add.text(600, 16, 'Time: 10', { fontSize: '32px', fill: '#5CFFFC'});
    // Music
    this.music = this.sound.add('loop', { loop: true });
    this.deadMusic = this.sound.add('dead', { loop: false });
    this.music.play();

    // loop
    timedLoop = this.time.addEvent({
        delay: 1000,
        callback: updateCounter,
        callbackScope: this,
        loop: true
    });

}

function update () {

    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    if (this.cursors.left.isDown){
        this.player.setVelocityX(-200);
        this.player.anims.play('left', true);
    } else if (this.cursors.up.isDown) {
        this.player.setVelocityY(-200);
        this.player.anims.play('right', true);
    } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(200);
        this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(200);
        this.player.anims.play('right', true);
    } else {
        this.player.setVelocityX(0);
        this.player.anims.play('turn');
    }

    if (this.spaceBar.isDown && timeLeft === 0) {
        this.time.addEvent({
            delay: 3000,
            callback: invulnerabilityModeOff,
            callbackScope: this
        });
        this.player.setScale(1.5);
        this.player.invulnerable = true;
    }
    if (this.cursors.up.isDown && this.player.body.touching.down) this.player.setVelocityY(-330);
}

function updateCounter() {
    if (timeLeft === 0) {
        this.timeLeftText.setText('Activate!!');
    } else {
        timeLeft -= 1;
        this.timeLeftText.setText('Time: ' + timeLeft);
    }
}

function invulnerabilityModeOff() {
    if (this.player.invulnerable) {
        this.player.invulnerable = false;
        timeLeft = 10;
        this.player.setScale(1);
    }
}

function collideBrick (player, brick) {
    this.hitMusic.play();
    blue.disableBody(true, true);
    score = player.invulnerable ? score - 1 : score + 1;
    this.scoreText.setText('Score: ' + score);


  //  createBody(this.blues, 'blue');
    var result = Math.random() * (100 - 1) + 1;

/*
    if (result < 10) createBody(this.pinks, 'pink');
    else if (result > 90) createBody(this.blues, 'blue');
    */
}

/*
function hitPink (player, pink) {
    pink.disableBody(true, true);
    if (!player.invulnerable) {
        this.deadMusic.play();
        this.music.stop();
        this.hitMusic.stop();
        this.physics.pause();
        timedLoop.remove();
        player.setTint(0xff0000);
        player.anims.play('turn');
        this.gameOverText = this.add.text(200, 200, 'GAME OVER', {
            fontSize: '64px',
            fill: '#fff'
        });
        //this.scene.remove();
    }
}*/

function createBody(arr, tipo) {
    var body = arr.create(Phaser.Math.Between(100, 700), 20, tipo);
    body.setBounce(1);
    body.setCollideWorldBounds(true);
    body.setVelocity(Phaser.Math.Between(-200, 200), 20);
}

function createCoin(arr, tipo) {
    var body = arr.create(Phaser.Math.Between(100, 700), 20, tipo);
    body.setBounce(1);
    body.setCollideWorldBounds(true);
    body.setVelocity(Phaser.Math.Between(-200, 200), 20);
}

function collectGem(sprite, gem) {
    this.hitMusic.play();
    this.objectLayer.removeTileAt(gem.x, gem.y);
    score++;
    this.scoreText.setText('Score: ' + score);
    return false;
}
