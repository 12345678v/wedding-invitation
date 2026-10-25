const experience = document.getElementById('experience');
const openButton = document.getElementById('openButton');
const replayButton = document.getElementById('replayButton');
const invitationCard = document.getElementById('invitationCard');
const petals = document.getElementById('petals');
const status = document.getElementById('status');
const music = document.getElementById('weddingMusic');
const musicButton = document.getElementById('musicButton');
const musicLabel = document.getElementById('musicLabel');
const opening = document.getElementById('opening');

let openingTimer;
let revealTimer;
let playbackRequest = 0;

music.volume = 0.75;

function updateMusicButton() {
  const playing = !music.paused && !music.ended;
  musicButton.setAttribute('aria-pressed', String(playing));
  musicLabel.textContent = playing ? 'قطع موسیقی' : 'پخش موسیقی';
}

function playMusic() {
  const request = ++playbackRequest;
  if (music.error) music.load();

  // Keep play() in the click call stack so mobile browsers have a user gesture.
  const playback = music.play();
  if (playback) {
    playback.catch((error) => {
      if (request !== playbackRequest || error.name === 'AbortError') return;
      updateMusicButton();
      status.textContent = 'برای شنیدن آهنگ، دکمه پخش موسیقی را لمس کنید.';
    });
  }
}

function stopMusic() {
  playbackRequest += 1;
  music.pause();
  music.currentTime = 0;
  updateMusicButton();
}

function makePetals() {
  petals.replaceChildren();
  const colors = ['#b8c8a8', '#78987a', '#93af8e', '#d5dfc5', '#58765d'];

  for (let index = 0; index < 18; index += 1) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.setProperty('--size', `${7 + Math.random() * 9}px`);
    petal.style.setProperty('--duration', `${4.8 + Math.random() * 3.8}s`);
    petal.style.setProperty('--delay', `${Math.random() * 1.6}s`);
    petal.style.setProperty('--drift', `${-80 + Math.random() * 160}px`);
    petal.style.setProperty('--spin', `${220 + Math.random() * 520}deg`);
    petal.style.setProperty('--petal-color', colors[index % colors.length]);
    petals.appendChild(petal);
  }
}

function openInvitation() {
  if (experience.classList.contains('is-opening')) return;

  experience.classList.add('is-opening');
  openButton.setAttribute('aria-expanded', 'true');
  musicButton.hidden = false;
  music.currentTime = 0;
  playMusic();
  status.textContent = 'پاکت باز شد و کارت دعوت نمایان می‌شود.';

  openingTimer = window.setTimeout(() => {
    experience.classList.add('is-revealed');
    invitationCard.setAttribute('aria-hidden', 'false');
    opening.inert = true;
    replayButton.hidden = false;
    makePetals();
  }, 760);

  revealTimer = window.setTimeout(() => {
    invitationCard.focus({ preventScroll: true });
  }, 2700);
}

function replayInvitation() {
  window.clearTimeout(openingTimer);
  window.clearTimeout(revealTimer);
  experience.classList.remove('is-revealed', 'is-opening');
  stopMusic();
  invitationCard.setAttribute('aria-hidden', 'true');
  opening.inert = false;
  openButton.setAttribute('aria-expanded', 'false');
  replayButton.hidden = true;
  musicButton.hidden = true;
  petals.replaceChildren();
  status.textContent = 'دعوت‌نامه برای نمایش دوباره آماده است.';
  openButton.focus({ preventScroll: true });
}

openButton.addEventListener('click', openInvitation);
replayButton.addEventListener('click', replayInvitation);
musicButton.addEventListener('click', () => {
  if (music.paused || music.ended) {
    playMusic();
  } else {
    playbackRequest += 1;
    music.pause();
  }
});

['play', 'playing', 'pause', 'ended'].forEach((event) => {
  music.addEventListener(event, updateMusicButton);
});

music.addEventListener('error', () => {
  updateMusicButton();
  if (experience.classList.contains('is-opening')) {
    musicLabel.textContent = 'تلاش دوباره برای موسیقی';
    status.textContent = 'بارگذاری آهنگ انجام نشد. برای تلاش دوباره دکمه موسیقی را لمس کنید.';
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && experience.classList.contains('is-revealed')) {
    replayInvitation();
  }
});

// The entire unmodified track is supplied as page data, not an HTTP media
// request. This avoids MP3 download interception by embedded browsers and
// download managers; the track can keep playing after the page is loaded.
if (typeof window.invitationMusicData === 'string') {
  music.src = window.invitationMusicData;
  delete window.invitationMusicData;
}

if (new URLSearchParams(window.location.search).get('preview') === 'open') {
  window.setTimeout(openInvitation, 80);
}
