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
const weaponDisplay = document.getElementById('weapon');
const correctHitsDisplay = document.getElementById('correct-hits');
const messageDisplay = document.getElementById('message');
const introScreen = document.getElementById('intro');
const infoDisplay = document.getElementById('info');
const gameOverScreen = document.getElementById('game-over');
const gameOverMessage = document.getElementById('game-over-message');
let currentWeapon = 'blackDot';
let gameRunning = false;

const stageSettings = [
    { hitPercentage: 60, spawnInterval: 2000, speed: 1.5 }, // مرحله اول آسون‌تر
    { hitPercentage: 70, spawnInterval: 800, speed: 2 },
    { hitPercentage: 80, spawnInterval: 600, speed: 3 },
    { hitPercentage: 90, spawnInterval: 500, speed: 4 },
    { hitPercentage: 100, spawnInterval: 400, speed: 5 }
];

class Target {
    constructor(type) {
        this.type = type;
        this.x = Math.random() * (canvas.width - 50);
        this.y = 0; // شروع از بالای صفحه
        this.size = 30;
        this.speedY = stageSettings[stage - 1].speed; // فقط حرکت عمودی
        this.opacity = 1;
    }

    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        if (this.type === 'circle') {
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            ctx.fillStyle = '#FFD700'; // طلایی
        } else if (this.type === 'square') {
            ctx.rect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
            ctx.fillStyle = '#00B7EB'; // آبی روشن
        } else if (this.type === 'triangle') {
            ctx.moveTo(this.x, this.y - this.size / 2);
            ctx.lineTo(this.x - this.size / 2, this.y + this.size / 2);
            ctx.lineTo(this.x + this.size / 2, this.y + this.size / 2);
            ctx.closePath();
            ctx.fillStyle = '#32CD32'; // سبز روشن
        }
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    update() {
        this.y += this.speedY;
        if (this.y - this.size / 2 > canvas.height) {
            // هدف از صفحه خارج می‌شه
            return false;
        }
        if (this.opacity < 1) this.opacity -= 0.05;
        return true;
    }
}

function drawBackground() {
    ctx.save();
    ctx.globalAlpha = 0.2; // شفافیت برای پس‌زمینه
    if (stage === 1) {
        // چمن و ابر (شبیه Super Mario)
        ctx.fillStyle = '#7CFC00';
        ctx.fillRect(0, canvas.height - 100, canvas.width, 100); // چمن
        ctx.fillStyle = '#FFF';
        ctx.fillRect(100, 50, 80, 40); // ابر 1
        ctx.fillRect(300, 80, 100, 50); // ابر 2
    } else if (stage === 2) {
        // آجر و آسمان آبی
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height); // آسمان
        for (let x = 0; x < canvas.width; x += 40) {
            for (let y = canvas.height - 120; y < canvas.height; y += 40) {
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x, y, 38, 38); // آجر
            }
        }
    } else if (stage === 3) {
        // سنگ و ستاره
        ctx.fillStyle = '#2F4F4F';
        ctx.fillRect(0, 0, canvas.width, canvas.height); // پس‌زمینه سنگی
        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height / 2, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFF00';
            ctx.fill();
        }
    } else if (stage === 4) {
        // جنگل و درخت
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, 0, canvas.width, canvas.height); // پس‌زمینه سبز
        for (let x = 0; x < canvas.width; x += 60) {
            ctx.fillStyle = '#006400';
            ctx.fillRect(x, canvas.height - 150, 40, 100); // درخت
            ctx.beginPath();
            ctx.arc(x + 20, canvas.height - 170, 30, 0, Math.PI * 2);
            ctx.fill();
        }
    } else {
        // فضا و سیاره
        ctx.fillStyle = '#191970';
        ctx.fillRect(0, 0, canvas.width, canvas.height); // پس‌زمینه فضایی
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 15, 0, Math.PI * 2);
            ctx.fillStyle = '#9932CC';
            ctx.fill();
        }
    }
    ctx.restore();
}

function drawWeapon() {
    ctx.beginPath();
    if (currentWeapon === 'blackDot') {
        ctx.arc(50, canvas.height - 50, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
    } else if (currentWeapon === 'line') {
        ctx.moveTo(40, canvas.height - 50);
        ctx.lineTo(60, canvas.height - 50);
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#000';
        ctx.stroke();
    } else if (currentWeapon === 'whiteDot') {
        ctx.arc(50, canvas.height - 50, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#FFF';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
    }
    ctx.closePath();
}

function startGame() {
    introScreen.style.display = 'none';
    canvas.style.display = 'block';
    infoDisplay.style.display = 'block';
    gameOverScreen.style.display = 'none';
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
    introScreen.style.display = 'block';
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
    gameOverScreen.style.display = 'block';
    if (hitPercentage >= requiredPercentage) {
        stage++;
        if (stage > stageSettings.length) {
            gameOverMessage.textContent = 'You won the game!';
        } else {
            gameOverMessage.textContent = `Stage ${stage - 1} cleared! Get ready for Stage ${stage}!`;
            setTimeout(restartGame, 3000);
            return;
        }
    } else {
        gameOverMessage.textContent = 'Game over! Try again.';
    }
}

function animate() {
    if (!gameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    targets = targets.filter(target => target.update());
    targets.forEach(target => target.draw());
    drawWeapon();
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
            const isCorrect =
                (target.type === 'circle' && currentWeapon === 'blackDot') ||
                (target.type === 'square' && currentWeapon === 'line') ||
                (target.type === 'triangle' && currentWeapon === 'whiteDot');
            if (isCorrect) {
                score += 1;
                correctHits++;
                scoreDisplay.textContent = `Score: ${score}`;
                correctHitsDisplay.textContent = `Correct Hits: ${correctHits}`;
                target.opacity = 0.9;
            }
            return false;
        }
        return true;
    });

    if (totalTargets >= 8) checkStageEnd(); // کاهش تعداد اهداف به 8
});

document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    let weaponChanged = false;
    if (e.key === '1' || e.key === 'Control') {
        currentWeapon = 'blackDot';
        weaponChanged = true;
    }
    if ((e.key === '2' || e.key === 'Alt') && stage >= 2) {
        currentWeapon = 'line';
        weaponChanged = true;
    }
    if ((e.key === '3' || e.key === 'Space') && stage >= 3) {
        currentWeapon = 'whiteDot';
        weaponChanged = true;
    }
    if (weaponChanged) {
        weaponDisplay.textContent = `Weapon: ${currentWeapon === 'blackDot' ? 'Black Dot' : currentWeapon === 'line' ? 'Line' : 'White Dot'}`;
    }
});

introScreen.style.display = 'block';
