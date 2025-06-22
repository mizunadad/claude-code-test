class WeatherConfig {
    constructor() {
        this.storageKeys = {
            apiKey: 'weather_api_key',
            temperatureUnit: 'temperature_unit',
            theme: 'app_theme',
            favorites: 'favorite_cities',
            lastLocation: 'last_location'
        };
        
        this.defaults = {
            temperatureUnit: 'metric',
            theme: 'light',
            apiUrl: 'https://api.openweathermap.org/data/2.5',
            geocodingUrl: 'https://api.openweathermap.org/geo/1.0'
        };
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
    }

    loadSettings() {
        const savedTheme = this.getSetting('theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? 'dark' : 'light');
        }
    }

    setupEventListeners() {
        const themeToggle = document.getElementById('theme-toggle');
        const settingsBtn = document.getElementById('settings-btn');
        const closeSettings = document.getElementById('close-settings');
        const saveSettings = document.getElementById('save-settings');
        const settingsModal = document.getElementById('settings-modal');

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.openSettings();
            });
        }

        if (closeSettings) {
            closeSettings.addEventListener('click', () => {
                this.closeSettings();
            });
        }

        if (saveSettings) {
            saveSettings.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        if (settingsModal) {
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    this.closeSettings();
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSettings();
            }
        });
    }

    getApiKey() {
        return this.getSetting('apiKey') || '';
    }

    setApiKey(apiKey) {
        this.setSetting('apiKey', apiKey);
    }

    getTemperatureUnit() {
        return this.getSetting('temperatureUnit') || this.defaults.temperatureUnit;
    }

    setTemperatureUnit(unit) {
        this.setSetting('temperatureUnit', unit);
    }

    getTheme() {
        return this.getSetting('theme') || this.defaults.theme;
    }

    setTheme(theme) {
        this.setSetting('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    toggleTheme() {
        const currentTheme = this.getTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    getFavorites() {
        const favorites = this.getSetting('favorites');
        return favorites ? JSON.parse(favorites) : [];
    }

    setFavorites(favorites) {
        this.setSetting('favorites', JSON.stringify(favorites));
    }

    addFavorite(city) {
        const favorites = this.getFavorites();
        const exists = favorites.find(fav => 
            fav.name.toLowerCase() === city.name.toLowerCase() && 
            fav.country === city.country
        );
        
        if (!exists) {
            favorites.unshift(city);
            if (favorites.length > 10) {
                favorites.pop();
            }
            this.setFavorites(favorites);
            return true;
        }
        return false;
    }

    removeFavorite(cityName, country) {
        const favorites = this.getFavorites();
        const filtered = favorites.filter(fav => 
            !(fav.name.toLowerCase() === cityName.toLowerCase() && fav.country === country)
        );
        this.setFavorites(filtered);
    }

    isFavorite(cityName, country) {
        const favorites = this.getFavorites();
        return favorites.some(fav => 
            fav.name.toLowerCase() === cityName.toLowerCase() && 
            fav.country === country
        );
    }

    getLastLocation() {
        const lastLocation = this.getSetting('lastLocation');
        return lastLocation ? JSON.parse(lastLocation) : null;
    }

    setLastLocation(location) {
        this.setSetting('lastLocation', JSON.stringify(location));
    }

    buildApiUrl(endpoint, params = {}) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            throw new Error('APIキーが設定されていません。設定画面でAPIキーを入力してください。');
        }

        const url = new URL(`${this.defaults.apiUrl}/${endpoint}`);
        
        params.appid = apiKey;
        params.units = this.getTemperatureUnit();
        params.lang = 'ja';

        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });

        return url.toString();
    }

    buildGeocodingUrl(params = {}) {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            throw new Error('APIキーが設定されていません。設定画面でAPIキーを入力してください。');
        }

        const url = new URL(`${this.defaults.geocodingUrl}/direct`);
        
        params.appid = apiKey;
        params.limit = params.limit || 5;

        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });

        return url.toString();
    }

    openSettings() {
        const modal = document.getElementById('settings-modal');
        const apiKeyInput = document.getElementById('api-key');
        const temperatureUnitSelect = document.getElementById('temperature-unit');

        if (apiKeyInput) {
            apiKeyInput.value = this.getApiKey();
        }

        if (temperatureUnitSelect) {
            temperatureUnitSelect.value = this.getTemperatureUnit();
        }

        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            
            setTimeout(() => {
                if (apiKeyInput) {
                    apiKeyInput.focus();
                }
            }, 100);
        }
    }

    closeSettings() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }

    saveSettings() {
        const apiKeyInput = document.getElementById('api-key');
        const temperatureUnitSelect = document.getElementById('temperature-unit');

        let hasChanges = false;

        if (apiKeyInput && apiKeyInput.value.trim()) {
            const newApiKey = apiKeyInput.value.trim();
            if (newApiKey !== this.getApiKey()) {
                this.setApiKey(newApiKey);
                hasChanges = true;
            }
        }

        if (temperatureUnitSelect && temperatureUnitSelect.value) {
            const newUnit = temperatureUnitSelect.value;
            if (newUnit !== this.getTemperatureUnit()) {
                this.setTemperatureUnit(newUnit);
                hasChanges = true;
            }
        }

        this.closeSettings();

        if (hasChanges) {
            this.showNotification('設定を保存しました', 'success');
            
            const event = new CustomEvent('configChanged', {
                detail: {
                    apiKey: this.getApiKey(),
                    temperatureUnit: this.getTemperatureUnit()
                }
            });
            document.dispatchEvent(event);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 1rem;
            right: 1rem;
            background: ${type === 'success' ? '#27AE60' : type === 'error' ? '#E74C3C' : '#3498DB'};
            color: white;
            padding: 1rem;
            border-radius: 10px;
            z-index: 2000;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    validateApiKey(apiKey) {
        return apiKey && apiKey.length === 32 && /^[a-f0-9]+$/i.test(apiKey);
    }

    isConfigured() {
        const apiKey = this.getApiKey();
        return apiKey && apiKey.length > 0;
    }

    getSetting(key) {
        try {
            return localStorage.getItem(this.storageKeys[key]);
        } catch (error) {
            console.warn('LocalStorageへのアクセスに失敗しました:', error);
            return null;
        }
    }

    setSetting(key, value) {
        try {
            localStorage.setItem(this.storageKeys[key], value);
        } catch (error) {
            console.warn('LocalStorageへの保存に失敗しました:', error);
        }
    }

    clearSettings() {
        try {
            Object.values(this.storageKeys).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            console.warn('設定のクリアに失敗しました:', error);
        }
    }

    exportSettings() {
        const settings = {};
        Object.keys(this.storageKeys).forEach(key => {
            const value = this.getSetting(key);
            if (value !== null) {
                settings[key] = value;
            }
        });
        return JSON.stringify(settings, null, 2);
    }

    importSettings(settingsJson) {
        try {
            const settings = JSON.parse(settingsJson);
            Object.keys(settings).forEach(key => {
                if (this.storageKeys[key]) {
                    this.setSetting(key, settings[key]);
                }
            });
            this.loadSettings();
            return true;
        } catch (error) {
            console.error('設定のインポートに失敗しました:', error);
            return false;
        }
    }
}

const weatherConfig = new WeatherConfig();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeatherConfig;
}