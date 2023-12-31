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

export class Fruit extends Phaser.Physics.Matter.Image {
    fruitType: FruitType;

    lifetime: number;

    constructor(
        world: Phaser.Physics.Matter.World,
        x: number,
        y: number,
        type: FruitType
    ) {
        let sprite = fruitTypeToTextureString(type);
        super(world, x, y, sprite);
        this.fruitType = type;
        this.setScale(1 + 0.5 * type);
        if (this.fruitType == FruitType.Grapes) {
            this.setCircle(this.displayWidth / 2.95);
            this.setOrigin(0.65, 0.6);
        } else {
            this.setCircle(this.displayWidth / 2);
        }
        this.lifetime = 0;
    }

    public update(time: number, delta: number): void {
        this.lifetime += delta;
    }
}
