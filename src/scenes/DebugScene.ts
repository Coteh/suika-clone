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
