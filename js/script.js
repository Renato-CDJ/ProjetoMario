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

function createParticle(x, y, color) {
  const particle = document.createElement("div")
  particle.style.position = "absolute"
  particle.style.left = x + "px"
  particle.style.bottom = y + "px"
  particle.style.width = "8px"
  particle.style.height = "8px"
  particle.style.borderRadius = "50%"
  particle.style.backgroundColor = color
  particle.style.pointerEvents = "none"
  particle.style.zIndex = "20"
  particle.style.boxShadow = `0 0 10px ${color}`

  const gameBoard = document.querySelector(".game-board")
  gameBoard.appendChild(particle)

  const angle = Math.random() * Math.PI * 2
  const velocity = 2 + Math.random() * 3
  const vx = Math.cos(angle) * velocity
  const vy = Math.sin(angle) * velocity + 5

  let posX = x
  let posY = y
  let opacity = 1

  function animate() {
    posX += vx
    posY += vy
    opacity -= 0.02

    particle.style.left = posX + "px"
    particle.style.bottom = posY + "px"
    particle.style.opacity = opacity

    if (opacity > 0) {
      requestAnimationFrame(animate)
    } else {
      particle.remove()
    }
  }

  animate()
}

function createJumpEffect() {
  const marioRect = mario.getBoundingClientRect()
  const gameBoardRect = document.querySelector(".game-board").getBoundingClientRect()
  const x = marioRect.left - gameBoardRect.left + marioRect.width / 2
  const y = marioRect.bottom - gameBoardRect.bottom

  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      createParticle(x, Math.abs(y), "#ffd700")
    }, i * 20)
  }
}

function applyCharacter(fileName) {
  const imagePath = "./images/" + fileName

  const marioEl = document.querySelector(".mario")
  if (marioEl) marioEl.src = imagePath

  const scoreIcon = document.getElementById("score-icon")
  if (scoreIcon) scoreIcon.src = imagePath

  localStorage.setItem("selectedCharacter", fileName)
}

function selectCharacter(fileName) {
  currentCharacterIndex = characters.indexOf(fileName)
  if (currentCharacterIndex === -1) currentCharacterIndex = 0

  applyCharacter(fileName)

  const selection = document.getElementById("character-selection")
  selection.style.opacity = "0"
  selection.style.transform = "scale(0.9)"

  setTimeout(() => {
    selection.style.display = "none"
    document.getElementById("game-board").hidden = false
    startGameLoop()
  }, 300)
}

function changeCharacter() {
  if (isGameOver) return

  currentCharacterIndex = (currentCharacterIndex + 1) % characters.length
  const nextCharacter = characters[currentCharacterIndex]
  applyCharacter(nextCharacter)

  mario.style.transform = "scale(1.2)"
  setTimeout(() => {
    mario.style.transform = "scale(1)"
  }, 200)
}

function updatePipeSpeed() {
  pipe.style.animation = `pipe-animation ${pipeSpeed}s infinite linear`
}

function jump() {
  if (isGameOver || isJumping) return

  isJumping = true
  mario.classList.add("jump")

  createJumpEffect()

  const jumpSound = jumpAudio.cloneNode()
  jumpSound.volume = 0.3
  jumpSound.play().catch(() => {})

  setTimeout(() => {
    mario.classList.remove("jump")
    isJumping = false
  }, 500)
}

function playSound() {
  const button = document.querySelector(".play-audio")

  if (musicAudio.paused) {
    musicAudio.currentTime = 0
    musicAudio.volume = 0.4
    musicAudio.play().catch(() => {})
    button.style.transform = "scale(1.1) rotate(15deg)"
    setTimeout(() => {
      button.style.transform = "scale(1) rotate(0deg)"
    }, 200)
  } else {
    musicAudio.pause()
    button.style.transform = "scale(0.9)"
    setTimeout(() => {
      button.style.transform = "scale(1)"
    }, 200)
  }
}

function updateHighScore() {
  const highScoreEl = document.getElementById("high-score")
  if (highScoreEl) {
    highScoreEl.textContent = highScore

    if (score > highScore) {
      highScoreEl.parentElement.style.transform = "scale(1.1)"
      setTimeout(() => {
        highScoreEl.parentElement.style.transform = "scale(1)"
      }, 300)
    }
  }
}

function createCollisionEffect() {
  const marioRect = mario.getBoundingClientRect()
  const gameBoardRect = document.querySelector(".game-board").getBoundingClientRect()
  const x = marioRect.left - gameBoardRect.left + marioRect.width / 2
  const y = marioRect.bottom - gameBoardRect.bottom

  const colors = ["#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3"]

  for (let i = 0; i < 15; i++) {
    setTimeout(() => {
      const color = colors[Math.floor(Math.random() * colors.length)]
      createParticle(x, Math.abs(y), color)
    }, i * 30)
  }
}

function handleGameOver() {
  isGameOver = true

  const pipePosition = pipe.offsetLeft
  pipe.style.animation = "none"
  pipe.style.left = `${pipePosition}px`

  const marioPosition = +window.getComputedStyle(mario).bottom.replace("px", "")
  mario.style.animation = "none"
  mario.style.bottom = `${marioPosition}px`

  mario.style.filter = "grayscale(100%)"
  mario.style.opacity = "0.7"

  createCollisionEffect()

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
    const pointsEarned = Math.floor(scoreAccumulator / 100)
    score += pointsEarned
    scoreAccumulator = scoreAccumulator % 100
    scoreSpan.textContent = score

    if (pointsEarned > 0) {
      scoreSpan.style.transform = "scale(1.2)"
      setTimeout(() => {
        scoreSpan.style.transform = "scale(1)"
      }, 100)
    }

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

window.addEventListener("DOMContentLoaded", () => {
  const selected = localStorage.getItem("selectedCharacter")
  const firstCharacter = selected || characters[0]
  currentCharacterIndex = characters.indexOf(firstCharacter)
  if (currentCharacterIndex === -1) currentCharacterIndex = 0

  updateHighScore()

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
