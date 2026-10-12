const FAVORITES_KEY = "lakbayFavorites";
const THEME_KEY = "lakbayTheme";

function getFavorites() {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
}

function saveFavorites(favorites) {
    localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(favorites)
    );
}

function isFavorite(id) {
    return getFavorites().includes(id);
}

function toggleFavoriteStorage(id) {
    let favorites = getFavorites();

    if (favorites.includes(id)) {
        favorites = favorites.filter(item => item !== id);
    } else {
        favorites.push(id);
    }

    saveFavorites(favorites);
    return favorites;
}

function saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
}

function getSavedTheme() {
    return localStorage.getItem(THEME_KEY);
}