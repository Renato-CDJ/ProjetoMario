const mario = document.querySelector(".mario")
const scoreSpan = document.getElementById("score")
const gameOverImg = document.querySelector(".game-over")
const jumpButton = document.getElementById("jump-button")
const restartButton = document.getElementById("restart-button")

const jumpAudio = document.getElementById("jump-audio")
const gameOverAudio = document.getElementById("gameover-audio")
const musicAudio = document.getElementById("sound-effect")

let score = 0
let isGameOver = false
let obstacleSpeed = 1.5
let isJumping = false
let highScore = Number.parseInt(localStorage.getItem("highScore")) || 0
let animationFrameId = null
const activeObstacles = []
const obstacleSpawnTimer = 0
let lastSpawnTime = 0

const characters = ["mario.gif", "gatim.gif", "pikachu.gif", "goku.gif", "tubarao.gif", "sla.gif", "Passinho.gif"]
let currentCharacterIndex = 0

const obstacleTypes = [
  {
    name: "pipe",
    image: "./images/pipe.png",
    width: 80,
    height: 80,
    hitboxHeight: 70,
    speed: 1,
    points: 10,
    color: "#2ecc71",
  },
  {
    name: "fire",
    image: "./images/fogo.gif",
    width: 60,
    height: 90,
    hitboxHeight: 80,
    speed: 1.3,
    points: 15,
    color: "#e74c3c",
  },
  {
    name: "flash",
    image: "./images/flash.webp",
    width: 70,
    height: 100,
    hitboxHeight: 90,
    speed: 1.5,
    points: 20,
    color: "#f39c12",
  },
  {
    name: "flying",
    image: "./images/Flying.gif",
    width: 75,
    height: 85,
    hitboxHeight: 75,
    speed: 1.2,
    points: 12,
    color: "#9b59b6",
  },
]

function createObstacle() {
  const gameBoard = document.querySelector(".game-board")
  const randomType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)]

  const obstacle = document.createElement("img")
  obstacle.src = randomType.image
  obstacle.alt = randomType.name
  obstacle.className = "obstacle"
  obstacle.style.position = "absolute"
  obstacle.style.bottom = "15px"
  obstacle.style.right = "-100px"
  obstacle.style.width = randomType.width + "px"
  obstacle.style.height = randomType.height + "px"
  obstacle.style.zIndex = "5"
  obstacle.style.userSelect = "none"
  obstacle.style.filter = "drop-shadow(0 6px 10px rgba(0, 0, 0, 0.25))"
  obstacle.style.transition = "filter 0.3s ease"

  gameBoard.appendChild(obstacle)

  const obstacleData = {
    element: obstacle,
    type: randomType,
    position: -100,
    passed: false,
  }

  activeObstacles.push(obstacleData)

  return obstacleData
}

function updateObstacles(deltaTime) {
  const speedMultiplier = deltaTime / 16.67

  activeObstacles.forEach((obs, index) => {
    obs.position += obs.type.speed * obstacleSpeed * 2.5 * speedMultiplier
    obs.element.style.right = obs.position + "px"

    const marioLeft = 100
    const obsRight = window.innerWidth - obs.position - obs.type.width

    if (!obs.passed && obsRight < marioLeft + 50 && obsRight > marioLeft - 50) {
      obs.element.style.filter = "drop-shadow(0 0 20px " + obs.type.color + ")"
    } else {
      obs.element.style.filter = "drop-shadow(0 6px 10px rgba(0, 0, 0, 0.25))"
    }

    if (!obs.passed && obs.position > window.innerWidth * 0.15) {
      obs.passed = true
      score += obs.type.points
      scoreSpan.textContent = score

      scoreSpan.style.transform = "scale(1.3)"
      scoreSpan.style.color = obs.type.color
      setTimeout(() => {
        scoreSpan.style.transform = "scale(1)"
        scoreSpan.style.color = "#fff"
      }, 200)
    }

    if (obs.position > window.innerWidth + 100) {
      obs.element.remove()
      activeObstacles.splice(index, 1)
    }
  })
}

function spawnObstacles(currentTime) {
  const spawnInterval = 2000 - Math.min(score * 2, 800)

  if (currentTime - lastSpawnTime > spawnInterval) {
    createObstacle()
    lastSpawnTime = currentTime
  }
}

function checkCollision() {
  const marioRect = mario.getBoundingClientRect()
  const marioBottom = Number.parseInt(window.getComputedStyle(mario).bottom)

  for (const obs of activeObstacles) {
    const obsRect = obs.element.getBoundingClientRect()

    const horizontalOverlap = marioRect.right > obsRect.left + 10 && marioRect.left < obsRect.right - 10

    const verticalCollision = marioBottom < obs.type.hitboxHeight - 10

    if (horizontalOverlap && verticalCollision) {
      return true
    }
  }

  return false
}

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

function jump() {
  if (isGameOver || isJumping) return

  isJumping = true
  mario.classList.add("jump")

  createJumpEffect()

  if (jumpAudio) {
    const jumpSound = jumpAudio.cloneNode()
    jumpSound.volume = 0.3
    jumpSound.play().catch(() => {})
  }

  setTimeout(() => {
    mario.classList.remove("jump")
    isJumping = false
  }, 500)
}

function playSound() {
  if (!musicAudio) return

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

  activeObstacles.forEach((obs) => {
    const currentRight = Number.parseInt(obs.element.style.right)
    obs.element.style.right = currentRight + "px"
    obs.element.style.animation = "none"
  })

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

  if (gameOverAudio) {
    gameOverAudio.volume = 0.5
    gameOverAudio.currentTime = 0
    gameOverAudio.play().catch(() => {})
  }

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
}

let lastTime = 0

function startGameLoop() {
  createObstacle()
  lastSpawnTime = performance.now()
  lastTime = performance.now()
  gameLoop(lastTime)
}

function gameLoop(currentTime) {
  if (isGameOver) return

  const deltaTime = currentTime - lastTime
  lastTime = currentTime

  updateObstacles(deltaTime)

  spawnObstacles(currentTime)

  if (score % 100 === 0 && score > 0) {
    if (obstacleSpeed > 0.6) {
      obstacleSpeed -= 0.02
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
      activeObstacles.forEach((obs) => {
        obs.element.style.animationPlayState = "paused"
      })
    }
  } else {
    if (!isGameOver && animationFrameId) {
      activeObstacles.forEach((obs) => {
        obs.element.style.animationPlayState = "running"
      })
      lastTime = performance.now()
      gameLoop(lastTime)
    }
  }
})
