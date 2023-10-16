const PLAYED_BEFORE_KEY = 'played_before';

export function hasPlayedBefore() {
    return window.localStorage.getItem(PLAYED_BEFORE_KEY) === 'true';
}

export function setPlayedBefore() {
    window.localStorage.setItem(PLAYED_BEFORE_KEY, 'true');
}
