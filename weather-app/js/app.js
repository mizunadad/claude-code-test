class WeatherApp {
    constructor() {
        this.config = weatherConfig;
        this.currentLocation = null;
        this.currentWeather = null;
        this.isLoading = false;
        
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupTouchGestures();
        this.showInitialState();
        
        if (this.config.isConfigured()) {
            await this.loadInitialWeather();
        } else {
            this.showConfigurationNeeded();
        }
    }

    setupEventListeners() {
        const searchBtn = document.getElementById('search-btn');
        const citySearch = document.getElementById('city-search');
        const locationBtn = document.getElementById('location-btn');
        const retryBtn = document.getElementById('retry-btn');
        const favoriteBtn = document.getElementById('favorite-btn');
        const tabBtns = document.querySelectorAll('.tab-btn');

        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.handleSearch());
        }

        if (citySearch) {
            citySearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !this.isLoading) {
                    this.handleSearch();
                }
            });
            
            citySearch.addEventListener('input', this.debounce((e) => {
                this.handleSearchSuggestions(e.target.value);
            }, 300));
        }

        if (locationBtn) {
            locationBtn.addEventListener('click', () => this.getCurrentLocation());
        }

        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.retryLastOperation());
        }

        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', () => this.toggleFavorite());
        }

        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        document.addEventListener('configChanged', (e) => {
            if (this.currentLocation) {
                this.loadWeatherData(this.currentLocation);
            }
        });

        document.addEventListener('debugWeatherData', (e) => {
            if (e.detail && e.detail.location && e.detail.weather) {
                this.currentLocation = e.detail.location;
                this.currentWeather = e.detail.weather;
                this.displayCurrentWeather(e.detail.weather, e.detail.location);
                this.hideLoading();
                this.hideError();
                this.showWeatherContent();
                this.switchTab('hourly');
            }
        });

        window.addEventListener('online', () => {
            if (this.currentLocation) {
                this.loadWeatherData(this.currentLocation);
            }
        });

        window.addEventListener('offline', () => {
            this.showError('インターネット接続がありません');
        });
    }

    setupTouchGestures() {
        const weatherContent = document.getElementById('weather-content');
        
        if (weatherContent) {
            weatherContent.addEventListener('touchstart', (e) => {
                this.touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            weatherContent.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe();
            }, { passive: true });
        }
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            const tabs = ['hourly', 'daily', 'favorites'];
            const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
            const currentIndex = tabs.indexOf(activeTab);

            let newIndex;
            if (diff > 0 && currentIndex < tabs.length - 1) {
                newIndex = currentIndex + 1;
            } else if (diff < 0 && currentIndex > 0) {
                newIndex = currentIndex - 1;
            } else {
                return;
            }

            this.switchTab(tabs[newIndex]);
        }
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(`${tabName}-tab`);

        if (activeBtn && activeContent) {
            activeBtn.classList.add('active');
            activeContent.classList.add('active');

            if (tabName === 'favorites') {
                this.loadFavorites();
            }
        }
    }

    showInitialState() {
        this.hideLoading();
        this.hideError();
        this.hideWeatherContent();
    }

    showConfigurationNeeded() {
        this.showError('APIキーが設定されていません。設定画面でOpenWeatherMap APIキーを入力してください。');
    }

    async loadInitialWeather() {
        const lastLocation = this.config.getLastLocation();
        
        if (lastLocation) {
            await this.loadWeatherData(lastLocation);
        } else {
            this.getCurrentLocation();
        }
    }

    async handleSearch() {
        const citySearch = document.getElementById('city-search');
        const query = citySearch.value.trim();
        
        if (!query) return;

        try {
            this.showLoading('都市を検索中...');
            const locations = await this.searchCity(query);
            
            if (locations && locations.length > 0) {
                const location = locations[0];
                await this.loadWeatherData({
                    lat: location.lat,
                    lon: location.lon,
                    name: location.name,
                    country: location.country
                });
                citySearch.value = '';
            } else {
                this.showError('都市が見つかりませんでした');
            }
        } catch (error) {
            this.showError('都市の検索に失敗しました: ' + error.message, {
                type: 'search_error',
                query: query,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    async handleSearchSuggestions(query) {
        if (query.length < 2) return;

        try {
            const locations = await this.searchCity(query);
            this.showSearchSuggestions(locations);
        } catch (error) {
            console.error('検索候補の取得に失敗しました:', error);
        }
    }

    showSearchSuggestions(locations) {
        const existingSuggestions = document.querySelector('.search-suggestions');
        if (existingSuggestions) {
            existingSuggestions.remove();
        }

        if (!locations || locations.length === 0) return;

        const suggestions = document.createElement('div');
        suggestions.className = 'search-suggestions';
        suggestions.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--bg-card);
            border-radius: 0 0 15px 15px;
            box-shadow: 0 4px 15px var(--shadow-medium);
            z-index: 10;
            max-height: 200px;
            overflow-y: auto;
        `;

        locations.slice(0, 5).forEach(location => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.style.cssText = `
                padding: 0.75rem 1rem;
                cursor: pointer;
                border-bottom: 1px solid var(--border-color);
                transition: background 0.2s ease;
            `;
            item.textContent = `${location.name}, ${location.country}`;
            
            item.addEventListener('click', async () => {
                suggestions.remove();
                document.getElementById('city-search').value = '';
                await this.loadWeatherData({
                    lat: location.lat,
                    lon: location.lon,
                    name: location.name,
                    country: location.country
                });
            });

            item.addEventListener('mouseenter', () => {
                item.style.background = 'var(--bg-secondary)';
            });

            item.addEventListener('mouseleave', () => {
                item.style.background = 'transparent';
            });

            suggestions.appendChild(item);
        });

        const searchContainer = document.querySelector('.search-bar');
        searchContainer.style.position = 'relative';
        searchContainer.appendChild(suggestions);

        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target)) {
                suggestions.remove();
            }
        }, { once: true });
    }

    async getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('位置情報がサポートされていません');
            return;
        }

        this.showLoading('現在地を取得中...');

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        };

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await this.loadWeatherData({
                    lat: latitude,
                    lon: longitude
                });
            },
            (error) => {
                let message = '位置情報の取得に失敗しました';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = '位置情報の使用が許可されていません';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = '位置情報が利用できません';
                        break;
                    case error.TIMEOUT:
                        message = '位置情報の取得がタイムアウトしました';
                        break;
                }
                this.showError(message);
            },
            options
        );
    }

    async searchCity(query) {
        const url = this.config.buildGeocodingUrl({ q: query });
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`検索エラー: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }
        
        return await response.json();
    }

    async loadWeatherData(location) {
        try {
            this.showLoading('天気情報を取得中...');
            this.currentLocation = location;

            const [currentWeather, forecast] = await Promise.all([
                this.fetchCurrentWeather(location.lat, location.lon),
                this.fetchForecast(location.lat, location.lon)
            ]);

            this.currentWeather = currentWeather;
            this.config.setLastLocation(location);

            this.displayCurrentWeather(currentWeather, location);
            this.displayHourlyForecast(forecast);
            this.displayDailyForecast(forecast);
            this.updateBackground(currentWeather);
            
            this.hideLoading();
            this.hideError();
            this.showWeatherContent();

        } catch (error) {
            console.error('天気データの取得エラー:', error);
            this.showError('天気情報の取得に失敗しました: ' + error.message, {
                type: 'weather_data_error',
                location: location,
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
        }
    }

    async fetchCurrentWeather(lat, lon) {
        const url = this.config.buildApiUrl('weather', { lat, lon });
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`天気情報エラー: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }
        
        return await response.json();
    }

    async fetchForecast(lat, lon) {
        const url = this.config.buildApiUrl('forecast', { lat, lon });
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`予報情報エラー: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }
        
        return await response.json();
    }

    displayCurrentWeather(weather, location) {
        const cityElement = document.getElementById('current-city');
        const tempElement = document.getElementById('current-temperature');
        const descElement = document.getElementById('current-desc');
        const feelsLikeElement = document.getElementById('feels-like');
        const iconElement = document.getElementById('current-icon');
        const humidityElement = document.getElementById('humidity');
        const windSpeedElement = document.getElementById('wind-speed');
        const pressureElement = document.getElementById('pressure');
        const visibilityElement = document.getElementById('visibility');

        if (cityElement) {
            cityElement.textContent = location.name || weather.name;
        }

        if (tempElement) {
            const temp = Math.round(weather.main.temp);
            const unit = this.config.getTemperatureUnit() === 'metric' ? '°C' : '°F';
            tempElement.textContent = `${temp}${unit}`;
        }

        if (descElement) {
            descElement.textContent = weather.weather[0].description;
        }

        if (feelsLikeElement) {
            const feelsLike = Math.round(weather.main.feels_like);
            const unit = this.config.getTemperatureUnit() === 'metric' ? '°C' : '°F';
            feelsLikeElement.textContent = `体感温度: ${feelsLike}${unit}`;
        }

        if (iconElement) {
            const iconCode = weather.weather[0].icon;
            iconElement.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
            iconElement.alt = weather.weather[0].description;
        }

        if (humidityElement) {
            humidityElement.textContent = `${weather.main.humidity}%`;
        }

        if (windSpeedElement) {
            const windSpeed = weather.wind?.speed || 0;
            windSpeedElement.textContent = `${windSpeed} m/s`;
        }

        if (pressureElement) {
            pressureElement.textContent = `${weather.main.pressure} hPa`;
        }

        if (visibilityElement) {
            const visibility = weather.visibility ? (weather.visibility / 1000).toFixed(1) : '不明';
            visibilityElement.textContent = `${visibility} km`;
        }

        this.updateFavoriteButton();
    }

    displayHourlyForecast(forecast) {
        const hourlyList = document.getElementById('hourly-list');
        if (!hourlyList) return;

        hourlyList.innerHTML = '';

        forecast.list.slice(0, 24).forEach(item => {
            const hourlyItem = document.createElement('div');
            hourlyItem.className = 'hourly-item';

            const time = new Date(item.dt * 1000);
            const timeString = time.getHours().toString().padStart(2, '0') + ':00';
            
            const temp = Math.round(item.main.temp);
            const unit = this.config.getTemperatureUnit() === 'metric' ? '°C' : '°F';
            const iconCode = item.weather[0].icon;

            hourlyItem.innerHTML = `
                <div class="hourly-time">${timeString}</div>
                <div class="hourly-icon">
                    <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="${item.weather[0].description}">
                </div>
                <div class="hourly-temp">${temp}${unit}</div>
            `;

            hourlyList.appendChild(hourlyItem);
        });
    }

    displayDailyForecast(forecast) {
        const dailyList = document.getElementById('daily-list');
        if (!dailyList) return;

        dailyList.innerHTML = '';

        const dailyData = this.groupForecastByDay(forecast.list);

        dailyData.slice(0, 5).forEach(day => {
            const dailyItem = document.createElement('div');
            dailyItem.className = 'daily-item';

            const date = new Date(day.dt * 1000);
            const dateString = this.formatDate(date);
            
            const high = Math.round(day.main.temp_max);
            const low = Math.round(day.main.temp_min);
            const unit = this.config.getTemperatureUnit() === 'metric' ? '°C' : '°F';
            const iconCode = day.weather[0].icon;

            dailyItem.innerHTML = `
                <div class="daily-date">${dateString}</div>
                <div class="daily-weather">
                    <div class="daily-icon">
                        <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="${day.weather[0].description}">
                    </div>
                    <div class="daily-desc">${day.weather[0].description}</div>
                </div>
                <div class="daily-temps">
                    <span class="daily-high">${high}${unit}</span>
                    <span class="daily-low">${low}${unit}</span>
                </div>
            `;

            dailyList.appendChild(dailyItem);
        });
    }

    groupForecastByDay(forecastList) {
        const grouped = {};
        
        forecastList.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateKey = date.toDateString();
            
            if (!grouped[dateKey]) {
                grouped[dateKey] = {
                    dt: item.dt,
                    weather: item.weather,
                    main: {
                        temp_max: item.main.temp_max,
                        temp_min: item.main.temp_min
                    }
                };
            } else {
                if (item.main.temp_max > grouped[dateKey].main.temp_max) {
                    grouped[dateKey].main.temp_max = item.main.temp_max;
                }
                if (item.main.temp_min < grouped[dateKey].main.temp_min) {
                    grouped[dateKey].main.temp_min = item.main.temp_min;
                }
            }
        });
        
        return Object.values(grouped);
    }

    formatDate(date) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return '今日';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return '明日';
        } else {
            return date.toLocaleDateString('ja-JP', { 
                month: 'short', 
                day: 'numeric',
                weekday: 'short'
            });
        }
    }

    updateBackground(weather) {
        const body = document.body;
        const header = document.querySelector('.header');
        const weatherCondition = weather.weather[0].main.toLowerCase();
        const isNight = weather.weather[0].icon.includes('n');

        let gradient;
        
        if (isNight) {
            gradient = 'var(--gradient-night)';
        } else {
            switch (weatherCondition) {
                case 'clear':
                    gradient = 'var(--gradient-sunny)';
                    break;
                case 'clouds':
                    gradient = 'var(--gradient-cloudy)';
                    break;
                case 'rain':
                case 'drizzle':
                case 'thunderstorm':
                    gradient = 'var(--gradient-rainy)';
                    break;
                default:
                    gradient = 'var(--gradient-default)';
            }
        }

        if (header) {
            header.style.background = gradient;
        }

        const weatherBg = document.querySelector('.weather-background');
        if (weatherBg) {
            weatherBg.style.background = gradient;
        } else {
            const bgDiv = document.createElement('div');
            bgDiv.className = 'weather-background';
            bgDiv.style.background = gradient;
            body.appendChild(bgDiv);
        }
    }

    loadFavorites() {
        const favoritesList = document.getElementById('favorites-list');
        if (!favoritesList) return;

        const favorites = this.config.getFavorites();
        
        if (favorites.length === 0) {
            favoritesList.innerHTML = '<p class="no-favorites">お気に入りの都市がありません</p>';
            return;
        }

        favoritesList.innerHTML = '';
        
        favorites.forEach(async (favorite) => {
            const favoriteItem = document.createElement('div');
            favoriteItem.className = 'favorite-item';
            
            favoriteItem.innerHTML = `
                <div class="favorite-info">
                    <div class="favorite-city">${favorite.name}, ${favorite.country}</div>
                    <div class="favorite-temp">読み込み中...</div>
                </div>
                <button class="favorite-remove" aria-label="削除">×</button>
            `;

            const removeBtn = favoriteItem.querySelector('.favorite-remove');
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFavorite(favorite.name, favorite.country);
            });

            favoriteItem.addEventListener('click', () => {
                this.loadWeatherData(favorite);
                this.switchTab('hourly');
            });

            favoritesList.appendChild(favoriteItem);

            try {
                const weather = await this.fetchCurrentWeather(favorite.lat, favorite.lon);
                const temp = Math.round(weather.main.temp);
                const unit = this.config.getTemperatureUnit() === 'metric' ? '°C' : '°F';
                const tempElement = favoriteItem.querySelector('.favorite-temp');
                if (tempElement) {
                    tempElement.textContent = `${temp}${unit} - ${weather.weather[0].description}`;
                }
            } catch (error) {
                const tempElement = favoriteItem.querySelector('.favorite-temp');
                if (tempElement) {
                    tempElement.textContent = '取得エラー';
                }
            }
        });
    }

    updateFavoriteButton() {
        const favoriteBtn = document.getElementById('favorite-btn');
        if (!favoriteBtn || !this.currentLocation) return;

        const isFav = this.config.isFavorite(this.currentLocation.name, this.currentLocation.country);
        favoriteBtn.classList.toggle('active', isFav);
        favoriteBtn.setAttribute('aria-label', isFav ? 'お気に入りから削除' : 'お気に入りに追加');
    }

    toggleFavorite() {
        if (!this.currentLocation) return;

        const isFav = this.config.isFavorite(this.currentLocation.name, this.currentLocation.country);
        
        if (isFav) {
            this.config.removeFavorite(this.currentLocation.name, this.currentLocation.country);
            this.config.showNotification('お気に入りから削除しました', 'info');
        } else {
            const added = this.config.addFavorite(this.currentLocation);
            if (added) {
                this.config.showNotification('お気に入りに追加しました', 'success');
            } else {
                this.config.showNotification('既にお気に入りに登録されています', 'info');
            }
        }

        this.updateFavoriteButton();
    }

    removeFavorite(cityName, country) {
        this.config.removeFavorite(cityName, country);
        this.loadFavorites();
        this.updateFavoriteButton();
        this.config.showNotification('お気に入りから削除しました', 'info');
    }

    retryLastOperation() {
        if (this.currentLocation) {
            this.loadWeatherData(this.currentLocation);
        } else {
            this.getCurrentLocation();
        }
    }

    showLoading(message = '読み込み中...') {
        this.isLoading = true;
        const loading = document.getElementById('loading');
        if (loading) {
            const loadingText = loading.querySelector('p');
            if (loadingText) {
                loadingText.textContent = message;
            }
            loading.classList.remove('hidden');
        }
    }

    hideLoading() {
        this.isLoading = false;
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.add('hidden');
        }
    }

    showError(message, details = null) {
        const error = document.getElementById('error');
        const errorText = document.getElementById('error-text');
        
        if (error && errorText) {
            errorText.textContent = message;
            error.classList.remove('hidden');
            
            if (details) {
                this.config.showErrorDetails(JSON.stringify(details, null, 2));
            }
        }
        
        this.hideLoading();
    }

    hideError() {
        const error = document.getElementById('error');
        if (error) {
            error.classList.add('hidden');
        }
    }

    showWeatherContent() {
        const weatherContent = document.getElementById('weather-content');
        if (weatherContent) {
            weatherContent.classList.remove('hidden');
        }
    }

    hideWeatherContent() {
        const weatherContent = document.getElementById('weather-content');
        if (weatherContent) {
            weatherContent.classList.add('hidden');
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new WeatherApp();
    
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('SW registered: ', registration);
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }

    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        const installPrompt = document.getElementById('install-prompt');
        const installBtn = document.getElementById('install-app');
        const dismissBtn = document.getElementById('dismiss-install');
        
        if (installPrompt) {
            installPrompt.classList.remove('hidden');
        }
        
        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`User response to the install prompt: ${outcome}`);
                    deferredPrompt = null;
                    installPrompt.classList.add('hidden');
                }
            });
        }
        
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                installPrompt.classList.add('hidden');
                deferredPrompt = null;
            });
        }
    });

    window.addEventListener('appinstalled', () => {
        console.log('PWA was installed');
        const installPrompt = document.getElementById('install-prompt');
        if (installPrompt) {
            installPrompt.classList.add('hidden');
        }
    });
});