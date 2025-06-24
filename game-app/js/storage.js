// ローカルストレージ管理

class GameStorage {
    constructor() {
        this.storageKey = 'game2048';
        this.defaultData = {
            bestScore: 0,
            currentScore: 0,
            gameState: null,
            settings: {
                soundEnabled: true,
                vibrationEnabled: true,
                animationSpeed: 'normal'
            },
            statistics: {
                gamesPlayed: 0,
                gamesWon: 0,
                totalScore: 0,
                bestTile: 0,
                totalMoves: 0,
                totalTime: 0
            }
        };
        
        this.data = this.loadData();
    }
    
    // データの読み込み
    loadData() {
        if (!Support.localStorage) {
            return { ...this.defaultData };
        }
        
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                // デフォルトデータとマージして不足フィールドを補完
                return this.mergeWithDefaults(parsed);
            }
        } catch (error) {
            handleError(error, 'GameStorage.loadData');
        }
        
        return { ...this.defaultData };
    }
    
    // デフォルトデータとマージ
    mergeWithDefaults(data) {
        const merged = { ...this.defaultData };
        
        if (data.bestScore !== undefined) merged.bestScore = data.bestScore;
        if (data.currentScore !== undefined) merged.currentScore = data.currentScore;
        if (data.gameState !== undefined) merged.gameState = data.gameState;
        
        if (data.settings) {
            merged.settings = { ...merged.settings, ...data.settings };
        }
        
        if (data.statistics) {
            merged.statistics = { ...merged.statistics, ...data.statistics };
        }
        
        return merged;
    }
    
    // データの保存
    saveData() {
        if (!Support.localStorage) {
            return false;
        }
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            return true;
        } catch (error) {
            handleError(error, 'GameStorage.saveData');
            return false;
        }
    }
    
    // ベストスコアの取得
    getBestScore() {
        return this.data.bestScore;
    }
    
    // ベストスコアの更新
    setBestScore(score) {
        if (score > this.data.bestScore) {
            this.data.bestScore = score;
            this.saveData();
            return true; // 新記録
        }
        return false;
    }
    
    // 現在のスコアの保存
    setCurrentScore(score) {
        this.data.currentScore = score;
        this.saveData();
    }
    
    // ゲーム状態の保存
    saveGameState(gameState) {
        this.data.gameState = {
            grid: gameState.grid,
            score: gameState.score,
            moves: gameState.moves,
            startTime: gameState.startTime,
            isWon: gameState.isWon,
            canContinue: gameState.canContinue
        };
        this.saveData();
    }
    
    // ゲーム状態の読み込み
    loadGameState() {
        return this.data.gameState;
    }
    
    // ゲーム状態のクリア
    clearGameState() {
        this.data.gameState = null;
        this.saveData();
    }
    
    // 設定の取得
    getSetting(key) {
        return this.data.settings[key];
    }
    
    // 設定の保存
    setSetting(key, value) {
        this.data.settings[key] = value;
        this.saveData();
    }
    
    // 統計データの更新
    updateStatistics(stats) {
        const statistics = this.data.statistics;
        
        if (stats.gameCompleted) {
            statistics.gamesPlayed++;
            if (stats.won) {
                statistics.gamesWon++;
            }
        }
        
        if (stats.score !== undefined) {
            statistics.totalScore += stats.score;
        }
        
        if (stats.bestTile !== undefined && stats.bestTile > statistics.bestTile) {
            statistics.bestTile = stats.bestTile;
        }
        
        if (stats.moves !== undefined) {
            statistics.totalMoves += stats.moves;
        }
        
        if (stats.time !== undefined) {
            statistics.totalTime += stats.time;
        }
        
        this.saveData();
    }
    
    // 統計データの取得
    getStatistics() {
        return { ...this.data.statistics };
    }
    
    // 勝率の計算
    getWinRate() {
        const stats = this.data.statistics;
        if (stats.gamesPlayed === 0) return 0;
        return Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
    }
    
    // 平均スコアの計算
    getAverageScore() {
        const stats = this.data.statistics;
        if (stats.gamesPlayed === 0) return 0;
        return Math.round(stats.totalScore / stats.gamesPlayed);
    }
    
    // 平均ゲーム時間の計算
    getAverageTime() {
        const stats = this.data.statistics;
        if (stats.gamesPlayed === 0) return 0;
        return Math.round(stats.totalTime / stats.gamesPlayed);
    }
    
    // データのエクスポート
    exportData() {
        try {
            const exportData = {
                ...this.data,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            handleError(error, 'GameStorage.exportData');
            return null;
        }
    }
    
    // データのインポート
    importData(jsonString) {
        try {
            const importedData = JSON.parse(jsonString);
            
            // バージョンチェック（将来の互換性のため）
            if (importedData.version && importedData.version !== '1.0') {
                console.warn('Imported data version mismatch');
            }
            
            // データの検証
            if (this.validateImportedData(importedData)) {
                this.data = this.mergeWithDefaults(importedData);
                this.saveData();
                return true;
            }
            
            return false;
        } catch (error) {
            handleError(error, 'GameStorage.importData');
            return false;
        }
    }
    
    // インポートデータの検証
    validateImportedData(data) {
        // 基本的な型チェック
        if (typeof data !== 'object' || data === null) return false;
        
        // 必要なフィールドの存在チェック
        const requiredFields = ['bestScore'];
        for (const field of requiredFields) {
            if (!(field in data)) return false;
        }
        
        // 数値フィールドの検証
        if (typeof data.bestScore !== 'number' || data.bestScore < 0) return false;
        
        return true;
    }
    
    // 全データのリセット
    resetAllData() {
        this.data = { ...this.defaultData };
        this.saveData();
    }
    
    // 統計データのみリセット
    resetStatistics() {
        this.data.statistics = { ...this.defaultData.statistics };
        this.saveData();
    }
    
    // ストレージ使用量の取得（概算）
    getStorageUsage() {
        if (!Support.localStorage) return 0;
        
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? new Blob([data]).size : 0;
        } catch (error) {
            return 0;
        }
    }
}

// グローバルインスタンス
const gameStorage = new GameStorage();