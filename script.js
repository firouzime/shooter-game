const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let score = 0;
let stage = 1;
let targets = [];
let totalTargets = 0;
let correctHits = 0;
let timeLeft = 30;
let timerInterval;
const scoreDisplay = document.getElementById('score');
const stageDisplay = document.getElementById('stage');
const timerDisplay = document.getElementById('timer');
const messageDisplay = document.getElementById('message');
const introScreen = document.getElementById('intro');
const infoDisplay = document.getElementById('info');
let currentWeapon = 'blackDot';
let gameRunning = false;

const stageSettings = [
    { hitPercentage: 60, spawnInterval: 1000 },
    { hitPercentage: 70, spawnInterval: 800 },
    { hitPercentage: 80, spawnInterval: 600 },
    { hitPercentage: 90, spawnInterval: 500 },
    { hitPercentage: 100, spawnInterval: 400 }
];

class Target {
    constructor(type) {
        this.type = type;
        this.x = Math.random() * (canvas.width - 50);
        this.y = Math.random() * (canvas.height - 50);
        this.size = 30;
        this.speedX = (Math.random() - 0.5) * (3 + stage);
        this.speedY = (Math.random() - 0.5) * (3 + stage);
        this.opacity = 1;
    }

    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        if (this.type === 'circle') {
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            ctx.fillStyle = 'red';
        } else if (this.type === 'square') {
            ctx.rect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
            ctx.fillStyle = 'blue';
        } else if (this.type === 'triangle') {
            ctx.moveTo(this.x, this.y - this.size / 2);
            ctx.lineTo(this.x - this.size / 2, this.y + this.size / 2);
            ctx.lineTo(this.x + this.size / 2, this.y + this.size / 2);
            ctx.closePath();
            ctx.fillStyle = 'green';
        }
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x + this.size / 2 > canvas.width || this.x - this.size / 2 < 0) this.speedX = -this.speedX;
        if (this.y + this.size / 2 > canvas.height || this.y - this.size / 2 < 0) this.speedY = -this.speedY;
        if (this.opacity < 1) this.opacity -= 0.05;
    }
}

function startGame() {
    introScreen.style.display = 'none';
    canvas.style.display = 'block';
    infoDisplay.style.display = 'block';
    gameRunning = true;
    showStageMessage();
    startTimer();
    spawnTargets();
    animate();
}

function showStageMessage() {
    let message = '';
    if (stage === 1) message = 'Stage 1: Shoot circles with black dot (1 or Ctrl).';
    else if (stage === 2) message = 'Stage 2: Shoot circles with black dot (1 or Ctrl), squares with line (2 or Alt).';
    else if (stage === 3) message = 'Stage 3: Shoot circles (1 or Ctrl), squares (2 or Alt), triangles with white dot (3 or Space).';
    else message = `Stage ${stage}: Hit ${stageSettings[stage - 1].hitPercentage}% of correct targets!`;
    messageDisplay.textContent = message;
    setTimeout(() => messageDisplay.textContent = '', 3000);
}

function startTimer() {
    timeLeft = 30;
    timerDisplay.textContent = `Time: ${timeLeft}`;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Time: ${timeLeft}`;
        if (timeLeft <= 0) {
            checkStageEnd();
        }
    }, 1000);
}

function spawnTarget() {
    let types = ['circle'];
    if (stage >= 2) types.push('square');
    if (stage >= 3) types.push('triangle');
    const type = types[Math.floor(Math.random() * types.length)];
    targets.push(new Target(type));
    totalTargets++;
}

function spawnTargets() {
    const interval = stageSettings[stage - 1].spawnInterval;
    setInterval(spawnTarget, interval);
}

function checkStageEnd() {
    clearInterval(timerInterval);
    const hitPercentage = (correctHits / totalTargets) * 100;
    const requiredPercentage = stageSettings[stage - 1].hitPercentage;
    if (hitPercentage >= requiredPercentage) {
        stage++;
        if (stage > stageSettings.length) {
            messageDisplay.textContent = 'You won the game!';
            gameRunning = false;
            return;
        } else {
            messageDisplay.textContent = `Stage ${stage} cleared! Get ready!`;
            stageDisplay.textContent = `Stage: ${stage}`;
            setTimeout(showStageMessage, 2000);
        }
    } else {
        messageDisplay.textContent = 'Game over! Try again.';
        gameRunning = false;
        return;
    }
    targets = [];
    totalTargets = 0;
    correctHits = 0;
    timeLeft = 30;
    timerDisplay.textContent = `Time: ${timeLeft}`;
    startTimer();
}

function animate() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    targets = targets.filter(target => target.opacity > 0);
    targets.forEach(target => {
        target.update();
        target.draw();
    });
    requestAnimationFrame(animate);
}

canvas.addEventListener('click', (e) => {
    if (!gameRunning) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    targets = targets.filter(target => {
        const dist = Math.sqrt((mouseX - target.x) ** 2 + (mouseY - target.y) ** 2);
        if (dist < target.size / 2) {
            const isCorrect =
                (target.type === 'circle' && currentWeapon === 'blackDot') ||
                (target.type === 'square' && currentWeapon === 'line') ||
                (target.type === 'triangle' && currentWeapon === 'whiteDot');
            if (isCorrect) {
                score += 1;
                correctHits++;
                scoreDisplay.textContent = `Score: ${score}`;
                target.opacity = 0.9; // انیمیشن محو شدن
            }
            return false;
        }
        return true;
    });

    if (totalTargets >= 10) checkStageEnd();
});

document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    if (e.key === '1' || e.key === 'Control') currentWeapon = 'blackDot';
    if ((e.key === '2' || e.key === 'Alt') && stage >= 2) currentWeapon = 'line';
    if ((e.key === '3' || e.key === 'Space') && stage >= 3) currentWeapon = 'whiteDot';
});

introScreen.style.display = 'block';