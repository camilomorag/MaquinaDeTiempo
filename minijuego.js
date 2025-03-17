document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM para el juego de alienígenas
  const startButton = document.getElementById("start-alien-game")
  const resetButton = document.getElementById("reset-alien-game")
  const scoreElement = document.getElementById("alien-score")
  const timeElement = document.getElementById("alien-time")
  const gameMessage = document.getElementById("alien-game-message")
  const gridCells = document.querySelectorAll(".grid-cell")

  // Variables del juego
  let score = 0
  let timeLeft = 60
  let gameInterval
  let buttonInterval
  let isGameRunning = false
  const targetScore = 500

  // Configuración del juego
  const buttonPoints = 25
  const alienPoints = -15
  const alienProbability = 0.3 // 30% de probabilidad de que aparezca un alienígena

  // Iniciar juego
  startButton.addEventListener("click", startGame)
  resetButton.addEventListener("click", resetGame)

  // Agregar eventos de clic a las celdas
  gridCells.forEach((cell) => {
    cell.addEventListener("click", handleCellClick)
  })

  function startGame() {
    if (isGameRunning) return

    // Reiniciar variables
    score = 0
    timeLeft = 60
    isGameRunning = true

    // Actualizar UI
    scoreElement.textContent = score
    timeElement.textContent = timeLeft
    gameMessage.classList.remove("visible", "success", "failure")

    // Desactivar/activar botones
    startButton.disabled = true
    resetButton.disabled = false

    // Limpiar celdas
    clearAllCells()

    // Iniciar intervalos
    gameInterval = setInterval(updateGame, 1000)
    buttonInterval = setInterval(showRandomButton, 1200) // Mostrar un nuevo botón cada 1.2 segundos
  }

  function updateGame() {
    timeLeft--
    timeElement.textContent = timeLeft

    // Verificar fin del juego
    if (timeLeft <= 0 || score >= targetScore) {
      endGame()
    }
  }

  function endGame() {
    isGameRunning = false
    clearInterval(gameInterval)
    clearInterval(buttonInterval)

    resetButton.disabled = false

    // Limpiar celdas
    clearAllCells()

    // Mostrar mensaje de resultado
    if (score >= targetScore) {
      gameMessage.textContent = "¡Éxito! Has estabilizado la máquina del tiempo."
      gameMessage.classList.add("visible", "success")
    } else {
      gameMessage.textContent = "La máquina ha colapsado. Intenta de nuevo."
      gameMessage.classList.add("visible", "failure")
    }
  }

  function resetGame() {
    clearAllCells()
    scoreElement.textContent = "0"
    timeElement.textContent = "60"
    gameMessage.classList.remove("visible")
    startButton.disabled = false

    // Detener el juego si está en curso
    if (isGameRunning) {
      isGameRunning = false
      clearInterval(gameInterval)
      clearInterval(buttonInterval)
    }
  }

  function clearAllCells() {
    gridCells.forEach((cell) => {
      cell.className = "grid-cell"
      cell.innerHTML = ""
      // Asegurarse de mantener el atributo data-index
      const index = cell.getAttribute("data-index")
      if (index) {
        cell.setAttribute("data-index", index)
      }
    })
  }

  function showRandomButton() {
    if (!isGameRunning) return

    // Limpiar celdas activas primero
    clearAllCells()

    // Seleccionar una celda aleatoria
    const randomIndex = Math.floor(Math.random() * gridCells.length)
    const cell = gridCells[randomIndex]

    // Determinar si aparece un alienígena
    const hasAlien = Math.random() < alienProbability

    // Activar la celda
    cell.classList.add("active")

    // Si hay alienígena, agregarlo
    if (hasAlien) {
      cell.classList.add("alien")

      // Crear el alienígena
      const alienIcon = document.createElement("div")
      alienIcon.className = "alien-icon"

      // Ojos
      const leftEye = document.createElement("div")
      leftEye.className = "alien-eye left"
      const leftPupil = document.createElement("div")
      leftPupil.className = "alien-pupil"
      leftEye.appendChild(leftPupil)

      const rightEye = document.createElement("div")
      rightEye.className = "alien-eye right"
      const rightPupil = document.createElement("div")
      rightPupil.className = "alien-pupil"
      rightEye.appendChild(rightPupil)

      // Boca
      const mouth = document.createElement("div")
      mouth.className = "alien-mouth"

      // Agregar partes al alienígena
      alienIcon.appendChild(leftEye)
      alienIcon.appendChild(rightEye)
      alienIcon.appendChild(mouth)

      // Agregar alienígena a la celda
      cell.appendChild(alienIcon)
    }

    // Auto-desaparecer después de un tiempo aleatorio
    const disappearTime = Math.random() * 500 + 1000 // 1-1.5 segundos
    setTimeout(() => {
      if (isGameRunning) {
        cell.className = "grid-cell"
        cell.innerHTML = ""
        // Mantener el atributo data-index
        const index = cell.getAttribute("data-index")
        if (index) {
          cell.setAttribute("data-index", index)
        }
      }
    }, disappearTime)
  }

  function handleCellClick(event) {
    if (!isGameRunning) return

    const cell = event.currentTarget

    // Verificar si la celda está activa
    if (cell.classList.contains("active")) {
      // Efecto visual de clic
      cell.classList.add("clicked")

      // Verificar si hay alienígena
      const hasAlien = cell.classList.contains("alien")

      // Actualizar puntuación
      const points = hasAlien ? alienPoints : buttonPoints
      score += points
      scoreElement.textContent = score

      // Mostrar indicador de puntos
      showPointsIndicator(cell, points)

      // Efecto visual según resultado
      if (hasAlien) {
        cell.classList.add("wrong")
      } else {
        cell.classList.add("correct")
      }

      // Limpiar celda
      setTimeout(() => {
        cell.className = "grid-cell"
        cell.innerHTML = ""
        // Mantener el atributo data-index
        const index = cell.getAttribute("data-index")
        if (index) {
          cell.setAttribute("data-index", index)
        }
      }, 300)

      // Verificar si se alcanzó el objetivo
      if (score >= targetScore) {
        endGame()
      }
    }
  }

  function showPointsIndicator(cell, points) {
    const indicator = document.createElement("div")
    indicator.className = `points-indicator ${points > 0 ? "positive" : "negative"}`
    indicator.textContent = points > 0 ? `+${points}` : points

    // Posicionar el indicador
    const rect = cell.getBoundingClientRect()
    const gameArea = document.querySelector(".game-area")
    const gameRect = gameArea.getBoundingClientRect()

    indicator.style.position = "absolute"
    indicator.style.left = `${rect.left - gameRect.left + rect.width / 2}px`
    indicator.style.top = `${rect.top - gameRect.top}px`

    // Agregar al área de juego
    gameArea.appendChild(indicator)

    // Eliminar después de la animación
    setTimeout(() => {
      if (indicator.parentNode === gameArea) {
        gameArea.removeChild(indicator)
      }
    }, 1000)
  }
})

