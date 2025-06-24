// 2048ゲームのメインロジック

class Game2048 {
    constructor() {
        this.gridSize = 4;
        this.grid = [];
        this.score = 0;
        this.moves = 0;
        this.startTime = null;
        this.isWon = false;
        this.canContinue = true;
        this.isAnimating = false;
        this.gameEnded = false;
        
        this.init();
    }
    
    // ゲームの初期化
    init() {
        this.initGrid();
        this.loadGameState();
        this.addRandomTile();
        this.addRandomTile();
        this.startTime = Date.now();
    }
    
    // グリッドの初期化
    initGrid() {
        this.grid = [];
        for (let row = 0; row < this.gridSize; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                this.grid[row][col] = 0;
            }
        }
    }
    
    // 保存されたゲーム状態の読み込み
    loadGameState() {
        const savedState = gameStorage.loadGameState();
        if (savedState && savedState.grid) {
            this.grid = savedState.grid;
            this.score = savedState.score || 0;
            this.moves = savedState.moves || 0;
            this.startTime = savedState.startTime || Date.now();
            this.isWon = savedState.isWon || false;
            this.canContinue = savedState.canContinue !== false;
            
            // 空のグリッドでない場合は、新しいタイルを追加しない
            if (this.hasNonEmptyTiles()) {
                return;
            }
        }
        
        // 新しいゲームの場合は初期化
        this.score = 0;
        this.moves = 0;
        this.isWon = false;
        this.canContinue = true;
        this.startTime = Date.now();
    }
    
    // 空でないタイルがあるかチェック
    hasNonEmptyTiles() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] !== 0) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // ランダムタイルの追加
    addRandomTile() {
        const emptyCells = getEmptyCells(this.grid);
        if (emptyCells.length === 0) return false;
        
        const randomCell = emptyCells[getRandomInt(0, emptyCells.length - 1)];
        const value = Math.random() < 0.9 ? 2 : 4; // 90%の確率で2、10%の確率で4
        
        this.grid[randomCell.row][randomCell.col] = value;
        return { row: randomCell.row, col: randomCell.col, value };
    }
    
    // タイルの移動（方向: 'up', 'down', 'left', 'right'）
    move(direction) {
        if (this.isAnimating || this.gameEnded) return null;
        
        const previousGrid = deepCopy(this.grid);
        const moveResult = this.performMove(direction);
        
        if (!moveResult.moved) {
            return null; // 移動が発生しなかった
        }
        
        this.moves++;
        this.score += moveResult.scoreGain;
        
        // 新しいタイルを追加
        const newTile = this.addRandomTile();
        
        // ゲーム状態をチェック
        this.checkWinCondition();
        this.checkGameOver();
        
        // ゲーム状態を保存
        this.saveGameState();
        
        return {
            moved: true,
            scoreGain: moveResult.scoreGain,
            mergedTiles: moveResult.mergedTiles,
            newTile: newTile,
            isWon: this.isWon,
            isGameOver: this.gameEnded
        };
    }
    
    // 実際の移動処理
    performMove(direction) {
        let moved = false;
        let scoreGain = 0;
        const mergedTiles = [];
        
        const vectors = this.getDirectionVector(direction);
        const traversals = this.buildTraversals(vectors);
        
        // マージフラグをリセット
        const merged = [];
        for (let row = 0; row < this.gridSize; row++) {
            merged[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                merged[row][col] = false;
            }
        }
        
        traversals.x.forEach(x => {
            traversals.y.forEach(y => {
                const cell = { row: y, col: x };
                const tile = this.grid[cell.row][cell.col];
                
                if (tile !== 0) {
                    const positions = this.findFarthestPosition(cell, vectors);
                    const next = positions.next;
                    
                    // 次の位置にタイルがあり、同じ値で、まだマージされていない場合
                    if (next && this.grid[next.row] && this.grid[next.row][next.col] === tile && !merged[next.row][next.col]) {
                        // マージ
                        const mergedValue = tile * 2;
                        this.grid[next.row][next.col] = mergedValue;
                        this.grid[cell.row][cell.col] = 0;
                        merged[next.row][next.col] = true;
                        
                        scoreGain += mergedValue;
                        mergedTiles.push({
                            from: { row: cell.row, col: cell.col },
                            to: { row: next.row, col: next.col },
                            value: mergedValue
                        });
                        moved = true;
                    } else {
                        // 移動のみ
                        const farthest = positions.farthest;
                        if (cell.row !== farthest.row || cell.col !== farthest.col) {
                            this.grid[farthest.row][farthest.col] = tile;
                            this.grid[cell.row][cell.col] = 0;
                            moved = true;
                        }
                    }
                }
            });
        });
        
        return { moved, scoreGain, mergedTiles };
    }
    
    // 方向ベクトルの取得
    getDirectionVector(direction) {
        const vectors = {
            up: { x: 0, y: -1 },
            right: { x: 1, y: 0 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 }
        };
        return vectors[direction];
    }
    
    // トラバーサル順序の構築
    buildTraversals(vector) {
        const traversals = { x: [], y: [] };
        
        for (let pos = 0; pos < this.gridSize; pos++) {
            traversals.x.push(pos);
            traversals.y.push(pos);
        }
        
        // 移動方向に応じて順序を逆転
        if (vector.x === 1) traversals.x = traversals.x.reverse();
        if (vector.y === 1) traversals.y = traversals.y.reverse();
        
        return traversals;
    }
    
    // 最遠位置の検索
    findFarthestPosition(cell, vector) {
        let previous;
        
        do {
            previous = cell;
            cell = {
                row: previous.row + vector.y,
                col: previous.col + vector.x
            };
        } while (this.withinBounds(cell) && this.cellAvailable(cell));
        
        return {
            farthest: previous,
            next: cell
        };
    }
    
    // セルが範囲内かチェック
    withinBounds(cell) {
        return cell.row >= 0 && cell.row < this.gridSize &&
               cell.col >= 0 && cell.col < this.gridSize;
    }
    
    // セルが利用可能かチェック
    cellAvailable(cell) {
        return this.grid[cell.row][cell.col] === 0;
    }
    
    // 勝利条件のチェック
    checkWinCondition() {
        if (this.isWon) return;
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] === 2048) {
                    this.isWon = true;
                    return;
                }
            }
        }
    }
    
    // ゲームオーバーのチェック
    checkGameOver() {
        if (!this.canContinue) {
            this.gameEnded = true;
            return;
        }
        
        // 空のセルがある場合はゲーム継続
        if (getEmptyCells(this.grid).length > 0) {
            return;
        }
        
        // 隣接するセルで同じ値があるかチェック
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const current = this.grid[row][col];
                
                // 右のセルをチェック
                if (col < this.gridSize - 1 && this.grid[row][col + 1] === current) {
                    return;
                }
                
                // 下のセルをチェック
                if (row < this.gridSize - 1 && this.grid[row + 1][col] === current) {
                    return;
                }
            }
        }
        
        // 移動可能な手がない場合はゲームオーバー
        this.gameEnded = true;
    }
    
    // 最高のタイル値を取得
    getBestTile() {
        let best = 0;
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] > best) {
                    best = this.grid[row][col];
                }
            }
        }
        return best;
    }
    
    // ゲーム状態の保存
    saveGameState() {
        const gameState = {
            grid: deepCopy(this.grid),
            score: this.score,
            moves: this.moves,
            startTime: this.startTime,
            isWon: this.isWon,
            canContinue: this.canContinue
        };
        
        gameStorage.saveGameState(gameState);
        gameStorage.setCurrentScore(this.score);
    }
    
    // ゲームのリスタート
    restart() {
        this.initGrid();
        this.score = 0;
        this.moves = 0;
        this.startTime = Date.now();
        this.isWon = false;
        this.canContinue = true;
        this.gameEnded = false;
        this.isAnimating = false;
        
        this.addRandomTile();
        this.addRandomTile();
        
        gameStorage.clearGameState();
        this.saveGameState();
    }
    
    // ゲーム継続（2048達成後）
    continueGame() {
        this.canContinue = true;
        this.saveGameState();
    }
    
    // ゲーム終了処理
    endGame(won = false) {
        const gameTime = Math.floor((Date.now() - this.startTime) / 1000);
        
        // 統計を更新
        gameStorage.updateStatistics({
            gameCompleted: true,
            won: won,
            score: this.score,
            bestTile: this.getBestTile(),
            moves: this.moves,
            time: gameTime
        });
        
        // ベストスコアを更新
        const isNewRecord = gameStorage.setBestScore(this.score);
        
        gameStorage.clearGameState();
        
        return {
            isNewRecord,
            gameTime,
            finalScore: this.score,
            bestTile: this.getBestTile()
        };
    }
    
    // デバッグ用：グリッドの表示
    printGrid() {
        console.log('Current Grid:');
        for (let row = 0; row < this.gridSize; row++) {
            console.log(this.grid[row].join('\t'));
        }
        console.log('Score:', this.score, 'Moves:', this.moves);
    }
}

// グローバルゲームインスタンス
let game;