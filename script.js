const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');


const revealBtn = document.getElementById('revealBtn');
revealBtn.style.display = 'none';  // Start hidden

function resizeCanvas() {
  canvas.width = window.innerWidth * 0.9;
  canvas.height = window.innerHeight * 0.7;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
canvas.addEventListener('pointerdown', () => {
  if (!allowPainting && !revealStarted) {
    startPaintingSession(); // Begin the paint session on first click/touch
  }
});


// Name drawing
const nameCanvas = document.createElement('canvas');
nameCanvas.width = canvas.width;
nameCanvas.height = canvas.height;
const nameCtx = nameCanvas.getContext('2d');



nameCtx.fillStyle = 'black';
nameCtx.fillRect(0, 0, canvas.width, canvas.height);

nameCtx.font = 'bold 10vw Arial';
nameCtx.textAlign = 'center';
nameCtx.textBaseline = 'middle';
nameCtx.fillStyle = 'white';
nameCtx.fillText('PRIYA', canvas.width / 2, canvas.height / 2);

const mask = nameCtx.getImageData(0, 0, canvas.width, canvas.height);

ctx.fillStyle = 'black';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Manual paint mode
let painting = false;
let brushColor = 'red';
let brushTimer = null;
let paintTimer = null;
let revealStarted = false;
let allowPainting = false;

function getRandomColor() {
  const r = Math.floor(100 + Math.random() * 155);
  const g = Math.floor(100 + Math.random() * 155);
  const b = Math.floor(100 + Math.random() * 155);
  return `rgb(${r}, ${g}, ${b})`;
}

function startPaintingSession() {
 if (allowPainting || revealStarted) return;

  allowPainting = true;
  brushColor = getRandomColor();

  // Change color every 0.5 sec
  brushTimer = setInterval(() => {
    brushColor = getRandomColor();
  }, 100);
monitorReveal(); 
 function monitorReveal() {
  if (!allowPainting || revealStarted) return;
  const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
  if (checkNameFullyRevealed(current)) {
    allowPainting = false;
    clearInterval(brushTimer);
    fadeReveal();
  } else {
    requestAnimationFrame(monitorReveal);
  }
}
requestAnimationFrame(monitorReveal);

}

canvas.addEventListener('mousedown', (e) => {
  if (!allowPainting) return;
  painting = true;
  paint(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', (e) => {
  if (!allowPainting || !painting) return;
  paint(e.offsetX, e.offsetY);
});

canvas.addEventListener('mouseup', () => painting = false);
canvas.addEventListener('mouseleave', () => painting = false);

canvas.addEventListener('touchstart', (e) => {
  if (!allowPainting) return;
  painting = true;
  const rect = canvas.getBoundingClientRect();
  paint(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
});

canvas.addEventListener('touchmove', (e) => {
  if (!allowPainting || !painting) return;
  const rect = canvas.getBoundingClientRect();
  paint(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
  e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', () => painting = false);

function paint(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 30 + Math.random() * 40, 0, Math.PI * 2);
  ctx.fillStyle = brushColor;
  ctx.fill();
}

function checkNameFullyRevealed(imageData) {
  const data = imageData.data;
  const maskData = mask.data;
  for (let i = 0; i < data.length; i += 4) {
    const isName = maskData[i] > 200;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const isBlack = r < 10 && g < 10 && b < 10;
    if (isName && isBlack) {
      return false;
    }
  }
  return true;
}

function checkRevealCondition() {
  const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
  if (checkNameFullyRevealed(current)) {
    fadeReveal();
  } else {
    // Let user continue until name fully revealed manually
    allowPainting = true;
    startPaintingSession(); // restart paint session

  }
}

function fadeReveal(duration = 3000) {
  revealStarted = true;
  const start = performance.now();
  const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const maskData = mask.data;

  function step(timestamp) {
    const elapsed = timestamp - start;
    const t = Math.min(1, elapsed / duration);
    const faded = ctx.createImageData(current);

    for (let i = 0; i < current.data.length; i += 4) {
      const isName = maskData[i] > 200;
      if (isName) {
        faded.data[i] = current.data[i];
        faded.data[i + 1] = current.data[i + 1];
        faded.data[i + 2] = current.data[i + 2];
        faded.data[i + 3] = 255;
      } else {
        const r = current.data[i];
        const g = current.data[i + 1];
        const b = current.data[i + 2];
        faded.data[i] = r * (1 - t);
        faded.data[i + 1] = g * (1 - t);
        faded.data[i + 2] = b * (1 - t);
        faded.data[i + 3] = 255;
      }
    }

    ctx.putImageData(faded, 0, 0);

    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      drawMessages();
       setTimeout(() => {
        revealBtn.style.display = 'inline-block';
      }, 10000);
    }
  }

  requestAnimationFrame(step);
}

// 🎉 Post-Reveal Messages
const rainbow = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
let rainbowIndex = 0;

function drawMessages() {
  setInterval(() => {
    // Rainbow "Happy Birthday"
    ctx.font = 'bold 8vw Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = rainbow[rainbowIndex];
    ctx.clearRect(0, 0, canvas.width, canvas.height * 0.2);
    ctx.fillText('Happy Birthday', canvas.width / 2, canvas.height / 2 - canvas.height * 0.15);
    rainbowIndex = (rainbowIndex + 1) % rainbow.length;

    // Sparkling "Let your silver scintill" with even spacing
    const text = 'Let your silver scintill';
    ctx.font = '4vw Arial';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.clearRect(0, canvas.height * 0.85, canvas.width, canvas.height * 0.2);
    const totalWidth = ctx.measureText(text).width;
    const startX = (canvas.width - totalWidth) / 2;
    const y = canvas.height / 2 + canvas.height * 0.12;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const w = ctx.measureText(char).width;
      ctx.fillStyle = Math.random() < 0.2 ? 'white' : 'silver';
      ctx.fillText(char, startX + ctx.measureText(text.slice(0, i)).width, y);
    }
  }, 2000);
}

document.getElementById('revealBtn').addEventListener('click', () => {
  if (!revealStarted) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    revealStarted = false;
    startPaintingSession();
  } else {
    location.reload(); // restart
  }
});

revealBtn.addEventListener('click', () => {
  resetGame();                      // Call your game reset logic
  revealBtn.style.display = 'none'; // Hide the button again after starting
});