import 'phaser';
import { MainScene } from './scenes/MainScene';
import { HUDScene } from './scenes/HUDScene';
import { DebugScene } from './scenes/DebugScene';
import {
    createDialogContentFromTemplate,
    renderDialog,
    renderNotification,
} from './page';

const THEME_SETTING_NAME = 'theme-switch';

const LANDSCAPE_CLASS_NAME = 'landscape';

declare global {
    var game: SuikaCloneGame;
    var MobileDetect: any;
}

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
        width: 400,
        height: 800,
        scene: scenes,
        type: Phaser.AUTO,
        parent: 'content',
        backgroundColor: '#ffd59d',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        physics: {
            default: 'arcade',
            arcade: {
                debug: !!process.env.IS_DEBUG,
                gravity: { y: 300 },
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

const settingsClose = settingsPane.querySelector('.close');
settingsClose.addEventListener('click', (e) => {
    e.preventDefault();
    toggleSettings();
});

const settings = document.querySelectorAll('.setting');
settings.forEach((setting) => {
    setting.addEventListener('click', (e) => {
        const elem = e.target as HTMLDivElement;
        const toggle = setting.querySelector('.toggle');
        let enabled = false;
        if (elem.classList.contains(THEME_SETTING_NAME)) {
            renderNotification('Coming soon');
        }
    });
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