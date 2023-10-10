import {
    Fruit,
    FruitType,
    fruitTypeToTextureString,
} from '../gameobjects/Fruit';
import { GameManager } from '../managers/GameManager';

export class MainScene extends Phaser.Scene {
    private gameManager: GameManager;

    private elapsedTime: number;

    private keys: Map<string, Phaser.Input.Keyboard.Key>;

    private fruits: Phaser.Physics.Arcade.Group;

    private touchCooldown: number = 0;
    private canTouch: boolean;
    private hasTouched: boolean;

    private nextFruit: FruitType;
    private nextFruitSprite: Phaser.GameObjects.Sprite;
    private highestFruit: FruitType;

    constructor() {
        super({
            key: 'MainScene',
        });
    }

    preload(): void {
        this.load.image('apple', './assets/img/themes/fruit_basket/Apple.png');
        this.load.image('pear', './assets/img/themes/fruit_basket/Pear.png');
        this.load.image(
            'grapes',
            './assets/img/themes/fruit_basket/Grapes.png'
        );
        this.load.image(
            'orange',
            './assets/img/themes/fruit_basket/Orange.png'
        );
        this.load.image('lemon', './assets/img/themes/fruit_basket/Lemon.png');
        this.load.image('mango', './assets/img/themes/fruit_basket/Mango.png');
        this.load.image('melon', './assets/img/themes/fruit_basket/Melon.png');
        this.load.image(
            'watermelon',
            './assets/img/themes/fruit_basket/Watermelon.png'
        );
        this.load.image('bar', './assets/img/healthbar.png');
        this.load.image('fingerIcon', './assets/img/tap.png');
        this.keys = new Map([
            ['LEFT', this.input.keyboard.addKey('LEFT')],
            ['RIGHT', this.input.keyboard.addKey('RIGHT')],
            ['SPACE', this.input.keyboard.addKey('SPACE')],
        ]);
        if (process.env.IS_DEBUG) {
            this.keys.set('D', this.input.keyboard.addKey('D'));
        }
    }

    create(): void {
        this.scene.launch('HUDScene');
        this.scene.launch('DebugScene');

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
            this.events.emit('updateScore');
            this.highestFruit = 0;
            this.setNextFruit();
        });
        this.events.on('gameStarted', () => {
            this.gameManager.setGameOver(false);
            this.gameManager.setDidWin(false);
        });

        this.fruits = this.physics.add.group({
            quantity: 0,
            maxSize: 0,
            bounceX: 0.5,
            bounceY: 0.5,
            collideWorldBounds: true,
            velocityX: 0,
            velocityY: 0,
        });

        this.fruits.maxSize = -1;

        this.physics.add.collider(
            this.fruits,
            undefined,
            function (fruit1, fruit2) {
                // Merge fruit if they're the same
                if (fruit1.fruitType == fruit2.fruitType) {
                    const fruit = new Fruit(
                        this,
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
            }.bind(this)
        );

        const barObj = new Phaser.GameObjects.Image(
            this,
            (game.config.width as number) / 2,
            100,
            'bar'
        );
        barObj.setScale(5, 1);
        this.add.existing(barObj);

        // Enable input for the scene
        this.input.on('pointerup', (pointer) => {
            // Ignore touches at the bottom of the canvas in case someone is swiping out on iPhone
            if (pointer.y >= (game.config.height as number) - 100) {
                return;
            }
            if (!this.hasTouched || this.gameManager.isGameOver()) {
                this.events.emit('gameStarted');
                this.hasTouched = true;
            }
            this.events.emit('tap');
            // Place fruit
            if (this.canTouch) {
                const fruit = new Fruit(this, pointer.x, 20, this.nextFruit);
                this.fruits.add(fruit, true);
                fruit.body.velocity.add(new Phaser.Math.Vector2(0, 500));
                this.touchCooldown = 500;
                this.canTouch = false;
                this.setNextFruit();
            }
        });

        this.nextFruitSprite = new Phaser.GameObjects.Sprite(
            this,
            (game.config.width as number) - 40,
            40,
            'apple'
        );
        this.nextFruitSprite.setVisible(false);
        this.add.existing(this.nextFruitSprite);

        this.highestFruit = 0;
        this.setNextFruit();
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
        this.nextFruitSprite.setTexture(
            fruitTypeToTextureString(this.nextFruit)
        );
        this.nextFruitSprite.setVisible(true);
    }

    update(time: number, delta: number): void {
        this.elapsedTime += delta;
        if (!this.gameManager.isGameOver()) {
            this.fruits.children.entries.forEach((entry) => {
                const sprite = entry as Fruit;
                sprite.update(time, delta);
                if (sprite.lifetime > 1000 && sprite.y < 100) {
                    this.events.emit('gameOver');
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
    }
}
