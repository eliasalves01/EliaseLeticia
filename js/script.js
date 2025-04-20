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
let introFinished = false; // Flag para controlar se a introdução já foi finalizada
let textTransitionInProgress = false; // Flag para controlar a transição entre textos

// Playlist para música de fundo com metadados
const bgMusicPlaylist = [
  {
    src: "assets/musica.mp3", 
    title: "Monde Nouveau",
    artist: "Oscar Anton",
    cover: "assets/CapadeMusica1.jpg"
  },
  {
    src: "assets/musica01.mp3", 
    title: "Monde Nouveau",
    artist: "Oscar Anton",
    cover: "assets/CapadeMusica1.jpg"
  },
  {
    src: "assets/musica2.mp3", 
    title: "I Wanna Be Yours",
    artist: "Arctic Monkeys",
    cover: "assets/CapadeMusica2.jpeg"
  },
  {
    src: "assets/musica3.mp3", 
    title: "Compass",
    artist: "The Neighbourhood",
    cover: "assets/CapadeMusica3.jpeg"
  }
];
let currentBgMusicIndex = 0;

// Variáveis para o modal de mídia
let currentMediaIndex = 0;
const galleryMedia = [
  { src: "assets/foto1.jpg", caption: "Nosso primeiro encontro", type: "image" },
  { src: "assets/foto2.jpeg", caption: "Nosso passeio especial", type: "image" },
  { src: "assets/video2.mp4", caption: "Nosso vídeo especial", type: "video" },
  { src: "assets/foto3.jpeg", caption: "Mais um momento especial", type: "image" }
];

// Variáveis para o carrossel da galeria
let galleryIndex = 0;

// Textos para a introdução
const texts = [
  "No instante em que nossos olhos se encontraram pela primeira vez...",  // 0
  "Eu senti que o universo conspirava para nos unir", // 1
  "Seu sorriso iluminou meu mundo de uma forma que nunca imaginei possível", // 2
  "E desde então, cada dia ao seu lado tem sido uma bênção", // 3
  calcularTempoRelacionamento(), // Texto dinâmico com o tempo juntos 4
  "Essas músicas são a trilha sonora da nossa história", // 5
  "Cada melodia guarda um pedaço do nosso amor", // 6
  "Lembra quando ouvimos 'I Wanna Be Yours' pela primeira vez juntos?", // 7
  "Ou quando 'Monde Nouveau' tocou e você disse que era nossa música?", // 8
  "São nessas pequenas lembranças que nosso amor se fortalece", // 9
  "E mesmo quando as notas terminam, nosso amor continua ecoando", // 10
  "Você é a melodia que embala meus dias e acalenta minhas noites", // 11 
  "Prometo ser o refrão que sempre se repete no seu coração", // 12
  "Nosso amor é como uma música perfeita - sem fim, apenas harmonia", // 13
  "Te amo mais que todas as estrelas no céu e todas as notas já cantadas" // 14
];

// Definir tempos de exibição personalizados para cada texto (em milissegundos)
const textDurations = [
  4500,  // Texto 0: "No instante em que nossos olhos se encontraram..."
  4500,  // Texto 1: "Eu senti que o universo conspirava para nos unir"
  5000,  // Texto 2: "Seu sorriso iluminou meu mundo..."
  5000,  // Texto 3: "E desde então, cada dia ao seu lado tem sido uma bênção"
  6000,  // Texto 4: calcularTempoRelacionamento() - Precisa de mais tempo pois é dinâmico
  5000,  // Texto 5: "Essas músicas são a trilha sonora da nossa história"
  5000,  // Texto 6: "Cada melodia guarda um pedaço do nosso amor"
  15000,  // Texto 7: "Lembra quando ouvimos 'I Wanna Be Yours'..."
  10000,  // Texto 8: "Ou quando 'Monde Nouveau' tocou..."
  5500,  // Texto 9: "São nessas pequenas lembranças que nosso amor se fortalece"
  5500,  // Texto 10: "E mesmo quando as notas terminam, nosso amor continua ecoando"
  5500,  // Texto 11: "Você é a melodia que embala meus dias e acalenta minhas noites"
  5500,  // Texto 12: "Prometo ser o refrão que sempre se repete no seu coração"
  6000,  // Texto 13: "Nosso amor é como uma música perfeita - sem fim, apenas harmonia"
  7000   // Texto 14: "Te amo mais que todas as estrelas no céu e todas as notas já cantadas"
];

// Elementos DOM
let textEl;
let introEl;
let startScreen;
let musicSection;
let header;
let main;
let audio;

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar as referências DOM
  textEl = document.getElementById("text");
  introEl = document.getElementById("intro");
  startScreen = document.getElementById("start-screen");
  musicSection = document.getElementById("music-section");
  header = document.querySelector("header");
  main = document.querySelector("main");
  audio = document.getElementById("bg-music");
  
  setupVoiceRecognition();
  setupVideoModal();
  setupMusicPlayers();
  setupCarousel();
  setupMediaModal();
  setupGalleryCarousel();
  setupVideoPreview();
  setupBgMusicPlaylist(); // Configurar a playlist de música de fundo
  
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

  // Contador para o carrossel
  let currentIndex = 0;
  const testimonials = document.querySelectorAll('.testimonial');
  const totalTestimonials = testimonials.length;

  // Inicializar o carrossel
  updateTestimonialDisplay();

  // Botões do carrossel
  document.querySelector('.prev-btn').addEventListener('click', function() {
    currentIndex = (currentIndex - 1 + totalTestimonials) % totalTestimonials;
    updateTestimonialDisplay();
  });

  document.querySelector('.next-btn').addEventListener('click', function() {
    currentIndex = (currentIndex + 1) % totalTestimonials;
    updateTestimonialDisplay();
  });

  // Galeria de mídia
  const galleryItems = document.querySelectorAll('.gallery-item, .video-item');
  const modal = document.getElementById('media-modal');
  const modalContent = document.querySelector('.modal-content');
  const mediaContainer = document.querySelector('.modal-media-container');
  const modalCaption = document.querySelector('.modal-caption');
  const closeBtn = document.querySelector('.modal-close');
  const prevBtn = document.querySelector('.modal-nav-prev');
  const nextBtn = document.querySelector('.modal-nav-next');
  
  let galleryIndex = 0;
  const galleryMedia = [];
  
  // Coletar informações de mídia da galeria
  galleryItems.forEach((item, index) => {
    const isVideo = item.classList.contains('video-item');
    const src = isVideo ? item.getAttribute('data-video') : item.querySelector('img').src;
    const alt = item.querySelector('img').alt;
    
    galleryMedia.push({
      isVideo: isVideo,
      src: src,
      alt: alt
    });
    
    // Adicionar evento de clique
    item.addEventListener('click', function() {
      galleryIndex = index;
      openModal(galleryIndex);
    });
  });
  
  // Funções para abrir/fechar modal
  function openModal(index) {
    const media = galleryMedia[index];
    
    // Limpar conteúdo anterior
    mediaContainer.innerHTML = '';
    
    // Criar o elemento correto baseado no tipo de mídia
    if (media.isVideo) {
      const video = document.createElement('video');
      video.src = media.src;
      video.controls = true;
      video.autoplay = true;
      mediaContainer.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = media.src;
      img.alt = media.alt;
      mediaContainer.appendChild(img);
    }
    
    // Atualizar legenda
    modalCaption.textContent = media.alt;
    
    // Mostrar modal
    modal.style.display = 'block';
  }
  
  function closeModal() {
    // Parar vídeo se estiver sendo reproduzido
    const video = mediaContainer.querySelector('video');
    if (video) {
      video.pause();
    }
    
    modal.style.display = 'none';
  }
  
  // Eventos para navegação na galeria
  closeBtn.addEventListener('click', closeModal);
  
  prevBtn.addEventListener('click', function() {
    galleryIndex = (galleryIndex - 1 + galleryMedia.length) % galleryMedia.length;
    openModal(galleryIndex);
  });
  
  nextBtn.addEventListener('click', function() {
    galleryIndex = (galleryIndex + 1) % galleryMedia.length;
    openModal(galleryIndex);
  });
  
  // Fechar modal ao clicar fora do conteúdo
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Navegar com as teclas
  document.addEventListener('keydown', function(e) {
    if (modal.style.display === 'block') {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'ArrowLeft') {
        galleryIndex = (galleryIndex - 1 + galleryMedia.length) % galleryMedia.length;
        openModal(galleryIndex);
      } else if (e.key === 'ArrowRight') {
        galleryIndex = (galleryIndex + 1) % galleryMedia.length;
        openModal(galleryIndex);
      }
    }
  });
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
  
  // Garantir que estamos usando a música correta da playlist
  if (audio) {
    audio.src = bgMusicPlaylist[currentBgMusicIndex].src;
    audio.play();
  }
  
  gerarEstrelas(introEl);
  showNextText();
}

// Função para gerenciar a exibição e a transição de textos
function showNextText() {
  // Verificar se os elementos estão disponíveis
  if (!textEl || !introEl) {
    console.error("Elementos de texto não encontrados, tentando novamente em 500ms");
    setTimeout(showNextText, 500);
    return;
  }

  // Prevenir chamadas sobrepostas durante transições
  if (textTransitionInProgress) {
    console.log("Transição de texto em andamento, ignorando chamada sobreposta");
    return;
  }

  // Verifica se já mostrou todos os textos
  if (current >= texts.length) {
    console.log(`Todos os textos foram exibidos (${current}/${texts.length}), finalizando introdução`);
    fadeOutIntro();
    return;
  }

  // Marcar que uma transição está em andamento
  textTransitionInProgress = true;

  console.log(`Preparando texto ${current+1}/${texts.length} (índice: ${current})`);
  
  // Transição de música com base no índice atual
  if (current === 7) {
    // Mudar para a música "I Wanna Be Yours" (índice 2 da playlist)
    console.log("Transitando para música 'I Wanna Be Yours' (índice 7)");
    try {
      fadeToSong(2); // Arctic Monkeys - I Wanna Be Yours
    } catch (error) {
      console.error("Erro ao mudar para a música 2:", error);
      // Fallback: tentar alterar a música diretamente
      if (audio) {
        currentBgMusicIndex = 2;
        audio.src = bgMusicPlaylist[2].src;
        audio.play().catch(e => console.error("Erro no fallback de música:", e));
      }
    }
  } else if (current === 8) {
    // Mudar para a música "Monde Nouveau" (índice 0 da playlist)
    console.log("Transitando para música 'Monde Nouveau' (índice 8)");
    try {
      fadeToSong(1); // Oscar Anton - Monde Nouveau
    } catch (error) {
      console.error("Erro ao mudar para a música 0:", error);
      // Fallback: tentar alterar a música diretamente
      if (audio) {
        currentBgMusicIndex = 0;
        audio.src = bgMusicPlaylist[0].src;
        audio.play().catch(e => console.error("Erro no fallback de música:", e));
      }
    }
  } else if (current === 9) {
    // Voltar para a música padrão (índice 0 da playlist)
    console.log("Voltando para música padrão (índice 9)");
    try {
      fadeToSong(1); // Oscar Anton - Monde Nouveau
    } catch (error) {
      console.error("Erro ao voltar para a música padrão:", error);
      // Fallback: tentar alterar a música diretamente
      if (audio) {
        currentBgMusicIndex = 0;
        audio.src = bgMusicPlaylist[0].src;
        audio.play().catch(e => console.error("Erro no fallback de música:", e));
      }
    }
  }
  
  // Reset do texto para garantir animação limpa
  textEl.classList.remove("visible");
  
  // Garantir que o elemento intro esteja visível e com display flex
  introEl.style.display = "flex";
  introEl.style.alignItems = "center";
  introEl.style.justifyContent = "center";
  
  // Adiciona um pequeno atraso antes de mostrar o texto para garantir que a animação ocorra corretamente
  setTimeout(() => {
    try {
      // Obtém o texto atual
      let currentText = texts[current];
      
      if (!currentText) {
        console.error(`Texto ${current} não encontrado!`);
        // Não avançamos o contador aqui, apenas finalizamos
        textTransitionInProgress = false;
        fadeOutIntro();
        return;
      }
      
      // Debug: verificar qual texto está sendo exibido
      console.log(`Exibindo texto ${current+1}/${texts.length}: ${currentText.substring(0, 30)}...`);
      
      // Verifica se está em um dispositivo móvel
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // Prepara o elemento de texto com altura adequada para evitar saltos
      prepareTextElement(currentText);
      
      // Mostra o texto atual com animação de fade-in
      textEl.textContent = currentText;
      textEl.classList.add("visible");
      
      // Se for o texto específico para exibir a seção de música (índice 3)
      if (current === 3) {
        console.log("Preparando transição para seção de música");
        // Programa a transição para a seção de música após o tempo de leitura
        setTimeout(() => {
          // Fade-out do texto atual
          textEl.classList.remove("visible");
          
          // Aguarda o fade-out terminar e então mostra a seção de música
          setTimeout(() => {
            introEl.style.display = "none";
            musicSection.classList.add("active");
            gerarEstrelas(musicSection);
            isMusicSectionActive = true;
            
            // Redefine altura mínima para evitar espaços em branco
            textEl.style.minHeight = "auto";
            
            // Liberar a flag de transição
            textTransitionInProgress = false;
          }, 500);
        }, isMobile ? 4000 : 3500); // Tempo extra para leitura em dispositivos móveis
        return;
      }
      
      // Transição normal entre textos - usando uma abordagem de promessa para evitar chamadas paralelas
      let timeoutDuration = isMobile ? 
        (textDurations[current] * 1.2) : // Mais tempo em dispositivos móveis (20% a mais)
        textDurations[current] || 6000;  // Fallback para 6 segundos se não estiver definido
      
      // Exibir o texto atual por um tempo antes de avançar para o próximo
      setTimeout(() => {
        // Fade-out do texto atual
        textEl.classList.remove("visible");
        
        // Avança APENAS para o próximo texto, sem pular
        current++;
        
        console.log(`Avançando para o próximo texto: ${current}/${texts.length}`);
        
        // Verificação extra para garantir que não excedemos o limite
        if (current >= texts.length) {
          console.log("Último texto exibido, finalizando introdução");
          textTransitionInProgress = false;
          fadeOutIntro();
          return;
        }
        
        // Espera o fade-out terminar antes de mostrar o próximo texto
        // Usando um timeout mais longo para garantir que o DOM seja atualizado completamente
        setTimeout(() => {
          // Liberar a flag de transição antes de chamar o próximo texto
          textTransitionInProgress = false;
          
          // Chamar diretamente a próxima exibição como uma função separada
          showNextTextWithDelay();
        }, 1000);
      }, timeoutDuration);
      
    } catch (error) {
      console.error("Erro ao exibir texto:", error);
      // Em caso de erro, liberar a flag de transição
      textTransitionInProgress = false;
      // Tenta recuperar sem avançar muito
      setTimeout(() => {
        fadeOutIntro();
      }, 5000);
    }
  }, 400); // Aumento do tempo de espera entre textos para garantir a transição
}

// Função auxiliar para mostrar o próximo texto com um pequeno atraso
function showNextTextWithDelay() {
  // Pequeno atraso adicional para garantir que a animação anterior terminou
  setTimeout(() => {
    console.log(`Chamando showNextText para o texto ${current+1}...`);
    showNextText();
  }, 200);
}

// Função auxiliar para preparar o elemento de texto com altura adequada
function prepareTextElement(text) {
  // Cria um elemento temporário para medir a altura necessária
  const tempSpan = document.createElement('span');
  tempSpan.style.visibility = 'hidden';
  tempSpan.style.position = 'absolute';
  tempSpan.style.whiteSpace = 'pre-line';
  tempSpan.style.fontSize = window.getComputedStyle(textEl).fontSize;
  tempSpan.style.fontFamily = window.getComputedStyle(textEl).fontFamily;
  tempSpan.style.width = `${textEl.clientWidth || introEl.clientWidth * 0.8}px`; // Fallback para largura
  tempSpan.style.padding = window.getComputedStyle(textEl).padding;
  tempSpan.textContent = text;
  document.body.appendChild(tempSpan);
  
  // Define altura mínima com base no conteúdo + margem de segurança
  const neededHeight = tempSpan.offsetHeight + 20;
  textEl.style.minHeight = `${neededHeight}px`;
  
  // Remove o elemento temporário
  document.body.removeChild(tempSpan);
}

// Função para finalizar a introdução e mostrar a seção principal
function fadeOutIntro() {
  // Evitar execução duplicada
  if (introFinished) {
    console.log("Introdução já foi finalizada, ignorando chamada");
    return;
  }
  
  console.log("Executando fadeOutIntro() - finalizando introdução");
  introFinished = true;
  
  // Garantir que o elemento texto tenha um fade-out suave
  if (textEl) {
    textEl.classList.remove("visible");
  }
  
  // Adicionar um pequeno delay antes de ocultar os elementos
  setTimeout(() => {
    if (introEl) introEl.style.display = "none";
    if (musicSection) musicSection.classList.remove("active");
    
    if (header) header.style.display = "flex";
    if (main) main.style.display = "block";
    
    setTimeout(() => {
      if (header) header.classList.add("show");
      if (main) main.classList.add("show");
      setupVideo();
      
      // Garantir que o amostrador de música esteja visível na tela principal
      showFloatingMusicPlayer();
      
      // Permite rolagem na seção final
      document.body.classList.remove('no-scroll');
      
      console.log("Transição para a seção principal concluída");
    }, 100);
  }, 500);
}

function continueAfterMusic() {
  if (!isMusicSectionActive || currentCard !== totalCards - 1) return;
  
  console.log("Continuando após a seção de música...");
  
  // Evitar múltiplas chamadas
  if (document.querySelector('.music-section.fade-out')) {
    console.log("Transição já em andamento, ignorando");
    return;
  }
  
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
  
  // Garantir que todas as variáveis necessárias estão disponíveis
  if (!textEl || !introEl || !audio) {
    console.error("Elementos necessários não encontrados para continuar após música");
    // Tentar recurar os elementos se não estiverem disponíveis
    textEl = document.getElementById("text");
    introEl = document.getElementById("intro");
    audio = document.getElementById("bg-music");
    
    if (!textEl || !introEl || !audio) {
      console.error("Não foi possível recuperar elementos, tentando finalizar introdução");
      setTimeout(fadeOutIntro, 1000);
      return;
    }
  }
  
  // Limpeza de eventos existentes para evitar duplicação
  musicSection.removeEventListener('transitionend', musicTransitionEndHandler);
  
  // Função para processar a transição após a animação de fade-out completa
  function musicTransitionEndHandler(e) {
    // Só prosseguir se o evento for do musicSection e a propriedade opacity
    if (e.target !== musicSection || e.propertyName !== 'opacity') return;
    
    console.log("Transição de saída da seção de música concluída");
    musicSection.removeEventListener('transitionend', musicTransitionEndHandler);
    continueWithTexts();
  }
  
  // Adicionar o listener para o evento de fim da transição
  musicSection.addEventListener('transitionend', musicTransitionEndHandler);
  
  // Timeout de segurança caso o evento transitionend não dispare
  setTimeout(continueWithTexts, 1200);
  
  // Função para continuar a exibição dos textos após a seção de música
  function continueWithTexts() {
    // Evitar execução duplicada
    if (!musicSection.classList.contains('active')) {
      console.log("Já removemos a seção de música, ignorando");
      return;
    }
    
    musicSection.classList.remove("active", "fade-out");
    isMusicSectionActive = false;
    
    // Preparar a intro para mostrar texto
    introEl.style.display = "flex";
    textEl.classList.remove("visible");
    textEl.style.minHeight = "auto";
    
    // Reiniciar música
    if (audio) {
      audio.currentTime = bgMusicCurrentTime || 0;
      audio.play().catch(err => console.log("Erro ao iniciar música:", err));
    }
    
    // Definir o próximo texto para exibir - INÍCIO DO 5º TEXTO (ÍNDICE 4)
    current = 4; 
    console.log(`Voltando à sequência de textos a partir do índice ${current}, próximo texto: ${texts[current].substring(0, 30)}...`);
    
    // Permitir que a interface seja redesenhada antes de animar o texto
    setTimeout(() => {
      // Chamar de forma segura a exibição do próximo texto
      showNextTextInSequence();
    }, 700);
  }
}

// Função para garantir que o próximo texto seja exibido na sequência correta
function showNextTextInSequence() {
  console.log(`Preparando para mostrar texto ${current+1}/${texts.length} após seção de música`);
  
  // Inicializar variáveis novamente, se necessário
  if (!textEl) textEl = document.getElementById("text");
  if (!introEl) introEl = document.getElementById("intro");
  
  // Garantir que a interface esteja pronta
  requestAnimationFrame(() => {
    // Chamar showNextText diretamente
    showNextText();
  });
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

// Funções para o modal de mídia (imagens e vídeos)
function setupMediaModal() {
  const mediaModal = document.getElementById('media-modal');
  const closeButton = document.getElementById('close-media-modal');
  const mediaContainer = document.getElementById('media-container');
  
  if (!mediaModal || !closeButton || !mediaContainer) {
    console.error('Elementos do modal de mídia não encontrados');
    return;
  }
  
  const modalContainer = mediaModal.querySelector('.relative');
  
  // Adicionar botões de navegação se ainda não existirem
  if (!document.querySelector('.media-nav.prev')) {
    const prevButton = document.createElement('button');
    prevButton.className = 'media-nav prev absolute left-0 top-1/2 transform -translate-y-1/2 text-white text-4xl bg-black bg-opacity-30 p-3 rounded-r-lg';
    prevButton.innerHTML = '❮';
    prevButton.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateMedia('prev');
    });
    modalContainer.appendChild(prevButton);
  }
  
  if (!document.querySelector('.media-nav.next')) {
    const nextButton = document.createElement('button');
    nextButton.className = 'media-nav next absolute right-0 top-1/2 transform -translate-y-1/2 text-white text-4xl bg-black bg-opacity-30 p-3 rounded-l-lg';
    nextButton.innerHTML = '❯';
    nextButton.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateMedia('next');
    });
    modalContainer.appendChild(nextButton);
  }
  
  // Fechar quando clicar no botão de fechar
  closeButton.addEventListener('click', () => {
    pauseCurrentMedia();
    mediaModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  });
  
  // Fechar quando clicar fora da imagem
  mediaModal.addEventListener('click', (e) => {
    if (e.target === mediaModal) {
      pauseCurrentMedia();
      mediaModal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  });
  
  // Navegação com teclado
  document.addEventListener('keydown', (e) => {
    if (!mediaModal.classList.contains('hidden')) {
      if (e.key === 'Escape') {
        pauseCurrentMedia();
        mediaModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
      } else if (e.key === 'ArrowLeft') {
        navigateMedia('prev');
      } else if (e.key === 'ArrowRight') {
        navigateMedia('next');
      }
    }
  });
}

function pauseCurrentMedia() {
  const videoElement = document.querySelector('#media-container video');
  if (videoElement) {
    videoElement.pause();
  }
  
  // Retomar música de fundo se estiver pausada
  const bgMusic = document.getElementById('bg-music');
  if (bgMusic && bgMusic.paused) {
    bgMusic.play().catch(e => console.log('Não foi possível retomar a música de fundo:', e));
  }
}

function openMediaModal(mediaSrc, caption, type) {
  const mediaModal = document.getElementById('media-modal');
  const mediaContainer = document.getElementById('media-container');
  const mediaCaption = document.getElementById('media-caption');
  const bgMusic = document.getElementById('bg-music');
  
  if (!mediaModal || !mediaContainer || !mediaCaption) {
    console.error('Elementos do modal de mídia não encontrados');
    return;
  }
  
  // Pausar música de fundo se estiver tocando e o tipo for vídeo
  if (type === 'video' && bgMusic && !bgMusic.paused) {
    bgMusic.pause();
  }
  
  // Encontrar o índice da mídia clicada
  currentMediaIndex = galleryMedia.findIndex(media => 
    media.src === mediaSrc && media.type === type
  );
  
  if (currentMediaIndex === -1) {
    console.warn('Mídia não encontrada no array galleryMedia:', mediaSrc);
    currentMediaIndex = 0;
  }
  
  // Limpar o container
  mediaContainer.innerHTML = '';
  
  // Criar o elemento apropriado baseado no tipo
  if (type === 'image') {
    const imgElement = document.createElement('img');
    imgElement.src = mediaSrc;
    imgElement.alt = caption;
    imgElement.className = 'max-w-full max-h-[80vh] mx-auto rounded-lg';
    mediaContainer.appendChild(imgElement);
  } else if (type === 'video') {
    const videoElement = document.createElement('video');
    videoElement.src = mediaSrc;
    videoElement.controls = true;
    videoElement.autoplay = true;
    videoElement.className = 'max-w-full max-h-[80vh] mx-auto rounded-lg';
    mediaContainer.appendChild(videoElement);
  }
  
  // Atualizar legenda
  mediaCaption.textContent = caption;
  
  // Exibir o modal - removendo a classe hidden
  mediaModal.classList.remove('hidden');
  
  // Verificar se o display é none e corrigi-lo
  if (window.getComputedStyle(mediaModal).display === 'none') {
    mediaModal.style.display = 'flex';
  }
  
  document.body.style.overflow = 'hidden'; // Impedir rolagem
}

function navigateMedia(direction) {
  // Pausar qualquer mídia atual
  pauseCurrentMedia();
  
  if (direction === 'prev') {
    currentMediaIndex = (currentMediaIndex - 1 + galleryMedia.length) % galleryMedia.length;
  } else {
    currentMediaIndex = (currentMediaIndex + 1) % galleryMedia.length;
  }
  
  const mediaItem = galleryMedia[currentMediaIndex];
  const mediaContainer = document.getElementById('media-container');
  const mediaCaption = document.getElementById('media-caption');
  const bgMusic = document.getElementById('bg-music');
  
  // Pausar música de fundo se estiver tocando e o tipo for vídeo
  if (mediaItem.type === 'video' && bgMusic && !bgMusic.paused) {
    bgMusic.pause();
  }
  
  // Aplicar efeito de transição
  mediaContainer.style.opacity = '0';
  mediaCaption.style.opacity = '0';
  
  setTimeout(() => {
    // Limpar o container
    mediaContainer.innerHTML = '';
    
    // Criar o elemento apropriado baseado no tipo
    if (mediaItem.type === 'image') {
      const imgElement = document.createElement('img');
      imgElement.src = mediaItem.src;
      imgElement.alt = mediaItem.caption;
      imgElement.className = 'max-w-full max-h-[80vh] mx-auto rounded-lg';
      mediaContainer.appendChild(imgElement);
    } else if (mediaItem.type === 'video') {
      const videoElement = document.createElement('video');
      videoElement.src = mediaItem.src;
      videoElement.controls = true;
      videoElement.autoplay = true;
      videoElement.className = 'max-w-full max-h-[80vh] mx-auto rounded-lg';
      mediaContainer.appendChild(videoElement);
    }
    
    // Atualizar legenda
    mediaCaption.textContent = mediaItem.caption;
    
    // Restaurar opacidade
    mediaContainer.style.opacity = '1';
    mediaCaption.style.opacity = '1';
  }, 300);
}

// Função para atualizar o display do carrossel
function updateTestimonialDisplay() {
  const testimonials = document.querySelectorAll('.testimonial');
  testimonials.forEach((testimonial, index) => {
    testimonial.style.display = index === currentIndex ? 'block' : 'none';
  });
}

// Função para configurar o carrossel da galeria em mobile
function setupGalleryCarousel() {
  const gallery = document.querySelector('.gallery');
  const paginationDots = document.querySelectorAll('.gallery-pagination-dot');
  
  if (!gallery || !paginationDots.length) return;
  
  // Verificar se é mobile para mostrar ou esconder elementos
  const isMobile = window.innerWidth <= 768;
  const paginationContainer = document.querySelector('.gallery-pagination');
  const swipeIndicator = document.querySelector('.gallery-swipe-indicator');
  
  if (paginationContainer) {
    paginationContainer.style.display = isMobile ? 'flex' : 'none';
  }
  
  if (swipeIndicator) {
    swipeIndicator.style.display = isMobile ? 'flex' : 'none';
  }
  
  // Atualizar visibilidade em resize
  window.addEventListener('resize', function() {
    const isMobileNow = window.innerWidth <= 768;
    if (paginationContainer) {
      paginationContainer.style.display = isMobileNow ? 'flex' : 'none';
    }
    if (swipeIndicator) {
      swipeIndicator.style.display = isMobileNow ? 'flex' : 'none';
    }
  });
  
  // Detectar scroll da galeria para atualizar paginação
  if (isMobile) {
    gallery.addEventListener('scroll', function() {
      debounce(updateGalleryPagination, 100)();
    });
    
    // Inicializar paginação
    updateGalleryPagination();
    
    // Adicionar evento de click em cada dot
    paginationDots.forEach((dot, index) => {
      dot.addEventListener('click', function() {
        scrollToGalleryItem(index);
      });
    });
  }
}

// Função para atualizar a paginação da galeria com base no scroll
function updateGalleryPagination() {
  const gallery = document.querySelector('.gallery');
  const items = document.querySelectorAll('.gallery .gallery-item, .gallery .video-item');
  const dots = document.querySelectorAll('.gallery-pagination-dot');
  
  if (!gallery || !items.length || !dots.length) return;
  
  // Calcular qual item está visível
  const scrollPosition = gallery.scrollLeft;
  const galleryWidth = gallery.offsetWidth;
  const itemWidth = items[0].offsetWidth;
  const activeIndex = Math.round(scrollPosition / itemWidth);
  
  // Atualizar paginação
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === activeIndex);
  });
  
  // Esconder indicador de swipe após o primeiro scroll
  if (scrollPosition > 10) {
    const swipeIndicator = document.querySelector('.gallery-swipe-indicator');
    if (swipeIndicator) {
      swipeIndicator.style.opacity = '0';
    }
  }
}

// Função para rolar para um item específico da galeria
function scrollToGalleryItem(index) {
  const gallery = document.querySelector('.gallery');
  const items = document.querySelectorAll('.gallery .gallery-item, .gallery .video-item');
  
  if (!gallery || !items.length || index >= items.length) return;
  
  const item = items[index];
  const itemLeft = item.offsetLeft;
  gallery.scrollTo({
    left: itemLeft - (gallery.offsetWidth - item.offsetWidth) / 2,
    behavior: 'smooth'
  });
}

// Função de debounce para limitar a frequência de chamadas
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

// Configuração dos previews de vídeo na galeria
function setupVideoPreview() {
  const videoItems = document.querySelectorAll('.video-item');
  
  videoItems.forEach(item => {
    const previewVideo = item.querySelector('.video-preview');
    
    if (!previewVideo) return;
    
    // Definir os pontos de início e fim do loop do vídeo (em segundos)
    const startTime = 2; // Começar em 2 segundos
    const endTime = 8; // Terminar em 8 segundos
    
    // Carregar o vídeo
    previewVideo.load();
    
    // Iniciar o preview automaticamente quando estiver pronto
    previewVideo.addEventListener('loadeddata', () => {
      // Definir o tempo inicial
      previewVideo.currentTime = startTime;
      
      // Iniciar a reprodução
      previewVideo.play().catch(error => console.error('Erro ao reproduzir vídeo:', error));
      
      // Verificar periodicamente se o vídeo saiu do intervalo definido
      const checkTimeInterval = setInterval(() => {
        if (previewVideo.currentTime >= endTime || previewVideo.currentTime < startTime) {
          previewVideo.currentTime = startTime;
        }
      }, 500); // Verificar a cada meio segundo
      
      // Armazenar o intervalo no elemento para limpeza posterior
      item.setAttribute('data-check-interval', checkTimeInterval);
    });
    
    // Pausar o preview quando o modal for aberto
    item.addEventListener('click', () => {
      previewVideo.pause();
      
      // Limpar o intervalo de verificação
      const checkTimeInterval = parseInt(item.getAttribute('data-check-interval'), 10);
      if (checkTimeInterval) {
        clearInterval(checkTimeInterval);
      }
    });
    
    // Obter a duração real do vídeo para o indicador de duração
    previewVideo.addEventListener('loadedmetadata', () => {
      const duration = previewVideo.duration;
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      
      const durationElement = item.querySelector('.video-duration');
      if (durationElement) {
        durationElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      }
    });
    
    // Reiniciar o preview quando o modal for fechado
    document.getElementById('close-media-modal').addEventListener('click', () => {
      previewVideo.currentTime = startTime;
      previewVideo.play().catch(error => console.error('Erro ao reiniciar preview:', error));
      
      // Configurar novo intervalo
      const checkTimeInterval = setInterval(() => {
        if (previewVideo.currentTime >= endTime || previewVideo.currentTime < startTime) {
          previewVideo.currentTime = startTime;
        }
      }, 500);
      
      item.setAttribute('data-check-interval', checkTimeInterval);
    });
  });
}

// Função para configurar a reprodução automática da playlist
function setupBgMusicPlaylist() {
  if (!audio) {
    audio = document.getElementById("bg-music");
  }
  
  if (!audio) {
    console.error("Elemento de áudio de fundo não encontrado");
    return;
  }
  
  // Inicializar o amostrador de música flutuante
  setupFloatingMusicPlayer();
  
  // Definir a música inicial
  audio.src = bgMusicPlaylist[currentBgMusicIndex].src;
  
  // Adicionar evento para atualizar o progresso da música
  audio.addEventListener('timeupdate', function() {
    updateMusicProgress();
  });
  
  // Adicionar evento para quando a música terminar
  audio.addEventListener('ended', function() {
    // Avançar para a próxima música na playlist
    currentBgMusicIndex = (currentBgMusicIndex + 1) % bgMusicPlaylist.length;
    
    // Definir a próxima música como fonte
    audio.src = bgMusicPlaylist[currentBgMusicIndex].src;
    
    // Iniciar a reprodução da próxima música
    audio.play().catch(error => {
      console.error("Erro ao reproduzir próxima música:", error);
    });
    
    // Atualizar o amostrador flutuante
    updateFloatingMusicPlayer();
    
    console.log(`Tocando próxima música: ${bgMusicPlaylist[currentBgMusicIndex].title}`);
  });
  
  // Lidar com erros de reprodução
  audio.addEventListener('error', function(e) {
    console.error("Erro ao carregar música:", e);
    
    // Tentar a próxima música em caso de erro
    currentBgMusicIndex = (currentBgMusicIndex + 1) % bgMusicPlaylist.length;
    audio.src = bgMusicPlaylist[currentBgMusicIndex].src;
    audio.play().catch(error => {
      console.error("Erro ao reproduzir música após falha:", error);
    });
  });
}

function updateDaysCounter() {
  const daysCounter = document.getElementById('days-counter');
  if (daysCounter) {
    // Extrair apenas o número de dias
    const dataInicio = new Date(2025, 1, 21); // 21/02/2025
    const dataAtual = new Date();
    
    if (dataAtual < dataInicio) {
      daysCounter.textContent = '0';
    } else {
      const diffMs = dataAtual - dataInicio;
      const diasTotais = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      daysCounter.textContent = diasTotais;
    }
  }
}

// Configuração e gerenciamento do amostrador de música flutuante
function setupFloatingMusicPlayer() {
  const floatingPlayer = document.getElementById('music-floating-player');
  const playPauseBtn = document.getElementById('play-pause');
  const prevBtn = document.getElementById('prev-track');
  const nextBtn = document.getElementById('next-track');
  
  if (!floatingPlayer) {
    console.error("Elemento do amostrador de música não encontrado");
    return;
  }
  
  // Inicializar com as informações da música atual
  updateFloatingMusicPlayer();
  
  // Mostrar o amostrador 3 segundos após o início da reprodução
  setTimeout(() => {
    showFloatingMusicPlayer();
  }, 3000);
  
  // Adicionar eventos para esconder/mostrar o amostrador ao passar o mouse
  floatingPlayer.addEventListener('mouseenter', () => {
    floatingPlayer.classList.add('animate');
  });
  
  floatingPlayer.addEventListener('mouseleave', () => {
    floatingPlayer.classList.remove('animate');
  });
  
  // Adicionar funcionalidade aos botões de controle
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleBgMusic();
    });
  }
  
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playPreviousTrack();
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playNextTrack();
    });
  }
}

// Reproduzir faixa anterior
function playPreviousTrack() {
  currentBgMusicIndex = (currentBgMusicIndex === 0) ? 
    bgMusicPlaylist.length - 1 : currentBgMusicIndex - 1;
  
  loadAndPlayTrack(currentBgMusicIndex);
}

// Reproduzir próxima faixa
function playNextTrack() {
  currentBgMusicIndex = (currentBgMusicIndex + 1) % bgMusicPlaylist.length;
  loadAndPlayTrack(currentBgMusicIndex);
}

// Carregar e reproduzir uma faixa específica
function loadAndPlayTrack(index) {
  if (!audio) return;
  
  const currentMusic = bgMusicPlaylist[index];
  audio.src = currentMusic.src;
  audio.load();
  
  // Atualizar o player flutuante
  updateFloatingMusicPlayer();
  
  // Iniciar a reprodução
  audio.play().then(() => {
    const albumArt = document.getElementById('current-album-art');
    if (albumArt) {
      albumArt.classList.add('rotating');
    }
    
    updatePlayPauseButton(false);
  }).catch(error => {
    console.error("Erro ao reproduzir áudio:", error);
  });
}

// Alternar entre reproduzir e pausar a música
function toggleBgMusic() {
  if (!audio) return;
  
  if (audio.paused) {
    audio.play().then(() => {
      const albumArt = document.getElementById('current-album-art');
      if (albumArt) {
        albumArt.classList.add('rotating');
      }
      
      updatePlayPauseButton(false);
    }).catch(error => {
      console.error("Erro ao reproduzir áudio:", error);
    });
  } else {
    audio.pause();
    const albumArt = document.getElementById('current-album-art');
    if (albumArt) {
      albumArt.classList.remove('rotating');
    }
    
    updatePlayPauseButton(true);
  }
}

// Atualizar o botão de play/pause
function updatePlayPauseButton(isPaused) {
  const playPauseBtn = document.getElementById('play-pause');
  if (playPauseBtn) {
    playPauseBtn.textContent = isPaused ? '▶' : '⏸';
  }
}

// Função para atualizar as informações do amostrador de música
function updateFloatingMusicPlayer() {
  const currentMusic = bgMusicPlaylist[currentBgMusicIndex];
  const albumArtElement = document.getElementById('current-album-art');
  
  if (albumArtElement) {
    // Atualizar com animação de fade
    albumArtElement.style.opacity = '0';
    
    setTimeout(() => {
      albumArtElement.src = currentMusic.cover;
      
      // Atualizar a classe rotating na capa do álbum
      if (audio && !audio.paused) {
        albumArtElement.classList.add('rotating');
      } else {
        albumArtElement.classList.remove('rotating');
      }
      
      albumArtElement.style.opacity = '1';
      
      // Animar para chamar atenção para a troca de música
      const floatingPlayer = document.getElementById('music-floating-player');
      if (floatingPlayer) {
        floatingPlayer.classList.add('animate');
        setTimeout(() => {
          floatingPlayer.classList.remove('animate');
        }, 4000);
      }
      
      // Atualizar o botão play/pause
      updatePlayPauseButton(audio.paused);
    }, 300);
  }
}

// Atualizar a barra de progresso do amostrador e o contador de tempo
function updateMusicProgress() {
  const progressBar = document.getElementById('mini-player-progress-bar');
  const timeDisplay = document.getElementById('current-time');
  
  if (progressBar && audio) {
    const percent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = `${percent}%`;
    
    // Atualizar o contador de tempo
    if (timeDisplay) {
      const currentTime = formatTime(audio.currentTime);
      timeDisplay.textContent = currentTime;
    }
  }
}

// Formatar tempo em MM:SS
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Mostrar o amostrador de música
function showFloatingMusicPlayer() {
  const floatingPlayer = document.getElementById('music-floating-player');
  if (floatingPlayer) {
    floatingPlayer.classList.add('show');
  }
}

// Esconder o amostrador de música
function hideFloatingMusicPlayer() {
  const floatingPlayer = document.getElementById('music-floating-player');
  if (floatingPlayer) {
    floatingPlayer.classList.remove('show');
  }
}

// Função auxiliar para inicializar o elemento de áudio, garantindo que ele esteja pronto
function ensureAudioIsReady() {
  if (!audio) {
    audio = document.getElementById("bg-music");
  }
  
  if (!audio) {
    console.error("Elemento de áudio não encontrado");
    return false;
  }
  
  // Garantir que o elemento tenha fonte e esteja carregado
  if (!audio.src || audio.src === '') {
    audio.src = bgMusicPlaylist[currentBgMusicIndex].src;
    audio.load();
  }
  
  return true;
}

// Função para fazer transição suave entre músicas
function fadeToSong(songIndex) {
  // Verificar e inicializar o elemento de áudio
  if (!ensureAudioIsReady()) {
    console.error("Não foi possível inicializar o elemento de áudio");
    return;
  }
  
  // Detectar se é dispositivo móvel
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  
  // Verificar se a música solicitada existe
  if (songIndex < 0 || songIndex >= bgMusicPlaylist.length) {
    console.error(`Índice de música inválido: ${songIndex}`);
    return;
  }
  
  // Em dispositivos móveis, especialmente iOS, as transições suaves podem não funcionar bem
  // Então usamos uma abordagem mais direta
  if (isMobile) {
    console.log(`Transição para música ${songIndex} em dispositivo móvel`);
    
    // Em iOS não manipulamos volume programaticamente
    if (!isIOS) {
      // Reduzir volume rapidamente (dispositivos Android)
      audio.volume = 0.1;
    }
    
    // Mudar música
    currentBgMusicIndex = songIndex;
    audio.src = bgMusicPlaylist[currentBgMusicIndex].src;
    
    // Carregar e tocar a música
    audio.load();
    
    // Para a música 2, definir tempo inicial após carregar
    if (songIndex === 2) {
      // Em dispositivos móveis, é mais confiável definir currentTime após um play()
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // Só podemos definir currentTime após um play bem-sucedido em mobile
          setTimeout(() => {
            audio.currentTime = 16;
            console.log("Música 2 iniciada em 16s (dispositivo móvel)");
            
            // Restaurar volume (apenas Android)
            if (!isIOS) {
              audio.volume = 1.0;
            }
          }, 100);
        }).catch(error => {
          console.error("Erro ao iniciar reprodução em mobile:", error);
          // Tentar novamente sem definir o tempo
          audio.play().catch(e => console.error("Segundo erro ao reproduzir:", e));
        });
      }
    } else {
      // Para outras músicas, apenas reproduzir
      audio.play().then(() => {
        if (!isIOS) {
          // Restaurar volume gradualmente (Android)
          setTimeout(() => {
            audio.volume = 1.0;
          }, 500);
        }
      }).catch(error => {
        console.error("Erro ao iniciar reprodução em mobile:", error);
      });
    }
    
    // Atualizar a interface do player
    updateFloatingMusicPlayer();
    
    return; // Encerrar a função para dispositivos móveis
  }
  
  // Código para desktop (transição suave)
  const currentVolume = audio.volume;
  const fadeOutDuration = 1000; // 1 segundo para fade out
  const fadeInDuration = 1000; // 1 segundo para fade in
  const volumeStep = 0.05;
  
  // Função para reduzir o volume gradualmente
  const fadeOut = () => {
    if (audio.volume > volumeStep) {
      audio.volume -= volumeStep;
      setTimeout(fadeOut, fadeOutDuration * volumeStep);
    } else {
      audio.volume = 0;
      
      // Mudar a música
      currentBgMusicIndex = songIndex;
      audio.src = bgMusicPlaylist[currentBgMusicIndex].src;
      
      // Se for a música 2 (I Wanna Be Yours), começar a tocar a partir de 16 segundos
      if (songIndex === 2) {
        audio.addEventListener('loadedmetadata', function startFromMiddle() {
          audio.currentTime = 16; // Começar a partir de 16 segundos
          console.log("Música 2 iniciada em 16s (desktop)");
          audio.removeEventListener('loadedmetadata', startFromMiddle);
        });
      }
      
      // Atualizar o player flutuante
      updateFloatingMusicPlayer();
      
      // Iniciar a reprodução e fade in
      audio.play().then(() => {
        fadeIn();
      }).catch(error => {
        console.error("Erro ao reproduzir áudio após transição:", error);
        audio.volume = currentVolume; // Restaurar volume em caso de erro
      });
    }
  };
  
  // Função para aumentar o volume gradualmente
  const fadeIn = () => {
    if (audio.volume < currentVolume - volumeStep) {
      audio.volume += volumeStep;
      setTimeout(fadeIn, fadeInDuration * volumeStep);
    } else {
      audio.volume = currentVolume;
    }
  };
  
  // Se a música atual já for a solicitada, não fazer nada
  if (currentBgMusicIndex === songIndex) return;
  
  // Iniciar o processo de fade out
  fadeOut();
}