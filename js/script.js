const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');
const scoreSpan = document.getElementById('score');
const gameOverImg = document.querySelector('.game-over');
const jumpButton = document.getElementById('jump-button');

const jumpAudio = document.getElementById('jump-audio');
const gameOverAudio = document.getElementById('gameover-audio');
const musicAudio = document.getElementById('sound-effect');

let score = 0;
let isGameOver = false;

function jump() {
  if (isGameOver) return;

  mario.classList.add('jump');
  jumpAudio.currentTime = 0;
  jumpAudio.play().catch(() => {});

  setTimeout(() => {
    mario.classList.remove('jump');
  }, 500);
}

function playSound() {
  musicAudio.currentTime = 0;
  musicAudio.play().catch(() => {});
}

const loop = setInterval(() => {
  const pipePosition = pipe.offsetLeft;
  const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');

  if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80 && !isGameOver) {
    pipe.style.animation = 'none';
    pipe.style.left = `${pipePosition}px`;

    mario.style.animation = 'none';
    mario.style.bottom = `${marioPosition}px`;
    mario.src = './images/game-over.png';
    mario.style.width = '75px';
    mario.style.marginLeft = '50px';

    gameOverImg.hidden = false;

    gameOverAudio.currentTime = 0;
    gameOverAudio.play().catch(() => {});

    clearInterval(loop);
    isGameOver = true;
  }

  if (!isGameOver) {
    score++;
    scoreSpan.textContent = score;
  }
}, 100);

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') jump();
});

jumpButton.addEventListener('touchstart', jump);
