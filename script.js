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
const correctHitsDisplay = document.getElementById('correct-hits');
const messageDisplay = document.getElementById('message');
const introScreen = document.getElementById('intro');
const infoDisplay = document.getElementById('info');
const stageClearedScreen = document.getElementById('stage-cleared');
const stageClearedMessage = document.getElementById('stage-cleared-message');
const gameOverScreen = document.getElementById('game-over');
const gameOverMessage = document.getElementById('game-over-message');
let gameRunning = false;

const stageSettings = [
    { hitPercentage: 60, spawnInterval: 3000, speed: 1.5, size: 38 }, // 1cm
    { hitPercentage: 70, spawnInterval: 2000, speed: 2, size: 38 },
    { hitPercentage: 70, spawnInterval: 2000, speed: 2, size: 38 },
    { hitPercentage: 70, spawnInterval: 2000, speed: 2, size: 38 },
    { hitPercentage: 70, spawnInterval: 2000, speed: 2, size: 38 },
    { hitPercentage: 70, spawnInterval: 2000, speed: 2.5, size: 38 },
    { hitPercentage: 70, spawnInterval: 2000, speed: 2.5, size: 38 },
    { hitPercentage: 70, spawnInterval: 2000, speed: 2.5, size: 38 },
    { hitPercentage: 70, spawnInterval: 2000, speed: 2.5, size: 38 },
    { hitPercentage: 70, spawnInterval: 2000, speed: 3, size: 38 },
    { hitPercentage: 80, spawnInterval: 1000, speed: 3.5, size: 19 }, // 0.5cm
    { hitPercentage: 80, spawnInterval: 1000, speed: 3.5, size: 19 },
    { hitPercentage: 80, spawnInterval: 1000, speed: 3.5, size: 19 },
    { hitPercentage: 80, spawnInterval: 1000, speed: 3.5, size: 19 },
    { hitPercentage: 80, spawnInterval: 1000, speed: 4, size: 19 },
    { hitPercentage: 80, spawnInterval: 1000, speed: 4, size: 19 },
    { hitPercentage: 80, spawnInterval: 1000, speed: 4, size: 19 },
    { hitPercentage: 80, spawnInterval: 1000, speed: 4, size: 19 },
    { hitPercentage: 80, spawnInterval: 1000, speed: 4.5, size: 19 },
    { hitPercentage: 80, spawnInterval: 1000, speed: 4.5, size: 19 },
    { hitPercentage: 90, spawnInterval: 1000, speed: 5, size: 9.5 }, // 0.25cm
    { hitPercentage: 90, spawnInterval: 1000, speed: 5, size: 9.5 },
    { hitPercentage: 90, spawnInterval: 1000, speed: 5, size: 9.5 }
];

class Target {
    constructor(type) {
        this.type = type; // 'rain' یا 'snow'
        this.x = Math.random() * (canvas.width - 50);
        this.y = 0; // شروع از بالای صفحه
        this.size = stageSettings[stage - 1].size;
        this.speedY = stageSettings[stage - 1].speed;
        this.opacity = 1;
        this.variant = Math.floor(Math.random() * 3); // تنوع شکل‌ها
    }

    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        if (this.type === 'rain') {
            // دونه‌های بارون (خطوط با طول‌های مختلف)
            let length = this.size * (0.5 + this.variant * 0.2);
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y + length);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#0288d1';
            ctx.stroke();
        } else {
            // دونه‌های برف (ستاره‌ای یا دایره)
            if (this.variant === 0) {
                ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();
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
        ctx.globalAlpha = 1;
    }

    update() {
        this.y += this.speedY;
        if (this.y - this.size / 2 > canvas.height) {
            return false;
        }
        if (this.opacity < 1) this.opacity -= 0.05;
        return true;
    }
}

function drawBackground() {
    ctx.save();
    ctx.globalAlpha = 0.2;
    if (stage <= 5) {
        // برف سبک با زمین یخ‌زده
        ctx.fillStyle = '#b0e0e6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height / 2, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        }
    } else if (stage <= 10) {
        // برف سنگین با آسمان تیره
        ctx.fillStyle = '#4682b4';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
        for (let i = 0; i < 15; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        }
    } else if (stage <= 15) {
        // طوفان برفی با الگوی موجی
        ctx.fillStyle = '#1e90ff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let y = 0; y < canvas.height; y += 20) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            for (let x = 0; x < canvas.width; x += 20) {
                ctx.lineTo(x, y + Math.sin(x / 20) * 10);
            }
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    } else if (stage <= 20) {
        // کوه‌های برفی
        ctx.fillStyle = '#87ceeb';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        ctx.lineTo(200, canvas.height - 150);
        ctx.lineTo(400, canvas.height - 100);
        ctx.lineTo(600, canvas.height - 200);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.fill();
    } else {
        // شب برفی با ستاره
        ctx.fillStyle = '#191970';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, canvas.height - 120, canvas.width, 120);
        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height / 2, 4, 0, Math.PI * 2);
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
    scoreDisplay.textContent = `Score: ${score}`;
    stageDisplay.textContent = `Stage: ${stage}`;
    correctHitsDisplay.textContent = `Correct Hits: ${correctHits}`;
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
    targets = [];
    gameRunning = true;
    scoreDisplay.textContent = `Score: ${score}`;
    stageDisplay.textContent = `Stage: ${stage}`;
    correctHitsDisplay.textContent = `Correct Hits: ${correctHits}`;
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
    targets = [];
    gameRunning = true;
    scoreDisplay.textContent = `Score: ${score}`;
    stageDisplay.textContent = `Stage: ${stage}`;
    correctHitsDisplay.textContent = `Correct Hits: ${correctHits}`;
    showStageMessage();
    startTimer();
    spawnTargets();
    animate();
}

function showStageMessage() {
    let message = '';
    if (stage === 1) message = 'Stage 1: Click raindrops and snowflakes to destroy them.';
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
    const type = Math.random() < 0.5 ? 'rain' : 'snow';
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
    requestAnimationFrame(animate);
}

canvas.addEventListener('click', (e) => {
    if (!gameRunning) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    targets = targets.filter(target => {
        const dist = Math.sqrt((mouseX - target.x) ** 2 + (mouseY - target.y) ** 2);
        if (dist < target.size) {
            score += 1;
            correctHits++;
            scoreDisplay.textContent = `Score: ${score}`;
            correctHitsDisplay.textContent = `Correct Hits: ${correctHits}`;
            target.opacity = 0.9;
            return false;
        }
        return true;
    });

    if (totalTargets >= 8) checkStageEnd();
});

introScreen.style.display = 'block';
