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
let pipeSpeed = 1.5; // segundos iniciais

// Seleção de personagem
function selectCharacter(fileName) {
  localStorage.setItem('selectedCharacter', fileName);
  document.getElementById('character-selection').style.display = 'none';
  document.getElementById('game-board').hidden = false;

  mario.src = './images/' + fileName;
}

// Aplica a velocidade ao cano
function updatePipeSpeed() {
  pipe.style.animation = `pipe-animation ${pipeSpeed}s infinite linear`;
}

// Reinicia o jogo após Game Over
function restartGame() {
  setTimeout(() => {
    window.location.reload();
  }, 2000);
}

// Ação de pulo
function jump() {
  if (isGameOver) return;

  mario.classList.add('jump');
  jumpAudio.currentTime = 0;
  jumpAudio.play().catch(() => {});

  setTimeout(() => {
    mario.classList.remove('jump');
  }, 500);
}

// Botão de som 🎵
function playSound() {
  musicAudio.currentTime = 0;
  musicAudio.play().catch(() => {});
}

// Carrega personagem salvo
window.addEventListener('DOMContentLoaded', () => {
  const selected = localStorage.getItem('selectedCharacter');
  if (selected && mario) {
    mario.src = './images/' + selected;
  }
});

updatePipeSpeed();

const loop = setInterval(() => {
  const pipePosition = pipe.offsetLeft;
  const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');

  if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80 && !isGameOver) {
    // Colisão
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
    restartGame();
  }

  if (!isGameOver) {
    score++;
    scoreSpan.textContent = score;

    if (score % 500 === 0 && pipeSpeed > 0.6) {
      pipeSpeed -= 0.1;
      updatePipeSpeed();
    }
  }
}, 100);

document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') jump();
});

jumpButton.addEventListener('touchstart', jump);
