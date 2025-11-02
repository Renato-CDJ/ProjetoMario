const mario = document.querySelector(".mario")
const pipe = document.querySelector(".pipe")
const scoreSpan = document.getElementById("score")
const gameOverImg = document.querySelector(".game-over")
const jumpButton = document.getElementById("jump-button")
const restartButton = document.getElementById("restart-button")

const jumpAudio = document.getElementById("jump-audio")
const gameOverAudio = document.getElementById("gameover-audio")
const musicAudio = document.getElementById("sound-effect")

let score = 0
let isGameOver = false
let pipeSpeed = 1.5
let isJumping = false
let highScore = Number.parseInt(localStorage.getItem("highScore")) || 0
let animationFrameId = null

const characters = ["mario.gif", "gatim.gif", "pikachu.gif", "goku.gif", "tubarao.gif", "sla.gif", "Passinho.gif"]
let currentCharacterIndex = 0

// Aplica personagem (imagem principal + ícone da pontuação)
function applyCharacter(fileName) {
  const imagePath = "./images/" + fileName

  // Atualiza personagem principal (só se existir)
  const marioEl = document.querySelector(".mario")
  if (marioEl) marioEl.src = imagePath

  // Atualiza ícone da pontuação
  const scoreIcon = document.getElementById("score-icon")
  if (scoreIcon) scoreIcon.src = imagePath

  localStorage.setItem("selectedCharacter", fileName)
}

// Seleciona ao clicar na tela inicial
function selectCharacter(fileName) {
  currentCharacterIndex = characters.indexOf(fileName)
  if (currentCharacterIndex === -1) currentCharacterIndex = 0

  applyCharacter(fileName)
  document.getElementById("character-selection").style.display = "none"
  document.getElementById("game-board").hidden = false

  startGameLoop()
}

// Troca personagem com tecla C
function changeCharacter() {
  if (isGameOver) return

  currentCharacterIndex = (currentCharacterIndex + 1) % characters.length
  const nextCharacter = characters[currentCharacterIndex]
  applyCharacter(nextCharacter)
}

// Atualiza velocidade
function updatePipeSpeed() {
  pipe.style.animation = `pipe-animation ${pipeSpeed}s infinite linear`
}

function jump() {
  if (isGameOver || isJumping) return

  isJumping = true
  mario.classList.add("jump")

  const jumpSound = jumpAudio.cloneNode()
  jumpSound.volume = 0.3
  jumpSound.play().catch(() => {})

  setTimeout(() => {
    mario.classList.remove("jump")
    isJumping = false
  }, 500)
}

// Som botão 🎵
function playSound() {
  if (musicAudio.paused) {
    musicAudio.currentTime = 0
    musicAudio.volume = 0.4
    musicAudio.play().catch(() => {})
  } else {
    musicAudio.pause()
  }
}

function updateHighScore() {
  const highScoreEl = document.getElementById("high-score")
  if (highScoreEl) {
    highScoreEl.textContent = highScore
  }
}

function handleGameOver() {
  isGameOver = true

  // Stop pipe animation
  const pipePosition = pipe.offsetLeft
  pipe.style.animation = "none"
  pipe.style.left = `${pipePosition}px`

  // Stop mario animation
  const marioPosition = +window.getComputedStyle(mario).bottom.replace("px", "")
  mario.style.animation = "none"
  mario.style.bottom = `${marioPosition}px`

  mario.style.filter = "grayscale(100%)"
  mario.style.opacity = "0.7"

  gameOverImg.hidden = false
  restartButton.hidden = false

  if (score > highScore) {
    highScore = score
    localStorage.setItem("highScore", highScore)
    updateHighScore()
  }

  gameOverAudio.volume = 0.5
  gameOverAudio.currentTime = 0
  gameOverAudio.play().catch(() => {})

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
}

function checkCollision() {
  const pipePosition = pipe.offsetLeft
  const marioPosition = +window.getComputedStyle(mario).bottom.replace("px", "")

  const marioWidth = mario.offsetWidth
  const pipeWidth = pipe.offsetWidth
  const collisionThreshold = 80

  // Check if pipe is in collision zone
  if (pipePosition <= 120 && pipePosition > -pipeWidth && marioPosition < collisionThreshold) {
    return true
  }

  return false
}

let lastTime = 0
let scoreAccumulator = 0

function startGameLoop() {
  updatePipeSpeed()
  lastTime = performance.now()
  gameLoop(lastTime)
}

function gameLoop(currentTime) {
  if (isGameOver) return

  const deltaTime = currentTime - lastTime
  lastTime = currentTime

  scoreAccumulator += deltaTime
  if (scoreAccumulator >= 100) {
    score += Math.floor(scoreAccumulator / 100)
    scoreAccumulator = scoreAccumulator % 100
    scoreSpan.textContent = score

    if (score % 500 === 0 && score > 0) {
      if (pipeSpeed > 0.6) {
        pipeSpeed -= 0.1
        updatePipeSpeed()
      }

      const board = document.querySelector(".game-board")
      board.classList.remove("sky-evening", "sky-night")

      const cycle = Math.floor(score / 500) % 3
      if (cycle === 1) {
        board.classList.add("sky-evening")
      } else if (cycle === 2) {
        board.classList.add("sky-night")
      }
    }
  }

  if (checkCollision()) {
    handleGameOver()
    return
  }

  animationFrameId = requestAnimationFrame(gameLoop)
}

// Aplica personagem salvo ao iniciar
window.addEventListener("DOMContentLoaded", () => {
  const selected = localStorage.getItem("selectedCharacter")
  const firstCharacter = selected || characters[0]
  currentCharacterIndex = characters.indexOf(firstCharacter)
  if (currentCharacterIndex === -1) currentCharacterIndex = 0

  updateHighScore()

  // Aguarda levemente a renderização para aplicar o personagem
  setTimeout(() => {
    applyCharacter(characters[currentCharacterIndex])
  }, 100)
})

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault()
    jump()
  }
  if (event.code === "KeyC") {
    event.preventDefault()
    changeCharacter()
  }
})

jumpButton.addEventListener("touchstart", (e) => {
  e.preventDefault()
  jump()
})

jumpButton.addEventListener("click", (e) => {
  e.preventDefault()
  jump()
})

// Reinício
restartButton.addEventListener("click", () => {
  location.reload()
})

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (animationFrameId && !isGameOver) {
      cancelAnimationFrame(animationFrameId)
      pipe.style.animationPlayState = "paused"
    }
  } else {
    if (!isGameOver && animationFrameId) {
      pipe.style.animationPlayState = "running"
      lastTime = performance.now()
      gameLoop(lastTime)
    }
  }
})
