document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM
  const canvas = document.getElementById("game-canvas")
  const ctx = canvas.getContext("2d")
  const startButton = document.getElementById("start-adventure")
  const resetButton = document.getElementById("reset-adventure")
  const timeElement = document.getElementById("adventure-time")
  const partsElement = document.getElementById("parts-collected")
  const eraElement = document.getElementById("current-era")
  const messageElement = document.getElementById("adventure-message")
  const inventoryElement = document.getElementById("inventory")
  const inventorySlots = document.querySelectorAll(".inventory-slot")

  // Variables del juego
  let gameRunning = false
  let gameTime = 120 // 2 minutos
  let gameInterval
  let animationFrameId
  let lastTimestamp = 0
  let inventoryOpen = false
  const activeSlot = -1

  // Épocas disponibles
  const eras = ["Prehistoria", "Antiguo Egipto", "Edad Media", "Revolución Industrial", "Presente", "Futuro"]
  let currentEra = 4 // Comienza en el presente

  // Objetos del juego
  const objects = [
    {
      id: 0,
      name: "Engranaje Temporal",
      era: 3,
      x: 600,
      y: 300,
      width: 30,
      height: 30,
      collected: false,
      sprite: null,
    },
    {
      id: 1,
      name: "Cristal de Energía",
      era: 5,
      x: 200,
      y: 150,
      width: 30,
      height: 30,
      collected: false,
      sprite: null,
    },
    { id: 2, name: "Circuito Cuántico", era: 2, x: 400, y: 400, width: 30, height: 30, collected: false, sprite: null },
    {
      id: 3,
      name: "Núcleo de Estabilización",
      era: 0,
      x: 150,
      y: 350,
      width: 30,
      height: 30,
      collected: false,
      sprite: null,
    },
    { id: 4, name: "Llave Dimensional", era: 1, x: 700, y: 200, width: 30, height: 30, collected: false, sprite: null },
  ]

  // Portales para viajar entre épocas
  const portals = [
    { fromEra: 4, toEra: 0, x: 100, y: 100, width: 50, height: 80 },
    { fromEra: 4, toEra: 1, x: 700, y: 100, width: 50, height: 80 },
    { fromEra: 4, toEra: 2, x: 100, y: 350, width: 50, height: 80 },
    { fromEra: 4, toEra: 3, x: 700, y: 350, width: 50, height: 80 },
    { fromEra: 4, toEra: 5, x: 400, y: 100, width: 50, height: 80 },
    { fromEra: 0, toEra: 4, x: 400, y: 400, width: 50, height: 80 },
    { fromEra: 1, toEra: 4, x: 400, y: 400, width: 50, height: 80 },
    { fromEra: 2, toEra: 4, x: 400, y: 400, width: 50, height: 80 },
    { fromEra: 3, toEra: 4, x: 400, y: 400, width: 50, height: 80 },
    { fromEra: 5, toEra: 4, x: 400, y: 400, width: 50, height: 80 },
  ]

  // Personaje jugable
  const player = {
    x: 400,
    y: 240,
    width: 40,
    height: 60,
    speed: 5,
    moving: false,
    direction: "down", // down, up, left, right
    sprite: null,
    inventory: Array(5).fill(null),
  }

  // Máquina del tiempo (objetivo final)
  const timeMachine = {
    x: 400,
    y: 240,
    width: 100,
    height: 100,
    repaired: false,
    sprite: null,
  }

  // Cargar imágenes
  function loadImages() {
    // Crear sprites simples para el juego
    createPlayerSprite()
    createObjectSprites()
    createTimeMachineSprite()
  }

  // Crear sprite del jugador
  function createPlayerSprite() {
    player.sprite = {
      draw: (x, y) => {
        // Cabeza
        ctx.fillStyle = "#FFD700"
        ctx.beginPath()
        ctx.arc(x + player.width / 2, y + 15, 15, 0, Math.PI * 2)
        ctx.fill()

        // Cuerpo
        ctx.fillStyle = "#4169E1"
        ctx.fillRect(x + 10, y + 30, player.width - 20, player.height - 30)

        // Brazos
        ctx.fillStyle = "#4169E1"
        ctx.fillRect(x, y + 30, 10, 20)
        ctx.fillRect(x + player.width - 10, y + 30, 10, 20)

        // Piernas
        ctx.fillStyle = "#000"
        ctx.fillRect(x + 10, y + player.height - 20, 10, 20)
        ctx.fillRect(x + player.width - 20, y + player.height - 20, 10, 20)
      },
    }
  }

  // Crear sprites de objetos
  function createObjectSprites() {
    objects.forEach((obj) => {
      obj.sprite = {
        draw: (x, y) => {
          // Dibujar objeto según su ID
          switch (obj.id) {
            case 0: // Engranaje
              ctx.fillStyle = "#888"
              ctx.beginPath()
              ctx.arc(x + obj.width / 2, y + obj.height / 2, obj.width / 2, 0, Math.PI * 2)
              ctx.fill()
              ctx.fillStyle = "#555"
              ctx.beginPath()
              ctx.arc(x + obj.width / 2, y + obj.height / 2, obj.width / 4, 0, Math.PI * 2)
              ctx.fill()
              break
            case 1: // Cristal
              ctx.fillStyle = "#00FFFF"
              ctx.beginPath()
              ctx.moveTo(x + obj.width / 2, y)
              ctx.lineTo(x + obj.width, y + obj.height / 2)
              ctx.lineTo(x + obj.width / 2, y + obj.height)
              ctx.lineTo(x, y + obj.height / 2)
              ctx.closePath()
              ctx.fill()
              break
            case 2: // Circuito
              ctx.fillStyle = "#00FF00"
              ctx.fillRect(x, y, obj.width, obj.height)
              ctx.strokeStyle = "#008800"
              ctx.lineWidth = 2
              ctx.beginPath()
              ctx.moveTo(x + 5, y + 5)
              ctx.lineTo(x + obj.width - 5, y + 5)
              ctx.lineTo(x + obj.width - 5, y + obj.height - 5)
              ctx.lineTo(x + 5, y + obj.height - 5)
              ctx.stroke()
              break
            case 3: // Núcleo
              ctx.fillStyle = "#FF0000"
              ctx.beginPath()
              ctx.arc(x + obj.width / 2, y + obj.height / 2, obj.width / 2, 0, Math.PI * 2)
              ctx.fill()
              ctx.fillStyle = "#FFFF00"
              ctx.beginPath()
              ctx.arc(x + obj.width / 2, y + obj.height / 2, obj.width / 4, 0, Math.PI * 2)
              ctx.fill()
              break
            case 4: // Llave
              ctx.fillStyle = "#FFD700"
              ctx.fillRect(x + 5, y, obj.width - 10, obj.height / 3)
              ctx.fillRect(x + obj.width / 2 - 5, y + obj.height / 3, 10, (obj.height * 2) / 3)
              ctx.fillRect(x + obj.width / 2 - 10, y + obj.height - 10, 20, 5)
              break
          }
        },
      }
    })
  }

  // Crear sprite de la máquina del tiempo
  function createTimeMachineSprite() {
    timeMachine.sprite = {
      draw: (x, y, repaired) => {
        // Base de la máquina
        ctx.fillStyle = repaired ? "#4169E1" : "#555"
        ctx.fillRect(x, y + 30, timeMachine.width, timeMachine.height - 30)

        // Cúpula
        ctx.fillStyle = repaired ? "#00FFFF" : "#888"
        ctx.beginPath()
        ctx.arc(x + timeMachine.width / 2, y + 30, timeMachine.width / 2, Math.PI, 0, false)
        ctx.fill()

        // Panel de control
        ctx.fillStyle = "#333"
        ctx.fillRect(x + 20, y + 50, timeMachine.width - 40, 30)

        // Luces
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = repaired ? ["#FF0000", "#00FF00", "#0000FF"][i] : "#555"
          ctx.beginPath()
          ctx.arc(x + 30 + i * 20, y + 65, 5, 0, Math.PI * 2)
          ctx.fill()
        }

        // Puerta
        ctx.fillStyle = "#222"
        ctx.fillRect(x + timeMachine.width / 2 - 15, y + 70, 30, 50)
      },
    }
  }

  // Dibujar el fondo según la época actual
  function drawBackground() {
    // Color de fondo según la época
    const bgColors = [
      "#8B4513", // Prehistoria (marrón)
      "#DAA520", // Antiguo Egipto (dorado)
      "#2F4F4F", // Edad Media (gris verdoso)
      "#696969", // Revolución Industrial (gris)
      "#1E3F66", // Presente (azul oscuro)
      "#000033", // Futuro (azul muy oscuro)
    ]

    ctx.fillStyle = bgColors[currentEra]
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Elementos decorativos según la época
    switch (currentEra) {
      case 0: // Prehistoria
        // Montañas
        ctx.fillStyle = "#654321"
        ctx.beginPath()
        ctx.moveTo(0, 200)
        ctx.lineTo(200, 100)
        ctx.lineTo(400, 180)
        ctx.lineTo(600, 80)
        ctx.lineTo(800, 150)
        ctx.lineTo(800, 480)
        ctx.lineTo(0, 480)
        ctx.closePath()
        ctx.fill()
        break

      case 1: // Antiguo Egipto
        // Pirámides
        ctx.fillStyle = "#C19A6B"
        ctx.beginPath()
        ctx.moveTo(200, 350)
        ctx.lineTo(300, 200)
        ctx.lineTo(400, 350)
        ctx.closePath()
        ctx.fill()

        ctx.beginPath()
        ctx.moveTo(500, 380)
        ctx.lineTo(650, 180)
        ctx.lineTo(800, 380)
        ctx.closePath()
        ctx.fill()
        break

      case 2: // Edad Media
        // Castillo
        ctx.fillStyle = "#808080"
        ctx.fillRect(500, 150, 200, 200)

        // Torres
        ctx.fillRect(480, 130, 40, 220)
        ctx.fillRect(680, 130, 40, 220)
        break

      case 3: // Revolución Industrial
        // Fábricas
        ctx.fillStyle = "#A52A2A"
        ctx.fillRect(100, 200, 150, 150)
        ctx.fillRect(500, 180, 200, 170)

        // Chimeneas
        ctx.fillRect(150, 150, 30, 50)
        ctx.fillRect(200, 170, 30, 30)
        ctx.fillRect(550, 130, 40, 50)
        ctx.fillRect(650, 150, 40, 30)
        break

      case 4: // Presente
        // Edificios
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = `rgb(${100 + i * 20}, ${100 + i * 20}, ${100 + i * 20})`
          ctx.fillRect(50 + i * 150, 150, 100, 200 + i * 30)
        }
        break

      case 5: // Futuro
        // Ciudad futurista
        ctx.fillStyle = "#1E90FF"

        // Edificios de cristal
        for (let i = 0; i < 6; i++) {
          ctx.fillStyle = `rgba(30, 144, 255, ${0.5 + i * 0.1})`
          ctx.fillRect(50 + i * 120, 150, 80, 250 - i * 20)
        }
        break
    }

    // Dibujar portales
    portals.forEach((portal) => {
      if (portal.fromEra === currentEra) {
        // Portal
        const gradient = ctx.createLinearGradient(portal.x, portal.y, portal.x, portal.y + portal.height)
        gradient.addColorStop(0, "#9400D3")
        gradient.addColorStop(0.5, "#4B0082")
        gradient.addColorStop(1, "#9400D3")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.ellipse(
          portal.x + portal.width / 2,
          portal.y + portal.height / 2,
          portal.width / 2,
          portal.height / 2,
          0,
          0,
          Math.PI * 2,
        )
        ctx.fill()

        // Efecto de brillo
        ctx.strokeStyle = "#FFFFFF"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.ellipse(
          portal.x + portal.width / 2,
          portal.y + portal.height / 2,
          portal.width / 2 - 5,
          portal.height / 2 - 5,
          0,
          0,
          Math.PI * 2,
        )
        ctx.stroke()
      }
    })
  }

  // Dibujar objetos en la época actual
  function drawObjects() {
    objects.forEach((obj) => {
      if (obj.era === currentEra && !obj.collected) {
        obj.sprite.draw(obj.x, obj.y)
      }
    })

    // Dibujar máquina del tiempo en el presente
    if (currentEra === 4) {
      timeMachine.sprite.draw(timeMachine.x, timeMachine.y, timeMachine.repaired)
    }
  }

  // Dibujar al jugador
  function drawPlayer() {
    player.sprite.draw(player.x, player.y)
  }

  // Actualizar inventario en la interfaz
  function updateInventoryUI() {
    inventorySlots.forEach((slot, index) => {
      slot.innerHTML = ""
      if (player.inventory[index] !== null) {
        const obj = objects[player.inventory[index]]
        const img = document.createElement("div")
        img.style.width = "80%"
        img.style.height = "80%"
        img.style.backgroundColor = ["#888", "#00FFFF", "#00FF00", "#FF0000", "#FFD700"][obj.id]
        img.style.borderRadius = obj.id === 0 || obj.id === 3 ? "50%" : "0"
        img.title = obj.name
        slot.appendChild(img)
      }
    })
  }

  // Comprobar colisiones con objetos
  function checkObjectCollisions() {
    objects.forEach((obj) => {
      if (obj.era === currentEra && !obj.collected) {
        if (
          player.x < obj.x + obj.width &&
          player.x + player.width > obj.x &&
          player.y < obj.y + obj.height &&
          player.y + player.height > obj.y
        ) {
          // Colisión con objeto
          obj.collected = true

          // Añadir al inventario
          const emptySlot = player.inventory.indexOf(null)
          if (emptySlot !== -1) {
            player.inventory[emptySlot] = obj.id
            updateInventoryUI()

            // Actualizar contador de piezas
            const collectedCount = player.inventory.filter((item) => item !== null).length
            partsElement.textContent = `${collectedCount}/5`
          }
        }
      }
    })
  }

  // Comprobar colisiones con portales
  function checkPortalCollisions() {
    portals.forEach((portal) => {
      if (portal.fromEra === currentEra) {
        if (
          player.x < portal.x + portal.width &&
          player.x + player.width > portal.x &&
          player.y < portal.y + portal.height &&
          player.y + player.height > portal.y
        ) {
          // Viajar a otra época
          currentEra = portal.toEra
          eraElement.textContent = eras[currentEra]

          // Posicionar al jugador cerca del portal de regreso
          const returnPortal = portals.find((p) => p.fromEra === currentEra && p.toEra === portal.fromEra)
          if (returnPortal) {
            player.x = returnPortal.x + returnPortal.width + 20
            player.y = returnPortal.y
          }
        }
      }
    })
  }

  // Comprobar interacción con la máquina del tiempo
  function checkTimeMachineInteraction() {
    if (
      currentEra === 4 && // Solo en el presente
      player.x < timeMachine.x + timeMachine.width &&
      player.x + player.width > timeMachine.x &&
      player.y < timeMachine.y + timeMachine.height &&
      player.y + player.height > timeMachine.y
    ) {
      // Verificar si tiene todas las piezas
      const collectedCount = player.inventory.filter((item) => item !== null).length

      if (collectedCount === 5 && !timeMachine.repaired) {
        timeMachine.repaired = true

        // Victoria
        setTimeout(() => {
          endGame(true)
        }, 1000)
      }
    }
  }

  // Actualizar el juego
  function update(timestamp) {
    if (!gameRunning) return

    // Calcular delta time para movimiento suave
    const deltaTime = timestamp - lastTimestamp
    lastTimestamp = timestamp

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Dibujar elementos
    drawBackground()
    drawObjects()
    drawPlayer()

    // Comprobar colisiones e interacciones
    if (!inventoryOpen) {
      checkObjectCollisions()
      checkPortalCollisions()
      checkTimeMachineInteraction()
    }

    // Solicitar siguiente frame
    animationFrameId = requestAnimationFrame(update)
  }

  // Iniciar juego
  function startGame() {
    if (gameRunning) return

    // Inicializar variables
    gameRunning = true
    gameTime = 120
    currentEra = 4 // Comenzar en el presente
    timeMachine.repaired = false

    // Reiniciar objetos
    objects.forEach((obj) => {
      obj.collected = false
    })

    // Reiniciar inventario
    player.inventory = Array(5).fill(null)
    updateInventoryUI()

    // Posicionar al jugador
    player.x = 400
    player.y = 240

    // Actualizar UI
    timeElement.textContent = gameTime
    partsElement.textContent = "0/5"
    eraElement.textContent = eras[currentEra]
    messageElement.textContent = ""
    messageElement.classList.remove("visible", "success", "failure")

    // Cargar imágenes
    loadImages()

    // Iniciar temporizador
    gameInterval = setInterval(() => {
      gameTime--
      timeElement.textContent = gameTime

      if (gameTime <= 0) {
        endGame(false)
      }
    }, 1000)

    // Iniciar loop de animación
    lastTimestamp = performance.now()
    animationFrameId = requestAnimationFrame(update)

    // Actualizar botones
    startButton.disabled = true
    resetButton.disabled = false
  }

  // Finalizar juego
  function endGame(success) {
    gameRunning = false

    // Detener temporizador y animación
    clearInterval(gameInterval)
    cancelAnimationFrame(animationFrameId)

    // Mostrar mensaje
    if (success) {
      messageElement.textContent =
        "¡Victoria! Has reparado la máquina del tiempo y salvado el continuo espacio-temporal."
      messageElement.classList.add("visible", "success")
    } else {
      messageElement.textContent = "¡Tiempo agotado! No has podido reparar la máquina del tiempo a tiempo."
      messageElement.classList.add("visible", "failure")
    }

    // Actualizar botones
    resetButton.disabled = false
  }

  // Reiniciar juego
  function resetGame() {
    endGame(false)
    messageElement.classList.remove("visible")
    startButton.disabled = false
  }

  // Eventos de teclado
  document.addEventListener("keydown", (e) => {
    if (!gameRunning) return

    // Si el inventario está abierto
    if (inventoryOpen) {
      if (e.code === "KeyE") {
        inventoryOpen = false
        inventoryElement.classList.remove("visible")
      }
      return
    }

    // Movimiento
    switch (e.code) {
      case "ArrowUp":
      case "KeyW":
        player.y = Math.max(0, player.y - player.speed)
        player.direction = "up"
        break
      case "ArrowDown":
      case "KeyS":
        player.y = Math.min(canvas.height - player.height, player.y + player.speed)
        player.direction = "down"
        break
      case "ArrowLeft":
      case "KeyA":
        player.x = Math.max(0, player.x - player.speed)
        player.direction = "left"
        break
      case "ArrowRight":
      case "KeyD":
        player.x = Math.min(canvas.width - player.width, player.x + player.speed)
        player.direction = "right"
        break
      case "KeyE":
        // Abrir/cerrar inventario
        inventoryOpen = true
        inventoryElement.classList.add("visible")
        break
    }
  })

  // Eventos de botones
  startButton.addEventListener("click", startGame)
  resetButton.addEventListener("click", resetGame)

  // Inicializar
  resetButton.disabled = true
  startButton.disabled = false

  // Mostrar una vista previa del juego incluso antes de iniciar
  loadImages()
  drawBackground()
  drawObjects()
  drawPlayer()
})

