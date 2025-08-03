const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let score = 0;
let stage = 1;
let targets = [];
let totalTargets = 0;
let correctHits = 0;
let combo = 0;
let timeLeft = 30;
let timerInterval;
let shootSound = new Audio('https://cdn.pixabay.com/audio/2022/03/10/audio_5b3b1e4f9b.mp3');
let rainSound = new Audio('https://cdn.pixabay.com/audio/2022/03/10/audio_4e3b1e4f9c.mp3');
let snowSound = new Audio('https://cdn.pixabay.com/audio/2022/03/10/audio_3c2b1e4f9d.mp3');
const scoreDisplay = document.getElementById('score');
const stageDisplay = document.getElementById('stage');
const timerDisplay = document.getElementById('timer');
const correctHitsDisplay = document.getElementById('correct-hits');
const comboDisplay = document.getElementById('combo');
const messageDisplay = document.getElementById('message');
const introScreen = document.getElementById('intro');
const infoDisplay = document.getElementById('info');
const stageClearedScreen = document.getElementById('stage-cleared');
const stageClearedMessage = document.getElementById('stage-cleared-message');
const gameOverScreen = document.getElementById('game-over');
const gameOverMessage = document.getElementById('game-over-message');
let gameRunning = false;
let shootAnimations = [];

function resizeCanvas() {
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.9;
    const aspectRatio = 4 / 3;
    if (maxWidth / maxHeight > aspectRatio) {
        canvas.height = Math.min(maxHeight, 600);
        canvas.width = canvas.height * aspectRatio;
    } else {
        canvas.width = Math.min(maxWidth, 800);
        canvas.height = canvas.width / aspectRatio;
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const stageSettings = [
    { hitPercentage: 60, spawnInterval: 3000, speed: 1.5, size: 38 * canvas.width / 800 },
    { hitPercentage: 70, spawnInterval: 2000, speed: 2, size: 38 * canvas.width / 800 },
    { hitPercentage: 70, spawnInterval: 2000, speed: 2, size: 38 * canvas.width / 800 },
    { hitPercentage: 70, spawnInterval: 2000, speed: 2, size: 38 * canvas.width / 800 },
    { hitPercentage: 70, spawnInterval: 2000, speed: 2, size: 38 * canvas.width / 800 },
    { hitPercentage: 70, spawnInterval: 2000, speed: 2.5, size: 38 * canvas.width / 800 },
    { hitPercentage: 70, spawnInterval: 2000, speed: 2.5, size: 38 * canvas.width / 800 },
    { hitPercentage: 70, spawnInterval: 2000, speed: 2.5, size: 38 * canvas.width / 800 },
    { hitPercentage: 70, spawnInterval: 2000, speed: 2.5, size: 38 * canvas.width / 800 },
    { hitPercentage: 70, spawnInterval: 2000, speed: 3, size: 38 * canvas.width / 800 },
    { hitPercentage: 80, spawnInterval: 1000, speed: 3.5, size: 19 * canvas.width / 800 },
    { hitPercentage: 80, spawnInterval: 1000, speed: 3.5, size: 19 * canvas.width / 800 },
    { hitPercentage: 80, spawnInterval: 1000, speed: 3.5, size: 19 * canvas.width / 800 },
    { hitPercentage: 80, spawnInterval: 1000, speed: 3.5, size: 19 * canvas.width / 800 },
    { hitPercentage: 80, spawnInterval: 1000, speed: 4, size: 19 * canvas.width / 800 },
    { hitPercentage: 80, spawnInterval: 1000, speed: 4, size: 19 * canvas.width / 800 },
    { hitPercentage: 80, spawnInterval: 1000, speed: 4, size: 19 * canvas.width / 800 },
    { hitPercentage: 80, spawnInterval: 1000, speed: 4, size: 19 * canvas.width / 800 },
    { hitPercentage: 80, spawnInterval: 1000, speed: 4.5, size: 19 * canvas.width / 800 },
    { hitPercentage: 80, spawnInterval: 1000, speed: 4.5, size: 19 * canvas.width / 800 },
    { hitPercentage: 90, spawnInterval: 1000, speed: 5, size: 9.5 * canvas.width / 800 },
    { hitPercentage: 90, spawnInterval: 1000, speed: 5, size: 9.5 * canvas.width / 800 },
    { hitPercentage: 90, spawnInterval: 1000, speed: 5, size: 9.5 * canvas.width / 800 }
];

class Target {
    constructor(type) {
        this.type = type;
        this.x = Math.random() * (canvas.width - stageSettings[stage - 1].size);
        this.y = 0;
        this.size = stageSettings[stage - 1].size;
        this.speedY = stageSettings[stage - 1].speed * canvas.height / 600;
        this.opacity = 1;
        this.variant = Math.floor(Math.random() * 3);
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        if (this.type === 'rain') {
            let length = this.size * (0.5 + this.variant * 0.2);
            let gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + length);
            gradient.addColorStop(0, '#0288d1');
            gradient.addColorStop(1, '#4fc3f7');
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y + length);
            ctx.lineWidth = 4;
            ctx.strokeStyle = gradient;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(this.x, this.y + length, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#4fc3f7';
            ctx.fill();
        } else {
            ctx.beginPath();
            if (this.variant === 0) {
                ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#b0e0e6';
                ctx.stroke();
            } else if (this.variant === 1) {
                ctx.moveTo(this.x, this.y - this.size / 2);
                ctx.lineTo(this.x, this.y + this.size / 2);
                ctx.moveTo(this.x - this.size / 2, this.y);
                ctx.lineTo(this.x + this.size / 2, this.y);
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#fff';
                ctx.stroke();
            } else {
                ctx.moveTo(this.x, this.y - this.size / 2);
                ctx.lineTo(this.x, this.y + this.size / 2);
                ctx.moveTo(this.x - this.size / 2, this.y);
                ctx.lineTo(this.x + this.size / 2, this.y);
                ctx.moveTo(this.x - this.size / 2.8, this.y - this.size / 2.8);
                ctx.lineTo(this.x + this.size / 2.8, this.y + this.size / 2.8);
                ctx.moveTo(this.x - this.size / 2.8, this.y + this.size / 2.8);
                ctx.lineTo(this.x + this.size / 2.8, this.y - this.size / 2.8);
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#fff';
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    update() {
        this.y += this.speedY;
        if (this.y - this.size / 2 > canvas.height) {
            combo = 0;
            comboDisplay.textContent = `Combo: ${combo}`;
            return false;
        }
        if (this.opacity < 1) this.opacity -= 0.05;
        return true;
    }
}

class ShootAnimation {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.opacity = 1;
        this.size = 10 * canvas.width / 800;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.opacity -= 0.1;
        this.size += 0.5;
        return this.opacity > 0;
    }
}

function drawBackground() {
    ctx.save();
    ctx.globalAlpha = 0.2;
    if (stage <= 5) {
        ctx.fillStyle = '#191970'; // شب برفی
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, canvas.height - 80 * canvas.height / 600, canvas.width, 80 * canvas.height / 600);
        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height / 2, 5 * canvas.width / 800, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        }
    } else if (stage <= 10) {
        ctx.fillStyle = '#4682b4'; // غروب برفی
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, canvas.height - 100 * canvas.height / 600, canvas.width, 100 * canvas.height / 600);
        for (let i = 0; i < 15; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 3 * canvas.width / 800, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        }
    } else if (stage <= 15) {
        ctx.fillStyle = '#87ceeb'; // آسمان ابری
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let y = 0; y < canvas.height; y += 20 * canvas.height / 600) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            for (let x = 0; x < canvas.width; x += 20) {
                ctx.lineTo(x, y + Math.sin(x / 20) * 10 * canvas.height / 600);
            }
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2 * canvas.width / 800;
            ctx.stroke();
        }
    } else if (stage <= 20) {
        ctx.fillStyle = '#b0e0e6'; // روز برفی
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        ctx.lineTo(200 * canvas.width / 800, canvas.height - 150 * canvas.height / 600);
        ctx.lineTo(400 * canvas.width / 800, canvas.height - 100 * canvas.height / 600);
        ctx.lineTo(600 * canvas.width / 800, canvas.height - 200 * canvas.height / 600);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.fill();
    } else {
        ctx.fillStyle = '#e0f7fa'; // روز آفتابی برفی
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, canvas.height - 120 * canvas.height / 600, canvas.width, 120 * canvas.height / 600);
        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height / 2, 4 * canvas.width / 800, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        }
    }
    ctx.restore();
}

function startGame() {
    introScreen.style.display = 'none';
    canvas.style.display = 'block';
    infoDisplay.style.display = 'block';
    gameOverScreen.style.display = 'none';
    stageClearedScreen.style.display = 'none';
    gameRunning = true;
    score = 0;
    stage = 1;
    totalTargets = 0;
    correctHits = 0;
    combo = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    stageDisplay.textContent = `Stage: ${stage}`;
    correctHitsDisplay.textContent = `Correct Hits: ${correctHits}`;
    comboDisplay.textContent = `Combo: ${combo}`;
    showStageMessage();
    startTimer();
    spawnTargets();
    animate();
}

function restartGame() {
    gameOverScreen.style.display = 'none';
    score = 0;
    stage = 1;
    totalTargets = 0;
    correctHits = 0;
    combo = 0;
    targets = [];
    gameRunning = true;
    scoreDisplay.textContent = `Score: ${score}`;
    stageDisplay.textContent = `Stage: ${stage}`;
    correctHitsDisplay.textContent = `Correct Hits: ${correctHits}`;
    comboDisplay.textContent = `Combo: ${combo}`;
    showStageMessage();
    startTimer();
    spawnTargets();
    animate();
}

function exitGame() {
    gameRunning = false;
    canvas.style.display = 'none';
    infoDisplay.style.display = 'none';
    gameOverScreen.style.display = 'none';
    stageClearedScreen.style.display = 'none';
    introScreen.style.display = 'block';
}

function nextStage() {
    stageClearedScreen.style.display = 'none';
    score = 0;
    totalTargets = 0;
    correctHits = 0;
    combo = 0;
    targets = [];
    gameRunning = true;
    scoreDisplay.textContent = `Score: ${score}`;
    stageDisplay.textContent = `Stage: ${stage}`;
    correctHitsDisplay.textContent = `Correct Hits: ${correctHits}`;
    comboDisplay.textContent = `Combo: ${combo}`;
    showStageMessage();
    startTimer();
    spawnTargets();
    animate();
}

function showStageMessage() {
    let message = '';
    if (stage === 1) message = 'Stage 1: Click or tap raindrops and snowflakes to destroy them.';
    else if (stage === 11) message = 'Stage 11: Targets are now smaller!';
    else if (stage === 21) message = 'Stage 21: Targets are even smaller!';
    else message = `Stage ${stage}: Hit ${stageSettings[stage - 1].hitPercentage}% of targets!`;
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
    const type = Math.random() < 0.8 ? 'rain' : 'snow'; // 80% بارون، 20% برف
    targets.push(new Target(type));
    totalTargets++;
}

function spawnTargets() {
    clearInterval(window.spawnInterval);
    const interval = stageSettings[stage - 1].spawnInterval;
    window.spawnInterval = setInterval(spawnTarget, interval);
}

function checkStageEnd() {
    clearInterval(timerInterval);
    clearInterval(window.spawnInterval);
    const hitPercentage = totalTargets > 0 ? (correctHits / totalTargets) * 100 : 0;
    const requiredPercentage = stageSettings[stage - 1].hitPercentage;
    gameRunning = false;
    if (hitPercentage >= requiredPercentage) {
        stage++;
        if (stage > stageSettings.length) {
            gameOverScreen.style.display = 'block';
            gameOverMessage.textContent = 'You won the game!';
        } else {
            stageClearedScreen.style.display = 'block';
            stageClearedMessage.textContent = `Stage ${stage - 1} cleared!`;
        }
    } else {
        gameOverScreen.style.display = 'block';
        gameOverMessage.textContent = 'Game over! Try again.';
    }
}

function animate() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    targets = targets.filter(target => target.update());
    targets.forEach(target => target.draw());
    shootAnimations = shootAnimations.filter(anim => anim.update());
    shootAnimations.forEach(anim => anim.draw());
    requestAnimationFrame(animate);
}

function handleInput(x, y) {
    if (!gameRunning) return;
    shootSound.play();
    shootAnimations.push(new ShootAnimation(x, y));
    let hit = false;
    targets = targets.filter(target => {
        const dist = Math.sqrt((x - target.x) ** 2 + (y - target.y) ** 2);
        if (dist < target.size) {
            hit = true;
            const multiplier = combo >= 3 ? 2 : combo >= 2 ? 1.5 : 1;
            score += 1 * multiplier;
            correctHits++;
            combo++;
            scoreDisplay.textContent = `Score: ${score}`;
            correctHitsDisplay.textContent = `Correct Hits: ${correctHits}`;
            comboDisplay.textContent = `Combo: ${combo}`;
            target.opacity = 0.9;
            (target.type === 'rain' ? rainSound : snowSound).play();
            return false;
        }
        return true;
    });
    if (!hit) combo = 0;
    comboDisplay.textContent = `Combo: ${combo}`;
    if (totalTargets >= 8) checkStageEnd();
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    handleInput(x, y);
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    handleInput(x, y);
});

introScreen.style.display = 'block';
