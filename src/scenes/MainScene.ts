import {
    Fruit,
    FruitType,
    fruitTypeToTextureString,
} from '../gameobjects/Fruit';
import { Player } from '../gameobjects/Player';
import { GameManager } from '../managers/GameManager';
import { GameControl, GameTheme } from '../types';

export class MainScene extends Phaser.Scene {
    private gameManager: GameManager;

    private elapsedTime: number;

    private keys: Map<string, Phaser.Input.Keyboard.Key>;

    private fruits: Phaser.GameObjects.Group;

    private touchCooldown: number = 0;
    private canTouch: boolean;
    private hasTouched: boolean;

    private nextFruit: FruitType;
    private highestFruit: FruitType;

    private bar: Phaser.GameObjects.Image;
    private barTween: Phaser.Tweens.Tween;

    private player: Player;

    private controls: GameControl;

    constructor() {
        super({
            key: 'MainScene',
        });
    }

    preload(): void {
        this.load.image('bar', './assets/img/healthbar.png');
        this.load.image('player', './assets/img/Player.png');
        this.keys = new Map([
            ['LEFT', this.input.keyboard.addKey('LEFT')],
            ['RIGHT', this.input.keyboard.addKey('RIGHT')],
            ['SPACE', this.input.keyboard.addKey('SPACE')],
        ]);
        if (process.env.IS_DEBUG) {
            this.keys.set('D', this.input.keyboard.addKey('D'));
        }
        // TODO: Could the themes not selected by user be loaded later?
        // TODO: Iterate all themes and load them
        this.loadTheme('fruit_basket');
        this.loadTheme('numbers');
    }

    loadTheme(theme: GameTheme): void {
        console.log('Loading theme', theme);
        this.load.image(`apple_${theme}`, `./assets/img/themes/${theme}/1.png`);
        this.load.image(`pear_${theme}`, `./assets/img/themes/${theme}/2.png`);
        this.load.image(
            `grapes_${theme}`,
            `./assets/img/themes/${theme}/3.png`
        );
        this.load.image(
            `orange_${theme}`,
            `./assets/img/themes/${theme}/4.png`
        );
        this.load.image(`lemon_${theme}`, `./assets/img/themes/${theme}/5.png`);
        this.load.image(`mango_${theme}`, `./assets/img/themes/${theme}/6.png`);
        this.load.image(`melon_${theme}`, `./assets/img/themes/${theme}/7.png`);
        this.load.image(
            `watermelon_${theme}`,
            `./assets/img/themes/${theme}/8.png`
        );
    }

    create(): void {
        this.scene.launch('HUDScene');
        if (process.env.IS_DEBUG) {
            this.scene.launch('DebugScene');
        }

        this.gameManager = this.registry.get('gameManager');
        if (!this.gameManager) {
            this.gameManager = new GameManager(this);
            this.registry.set('gameManager', this.gameManager);
        }
        this.gameManager.init();
        this.events.on('updateScore', () => {
            this.gameManager.updateHighScore();
        });
        this.events.on('gameOver', () => {
            this.fruits.clear(true, true);
            this.gameManager.setGameOver(true);
            this.registry.set('score', 0);
            this.registry.set('gameStarted', false);
            this.events.emit('updateScore');
            this.highestFruit = 0;
            this.setNextFruit();
        });
        this.events.on('gameStarted', () => {
            this.gameManager.setGameOver(false);
            this.gameManager.setDidWin(false);
        });
        this.events.on('moveLeft', () => {
            this.player.moveLeft();
        });
        this.events.on('moveLeftStart', () => {
            this.player.moveLeftStart();
            this.events.emit('debug', 'moveLeftHeld', true);
        });
        this.events.on('moveLeftStop', () => {
            this.player.moveLeftStop();
            this.events.emit('debug', 'moveLeftHeld', false);
        });
        this.events.on('moveRight', () => {
            this.player.moveRight();
        });
        this.events.on('moveRightStart', () => {
            this.player.moveRightStart();
            this.events.emit('debug', 'moveRightHeld', true);
        });
        this.events.on('moveRightStop', () => {
            this.player.moveRightStop();
            this.events.emit('debug', 'moveRightHeld', false);
        });
        this.events.on('dropFruit', (posX) => {
            if (!this.hasTouched || this.gameManager.isGameOver()) {
                this.registry.set('gameStarted', true);
                this.events.emit('gameStarted');
                this.hasTouched = true;
            }
            this.events.emit('tap');
            // Place fruit
            if (this.canTouch) {
                const fruit = new Fruit(
                    this.matter.world,
                    posX,
                    20,
                    this.nextFruit
                );
                this.fruits.add(fruit, true);
                this.touchCooldown = 500;
                this.canTouch = false;
                this.setNextFruit();
            }
        });
        this.game.events.on('controlsChange', this.onControlsChange.bind(this));
        this.game.events.on('themeChange', (newTheme: GameTheme) => {
            // Update the next fruit sprite to the new theme
            this.events.emit('nextFruit', this.nextFruit);
        });

        this.fruits = this.add.group({
            quantity: 0,
            maxSize: 0,
        });

        this.fruits.maxSize = -1;

        this.matter.world.setBounds(
            0,
            0,
            game.config.width as number,
            game.config.height as number,
            32,
            true,
            true,
            false,
            true
        );

        // Set up collision event for the group
        this.matter.world.on(
            'collisionstart',
            function (event) {
                event.pairs.forEach(function (pair) {
                    const bodyA = pair.bodyA;
                    const bodyB = pair.bodyB;

                    // Check if bodies are in the group
                    if (
                        this.fruits.contains(bodyA.gameObject) &&
                        this.fruits.contains(bodyB.gameObject)
                    ) {
                        const fruit1 = bodyA.gameObject;
                        const fruit2 = bodyB.gameObject;

                        // Merge fruits if they're the same
                        if (fruit1.fruitType == fruit2.fruitType) {
                            const fruit = new Fruit(
                                this.matter.world,
                                fruit1.x,
                                fruit1.y - 50,
                                fruit1.fruitType + 1
                            );
                            this.fruits.add(fruit, true);
                            this.fruits.remove(fruit1, true, true);
                            this.fruits.remove(fruit2, true, true);

                            var score: number = this.registry.get('score');
                            score += 100 * (fruit1.fruitType + 1);
                            this.registry.set('score', score);
                            this.events.emit('updateScore');

                            if (fruit1.fruitType > this.highestFruit) {
                                this.highestFruit = fruit1.fruitType;
                            }

                            if (
                                fruit1.fruitType + 1 == FruitType.Watermelon &&
                                !this.gameManager.getDidWin()
                            ) {
                                this.events.emit('win');
                                this.gameManager.setDidWin(true);
                            }
                        }
                    }
                }, this);
            },
            this
        );

        const barObj = new Phaser.GameObjects.Image(
            this,
            (game.config.width as number) / 2,
            100,
            'bar'
        );
        barObj.setScale(5, 1);
        this.add.existing(barObj);
        this.bar = barObj;
        this.bar.alpha = 0;

        // Enable input for the scene
        this.input.on('pointerup', (pointer) => {
            // Ignore touches at the bottom of the canvas in case someone is swiping out on iPhone
            if (pointer.y >= (game.config.height as number) - 100) {
                return;
            }
            this.events.emit(
                'dropFruit',
                this.controls === 'tap' ? pointer.x : this.player.x
            );
        });

        this.player = new Player(this, 100, 20, this.keys);
        this.add.existing(this.player);

        this.highestFruit = 0;
        this.setNextFruit();

        this.controls = gameOptions.controls;
        this.onControlsChange(this.controls);

        this.scene
            .get('HUDScene')
            .events.once('create', this.onHUDSceneCreate, this);
        if (process.env.IS_DEBUG) {
            this.scene
                .get('DebugScene')
                .events.once('create', this.onDebugSceneCreate, this);
        }

        this.registry.set('gameStarted', false);
    }

    onHUDSceneCreate(): void {
        this.events.emit('nextFruit', this.nextFruit);
        this.events.emit('gameInit');
    }

    onDebugSceneCreate(): void {
        this.events.emit('debug', 'moveLeftHeld', false);
        this.events.emit('debug', 'moveRightHeld', false);
    }

    setNextFruit(): void {
        this.nextFruit = FruitType.Apple;
        const randVal = Math.round(Math.random() * 4);
        if (randVal % 4 === 0 && this.highestFruit >= FruitType.Orange) {
            this.nextFruit = FruitType.Orange;
        } else if (randVal % 3 === 0 && this.highestFruit >= FruitType.Grapes) {
            this.nextFruit = FruitType.Grapes;
        } else if (
            randVal % 2 === 0 &&
            this.hasTouched &&
            !this.gameManager.isGameOver()
        ) {
            this.nextFruit = FruitType.Pear;
        }
        this.events.emit('nextFruit', this.nextFruit);
    }

    update(time: number, delta: number): void {
        this.elapsedTime += delta;
        if (!this.gameManager.isGameOver()) {
            this.fruits.children.entries.forEach((entry) => {
                const sprite = entry as Fruit;
                sprite.update(time, delta);
                if (sprite.lifetime > 1000) {
                    if (sprite.y < 100) {
                        this.events.emit('gameOver');
                        if (this.barTween) {
                            this.barTween.setFinishedState();
                            this.bar.alpha = 0;
                        }
                    } else if (sprite.y < 250) {
                        this.pulsateImage(this.bar);
                    }
                }
            });
        }

        if (this.touchCooldown <= 0) {
            this.canTouch = true;
        } else {
            this.touchCooldown -= delta;
        }

        var debugKey = this.keys.get('D');
        if (debugKey && this.input.keyboard.checkDown(debugKey, 1000)) {
            this.events.emit('debugToggle');
        }

        if (this.controls === 'move') {
            this.player.update(time, delta);
        }
    }

    pulsateImage(pulsatingImage) {
        // If a pulsating effect is active currently, then do not make a new one until it finishes
        if (this.barTween && !this.barTween.isFinished()) {
            return;
        }

        // Create a tween for the pulsating effect
        this.barTween = this.tweens.add({
            targets: pulsatingImage,
            alpha: 1,
            duration: 500, // Total duration of the pulsating effect in milliseconds
            yoyo: true, // Yoyo makes the tween play back and forth
            repeat: 1, // Repeat only once
            onComplete: () => {
                this.barTween.setFinishedState();
            },
        });
    }

    onControlsChange(controls) {
        if (controls === 'move') {
            this.player.setVisible(true);
        } else {
            this.player.setVisible(false);
        }
        this.controls = controls;
    }
}
