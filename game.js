const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const currentScoreEl = document.getElementById('currentScore');
const targetScoreEl = document.getElementById('targetScore');
const finalScoreEl = document.getElementById('finalScore');
const gameOverTitle = document.getElementById('gameOverTitle');
const levelDescriptionEl = document.getElementById('levelDescription');

const startOverlay = document.getElementById('startOverlay');
const levelOverlay = document.getElementById('levelOverlay');
const pauseOverlay = document.getElementById('pauseOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const restartOverlayBtn = document.getElementById('restartOverlayBtn');
const openLevelBtn = document.getElementById('openLevelBtn');
const confirmLevelBtn = document.getElementById('confirmLevelBtn');
const resumeBtn = document.getElementById('resumeBtn');
const resumeOverlayBtn = document.getElementById('resumeOverlayBtn');
const pauseBtn = document.getElementById('pauseBtn');

const levelsGrid = document.getElementById('levelsGrid');
const colorOptions = document.getElementById('colorOptions');

const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

let snake = [];
let food = { x: 0, y: 0, spawnTime: 0, state: 'normal' };
let dx = 0;
let dy = 0;
let score = 0;
let targetScore = 300;
let gameInterval = null;
let currentLevel = 1;
let snakeColor = '#2ecc71';
let changingDirection = false;
let isPaused = false;
let gameStarted = false;

const levelDescriptions = {
    1: "Mô tả level 1: Ăn đủ 300 điểm mục tiêu để chiến thắng cơ bản.",
    2: "Mô tả level 2: Thức ăn đếm ngược 6s. Sau 4s đổi màu vàng (ít điểm hơn), qua 6s đổi màu đỏ sẫm (trừ điểm nhưng vẫn dài ra).",
    3: "mô tả level",
    4: "mô tả level",
    5: "mô tả level",
    6: "mô tả level",
    7: "mô tả level",
    8: "mô tả level",
    9: "mô tả level",
    10: "mô tả level"
};

targetScoreEl.textContent = targetScore;

for (let i = 1; i <= 10; i++) {
    const btn = document.createElement('button');
    btn.className = `level-btn ${i === 1 ? 'selected' : ''}`;
    btn.textContent = i;
    btn.dataset.level = i;
    btn.addEventListener('click', () => {
        document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        currentLevel = parseInt(btn.dataset.level);

        levelDescriptionEl.textContent = levelDescriptions[currentLevel] || "mô tả level";
    });
    levelsGrid.appendChild(btn);
}

colorOptions.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
        colorOptions.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        snakeColor = dot.dataset.color;
    });
});

startBtn.addEventListener('click', () => {
    startOverlay.classList.add('hidden');
    levelOverlay.classList.remove('hidden');
});

openLevelBtn.addEventListener('click', () => {
    if (gameInterval) clearInterval(gameInterval);
    gameStarted = false;
    isPaused = false;
    pauseOverlay.classList.add('hidden');
    pauseBtn.style.display = 'inline-block';
    resumeBtn.style.display = 'none';
    levelOverlay.classList.remove('hidden');
    startOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
});

confirmLevelBtn.addEventListener('click', () => {
    levelOverlay.classList.add('hidden');
    startGame();
});

restartBtn.addEventListener('click', () => {
    gameOverOverlay.classList.add('hidden');
    pauseOverlay.classList.add('hidden');
    startGame();
});

restartOverlayBtn.addEventListener('click', () => {
    gameOverOverlay.classList.add('hidden');
    startGame();
});

function togglePause() {
    if (!gameStarted) return;

    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(gameInterval);
        pauseOverlay.classList.remove('hidden');
        pauseBtn.style.display = 'none';
        resumeBtn.style.display = 'inline-block';
        resumeBtn.textContent = 'Tiếp Tục';
    } else {
        pauseOverlay.classList.add('hidden');
        pauseBtn.style.display = 'inline-block';
        resumeBtn.style.display = 'none';

        const fixedSpeed = 130;
        gameInterval = setInterval(gameLoop, fixedSpeed);
    }
}

pauseBtn.addEventListener('click', togglePause);
resumeBtn.addEventListener('click', togglePause);
resumeOverlayBtn.addEventListener('click', togglePause);

function startGame() {
    gameStarted = true;
    isPaused = false;
    pauseOverlay.classList.add('hidden');
    pauseBtn.style.display = 'inline-block';
    resumeBtn.style.display = 'none';

    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    score = 0;
    currentScoreEl.textContent = score;

    targetScore = 300;
    targetScoreEl.textContent = targetScore;

    dx = 1;
    dy = 0;

    initLevel(currentLevel);
    spawnFood();

    if (gameInterval) clearInterval(gameInterval);

    const fixedSpeed = 130;
    gameInterval = setInterval(gameLoop, fixedSpeed);
}

function initLevel(level) {
    switch (level) {
        case 2:
            break;
        default:
            break;
    }
}

function updateLevelLogic() {
    switch (currentLevel) {
        case 1:
            break;
        case 2:
            const elapsedTime = (Date.now() - food.spawnTime) / 1000;
            if (elapsedTime > 6) {
                food.state = 'danger';
            } else if (elapsedTime > 4) {
                food.state = 'warning';
            } else {
                food.state = 'normal';
            }
            break;
        default:
            break;
    }
}

function drawLevelElements() {
    switch (currentLevel) {
        case 1:
            break;
        case 2:
            break;
        default:
            break;
    }
}

function gameLoop() {
    changingDirection = false;

    updateLevelLogic();

    moveSnake();

    if (score >= targetScore) {
        clearInterval(gameInterval);
        gameStarted = false;
        pauseBtn.style.display = 'inline-block';
        resumeBtn.style.display = 'none';
        finalScoreEl.textContent = score;
        gameOverTitle.textContent = "Chiến Thắng! 🎉";
        gameOverOverlay.classList.remove('hidden');
        return;
    }

    if (checkGameOver()) {
        clearInterval(gameInterval);
        gameStarted = false;
        pauseBtn.style.display = 'inline-block';
        resumeBtn.style.display = 'none';
        finalScoreEl.textContent = score;
        gameOverTitle.textContent = "Kết Thúc";
        gameOverOverlay.classList.remove('hidden');
        return;
    }
    clearCanvas();
    drawGrid();
    drawFood();
    drawSnake();
    drawLevelElements();
}

function clearCanvas() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGrid() {
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    for (let i = 0; i <= TILE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
    }
}

function drawSnake() {
    snake.forEach((part) => {
        ctx.fillStyle = snakeColor;
        ctx.fillRect(part.x * GRID_SIZE, part.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
    });
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        switch (currentLevel) {
            case 1:
                score += 10;
                break;
            case 2:
                if (food.state === 'normal') {
                    score += 10;
                } else if (food.state === 'warning') {
                    score += 3;
                } else if (food.state === 'danger') {
                    score -= 5;
                    if (score < 0) score = 0;
                }
                break;
            default:
                break;
        }

        currentScoreEl.textContent = score;
        spawnFood();
    } else {
        snake.pop();
    }
}

function spawnFood() {
    food.x = Math.floor(Math.random() * TILE_COUNT);
    food.y = Math.floor(Math.random() * TILE_COUNT);
    food.spawnTime = Date.now();
    food.state = 'normal';

    snake.forEach(part => {
        if (part.x === food.x && part.y === food.y) {
            spawnFood();
        }
    });
}

function drawFood() {
    let foodColor = "#e74c3c";
    switch (currentLevel) {
        case 1:
            ctx.fillStyle = foodColor;
            ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
            break;
        case 2:
            const elapsedTime = (Date.now() - food.spawnTime) / 1000;

            let showBorder = true;
            let borderColor = "#e74c3c";
            let progress = 1;

            if (elapsedTime <= 4) {
                foodColor = "#e74c3c";
                borderColor = "#e74c3c";
                progress = Math.max(0, 1 - (elapsedTime / 4));
            } else if (elapsedTime <= 6) {
                foodColor = "#f1c40f";
                borderColor = "#f1c40f";
                progress = Math.max(0, 1 - ((elapsedTime - 4) / 2));
            } else {
                foodColor = "#8b0000";
                showBorder = false;
            }

            ctx.fillStyle = foodColor;
            ctx.fillRect(food.x * GRID_SIZE + 2, food.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);

            if (showBorder) {
                ctx.save();
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = 2;

                let x = food.x * GRID_SIZE;
                let y = food.y * GRID_SIZE;
                let size = GRID_SIZE;
                let perimeter = size * 4;
                let currentPerimeter = perimeter * progress;

                ctx.beginPath();
                let len = Math.min(currentPerimeter, size);
                ctx.moveTo(x, y);
                ctx.lineTo(x + len, y);
                currentPerimeter -= len;

                if (currentPerimeter > 0) {
                    len = Math.min(currentPerimeter, size);
                    ctx.lineTo(x + size, y + len);
                    currentPerimeter -= len;
                }

                if (currentPerimeter > 0) {
                    len = Math.min(currentPerimeter, size);
                    ctx.lineTo(x + size - len, y + size);
                    currentPerimeter -= len;
                }

                if (currentPerimeter > 0) {
                    len = Math.min(currentPerimeter, size);
                    ctx.lineTo(x, y + size - len);
                }

                ctx.stroke();
                ctx.restore();
            }
            break;
        default:
            break;
    }
}

function checkGameOver() {
    const head = snake[0];

    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        return true;
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function changeDirection(newDx, newDy) {
    if (changingDirection || isPaused || !gameStarted) return;

    if (newDx !== 0 && dx === 0) {
        dx = newDx;
        dy = 0;
        changingDirection = true;
    }
    if (newDy !== 0 && dy === 0) {
        dx = 0;
        dy = newDy;
        changingDirection = true;
    }
}

document.addEventListener('keydown', e => {
    if (e.code === 'Space') {
        e.preventDefault();
        togglePause();
        return;
    }

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') changeDirection(-1, 0);
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') changeDirection(0, -1);
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') changeDirection(1, 0);
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') changeDirection(0, 1);
});