import 'phaser';
import { MainScene } from './scenes/MainScene';
import { HUDScene } from './scenes/HUDScene';
import { DebugScene } from './scenes/DebugScene';
import {
    createDialogContentFromTemplate,
    renderDialog,
    renderNotification,
} from './page';
import {
    GameOptions,
    hasPlayedBefore,
    loadGameOptions,
    saveGameOptions,
    setPlayedBefore,
} from './storage';

const THEME_SETTING_NAME = 'theme-switch';
const CONTROLS_SETTING_NAME = 'controls';

const LANDSCAPE_CLASS_NAME = 'landscape';

declare global {
    var game: SuikaCloneGame;
    var MobileDetect: any;
    var gameOptions: GameOptions;
}

global.gameOptions = loadGameOptions();

class SuikaCloneGame extends Phaser.Game {
    constructor(config: Phaser.Types.Core.GameConfig) {
        super(config);
    }
}

var scenes: Function[] = [MainScene, HUDScene];

if (process.env.IS_DEBUG) {
    scenes.push(DebugScene);
}

window.onload = () => {
    const config: Phaser.Types.Core.GameConfig = {
        title: 'Suika Clone',
        width: 460,
        height: 800,
        scene: scenes,
        type: Phaser.AUTO,
        parent: 'content',
        backgroundColor: '#ffd59d',
        input: {
            // There needs to be at least 3 active pointers for multi-touch to work
            activePointers: 3,
        },
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        physics: {
            default: 'matter',
            matter: {
                enableSleeping: true,
            },
        },
    };
    var game = new SuikaCloneGame(config);
    global.game = game;
};

const helpLink: HTMLAnchorElement = document.querySelector('.help-link');
helpLink.addEventListener('click', (e) => {
    e.preventDefault();
    renderDialog(createDialogContentFromTemplate('#how-to-play'), true);
    helpLink.blur();
});

const gamePane: HTMLDivElement = document.querySelector('.game');
const settingsPane: HTMLDivElement = document.querySelector('.settings');
const settingsLink: HTMLAnchorElement = document.querySelector(
    '.settings-link'
);

const toggleSettings = () => {
    settingsLink.blur();
    if (settingsPane.style.display === 'none') {
        gamePane.style.display = 'none';
        settingsPane.style.display = 'flex';
    } else {
        gamePane.style.display = 'flex';
        settingsPane.style.display = 'none';
    }
};

settingsLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleSettings();
});

const settings = document.querySelectorAll('.setting');
settings.forEach((setting) => {
    const elem = setting as HTMLDivElement;
    const toggle = setting.querySelector('.toggle');
    setting.addEventListener('click', (e) => {
        let optionChanged = false;
        if (elem.classList.contains(THEME_SETTING_NAME)) {
            if (game.registry.get('gameStarted')) {
                renderNotification(
                    'You can only change theme when game is not currently in progress'
                );
                return;
            }
            gameOptions.theme =
                gameOptions.theme === 'fruit_basket'
                    ? 'numbers'
                    : 'fruit_basket';
            game.events.emit('themeChange', gameOptions.theme);
            toggle.innerHTML =
                gameOptions.theme === 'fruit_basket'
                    ? 'Fruit Basket'
                    : 'Numbers';
            optionChanged = true;
        } else if (elem.classList.contains(CONTROLS_SETTING_NAME)) {
            gameOptions.controls =
                gameOptions.controls === 'tap' ? 'move' : 'tap';
            game.events.emit('controlsChange', gameOptions.controls);
            toggle.innerHTML = gameOptions.controls === 'move' ? 'Move' : 'Tap';
            optionChanged = true;
        }
        if (optionChanged) {
            saveGameOptions(gameOptions);
        }
    });
    if (elem.classList.contains(THEME_SETTING_NAME)) {
        toggle.innerHTML =
            gameOptions.theme === 'fruit_basket' ? 'Fruit Basket' : 'Numbers';
    } else if (elem.classList.contains(CONTROLS_SETTING_NAME)) {
        toggle.innerHTML = gameOptions.controls === 'move' ? 'Move' : 'Tap';
    }
});

const closeDialog = (dialog, overlayBackElem) => {
    if (dialog) {
        // Check if dialog is closable first before closing (close button would be visible, if so)
        const closeBtn = dialog.querySelector('button.close');
        if (closeBtn.style.display === 'none') {
            return;
        }
        dialog.remove();
    }
    // NTS: Perhaps it'd make more sense if overlay backdrop only disappeared when a valid dialog is passed,
    // but if an invalid dialog is being passed, it might not be on the screen either.
    // In this case, it may be better to leave this as-is and always have the backdrop close so that players can still play.
    overlayBackElem.style.display = 'none';
};

const handleKeyInput = (key) => {
    const dialog = document.querySelector('.dialog');
    if (dialog && (key === 'enter' || key === 'escape')) {
        return closeDialog(dialog, overlayBackElem);
    }
};

window.addEventListener('keydown', (e) => {
    handleKeyInput(e.key.toLowerCase());
});

const overlayBackElem = document.querySelector('.overlay-back');
overlayBackElem.addEventListener('click', (e) => {
    const dialog = document.querySelector('.dialog');
    closeDialog(dialog, overlayBackElem);
});

const landscapeQuery = window.matchMedia('(orientation: landscape)');

const checkForOrientation = (mediaQueryEvent) => {
    const md =
        typeof MobileDetect !== 'undefined' &&
        new MobileDetect(window.navigator.userAgent);
    if (md && mediaQueryEvent.matches && md.mobile()) {
        document.getElementById('landscape-overlay').style.display = 'block';
        document.body.classList.add(LANDSCAPE_CLASS_NAME);
        // Have the snow element appear on top of the landscape overlay
        // (will only be visible if the "display" attribute is set, though)
        // if (snowEmbed) snowEmbed.style.zIndex = '99999';
    } else {
        document.getElementById('landscape-overlay').style.display = 'none';
        document.body.classList.remove(LANDSCAPE_CLASS_NAME);
        // if (snowEmbed) snowEmbed.style.zIndex = '';
    }
};

if (landscapeQuery.addEventListener) {
    landscapeQuery.addEventListener('change', function (event) {
        checkForOrientation(event);
    });
} else {
    // Support for older browsers, addListener is deprecated
    landscapeQuery.addListener(checkForOrientation);
}

checkForOrientation(landscapeQuery);

if (!hasPlayedBefore()) {
    renderDialog(createDialogContentFromTemplate('#how-to-play'), true);
    setPlayedBefore();
}
