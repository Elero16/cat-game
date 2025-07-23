// Инициализация canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Установка размеров canvas
canvas.width = 850;
canvas.height = 500;

// Цветовая палитра
const colors = {
    background: '#FFFFFF',
    cityDark: '#6A5ACD',
    cityLight: '#BA55D3',
    cat: '#FDEBD0',
    obstacle: ['#B0C4DE', '#9370DB', '#ADD8E6', '#FFC0CB'],
    text: '#33001a'
};

// Игровые переменные
let score = 0;
let gameSpeed = 5;
let isGameOver = false;
let animationId;
let obstacles = [];
let lastObstacleTime = 0;
const obstacleInterval = 1500; // интервал между препятствиями в мс

// Котик
const cat = {
    x: 100,
    y: canvas.height - 100,
    width: 40,
    height: 40,
    velocityY: 0,
    jumpPower: -15,
    gravity: 0.8,
    isJumping: false,

    draw() {
        // Тело котика
        ctx.fillStyle = '#FDEBD0'; // Бежевый
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Щеки
        ctx.fillStyle = '#FFC0CB'; // Розовый
        ctx.fillRect(this.x + 5, this.y + 5, 10, 10); // Левая щека
        ctx.fillRect(this.x + 25, this.y + 5, 10, 10); // Правая щека

        // Глаза
        ctx.fillStyle = '#6B4226'; // Темно-коричневый
        ctx.fillRect(this.x + 10, this.y + 10, 5, 5); // Левый глаз
        ctx.fillRect(this.x + 25, this.y + 10, 5, 5); // Правый глаз

        // Усы
        ctx.strokeStyle = '#6B4226';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + 10, this.y + 20);
        ctx.lineTo(this.x + 5, this.y + 30);
        ctx.moveTo(this.x + 10, this.y + 20);
        ctx.lineTo(this.x + 15, this.y + 30);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x + 25, this.y + 20);
        ctx.lineTo(this.x + 30, this.y + 30);
        ctx.moveTo(this.x + 25, this.y + 20);
        ctx.lineTo(this.x + 20, this.y + 30);
        ctx.stroke();

        // Уши
        ctx.fillStyle = '#000000'; // Черный
        ctx.beginPath();
        ctx.moveTo(this.x + 5, this.y);
        ctx.lineTo(this.x + 15, this.y - 15);
        ctx.lineTo(this.x + 25, this.y);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.x + 15, this.y);
        ctx.lineTo(this.x + 35, this.y - 15);
        ctx.lineTo(this.x + 35, this.y);
        ctx.fill();

        // Хвост
        ctx.fillStyle = '#000000'; // Черный
        ctx.beginPath();
        ctx.moveTo(this.x + this.width, this.y + 20);
        ctx.lineTo(this.x + this.width + 15, this.y + 10);
        ctx.lineTo(this.x + this.width + 15, this.y + 30);
        ctx.fill();
    },

    update() {
        // Применяем гравитацию
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        // Проверка на землю
        if (this.y >= canvas.height - 100) {
            this.y = canvas.height - 100;
            this.velocityY = 0;
            this.isJumping = false;
        }
    },

    jump() {
        if (!this.isJumping) {
            this.velocityY = this.jumpPower;
            this.isJumping = true;
        }
    }
};

// Препятствие
class Obstacle {
    constructor() {
        this.width = 30 + Math.random() * 30;
        this.height = 40 + Math.random() * 60;
        this.x = canvas.width;
        this.y = canvas.height - this.height - 60;
        this.color = colors.obstacle[Math.floor(Math.random() * colors.obstacle.length)];
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x -= gameSpeed;
    }
}

// Фон города
function drawCityBackground() {
    // Градиент неба
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#FF69B4'); // Розовый закат
    skyGradient.addColorStop(0.5, '#BA55D3'); // Лавандовый
    skyGradient.addColorStop(1, '#6A5ACD'); // Темно-лавандовый
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Здания на заднем плане
    ctx.fillStyle = '#6A5ACD'; // Темно-лавандовый
    const buildingCount = 10;
    const buildingWidth = canvas.width / buildingCount;

    for (let i = 0; i < buildingCount; i++) {
        const height = 100 + Math.random() * 150;
        ctx.fillRect(i * buildingWidth, canvas.height - height, buildingWidth, height);

        // Окна
        ctx.fillStyle = '#BA55D3'; // Светло-лавандовый
        const windowSize = 8;
        const windowPadding = 10;

        for (let y = canvas.height - height + windowPadding; y < canvas.height - windowPadding; y += windowSize + windowPadding) {
            for (let x = i * buildingWidth + windowPadding; x < (i + 1) * buildingWidth - windowPadding; x += windowSize + windowPadding) {
                if (Math.random() > 0.3) {
                    ctx.fillRect(x, y, windowSize, windowSize);
                }
            }
        }
        ctx.fillStyle = '#6A5ACD'; // Возвращаем цвет зданий
    }

    // Дорога
    ctx.fillStyle = '#33001a';
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

    // Разметка на дороге
    ctx.fillStyle = '#BA55D3';
    for (let i = 0; i < canvas.width; i += 60) {
        ctx.fillRect(i, canvas.height - 30, 30, 5);
    }
}

// Отрисовка счета
function drawScore() {
    ctx.fillStyle = colors.text;
    ctx.font = '24px "Press Start 2P", cursive';
    ctx.fillText(`Счет: ${score}`, 20, 40);
}

// Отрисовка инструкции
function drawInstructions() {
    ctx.fillStyle = colors.text;
    ctx.font = '18px "Press Start 2P", cursive';
    ctx.fillText('Двойной прыжок: двойное нажатие пробела', 20, 70);
}

// Проверка столкновений
function checkCollision() {
    for (let obstacle of obstacles) {
        if (
            cat.x < obstacle.x + obstacle.width &&
            cat.x + cat.width > obstacle.x &&
            cat.y < obstacle.y + obstacle.height &&
            cat.y + cat.height > obstacle.y
        ) {
            gameOver();
            return;
        }
    }
}

// Конец игры
function gameOver() {
    isGameOver = true;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = colors.cat;
    ctx.font = '36px "Press Start 2P", cursive';
    ctx.textAlign = 'center';
    ctx.fillText('ИГРА ОКОНЧЕНА', canvas.width / 2, canvas.height / 2 - 30);
    ctx.fillText(`Счет: ${score}`, canvas.width / 2, canvas.height / 2 + 30);
    ctx.font = '18px "Press Start 2P", cursive';
    ctx.fillText('Нажмите ПРОБЕЛ чтобы играть снова', canvas.width / 2, canvas.height / 2 + 80);
    ctx.textAlign = 'left';

    cancelAnimationFrame(animationId);
}

// Сброс игры
function resetGame() {
    score = 0;
    gameSpeed = 5;
    obstacles = [];
    cat.y = canvas.height - 100;
    cat.velocityY = 0;
    cat.isJumping = false;
    isGameOver = false;
    lastObstacleTime = 0;
    animationId = requestAnimationFrame(gameLoop);
}

// Основной игровой цикл
function gameLoop(timestamp) {
    // Очистка canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Отрисовка фона
    drawCityBackground();

    // Генерация препятствий
    if (timestamp - lastObstacleTime > obstacleInterval && !isGameOver) {
        obstacles.push(new Obstacle());
        lastObstacleTime = timestamp;

        // Увеличиваем сложность
        if (score % 5 === 0) {
            gameSpeed += 0.2;
        }
    }

    // Обновление и отрисовка препятствий
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].update();
        obstacles[i].draw();

        // Удаление препятствий за пределами экрана
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            score++;
        }
    }

    // Обновление и отрисовка котика
    cat.update();
    cat.draw();

    // Проверка столкновений
    if (!isGameOver) {
        checkCollision();
    }

    // Отрисовка счета и инструкции
    drawScore();
    drawInstructions();

    // Продолжение игрового цикла
    if (!isGameOver) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Обработка нажатий клавиш
let lastJumpTime = 0;
const doubleJumpInterval = 200; // мс между нажатиями для двойного прыжка

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault(); // Предотвращаем прокрутку страницы
        if (isGameOver) {
            resetGame();
        } else {
            const currentTime = Date.now();
            // Если двойное нажатие и котик в воздухе, но ещё может прыгнуть
            if (currentTime - lastJumpTime < doubleJumpInterval && cat.isJumping) {
                cat.velocityY = cat.jumpPower; // Второй прыжок
            } else if (!cat.isJumping) {
                cat.jump();
            }
            lastJumpTime = currentTime;
        }
    }
});

// Обработка кнопки Play
const playButton = document.getElementById('playButton');
playButton.addEventListener('click', () => {
    if (isGameOver || !animationId) {
        resetGame();
    }
});
