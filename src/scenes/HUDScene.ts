const GAME_OVER_SCREEN_OFFSET: number = -200;

export class HUDScene extends Phaser.Scene {
    private mainScene: Phaser.Scene;

    private scoreText: Phaser.GameObjects.Text;
    private highscoreText: Phaser.GameObjects.Text;
    private score: number;
    private highscore: number = 0;
    private displayScore: number;

    private gameOverText: Phaser.GameObjects.Text;
    private beatHighscoreText: Phaser.GameObjects.Text;
    private winText: Phaser.GameObjects.Text;
    private instructionText: Phaser.GameObjects.Text;
    private fingerIcon: Phaser.GameObjects.Image;
    private leftArrow: Phaser.GameObjects.Image;
    private rightArrow: Phaser.GameObjects.Image;

    constructor() {
        super({
            key: 'HUDScene',
        });
    }

    preload(): void {
        this.load.image('fingerIcon', './assets/img/tap.png');
        this.load.image('leftArrow', './assets/img/LeftArrow.svg');
        this.load.image('rightArrow', './assets/img/RightArrow.svg');
    }

    create(): void {
        this.add.text(10, 10, 'Score:');
        this.scoreText = this.add.text(120, 10, '0');
        this.add.text(10, 30, 'High Score:');
        this.highscoreText = this.add.text(120, 30, '0');
        if (this.registry.get('highscore')) {
            this.highscore = this.registry.get('highscore');
            this.highscoreText.setText(this.highscore.toString());
        }

        this.score = 0;
        this.displayScore = 0;

        this.mainScene = this.scene.get('MainScene');
        this.mainScene.events.on('updateScore', this.updateScore.bind(this));
        this.mainScene.events.on('gameOver', this.gameOver.bind(this));
        this.mainScene.events.on('gameStarted', this.onGameStarted.bind(this));
        this.mainScene.events.on('tap', this.onTap.bind(this));
        this.mainScene.events.on('win', this.onWin.bind(this));

        this.game.events.on('controlsChange', this.onControlsChange.bind(this));

        this.gameOverText = this.add.text(
            (game.config.width as number) / 4,
            this.cameras.main.centerY + GAME_OVER_SCREEN_OFFSET,
            'Game Over!'
        );
        this.gameOverText.setVisible(false);
        this.beatHighscoreText = this.add.text(
            (game.config.width as number) / 4,
            this.cameras.main.centerY + 50 + GAME_OVER_SCREEN_OFFSET,
            'You got a new high score!'
        );
        this.beatHighscoreText.setVisible(false);
        this.winText = this.add.text(
            (game.config.width as number) / 4,
            this.cameras.main.centerY + GAME_OVER_SCREEN_OFFSET,
            'You got watermelon! Nice!\nKeep going!'
        );
        this.winText.setVisible(false);

        // Add the instruction text
        this.instructionText = this.add.text(
            (game.config.width as number) / 2,
            (game.config.height as number) / 2 - 50,
            'Touch to place fruit',
            {
                fontSize: '24px',
                align: 'center',
            }
        );
        this.instructionText.setOrigin(0.5);

        // Add the finger icon
        this.fingerIcon = this.add.image(
            (game.config.width as number) / 2,
            (game.config.height as number) / 2 + 50,
            'fingerIcon'
        );
        this.fingerIcon.setOrigin(0.5);
        this.fingerIcon.setScale(0.2, 0.2);

        this.leftArrow = this.add.image(
            0,
            (game.config.height as number) / 2 + 50,
            'leftArrow'
        );
        this.leftArrow.setOrigin(0.5);
        this.leftArrow.setScale(0.1, 0.1);
        this.leftArrow.x = this.leftArrow.displayWidth / 2;
        this.leftArrow.setInteractive().on('pointerdown', () => {
            this.mainScene.events.emit('moveLeftStart');
        });
        this.leftArrow.setInteractive().on('pointerup', () => {
            this.mainScene.events.emit('moveLeftStop');
        });

        this.rightArrow = this.add.image(
            0,
            (game.config.height as number) / 2 + 50,
            'rightArrow'
        );
        this.rightArrow.setOrigin(0.5);
        this.rightArrow.setScale(0.1, 0.1);
        this.rightArrow.x =
            this.cameras.main.width - this.rightArrow.displayWidth / 2;
        this.rightArrow.setInteractive().on('pointerdown', () => {
            this.mainScene.events.emit('moveRightStart');
        });
        this.rightArrow.setInteractive().on('pointerup', () => {
            this.mainScene.events.emit('moveRightStop');
        });

        this.onControlsChange(gameOptions.controls);
    }

    updateScore(): void {
        this.score = this.registry.get('score');
    }

    update(time: number, delta: number): void {
        if (this.displayScore < this.score / 2) {
            this.displayScore = Math.ceil(this.score / 2);
        } else if (this.displayScore < this.score) {
            this.displayScore =
                this.score - this.displayScore === 1
                    ? this.displayScore + 1
                    : this.displayScore + 2;
        }
        this.scoreText.setText(this.displayScore.toString());
        if (this.registry.get('beatHighscore')) {
            this.highscoreText.setText(this.displayScore.toString());
        }
    }

    gameOver(): void {
        this.displayScore = this.score;
        this.gameOverText.setVisible(true);
        if (this.registry.get('beatHighscore')) {
            this.beatHighscoreText.setVisible(true);
        }
        this.registry.set('beatHighscore', false);
        if (this.registry.get('highscore')) {
            this.highscore = this.registry.get('highscore');
            this.highscoreText.setText(this.highscore.toString());
        }
        this.instructionText.setVisible(true);
        this.fingerIcon.setVisible(true);
    }

    onGameStarted(): void {
        this.instructionText.setVisible(false);
        this.fingerIcon.setVisible(false);
        this.gameOverText.setVisible(false);
        this.beatHighscoreText.setVisible(false);
    }

    onTap(): void {
        this.winText.setVisible(false);
    }

    onWin(): void {
        this.winText.setVisible(true);
    }

    onControlsChange(controls) {
        if (controls === 'move') {
            this.leftArrow.setVisible(true);
            this.rightArrow.setVisible(true);
        } else {
            this.leftArrow.setVisible(false);
            this.rightArrow.setVisible(false);
        }
    }
}
