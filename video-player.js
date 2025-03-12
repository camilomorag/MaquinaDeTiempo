document.addEventListener("DOMContentLoaded", () => {
    // Elementos del reproductor de video
    const videoSimulation = document.getElementById("video-simulation")
    const playPauseBtn = document.querySelector(".play-pause")
    const playIconSmall = document.querySelector(".play-icon-small")
    const progressBar = document.querySelector(".progress-bar")
    const progressFilled = document.querySelector(".progress-filled")
    const timeDisplay = document.querySelector(".time-display")
    const fullscreenBtn = document.querySelector(".fullscreen")
  
    // Estado del reproductor
    let isPlaying = false
    let progress = 0
    let progressInterval
    let animationSequence
    let currentSequence = 0
    const sequences = [
      { time: 0, class: "video-sequence-1" },
      { time: 2, class: "video-sequence-2" },
      { time: 4, class: "video-sequence-3" },
      { time: 6, class: "video-sequence-4" },
      { time: 8, class: "video-sequence-5" },
      { time: 10, class: "video-sequence-6" },
      { time: 12, class: "video-sequence-7" },
    ]
  
    // Crear partículas para la animación
    function createParticles() {
      const particlesContainer = document.querySelector(".time-particles")
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement("div")
        particle.className = "particle"
        particle.style.left = `${Math.random() * 100}%`
        particle.style.top = `${Math.random() * 100}%`
        particle.style.width = `${Math.random() * 4 + 2}px`
        particle.style.height = particle.style.width
        particle.style.opacity = Math.random() * 0.7 + 0.3
  
        // Animación CSS personalizada
        const duration = Math.random() * 10 + 5
        const delay = Math.random() * 5
        particle.style.animation = `float ${duration}s ${delay}s infinite alternate ease-in-out`
  
        particlesContainer.appendChild(particle)
      }
    }
  
    // Inicializar partículas
    createParticles()
  
    // Función para simular reproducción
    function togglePlay() {
      if (isPlaying) {
        // Pausar
        isPlaying = false
        clearInterval(progressInterval)
        clearInterval(animationSequence)
  
        // Cambiar icono a play
        playIconSmall.style.borderWidth = "8px 0 8px 12px"
        playIconSmall.style.borderColor = "transparent transparent transparent white"
  
        // Pausar animación
        videoSimulation.classList.remove("video-playing")
        for (const seq of sequences) {
          videoSimulation.classList.remove(seq.class)
        }
      } else {
        // Reproducir
        isPlaying = true
  
        // Iniciar animación
        videoSimulation.classList.add("video-playing")
        currentSequence = 0
  
        // Aplicar primera secuencia
        videoSimulation.classList.add(sequences[0].class)
  
        // Controlar secuencias de animación
        animationSequence = setInterval(() => {
          const currentTime = (progress / 100) * 15 // 15 segundos de duración
  
          // Verificar si debemos cambiar de secuencia
          if (currentSequence < sequences.length - 1 && currentTime >= sequences[currentSequence + 1].time) {
            videoSimulation.classList.remove(sequences[currentSequence].class)
            currentSequence++
            videoSimulation.classList.add(sequences[currentSequence].class)
          }
        }, 100)
  
        // Simular progreso
        progressInterval = setInterval(() => {
          progress += 0.5
          if (progress > 100) {
            progress = 0
            clearInterval(progressInterval)
            clearInterval(animationSequence)
            isPlaying = false
            videoSimulation.classList.remove("video-playing")
            for (const seq of sequences) {
              videoSimulation.classList.remove(seq.class)
            }
            playIconSmall.style.borderWidth = "8px 0 8px 12px"
            playIconSmall.style.borderColor = "transparent transparent transparent white"
          }
  
          // Actualizar barra de progreso
          progressFilled.style.width = `${progress}%`
  
          // Actualizar tiempo
          const currentSeconds = Math.floor((progress / 100) * 15) // 15 segundos
          const minutes = Math.floor(currentSeconds / 60)
          const seconds = currentSeconds % 60
          timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, "0")} / 0:15`
        }, 100)
  
        // Cambiar icono a pausa
        playIconSmall.style.borderWidth = "0 4px 0 4px"
        playIconSmall.style.borderColor = "white"
        playIconSmall.style.width = "12px"
        playIconSmall.style.height = "16px"
      }
    }
  
    // Eventos
    videoSimulation.addEventListener("click", togglePlay)
    playPauseBtn.addEventListener("click", togglePlay)
  
    progressBar.addEventListener("click", (e) => {
      const rect = progressBar.getBoundingClientRect()
      const pos = (e.clientX - rect.left) / rect.width
      progress = pos * 100
      progressFilled.style.width = `${progress}%`
  
      // Actualizar tiempo
      const currentSeconds = Math.floor((progress / 100) * 15)
      const minutes = Math.floor(currentSeconds / 60)
      const seconds = currentSeconds % 60
      timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, "0")} / 0:15`
  
      // Actualizar secuencia de animación
      if (isPlaying) {
        // Eliminar todas las clases de secuencia
        for (const seq of sequences) {
          videoSimulation.classList.remove(seq.class)
        }
  
        // Encontrar la secuencia actual basada en el tiempo
        currentSequence = 0
        for (let i = sequences.length - 1; i >= 0; i--) {
          if (currentSeconds >= sequences[i].time) {
            currentSequence = i
            videoSimulation.classList.add(sequences[i].class)
            break
          }
        }
      }
    })
  
    fullscreenBtn.addEventListener("click", () => {
      if (videoSimulation.requestFullscreen) {
        videoSimulation.requestFullscreen()
      } else if (videoSimulation.webkitRequestFullscreen) {
        videoSimulation.webkitRequestFullscreen()
      } else if (videoSimulation.msRequestFullscreen) {
        videoSimulation.msRequestFullscreen()
      }
    })
  
    // Eventos para los controles de volumen
    const volumeBtn = document.querySelector(".volume")
    const volumeSlider = document.querySelector(".volume-slider")
    const volumeFilled = document.querySelector(".volume-filled")
  
    volumeBtn.addEventListener("click", () => {
      if (volumeFilled.style.width === "0px") {
        volumeFilled.style.width = "70%"
      } else {
        volumeFilled.style.width = "0px"
      }
    })
  
    volumeSlider.addEventListener("click", (e) => {
      const rect = volumeSlider.getBoundingClientRect()
      const pos = (e.clientX - rect.left) / rect.width
      volumeFilled.style.width = `${pos * 100}%`
    })
  })
  
  