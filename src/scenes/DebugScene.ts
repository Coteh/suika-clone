export class DebugScene extends Phaser.Scene {
    private isVisible: boolean;
    private debugTextGroup: Phaser.GameObjects.Group;
    private debugTexts: {};
    private y: number;
    private back: Phaser.GameObjects.Graphics;
    private debugControlsText: Phaser.GameObjects.Text;
    private debugControlsTextBack: Phaser.GameObjects.Graphics;

    constructor() {
        super({
            key: 'DebugScene',
        });
    }

    create(): void {
        var mainScene: Phaser.Scene = this.scene.get('MainScene');
        this.debugTexts = {};
        this.y = 100;
        this.back = this.add.graphics();
        this.back.fillStyle(0x000000, 0.5);
        this.back.fillRect(0, 100, (game.config.width as number) / 1.5, 100);
        this.debugTextGroup = this.add.group();
        const instructionsText = new Phaser.GameObjects.Text(
            this,
            0,
            this.y,
            '',
            {}
        );
        instructionsText.setText('Press Q for controls info');
        this.y += 32;
        this.debugTextGroup.add(instructionsText, true);
        this.addKey('highscore');
        this.addKey('xspeed');
        this.addKey('yspeed');
        this.addKey('x');
        this.addKey('y');
        this.addKey('moveLeftHeld');
        this.addKey('moveRightHeld');
        this.addKey('heldDelta');
        this.addKey('mergeDisabled');
        this.addKey('heldNextFruit');
        this.debugControlsTextBack = this.add.graphics();
        this.debugControlsTextBack.fillStyle(0x000000, 0.5);
        this.debugControlsTextBack.fillRect(
            100,
            200,
            (game.config.width as number) / 1.5,
            100
        );
        this.debugControlsText = this.add.text(
            100,
            200,
            [
                'R - Remove all fruit from scene',
                'F - Change next fruit',
                'G - Freeze next fruit',
                'M - Toggle merging on/off',
                'D - Toggle debug view',
                'Q - Toggle debug controls view',
            ].join('\n')
        );
        this.toggleControlsViewVisibility(false);
        mainScene.events.on('debug', (key, value) => {
            this.setText(key, value);
        });
        mainScene.events.on('debugToggle', () => {
            this.toggleVisibility();
        });
        mainScene.events.on('debugControlsViewToggle', () => {
            this.toggleControlsViewVisibility(!this.debugControlsText.visible);
        });
        this.events.on('shutdown', () => {
            mainScene.events.removeAllListeners('debug');
            mainScene.events.removeAllListeners('debugToggle');
        });
        this.isVisible = true;
        this.registry.set('debugVisible', true);
    }

    addKey(key: string): void {
        this.debugTexts[key] = new Phaser.GameObjects.Text(
            this,
            0,
            this.y,
            '',
            {}
        );
        this.debugTextGroup.add(this.debugTexts[key], true);
        // TODO: Allow caller to set initial values
        this.setText(key, 'None');
        this.debugTexts[key].setScrollFactor(0);
        this.y += 32;
        this.back.clear();
        this.back.fillStyle(0x000000, 0.5);
        this.back.fillRect(
            0,
            100,
            (game.config.width as number) / 1.5,
            this.y - 100
        );
    }

    setText(key: string, text: string): void {
        this.debugTexts[key].setText(key + ': ' + text);
    }

    toggleVisibility(): void {
        this.isVisible = !this.isVisible;
        this.debugTextGroup.toggleVisible();
        this.back.setVisible(this.isVisible);
        this.toggleControlsViewVisibility(this.isVisible);
        this.registry.set('debugVisible', this.isVisible);
    }

    toggleControlsViewVisibility(visible: boolean): void {
        this.debugControlsText.setVisible(visible);
        this.debugControlsTextBack.setVisible(visible);
    }
}
