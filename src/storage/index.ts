import { GameControl, GameTheme } from '../types';

const PLAYED_BEFORE_KEY = 'played_before';
const GAME_OPTIONS_KEY = 'game_options';

export interface GameOptions {
    controls: GameControl;
    theme: GameTheme;
}

let gameOptions: GameOptions = {
    controls: 'tap',
    theme: 'fruit_basket',
};

export function loadGameOptions() {
    try {
        const gameOptionsStr = window.localStorage.getItem(GAME_OPTIONS_KEY);
        if (!gameOptionsStr) {
            return gameOptions;
        }
        gameOptions = JSON.parse(gameOptionsStr);
    } catch (e) {
        console.error(e);
    }
    return gameOptions;
}

export function saveGameOptions(newOptions) {
    window.localStorage.setItem(GAME_OPTIONS_KEY, JSON.stringify(newOptions));
}

export function hasPlayedBefore() {
    return window.localStorage.getItem(PLAYED_BEFORE_KEY) === 'true';
}

export function setPlayedBefore() {
    window.localStorage.setItem(PLAYED_BEFORE_KEY, 'true');
}
