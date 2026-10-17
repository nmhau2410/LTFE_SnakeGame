const gameTable = document.getElementById("game");

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

const ROW = 20;
const COL = 20;
const GAME_SPEED = 150;

let snake = [];
let food = {x: 0, y: 0, spawnTime: 0, remainingTime: 6000, state: 'normal'};
let lastFrameTime = 0;
let dx = 0;
let dy = 1;
let score = 0;
let targetScore = 300;
let gameInterval = null;
let currentLevel = 1;
let snakeColor = '#2ecc71';
let changingDirection = false;
let isPaused = false;
let gameStarted = false;
let portalTransition = null;
let obstacles = [];

const levelDescriptions = {
    1: "Mô tả level 1: Ăn đủ 300 điểm mục tiêu để chiến thắng cơ bản",
    2: "Mô tả level 2: Thức ăn đếm ngược 6s có viền border trực quan. Sau 4s đổi màu vàng, qua 6s đổi màu đỏ sẫm trừ điểm nhưng vẫn dài ra",
    3: "Khi ăn thức ăn rắn sẽ được dịch chuyển đến vị trí an toàn khác",
    4: "Có 3 chướng ngại vật di chuyển ngang hoặc dọc",
    5: "mô tả level",
    6: "mô tả level",
    7: "mô tả level",
    8: "mô tả level",
    9: "mô tả level",
    10: "mô tả level"
};

targetScoreEl.textContent = targetScore;

function initGame() {
    gameTable.innerHTML = "";
    for (let i = 0; i < ROW; i++) {
        let tr = document.createElement("tr");
        for (let j = 0; j < COL; j++) {
            let td = document.createElement("td");
            td.id = `cell_${i}_${j}`;
            tr.appendChild(td);
        }
        gameTable.appendChild(tr);
    }
}

initGame();

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

        food.spawnTime = Date.now() - (6000 - food.remainingTime);
        lastFrameTime = Date.now();

        gameInterval = setInterval(gameLoop, GAME_SPEED);
    }
}

pauseBtn.addEventListener('click', togglePause);
resumeBtn.addEventListener('click', togglePause);
resumeOverlayBtn.addEventListener('click', togglePause);

function initSnake() {
    let x = Math.floor(Math.random() * (ROW - 6)) + 3;
    let y = Math.floor(Math.random() * (COL - 6)) + 3;

    return [{x: x, y: y - 1}, {x: x, y: y}];
}

function startGame() {
    gameStarted = true;
    isPaused = false;
    portalTransition = null;
    obstacles = [];
    pauseOverlay.classList.add('hidden');
    pauseBtn.style.display = 'inline-block';
    resumeBtn.style.display = 'none';

    snake = initSnake();
    score = 0;
    currentScoreEl.textContent = score;

    targetScore = 300;
    targetScoreEl.textContent = targetScore;

    dx = 0;
    dy = 1;

    spawnFood();
    if (currentLevel === 4) initObstacles();
    render();

    if (gameInterval) clearInterval(gameInterval);
    lastFrameTime = Date.now();
    gameInterval = setInterval(gameLoop, GAME_SPEED);
}

function updateLevelLogic() {
    switch (currentLevel) {
        case 1:
            break;
        case 2:
            let now = Date.now();
            let delta = now - lastFrameTime;
            lastFrameTime = now;

            if (!isPaused) {
                food.remainingTime -= delta;
            }

            let elapsedSeconds = (6000 - food.remainingTime) / 1000;

            if (elapsedSeconds > 6) {
                food.state = 'danger';
            } else if (elapsedSeconds > 4) {
                food.state = 'warning';
            } else {
                food.state = 'normal';
            }
            break;
        case 3:
            break;
        case 4:
            moveObstacles();
            break;
        default:
            break;
    }
}

function gameLoop() {
    changingDirection = false;

    updateLevelLogic();
    if (portalTransition) {
        advancePortalTransition();
    } else {
        moveSnake();
    }

    if (score >= targetScore) {
        clearInterval(gameInterval);
        gameStarted = false;
        pauseBtn.style.display = 'inline-block';
        resumeBtn.style.display = 'none';
        finalScoreEl.textContent = score;
        gameOverTitle.textContent = "Bạn đã thắngggggg";
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

    render();
}

function moveSnake() {
    let head = snake[snake.length - 1];
    let newHead = {x: head.x + dx, y: head.y + dy};

    snake.push(newHead);

    if (newHead.x === food.x && newHead.y === food.y) {
        switch (currentLevel) {
            case 1:
                score += 10;
                break;
            case 2:
                if (food.state === 'normal') score += 10; else if (food.state === 'warning') score += 3; else if (food.state === 'danger') {
                    score -= 5;
                    if (score < 0) score = 0;
                }
                break;
            case 3:
                score += 10;
                break;
            case 4:
                score += 10;
                break;
            default:
                break;
        }
        currentScoreEl.textContent = score;
        if (currentLevel === 3) {
            teleportSnake();
        }
        spawnFood();
    } else {
        snake.shift();
    }
}

function spawnFood() {
    food.x = Math.floor(Math.random() * ROW);
    food.y = Math.floor(Math.random() * COL);
    food.spawnTime = Date.now();
    food.remainingTime = 6000;
    lastFrameTime = Date.now();
    food.state = 'normal';
    placeFoodInSafeCell();
}

function placeFoodInSafeCell() {
    const occupiedCells = new Set(snake.map(part => `${part.x},${part.y}`));
    portalTransition?.exitCells.forEach(part => occupiedCells.add(`${part.x},${part.y}`));
    obstacles.forEach(obstacle => occupiedCells.add(`${obstacle.x},${obstacle.y}`));
    const availableCells = [];

    for (let x = 0; x < ROW; x++) {
        for (let y = 0; y < COL; y++) {
            if (!occupiedCells.has(`${x},${y}`)) {
                availableCells.push({x, y});
            }
        }
    }

    if (availableCells.length === 0) return;

    const nextFood = availableCells[Math.floor(Math.random() * availableCells.length)];
    food.x = nextFood.x;
    food.y = nextFood.y;
}

function initObstacles() {
    const obstacleCount = 3;
    const occupiedCells = new Set(snake.map(part => `${part.x},${part.y}`));
    occupiedCells.add(`${food.x},${food.y}`);
    obstacles = [];

    for (let i = 0; i < obstacleCount; i++) {
        const availableCells = [];
        for (let x = 0; x < ROW; x++) {
            for (let y = 0; y < COL; y++) {
                if (!occupiedCells.has(`${x},${y}`)) availableCells.push({x, y});
            }
        }
        if (availableCells.length === 0) break;

        const position = availableCells[Math.floor(Math.random() * availableCells.length)];
        occupiedCells.add(`${position.x},${position.y}`);
        const movesHorizontally = Math.random() < 0.5;
        const direction = Math.random() < 0.5 ? -1 : 1;
        obstacles.push({
            ...position, dx: movesHorizontally ? 0 : direction, dy: movesHorizontally ? direction : 0
        });
    }
}

function moveObstacles() {
    obstacles.forEach((obstacle, index) => {
        let nextX = obstacle.x + obstacle.dx;
        let nextY = obstacle.y + obstacle.dy;
        const isBlocked = (x, y) => x < 0 || x >= ROW || y < 0 || y >= COL || snake.some(part => part.x === x && part.y === y) || (food.x === x && food.y === y) || obstacles.some((other, otherIndex) => otherIndex !== index && other.x === x && other.y === y);

        if (isBlocked(nextX, nextY)) {
            obstacle.dx *= -1;
            obstacle.dy *= -1;
            nextX = obstacle.x + obstacle.dx;
            nextY = obstacle.y + obstacle.dy;
        }

        if (!isBlocked(nextX, nextY)) {
            obstacle.x = nextX;
            obstacle.y = nextY;
        }
    });
}

function teleportSnake() {
    const head = snake[snake.length - 1];
    const occupiedCells = new Set(snake.map(part => `${part.x},${part.y}`));
    const directions = [{x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}];
    const destinations = [];

    for (let x = 0; x < ROW; x++) {
        for (let y = 0; y < COL; y++) {
            if (occupiedCells.has(`${x},${y}`)) continue;

            for (const direction of directions) {
                const exitCells = [];
                let isSafe = true;

                for (let offset = 1; offset < snake.length; offset++) {
                    const exitCell = {x: x - direction.x * offset, y: y - direction.y * offset};
                    const key = `${exitCell.x},${exitCell.y}`;
                    if (exitCell.x < 0 || exitCell.x >= ROW || exitCell.y < 0 || exitCell.y >= COL || occupiedCells.has(key) || (exitCell.x === head.x && exitCell.y === head.y)) {
                        isSafe = false;
                        break;
                    }
                    exitCells.push(exitCell);
                }

                for (let offset = 1; offset <= Math.min(2, ROW, COL); offset++) {
                    const nextHead = {x: x + direction.x * offset, y: y + direction.y * offset};
                    if (nextHead.x < 0 || nextHead.x >= ROW || nextHead.y < 0 || nextHead.y >= COL || occupiedCells.has(`${nextHead.x},${nextHead.y}`)) {
                        isSafe = false;
                        break;
                    }
                }

                if (isSafe) {
                    destinations.push({position: {x, y}, direction, exitCells});
                }
            }
        }
    }

    if (destinations.length === 0) return;

    const destination = destinations[Math.floor(Math.random() * destinations.length)];
    snake[snake.length - 1] = destination.position;
    dx = destination.direction.x;
    dy = destination.direction.y;
    portalTransition = {exitCells: destination.exitCells, movedSegments: 0};
}

function advancePortalTransition() {
    const oldSnake = snake.map(part => ({...part}));
    const oldHead = oldSnake[oldSnake.length - 1];
    const nextHead = {x: oldHead.x + dx, y: oldHead.y + dy};
    snake[snake.length - 1] = nextHead;

    for (let offset = 0; offset <= portalTransition.movedSegments; offset++) {
        const segmentIndex = snake.length - 2 - offset;
        snake[segmentIndex] = oldSnake[segmentIndex + 1];
    }

    portalTransition.movedSegments++;

    if (portalTransition.movedSegments >= snake.length - 1) {
        portalTransition = null;
    }

    if (nextHead.x === food.x && nextHead.y === food.y) {
        score += 10;
        currentScoreEl.textContent = score;
        spawnFood();
    }
}

function render() {
    for (let i = 0; i < ROW; i++) {
        for (let j = 0; j < COL; j++) {
            let cell = document.getElementById(`cell_${i}_${j}`);
            if (cell) {
                cell.style.backgroundColor = "";
                cell.className = "";
                cell.innerHTML = "";
            }
        }
    }

    let foodCell = document.getElementById(`cell_${food.x}_${food.y}`);
    if (foodCell) {
        if (currentLevel === 2) {
            let elapsedSeconds = (6000 - food.remainingTime) / 1000;
            let percentage = 0;
            let borderColor = "transparent";
            let coreClass = "red";

            if (elapsedSeconds <= 4) {
                percentage = ((4 - elapsedSeconds) / 4) * 100;
                borderColor = "#e74c3c";
                coreClass = "red";
            } else if (elapsedSeconds <= 6) {
                percentage = ((6 - elapsedSeconds) / 2) * 100;
                borderColor = "#f1c40f";
                coreClass = "yellow";
            } else {
                percentage = 0;
                borderColor = "transparent";
                coreClass = "darkred";
            }

            let container = document.createElement('div');
            container.className = 'food-container';

            let spinner = document.createElement('div');
            spinner.className = 'food-border-spinner';
            if (percentage > 0) {
                spinner.style.background = `conic-gradient(${borderColor} ${percentage}%, transparent 0)`;
            }

            let cutout = document.createElement('div');
            cutout.className = 'food-cutout';

            let core = document.createElement('div');
            core.className = `food-core ${coreClass}`;

            cutout.appendChild(core);
            spinner.appendChild(cutout);
            container.appendChild(spinner);
            foodCell.appendChild(container);

        } else {
            let container = document.createElement('div');
            container.className = 'food-container';
            let core = document.createElement('div');
            core.className = 'food-core red';
            container.appendChild(core);
            foodCell.appendChild(container);
        }
    }

    obstacles.forEach(obstacle => {
        const obstacleCell = document.getElementById(`cell_${obstacle.x}_${obstacle.y}`);
        if (obstacleCell) obstacleCell.classList.add('obstacle-cell');
    });

    snake.forEach((part, index) => {
        let partCell = document.getElementById(`cell_${part.x}_${part.y}`);
        if (partCell) {
            partCell.style.backgroundColor = snakeColor;
            partCell.classList.add("snake-cell");
            if (index === snake.length - 1) {
                partCell.classList.add('snake-head');
                if (dy > 0) partCell.classList.add('head-right'); else if (dy < 0) partCell.classList.add('head-left'); else if (dx > 0) partCell.classList.add('head-down'); else partCell.classList.add('head-up');
            }
        }
    });
}

function checkGameOver() {
    const head = snake[snake.length - 1];

    if (head.x < 0 || head.x >= ROW || head.y < 0 || head.y >= COL) {
        return true;
    }

    for (let i = 0; i < snake.length - 1; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    if (obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y)) {
        return true;
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

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') changeDirection(0, -1);
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') changeDirection(-1, 0);
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') changeDirection(0, 1);
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') changeDirection(1, 0);
});
