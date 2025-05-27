const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');
const scoreSpan = document.getElementById('score');
const gameOverImg = document.querySelector('.game-over');
const jumpButton = document.getElementById('jump-button');
const restartButton = document.getElementById('restart-button');

const jumpAudio = document.getElementById('jump-audio');
const gameOverAudio = document.getElementById('gameover-audio');
const musicAudio = document.getElementById('sound-effect');

let score = 0;
let isGameOver = false;
let pipeSpeed = 1.5;

// Lista de personagens e índice
const characters = ['mario.gif', 'luigi.gif', 'yoshi.gif'];
let currentCharacterIndex = 0;

// Aplica personagem (imagem principal + ícone da pontuação)
function applyCharacter(fileName) {
  const imagePath = './images/' + fileName;

  // Atualiza personagem principal (só se existir)
  const marioEl = document.querySelector('.mario');
  if (marioEl) marioEl.src = imagePath;

  // Atualiza ícone da pontuação
  const scoreIcon = document.getElementById('score-icon');
  if (scoreIcon) scoreIcon.src = imagePath;

  localStorage.setItem('selectedCharacter', fileName);
}


// Seleciona ao clicar na tela inicial
function selectCharacter(fileName) {
  currentCharacterIndex = characters.indexOf(fileName);
  applyCharacter(fileName);
  document.getElementById('character-selection').style.display = 'none';
  document.getElementById('game-board').hidden = false;
}

// Troca personagem com tecla C
function changeCharacter() {
  currentCharacterIndex = (currentCharacterIndex + 1) % characters.length;
  const nextCharacter = characters[currentCharacterIndex];
  applyCharacter(nextCharacter);
}

// Atualiza velocidade
function updatePipeSpeed() {
  pipe.style.animation = `pipe-animation ${pipeSpeed}s infinite linear`;
}

// Pulo
function jump() {
  if (isGameOver) return;

  mario.classList.add('jump');
  jumpAudio.currentTime = 0;
  jumpAudio.play().catch(() => {});

  setTimeout(() => {
    mario.classList.remove('jump');
  }, 500);
}

// Som botão 🎵
function playSound() {
  musicAudio.currentTime = 0;
  musicAudio.play().catch(() => {});
}

// Aplica personagem salvo ao iniciar
window.addEventListener('DOMContentLoaded', () => {
  const selected = localStorage.getItem('selectedCharacter');
  const firstCharacter = selected || characters[0];
  currentCharacterIndex = characters.indexOf(firstCharacter);
  if (currentCharacterIndex === -1) currentCharacterIndex = 0;

  // Aguarda levemente a renderização para aplicar o personagem
  setTimeout(() => {
    applyCharacter(characters[currentCharacterIndex]);
  }, 100);
});


updatePipeSpeed();

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
    restartButton.hidden = false;
  }

  if (!isGameOver) {
    score++;
    scoreSpan.textContent = score;

    if (score % 500 === 0) {
      if (pipeSpeed > 0.6) {
        pipeSpeed -= 0.1;
        updatePipeSpeed();
      }

      const board = document.querySelector('.game-board');
      board.classList.remove('sky-evening', 'sky-night');

      const cycle = (score / 500) % 3;
      if (cycle === 1) {
        board.classList.add('sky-evening');
      } else if (cycle === 2) {
        board.classList.add('sky-night');
      }
    }
  }
}, 100);

// Teclado
document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') jump();
  if (event.code === 'KeyC') changeCharacter();
});

// Celular
jumpButton.addEventListener('touchstart', jump);

// Reinício
restartButton.addEventListener('click', () => {
  window.location.reload();
});
