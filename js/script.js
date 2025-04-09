// Variáveis globais
let bgMusicCurrentTime = 0;
let currentCard = 0;
let touchStartX = 0;
let touchStartY = 0;
let current = 0;
let isMusicSectionActive = false;
const totalCards = document.querySelectorAll('.music-card').length;
const musicCards = document.getElementById('music-cards');
const indicators = document.querySelectorAll('.indicator');
const unlockMessage = document.getElementById('unlock-message');
const swipeInstruction = document.querySelector('.swipe-instruction');

// Textos para a introdução
const texts = [
  "No instante em que nossos olhos se encontraram pela primeira vez...",
  "Eu senti que o universo conspirava para nos unir",
  "Seu sorriso iluminou meu mundo de uma forma que nunca imaginei possível",
  "E desde então, cada dia ao seu lado tem sido uma bênção",
  calcularTempoRelacionamento(), // Texto dinâmico com o tempo juntos
  // Seção de música aparece aqui
  "Essas músicas são a trilha sonora da nossa história",
  "Cada melodia guarda um pedaço do nosso amor",
  "Lembra quando ouvimos 'I Wanna Be Yours' pela primeira vez juntos?",
  "Ou quando 'Monde Nouveau' tocou e você disse que era nossa música?",
  "São nessas pequenas lembranças que nosso amor se fortalece",
  "E mesmo quando as notas terminam, nosso amor continua ecoando",
  "Você é a melodia que embala meus dias e acalenta minhas noites",
  "Prometo ser o refrão que sempre se repete no seu coração",
  "Nosso amor é como uma música perfeita - sem fim, apenas harmonia",
  "Te amo mais que todas as estrelas no céu e todas as notas já cantadas"
];

// Elementos DOM
const textEl = document.getElementById("text");
const introEl = document.getElementById("intro");
const startScreen = document.getElementById("start-screen");
const musicSection = document.getElementById("music-section");
const header = document.querySelector("header");
const main = document.querySelector("main");
const audio = document.getElementById("bg-music");

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  setupVoiceRecognition();
  setupVideoModal();
  setupMusicPlayers();
  setupCarousel();
  
  // Tenta autoplay após interação do usuário
  document.body.addEventListener('click', function initialPlay() {
    setupVideo();
    document.body.removeEventListener('click', initialPlay);
  }, { once: true });

  // Event listeners para mobile
  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchmove', handleTouchMove, { passive: true });
  document.addEventListener('wheel', handleWheel, { passive: false });
  
  // Gera estrelas na tela inicial
  gerarEstrelas(document.getElementById("start-screen"));
  
  // Impede a rolagem em telas específicas
  prevenirRolagem();
});

// Impede a rolagem quando em telas específicas
function prevenirRolagem() {
  // Adiciona classe no-scroll ao body por padrão
  document.body.classList.add('no-scroll');
  
  // Impede o evento wheel para evitar rolagem
  document.addEventListener('wheel', function(e) {
    if (startScreen.style.display !== "none" || 
        introEl.style.display !== "none" || 
        isMusicSectionActive) {
      e.preventDefault();
    }
  }, { passive: false });
  
  // Impede teclas de seta que poderiam causar rolagem
  document.addEventListener('keydown', function(e) {
    if ((startScreen.style.display !== "none" || 
         introEl.style.display !== "none" || 
         isMusicSectionActive) && 
        (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
         e.key === 'PageUp' || e.key === 'PageDown' || 
         e.key === 'Space')) {
      e.preventDefault();
    }
  });
  
  // Impede o comportamento padrão do touch para rolagem vertical
  document.addEventListener('touchmove', function(e) {
    if (startScreen.style.display !== "none" || 
        introEl.style.display !== "none" || 
        isMusicSectionActive) {
      
      // Permite apenas movimento horizontal para o carrossel na seção de música
      if (isMusicSectionActive) {
        const touch = e.touches[0];
        const startX = touchStartX;
        const startY = touchStartY;
        const currentX = touch.clientX;
        const currentY = touch.clientY;
        
        // Se o movimento vertical for maior que o horizontal, previne
        if (Math.abs(currentY - startY) > Math.abs(currentX - startX)) {
          e.preventDefault();
        }
      } else {
        e.preventDefault();
      }
    }
  }, { passive: false });
}

// Função para calcular tempo de relacionamento
function calcularTempoRelacionamento() {
  const dataInicio = new Date(2025, 1, 21); // 21/02/2025
  const dataAtual = new Date();
  
  if (dataAtual < dataInicio) {
    const diffMs = dataInicio - dataAtual;
    const diasFaltantes = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return `Faltam ${diasFaltantes} dias para começarmos nossa jornada juntos 💕`;
  }

  const diffMs = dataAtual - dataInicio;
  const horasTotais = Math.floor(diffMs / (1000 * 60 * 60));
  const diasTotais = Math.floor(horasTotais / 24);
  const semanas = Math.floor(diasTotais / 7);
  const meses = Math.floor(diasTotais / 30);
  const semanasNoMes = semanas % 4;
  const diasRestantes = diasTotais % 7;

 
  if (diasRestantes === 0) {
    return `Estamos juntos a:
        ${meses} ${meses === 1 ? 'mês' : 'meses'} e
        ${semanasNoMes} ${semanasNoMes === 1 ? 'semana' : 'semanas'}
        
        ${horasTotais.toLocaleString()} horas de felicidade juntos 💕`;
}

return `Estamos juntos a:
        ${meses} ${meses === 1 ? 'mês' : 'meses'},
        ${semanasNoMes} ${semanasNoMes === 1 ? 'semana' : 'semanas'} e
        ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}
        
        são ${horasTotais.toLocaleString()} horas compartilhadas ❤️`;

}

// Configuração dos players de música
function setupMusicPlayers() {
  const audioBg = document.getElementById('bg-music');
  let bgMusicWasPlaying = false;
  
  document.querySelectorAll('.music-player').forEach((player, index) => {
    const button = player.querySelector('.play-button');
    const album = player.querySelector('.album-cover');
    const audioId = button.getAttribute('data-audio');
    const audio = document.getElementById(audioId);
    const progressBar = document.getElementById(`progress${index + 1}`);
    const currentTimeDisplay = player.parentElement.querySelector('.current-time');
    const durationDisplay = player.parentElement.querySelector('.duration');
    
    audio.addEventListener('loadedmetadata', () => {
      const duration = audio.duration;
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      durationDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    });
    
    audio.addEventListener('timeupdate', () => {
      const currentTime = audio.currentTime;
      const duration = audio.duration;
      const progressPercent = (currentTime / duration) * 100;
      progressBar.style.width = `${progressPercent}%`;
      
      const minutes = Math.floor(currentTime / 60);
      const seconds = Math.floor(currentTime % 60);
      currentTimeDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    });
    
    audio.addEventListener('ended', () => {
      button.textContent = "▶";
      album.classList.remove('rotating');
      progressBar.style.width = '0%';
      currentTimeDisplay.textContent = '0:00';
      
      if(bgMusicWasPlaying) {
        audioBg.play();
      }
    });
    
    button.addEventListener('click', () => {
      bgMusicWasPlaying = !audioBg.paused;
      
      if(bgMusicWasPlaying) {
        audioBg.pause();
      }

      document.querySelectorAll('audio:not(#bg-music)').forEach(a => {
        if (a !== audio) {
          a.pause();
          a.currentTime = 0;
          const otherButton = a.parentElement.querySelector('.play-button');
          const otherAlbum = a.parentElement.querySelector('.album-cover');
          const otherProgress = a.parentElement.querySelector('.progress-bar');
          const otherCurrentTime = a.parentElement.querySelector('.current-time');
          
          if (otherButton) otherButton.textContent = "▶";
          if (otherAlbum) otherAlbum.classList.remove('rotating');
          if (otherProgress) otherProgress.style.width = '0%';
          if (otherCurrentTime) otherCurrentTime.textContent = '0:00';
        }
      });

      if (audio.paused) {
        audio.play()
          .then(() => {
            button.textContent = "⏸";
            album.classList.add('rotating');
          })
          .catch(error => {
            console.error("Erro ao reproduzir áudio:", error);
          });
      } else {
        audio.pause();
        button.textContent = "▶";
        album.classList.remove('rotating');
        
        if(bgMusicWasPlaying) {
          audioBg.play();
        }
      }
    });
  });
}

// Configuração do carrossel de músicas
function setupCarousel() {
  musicCards.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, {passive: true});
  
  musicCards.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    handleSwipe(touchStartX, touchEndX);
  }, {passive: true});
  
  let mouseDownX = 0;
  let mouseUpX = 0;
  
  musicCards.addEventListener('mousedown', (e) => {
    mouseDownX = e.clientX;
  });
  
  musicCards.addEventListener('mouseup', (e) => {
    mouseUpX = e.clientX;
    if (Math.abs(mouseUpX - mouseDownX) > 50) {
      if (mouseUpX < mouseDownX) {
        nextCard();
      } else {
        prevCard();
      }
    }
  });
  
  indicators.forEach(indicator => {
    indicator.addEventListener('click', () => {
      currentCard = parseInt(indicator.getAttribute('data-index'));
      updateCarousel();
      
      if (currentCard !== totalCards - 1) {
        unlockMessage.classList.remove('show-unlock');
        swipeInstruction.style.display = 'flex';
      }
    });
  });
  
  document.getElementById('music-section').addEventListener('transitionend', function() {
    if (!this.classList.contains('active')) {
      resetCarousel();
    }
  });
}

function handleSwipe(startX, endX) {
  if (endX < startX - 50) {
    nextCard();
  } else if (endX > startX + 50) {
    prevCard();
  }
}

function nextCard() {
  if (currentCard < totalCards - 1) {
    currentCard++;
    updateCarousel();
  } else {
    showUnlockMessage();
  }
}

function prevCard() {
  if (currentCard > 0) {
    currentCard--;
    updateCarousel();
    unlockMessage.classList.remove('show-unlock');
    swipeInstruction.style.display = 'flex';
  }
}

function updateCarousel() {
  musicCards.style.transform = `translateX(-${currentCard * 100}%)`;
  
  indicators.forEach((ind, index) => {
    ind.classList.toggle('active', index === currentCard);
  });

  if (currentCard === totalCards - 1) {
    showUnlockMessage();
  }
}

function showUnlockMessage() {
  unlockMessage.innerHTML = '<p>Deslize para cima para continuar nossa jornada de amor...</p>';
  unlockMessage.classList.add('show-unlock');
  swipeInstruction.style.display = 'none';
  
  setTimeout(() => {
    unlockMessage.style.opacity = '1';
  }, 1000);
}

function resetCarousel() {
  currentCard = 0;
  musicCards.style.transform = 'translateX(0)';
  indicators.forEach((ind, index) => {
    ind.classList.toggle('active', index === 0);
  });
  unlockMessage.classList.remove('show-unlock');
  unlockMessage.style.opacity = '0';
  swipeInstruction.style.display = 'flex';
}

// Configuração do reconhecimento de voz
function setupVoiceRecognition() {
  const VoiceBtn = document.getElementById('voice-btn');
  const VoiceStatus = document.getElementById('voice-status');
  
  const existingContainer = document.getElementById('hearts-container');
  if (existingContainer) {
    existingContainer.remove();
  }

  const HeartsContainer = document.createElement('div');
  HeartsContainer.id = 'hearts-container';
  document.body.appendChild(HeartsContainer);

  if (!('webkitSpeechRecognition' in window)) {
    VoiceBtn.disabled = true;
    VoiceStatus.textContent = 'Recurso não suportado no seu navegador';
    return;
  }

  const Recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  Recognition.lang = 'pt-BR';
  Recognition.interimResults = false;
  Recognition.continuous = false;
  Recognition.maxAlternatives = 1;

  Recognition.onstart = function() {
    VoiceStatus.textContent = 'Fale agora : " Eu te amo! " ';
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this.timeout = setTimeout(() => {
        if (VoiceBtn.classList.contains('listening')) {
          Recognition.stop();
          VoiceStatus.textContent = 'Tempo esgotado, tente novamente!';
          VoiceBtn.classList.remove('listening');
        }
      }, 10000);
    }
  };

  VoiceBtn.addEventListener('click', function() {
    VoiceStatus.textContent = 'Preparando...';
    VoiceBtn.classList.add('listening');
    
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        VoiceStatus.textContent = 'Diga "Eu te amo" agora...';
        Recognition.start();
      })
      .catch(err => {
        VoiceStatus.textContent = 'Permissão do microfone negada!';
        VoiceBtn.classList.remove('listening');
        console.error('Erro de permissão:', err);
      });
  });

  Recognition.onresult = function(event) {
    clearTimeout(this.timeout);
    const speechResult = event.results[0][0].transcript.trim().toLowerCase();
    VoiceBtn.classList.remove('listening');
    
    if (speechResult.includes('eu te amo')) {
      createHearts();
      VoiceStatus.innerHTML = '💖 <strong>Eu te amo mais!</strong> 💖';
      new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3').play();
    } else {
      VoiceStatus.textContent = `Você disse: "${speechResult}"`;
    }
  };

  Recognition.onerror = function(event) {
    clearTimeout(this.timeout);
    VoiceBtn.classList.remove('listening');
    
    if (event.error === 'no-speech' && /Mobile/i.test(navigator.userAgent)) {
      VoiceStatus.textContent = 'Não detectei voz. Toque para tentar novamente!';
    } else {
      VoiceStatus.textContent = `Erro: ${event.error}`;
    }
  };

  Recognition.onend = function() {
    VoiceBtn.classList.remove('listening');
  };

  function createHearts() {
    HeartsContainer.innerHTML = '';
    
    const heartCount = 350; // Altere este valor para a quantidade desejada


    for (let i = 0; i < heartCount ; i++) {
      const heart = document.createElement('div');
      heart.className = 'heart';
      
      const hearts = ['❤️', '💖', '💗', '💓', '💘'];
      heart.innerHTML = hearts[Math.floor(Math.random() * hearts.length)];
      
      const startX = Math.random() * 100;
      const endX = (Math.random() - 0.5) * 40;
      
      heart.style.setProperty('--start-x', `${startX}vw`);
      heart.style.setProperty('--end-x', `${endX}px`);
      heart.style.left = `${startX}vw`;
      
      const size = Math.random() * 20 + 15;
      heart.style.fontSize = `${size}px`;
      
      const duration = Math.random() * 3 + 4;
      heart.style.animationDuration = `${duration}s`;
      heart.style.animationDelay = `${Math.random() * 2}s`;
      
      HeartsContainer.appendChild(heart);
    }
    
    setTimeout(() => {
      HeartsContainer.innerHTML = '';
    }, 10000);
  }
}

// Configuração do vídeo
function setupVideo() {
  const mainVideo = document.getElementById('main-video');
  mainVideo.muted = true;
  mainVideo.playsInline = true;
  
  const playPromise = mainVideo.play();
  
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      const playButton = document.createElement('button');
      playButton.innerHTML = '▶ Toque para iniciar o vídeo';
      playButton.style.position = 'absolute';
      playButton.style.bottom = '20px';
      playButton.style.left = '50%';
      playButton.style.transform = 'translateX(-50%)';
      playButton.style.zIndex = '10';
      playButton.style.padding = '10px 20px';
      playButton.style.backgroundColor = 'rgba(0,0,0,0.7)';
      playButton.style.color = 'white';
      playButton.style.border = 'none';
      playButton.style.borderRadius = '5px';
      
      playButton.addEventListener('click', () => {
        mainVideo.play();
        playButton.remove();
      });
      
      document.querySelector('.banner').appendChild(playButton);
    });
  }
}

// Configuração do modal de vídeo
function setupVideoModal() {
  const btnPlay = document.querySelector('.btn-play');
  const videoModal = document.getElementById('video-modal');
  const modalVideo = document.getElementById('modal-video');
  const closeModal = document.getElementById('close-modal');
  const bgMusic = document.getElementById('bg-music');

  btnPlay.addEventListener('click', () => {
    videoModal.classList.remove('hidden');
    modalVideo.play();
    bgMusic.pause();
  });

  closeModal.addEventListener('click', () => {
    modalVideo.pause();
    videoModal.classList.add('hidden');
    bgMusic.play();
  });

  videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) {
      modalVideo.pause();
      videoModal.classList.add('hidden');
      bgMusic.play();
    }
  });

  modalVideo.addEventListener('play', () => {
    bgMusic.pause();
  });

  modalVideo.addEventListener('pause', () => {
    if (!videoModal.classList.contains('hidden')) {
      bgMusic.play();
    }
  });
}

// Funções da introdução
function iniciar() {
  startScreen.style.display = "none";
  introEl.style.display = "flex";
  audio.play();
  gerarEstrelas(introEl);
  showNextText();
}

function showNextText() {
  // Verifica se já mostrou todos os textos
  if (current >= texts.length) {
    introEl.style.display = "none";
    musicSection.classList.remove("active");
    
    header.style.display = "flex";
    main.style.display = "block";
    
    setTimeout(() => {
      header.classList.add("show");
      main.classList.add("show");
      setupVideo();
      
      // Permite rolagem na seção final
      document.body.classList.remove('no-scroll');
    }, 100);
    return;
  }

  // Mostra o texto atual
  textEl.textContent = texts[current];
  textEl.classList.add("visible");

  // Se for o texto 3 (índice 3), mostra a seção de música
  if (current === 3) {
    setTimeout(() => {
      textEl.classList.remove("visible");
      introEl.style.display = "none";
      musicSection.classList.add("active");
      gerarEstrelas(musicSection); // Gera estrelas na seção de música
      isMusicSectionActive = true;
    }, 3500);
    return;
  }

  // Transição normal entre textos
  setTimeout(() => {
    textEl.classList.remove("visible");
    current++;
    setTimeout(showNextText, 1000);
  }, 3500);
}

function continueAfterMusic() {
  if (!isMusicSectionActive || currentCard !== totalCards - 1) return;
  
  bgMusicCurrentTime = audio.currentTime;
  
  // Pausa todos os players de música
  document.querySelectorAll('audio:not(#bg-music)').forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
    const button = audio.parentElement.querySelector('.play-button');
    const album = audio.parentElement.querySelector('.album-cover');
    const progress = audio.parentElement.querySelector('.progress-bar');
    
    if (button) button.textContent = "▶";
    if (album) album.classList.remove('rotating');
    if (progress) progress.style.width = '0%';
  });
  
  musicSection.classList.add('fade-out');
  setTimeout(() => {
    musicSection.classList.remove("active", "fade-out");
    isMusicSectionActive = false;
    introEl.style.display = "flex";
    current = 4; // Continua no 5º texto (índice 4)
    audio.currentTime = bgMusicCurrentTime;
    audio.play();
    
    // Mostra o texto imediatamente
    textEl.textContent = texts[current];
    textEl.classList.add("visible");
    
    // Configura o timeout para o próximo texto
    setTimeout(() => {
      textEl.classList.remove("visible");
      current++;
      setTimeout(showNextText, 1000);
    }, 3500);
  }, 1000);
}

// Função para gerar estrelas
function gerarEstrelas(container) {
  // Se não especificar um container, usa a tela inicial
  container = container || document.getElementById("start-screen");
  
  const numStars = 350;
  
  // Limpa estrelas existentes no container
  const existingStars = container.querySelectorAll('.star');
  existingStars.forEach(star => star.remove());
  
  // Cria novas estrelas
  for (let i = 0; i < numStars; i++) {
    const star = document.createElement("div");
    star.classList.add("star");
    
    // Tamanho aleatório
    let size = Math.random() * 3 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    
    // Posição aleatória
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    
    // Animação aleatória
    star.style.animationDuration = `${Math.random() * 3 + 2}s`;
    
    // Adiciona ao container
    container.appendChild(star);
  }
}

// Funções de controle de scroll
function handleTouchStart(e) {
  touchStartY = e.touches[0].clientY;
  touchStartX = e.touches[0].clientX;
}

function handleTouchMove(e) {
  if (!isMusicSectionActive) return;
  
  const touchY = e.touches[0].clientY;
  const diff = touchStartY - touchY;
  
  // Rola para baixo apenas se o usuário já viu todas as músicas
  if (diff > 50 && currentCard === totalCards - 1) {
    continueAfterMusic();
  }
}

function handleWheel(e) {
  if (!isMusicSectionActive) return;
  
  // Rola para baixo apenas se o usuário já viu todas as músicas
  if (e.deltaY > 0 && currentCard === totalCards - 1) {
    e.preventDefault();
    continueAfterMusic();
  }
}