// UI制御とイベント処理

class GameUI {
    constructor() {
        console.log('GameUI constructor called');
        this.gridContainer = $('#grid-container');
        this.tileContainer = $('#tile-container');
        this.scoreElement = $('#score');
        this.bestScoreElement = $('#best-score');
        this.restartButton = $('#restart-btn');
        this.tryAgainButton = $('#try-again-btn');
        this.gameMessage = $('#game-message');
        this.messageTitle = $('#message-title');
        this.messageContent = $('#message-content');
        
        console.log('DOM elements:', {
            gridContainer: this.gridContainer,
            tileContainer: this.tileContainer,
            scoreElement: this.scoreElement,
            restartButton: this.restartButton
        });
        
        this.tiles = new Map(); // タイルIDとDOM要素のマッピング
        this.nextTileId = 1;
        
        this.init();
    }
    
    // UI初期化
    init() {
        this.setupEventListeners();
        this.updateBestScore();
        this.calculateTileSize();
        
        // ウィンドウリサイズ時の処理
        window.addEventListener('resize', debounce(() => {
            this.calculateTileSize();
            this.updateAllTilePositions();
        }, 250));
    }
    
    // イベントリスナーの設定
    setupEventListeners() {
        // キーボード操作
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // ボタン操作
        this.restartButton.addEventListener('click', () => this.restartGame());
        this.tryAgainButton.addEventListener('click', () => this.restartGame());
        
        // 矢印キーボタン操作
        const arrowButtons = document.querySelectorAll('.arrow-btn');
        arrowButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const direction = button.getAttribute('data-direction');
                console.log('Arrow button clicked:', direction);
                this.makeMove(direction);
            });
            
            // タッチイベントも追加（より確実な動作のため）
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const direction = button.getAttribute('data-direction');
                console.log('Arrow button touched:', direction);
                this.makeMove(direction);
            });
        });
        
        // iOS Safari対応
        document.addEventListener('gesturestart', (e) => e.preventDefault());
        document.addEventListener('gesturechange', (e) => e.preventDefault());
        document.addEventListener('gestureend', (e) => e.preventDefault());
    }
    
    // タイルサイズの計算
    calculateTileSize() {
        const containerRect = this.gridContainer.getBoundingClientRect();
        const containerSize = Math.min(containerRect.width, containerRect.height);
        this.cellSize = (containerSize - 40) / 4; // 40px = padding + gaps
        this.containerSize = containerSize;
    }
    
    // キーボード操作の処理
    handleKeyDown(e) {
        if (game?.isAnimating) return;
        
        const keyMap = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'KeyW': 'up',
            'KeyS': 'down',
            'KeyA': 'left',
            'KeyD': 'right'
        };
        
        const direction = keyMap[e.code];
        if (direction) {
            e.preventDefault();
            this.makeMove(direction);
        }
    }
    
    // 移動の実行
    makeMove(direction) {
        if (game?.isAnimating || game?.gameEnded) return;
        
        console.log('Making move:', direction);
        const result = game.move(direction);
        console.log('Move result:', result);
        
        if (!result) {
            console.log('No move possible');
            return;
        }
        
        game.isAnimating = true;
        
        // アニメーション実行
        this.animateMove(result).then(() => {
            game.isAnimating = false;
            
            // ゲーム状態をチェック
            if (result.isWon && !game.isWon) {
                this.showWinMessage();
            } else if (result.isGameOver) {
                this.showGameOverMessage();
            }
        });
        
        // スコア更新
        this.updateScore();
        this.updateBestScore();
    }
    
    // 移動アニメーションの実行
    async animateMove(result) {
        const promises = [];
        
        // 既存タイルの移動とマージ
        result.mergedTiles.forEach(merge => {
            const fromTile = this.findTileAtPosition(merge.from.row, merge.from.col);
            if (fromTile) {
                promises.push(this.animateTileMove(fromTile.element, merge.to.row, merge.to.col));
            }
        });
        
        // すべての移動アニメーションを実行
        await Promise.all(promises);
        
        // グリッドを完全に更新
        this.updateGrid();
        
        // 新しいタイルの追加
        if (result.newTile) {
            this.addTile(result.newTile.row, result.newTile.col, result.newTile.value, true);
        }
    }
    
    // タイル移動アニメーション
    animateTileMove(element, toRow, toCol) {
        return new Promise(resolve => {
            const pos = getPixelPosition(toRow, toCol, this.containerSize);
            element.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
            
            setTimeout(resolve, 150); // CSS transition時間と合わせる
        });
    }
    
    // グリッド全体の更新
    updateGrid() {
        // 既存のタイルをクリア
        this.tileContainer.innerHTML = '';
        this.tiles.clear();
        this.nextTileId = 1;
        
        // 現在のグリッド状態からタイルを生成
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const value = game.grid[row][col];
                if (value !== 0) {
                    this.addTile(row, col, value, false);
                }
            }
        }
    }
    
    // タイルの追加
    addTile(row, col, value, isNew = false) {
        const tileElement = createElement('div', `tile tile-${value}`);
        const tileId = this.nextTileId++;
        
        // 位置の設定
        const pos = getPixelPosition(row, col, this.containerSize);
        tileElement.style.width = `${this.cellSize}px`;
        tileElement.style.height = `${this.cellSize}px`;
        tileElement.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        tileElement.textContent = value;
        
        // 新しいタイルの場合はアニメーションクラスを追加
        if (isNew) {
            tileElement.classList.add('tile-new');
        }
        
        this.tileContainer.appendChild(tileElement);
        this.tiles.set(tileId, {
            element: tileElement,
            row: row,
            col: col,
            value: value
        });
        
        return tileElement;
    }
    
    // 指定位置のタイルを検索
    findTileAtPosition(row, col) {
        for (const [id, tile] of this.tiles) {
            if (tile.row === row && tile.col === col) {
                return tile;
            }
        }
        return null;
    }
    
    // 全タイル位置の更新
    updateAllTilePositions() {
        this.tiles.forEach(tile => {
            const pos = getPixelPosition(tile.row, tile.col, this.containerSize);
            tile.element.style.width = `${this.cellSize}px`;
            tile.element.style.height = `${this.cellSize}px`;
            tile.element.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
        });
    }
    
    // スコア更新
    updateScore() {
        this.scoreElement.textContent = formatNumber(game.score);
        this.scoreElement.classList.add('score-increase');
        setTimeout(() => {
            this.scoreElement.classList.remove('score-increase');
        }, 300);
    }
    
    // ベストスコア更新
    updateBestScore() {
        const bestScore = gameStorage.getBestScore();
        this.bestScoreElement.textContent = formatNumber(bestScore);
    }
    
    // 勝利メッセージの表示
    showWinMessage() {
        this.messageTitle.textContent = '祝！2048達成！';
        this.messageContent.textContent = 'おめでとうございます！続行しますか？';
        
        // 継続ボタンを追加
        const continueButton = createElement('button', 'try-again-button', '続ける');
        continueButton.style.marginRight = '12px';
        continueButton.addEventListener('click', () => {
            game.continueGame();
            this.hideMessage();
        });
        
        const restartButton = createElement('button', 'try-again-button', '新しいゲーム');
        restartButton.addEventListener('click', () => this.restartGame());
        
        this.messageContent.innerHTML = '';
        this.messageContent.appendChild(document.createTextNode('おめでとうございます！続行しますか？'));
        this.messageContent.appendChild(document.createElement('br'));
        this.messageContent.appendChild(document.createElement('br'));
        this.messageContent.appendChild(continueButton);
        this.messageContent.appendChild(restartButton);
        
        this.showMessage();
        
        // バイブレーション（対応デバイスのみ）
        if (Support.vibration) {
            navigator.vibrate([200, 100, 200]);
        }
    }
    
    // ゲームオーバーメッセージの表示
    showGameOverMessage() {
        const endResult = game.endGame(false);
        
        this.messageTitle.textContent = 'ゲームオーバー';
        
        let message = 'もう一度挑戦しますか？';
        if (endResult.isNewRecord) {
            message = '新記録です！\n' + message;
        }
        
        this.messageContent.textContent = message;
        this.tryAgainButton.textContent = 'もう一度';
        
        this.showMessage();
        
        // 統計情報をコンソールに出力（デバッグ用）
        console.log('Game Over Stats:', endResult);
    }
    
    // メッセージの表示
    showMessage() {
        this.gameMessage.classList.add('active');
        this.gameMessage.classList.add('fade-in');
    }
    
    // メッセージの非表示
    hideMessage() {
        this.gameMessage.classList.remove('active', 'fade-in');
    }
    
    // ゲームリスタート
    restartGame() {
        this.hideMessage();
        game.restart();
        this.updateGrid();
        this.updateScore();
        this.updateBestScore();
    }
    
    // ゲーム開始時の初期化
    startGame() {
        this.updateGrid();
        this.updateScore();
        this.updateBestScore();
    }
}

// DOM読み込み完了時の処理
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    try {
        // ゲームとUIの初期化
        console.log('Creating Game2048 instance...');
        game = new Game2048();
        console.log('Game instance created:', game);
        
        console.log('Creating GameUI instance...');
        const gameUI = new GameUI();
        console.log('GameUI instance created:', gameUI);
        
        // 初期画面の更新
        gameUI.startGame();
        
        // サービスワーカーの登録（PWA対応）
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js').catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
        }
        
        // デバッグ用のグローバル参照
        window.game = game;
        window.gameUI = gameUI;
        
        console.log('2048 Game initialized successfully!');
        console.log('Device Info:', {
            isMobile: Device.isMobile,
            isTouch: Support.touch,
            localStorage: Support.localStorage,
            viewportSize: Device.getViewportSize()
        });
        
    } catch (error) {
        console.error('Initialization error:', error);
        handleError(error, 'Game initialization');
        
        // フォールバック：基本的なエラーメッセージを表示
        document.body.innerHTML = `
            <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
                <h1>エラーが発生しました</h1>
                <p>ゲームを読み込めませんでした。ページを再読み込みしてください。</p>
                <button onclick="location.reload()" style="padding: 10px 20px; font-size: 16px;">
                    再読み込み
                </button>
            </div>
        `;
    }
});

// ページ離脱時の処理
window.addEventListener('beforeunload', () => {
    if (game && !game.gameEnded) {
        game.saveGameState();
    }
});

// ページの可視性変更時の処理
document.addEventListener('visibilitychange', () => {
    if (document.hidden && game && !game.gameEnded) {
        game.saveGameState();
    }
});