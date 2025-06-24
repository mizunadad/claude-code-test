// ユーティリティ関数

// DOM要素の取得
function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
}

// 要素の作成
function createElement(tag, className, textContent) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
}

// 配列のディープコピー
function deepCopy(arr) {
    return arr.map(row => [...row]);
}

// 配列が等しいかチェック
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (Array.isArray(arr1[i]) && Array.isArray(arr2[i])) {
            if (!arraysEqual(arr1[i], arr2[i])) return false;
        } else if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}

// ランダムな整数を生成
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 配列をシャッフル
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 空のセルを取得
function getEmptyCells(grid) {
    const emptyCells = [];
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (grid[row][col] === 0) {
                emptyCells.push({ row, col });
            }
        }
    }
    return emptyCells;
}

// グリッドの位置からピクセル位置を計算
function getPixelPosition(row, col, containerSize) {
    const cellSize = (containerSize - 40) / 4; // 40px = padding + gaps
    const gap = 8;
    const x = col * (cellSize + gap) + gap;
    const y = row * (cellSize + gap) + gap;
    return { x, y, size: cellSize };
}

// 数値をフォーマット
function formatNumber(num) {
    if (num >= 1000000) {
        return Math.floor(num / 1000000) + 'M';
    } else if (num >= 1000) {
        return Math.floor(num / 1000) + 'K';
    }
    return num.toString();
}

// デバウンス関数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// スロットル関数
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// アニメーション完了を待つ
function waitForAnimation(element, animationName) {
    return new Promise(resolve => {
        const onAnimationEnd = (event) => {
            if (event.animationName === animationName) {
                element.removeEventListener('animationend', onAnimationEnd);
                resolve();
            }
        };
        element.addEventListener('animationend', onAnimationEnd);
    });
}

// トランジション完了を待つ
function waitForTransition(element, property) {
    return new Promise(resolve => {
        const onTransitionEnd = (event) => {
            if (event.propertyName === property) {
                element.removeEventListener('transitionend', onTransitionEnd);
                resolve();
            }
        };
        element.addEventListener('transitionend', onTransitionEnd);
    });
}

// ブラウザの機能サポートチェック
const Support = {
    localStorage: (function() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    })(),
    
    touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    
    vibration: 'vibrate' in navigator,
    
    cssTransforms: (function() {
        const div = document.createElement('div');
        return typeof div.style.transform !== 'undefined';
    })(),
    
    cssTransitions: (function() {
        const div = document.createElement('div');
        return typeof div.style.transition !== 'undefined';
    })()
};

// デバイス情報
const Device = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent),
    
    getViewportSize() {
        return {
            width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
            height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
        };
    }
};

// エラーハンドリング
function handleError(error, context = 'Unknown') {
    console.error(`Error in ${context}:`, error);
    
    // 本番環境では詳細なエラー情報を隠す
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.trace();
    }
}

// パフォーマンス測定
const Performance = {
    marks: new Map(),
    
    mark(name) {
        this.marks.set(name, performance.now());
    },
    
    measure(name, startMark) {
        const startTime = this.marks.get(startMark);
        if (startTime) {
            const duration = performance.now() - startTime;
            console.log(`${name}: ${duration.toFixed(2)}ms`);
            return duration;
        }
        return 0;
    }
};