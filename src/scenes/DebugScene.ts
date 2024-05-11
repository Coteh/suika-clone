import { DebugManager } from '../managers/DebugManager';

export class DebugScene extends Phaser.Scene {
    private debugManager: DebugManager;

    constructor() {
        super({
            key: 'DebugScene',
        });
    }

    create(): void {
        var game: Phaser.Scene = this.scene.get('MainScene');
        this.debugManager = new DebugManager(this);
        this.debugManager.addKey('highscore');
        this.debugManager.addKey('xspeed');
        this.debugManager.addKey('yspeed');
        this.debugManager.addKey('x');
        this.debugManager.addKey('y');
        this.debugManager.addKey('moveLeftHeld');
        this.debugManager.addKey('moveRightHeld');
        this.debugManager.addKey('heldDelta');
        this.debugManager.addKey('mergeDisabled');
        this.debugManager.addKey('heldNextFruit');
        game.events.on('debug', (key, value) => {
            this.debugManager.setText(key, value);
        });
        game.events.on('debugToggle', () => {
            this.debugManager.toggleVisibility();
        });
        this.events.on('shutdown', () => {
            game.events.removeAllListeners('debug');
            game.events.removeAllListeners('debugToggle');
        });
    }
}
