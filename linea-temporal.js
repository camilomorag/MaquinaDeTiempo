document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM
  const events = document.querySelectorAll(".event")
  const dropZones = document.querySelectorAll(".drop-zone")
  const message = document.getElementById("timeline-message")
  const resetButton = document.getElementById("reset-timeline")

  let correctCount = 0
  const totalEvents = events.length

  // Inicializar el juego
  initGame()

  function initGame() {
    // Reiniciar contador
    correctCount = 0

    // Reiniciar eventos
    events.forEach((event) => {
      event.style.display = "block"
      event.style.opacity = "1"
    })

    // Reiniciar zonas de destino
    dropZones.forEach((zone) => {
      zone.style.backgroundColor = "rgba(0, 0, 255, 0.2)"
      zone.textContent = zone.dataset.year
      zone.classList.remove("anomaly")
    })

    // Ocultar mensaje
    if (message) {
      message.textContent = ""
      message.classList.remove("visible", "success")
    }

    // Mezclar eventos aleatoriamente
    shuffleEvents()
  }

  // Eventos de arrastre
  events.forEach((event) => {
    event.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text", event.dataset.year)
      event.style.opacity = "0.5"
    })

    event.addEventListener("dragend", () => {
      event.style.opacity = "1"
    })
  })

  // Eventos de destino
  dropZones.forEach((zone) => {
    zone.addEventListener("dragover", (e) => {
      e.preventDefault()
      zone.style.backgroundColor = "rgba(0, 255, 255, 0.5)"
    })

    zone.addEventListener("dragleave", () => {
      zone.style.backgroundColor = "rgba(0, 0, 255, 0.2)"
    })

    zone.addEventListener("drop", (e) => {
      e.preventDefault()
      const droppedYear = e.dataTransfer.getData("text")

      if (droppedYear === zone.dataset.year) {
        // Correcto
        const eventElement = document.querySelector(`.event[data-year='${droppedYear}']`)
        eventElement.style.display = "none"
        zone.style.backgroundColor = "rgba(0, 255, 0, 0.5)"

        // Extraer el texto del evento (sin el emoji)
        const eventText = eventElement.textContent.split(" ").slice(1).join(" ")
        zone.innerHTML = `${zone.dataset.year}<br>${eventText}`

        correctCount++

        // Verificar si se completó el juego
        if (correctCount === totalEvents) {
          if (message) {
            message.textContent = "¡Línea Temporal Restaurada! La estabilidad temporal ha sido restablecida."
            message.classList.add("visible", "success")
          }

          // Efecto de éxito
          dropZones.forEach((z) => {
            z.style.boxShadow = "0 0 20px rgba(0, 255, 0, 0.7)"
          })
        }
      } else {
        // Incorrecto
        zone.classList.add("anomaly")
        setTimeout(() => {
          zone.classList.remove("anomaly")
          zone.style.backgroundColor = "rgba(0, 0, 255, 0.2)"
        }, 600)
      }
    })
  })

  function shuffleEvents() {
    const eventsContainer = document.querySelector(".events")
    if (!eventsContainer) return

    const eventArray = Array.from(eventsContainer.children)

    // Mezclar el array
    for (let i = eventArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[eventArray[i], eventArray[j]] = [eventArray[j], eventArray[i]]
    }

    // Limpiar y volver a añadir los elementos
    eventsContainer.innerHTML = ""
    eventArray.forEach((event) => eventsContainer.appendChild(event))
  }

  // Botón de reinicio
  if (resetButton) {
    resetButton.addEventListener("click", initGame)
  }
})

