var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 300
            },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var score = 0;
var timeLeft = 10;

function preload() {
    this.load.image('plataforma', 'assets/ground.png');
    this.load.spritesheet('mikari', 'assets/dude2.png', {
        frameWidth: 32,
        frameHeight: 48
    });

    this.load.image('blue', 'assets/blue.png');
    this.load.image('pink', 'assets/pink.png');

    this.load.audio('loop', 'assets/audio/loop4.mp3');
    this.load.audio('dead', 'assets/audio/dead1.mp3');
    this.load.audio('touch', 'assets/audio/shield.mp3');

}


function create() {
    this.plataformas = this.physics.add.staticGroup();
    this.plataformas.create(400, 590, 'plataforma').setScale(2).refreshBody();
    this.plataformas.create(50, 250, 'plataforma');
    this.plataformas.create(750, 320, 'plataforma');

    this.player = this.physics.add.sprite(100, 400, 'mikari');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);

    this.controls = this.input.keyboard.createCursorKeys();
    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('mikari', {
            start: 0,
            end: 3
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('mikari', {
            start: 5,
            end: 8
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{
            key: 'mikari',
            frame: 4
        }]
    });

    this.blues = this.physics.add.group();
    this.pinks = this.physics.add.group();
    createBody(this.blues, 'blue');
    createBody(this.pinks, 'pink');

    this.physics.add.collider(this.player, this.plataformas);
    this.physics.add.collider(this.blues, this.plataformas);
    this.physics.add.collider(this.pinks, this.plataformas);
    this.physics.add.collider(this.player, this.blues, hitBlues, null, this);
    this.physics.add.collider(this.player, this.pinks, hitPinks, null, this);

    this.scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '32px',
        fill: '#ff0066'
    });

    this.timeLeftText = this.add.text(600, 16, 'Time: 10', {
        fontSize: '32px',
        fill: '#5cfffc'
    })

    this.timedLoop = this.time.addEvent({
        delay: 1000,
        callback: updateCounter,
        callbackScope: this,
        loop: true
    });

    this.music = this.sound.add('loop', {
        loop: true
    });
    this.hitMusic = this.sound.add('touch', {
        loop: false
    });
    this.deadMusic = this.sound.add('dead', {
        loop: false
    });
    this.music.play();
}

function update() {

    if (this.controls.left.isDown) {
        this.player.setVelocityX(-160);
        this.player.anims.play('left', true);
    } else if (this.controls.right.isDown) {
        this.player.setVelocityX(160);
        this.player.anims.play('right', true);
    } else if (this.controls.up.isDown) {
        this.player.setVelocityY(-160);
        this.player.anims.play('left', true);
    } else if (this.controls.down.isDown) {
        this.player.setVelocityY(160);
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
        this.player.invulnerable = true;
        this.player.setScale(1.5);
    }

    
    
}

function hitBlues(player, blue) {
    blue.disableBody(true, true);
    this.hitMusic.play();
    score += 1;
    this.scoreText.setText('Score: ' + score);

    createBody(this.blues, 'blue');
    createBody(this.pinks, 'pink');

    var result = Math.random() * (100 - 1) + 1;
    if (result < 10) createBody(this.pinks, 'pink');
    if (result > 90) createBody(this.blues, 'blue');

}

function hitPinks(player, pink) {
    pink.disableBody(true, true);
    if (!player.invulnerable) {
        this.deadMusic.play();
        this.hitMusic.stop();
        this.music.stop();
        player.setTint(0xff0000);
        this.physics.pause();
        this.gameOverText = this.add.text(220, 290, 'GAME OVER', {
            fontSize: '64px',
            fill: '#fff'
        });
    }
    
}

function createBody(arr, tipo) {
    var body = arr.create(Phaser.Math.Between(100, 700), 20, tipo);
    body.setBounce(1);
    body.setCollideWorldBounds(true);
    body.setVelocity(Phaser.Math.Between(-200, 200), 20);
}

function updateCounter() {
    if (timeLeft === 0) {
        this.timeLeftText.setText('Activate!!')
    } else {
        timeLeft -=1;
        this.timeLeftText.setText('Time: ' + timeLeft);
    }
}

function invulnerabilityModeOff() {
    this.player.invulnerable = false;
    this.player.setScale(1);
    timeLeft = 10;
}


