export enum FruitType {
    Apple = 0,
    Pear = 1,
    Grapes = 2,
    Orange = 3,
    Lemon = 4,
    Mango = 5,
    Melon = 6,
    Watermelon = 7,
}

export function fruitTypeToTextureString(fruitType: FruitType) {
    let resolvedFruitType = fruitType % 8;
    let sprite = 'apple';
    switch (resolvedFruitType) {
        case FruitType.Pear:
            sprite = 'pear';
            break;
        case FruitType.Grapes:
            sprite = 'grapes';
            break;
        case FruitType.Orange:
            sprite = 'orange';
            break;
        case FruitType.Lemon:
            sprite = 'lemon';
            break;
        case FruitType.Mango:
            sprite = 'mango';
            break;
        case FruitType.Melon:
            sprite = 'melon';
            break;
        case FruitType.Watermelon:
            sprite = 'watermelon';
            break;
    }
    return sprite;
}

export class Fruit extends Phaser.Physics.Arcade.Image {
    fruitType: FruitType;

    lifetime: number;

    constructor(scene: Phaser.Scene, x: number, y: number, type: FruitType) {
        let sprite = fruitTypeToTextureString(type);
        super(scene, x, y, sprite);
        scene.physics.world.enable(this);
        this.setScale(1 + 0.5 * type);
        this.fruitType = type;
        this.setCircle(30);
        this.lifetime = 0;

        // Enable debugging for the physics body
        this.body.debugShowBody = true;
        this.body.debugBodyColor = 0x00ff00; // Color of the debug body
    }

    public update(time: number, delta: number): void {
        this.lifetime += delta;
    }
}
