// Main JavaScript file for Spotify-inspired Music Player

// DOM Elements
const playPauseBtn = document.getElementById('play-pause');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const shuffleBtn = document.getElementById('shuffle');
const repeatBtn = document.getElementById('repeat');
const volumeSlider = document.getElementById('volume');
const progressSlider = document.getElementById('progress');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const albumArt = document.getElementById('album-art');
const trackTitle = document.getElementById('track-title');
const artistName = document.getElementById('artist');
const albumName = document.getElementById('album');
const releaseDate = document.getElementById('release-date');
const lyricsEl = document.getElementById('lyrics');
const playlistEl = document.getElementById('playlist');
const addSongBtn = document.getElementById('add-song');
const miniAlbumArt = document.getElementById('mini-album-art');
const miniTrackTitle = document.getElementById('mini-track-title');
const miniArtist = document.getElementById('mini-artist');

// Audio object
const audio = new Audio();

// Playlist array
let playlist = [];
let currentTrackIndex = 0;
let isPlaying = false;
let isShuffled = false;
let repeatMode = 'off'; // 'off', 'one', 'all'

// Event Listeners
playPauseBtn.addEventListener('click', togglePlayPause);
prevBtn.addEventListener('click', playPreviousTrack);
nextBtn.addEventListener('click', playNextTrack);
shuffleBtn.addEventListener('click', toggleShuffle);
repeatBtn.addEventListener('click', toggleRepeat);
volumeSlider.addEventListener('input', setVolume);
progressSlider.addEventListener('input', seekTo);
addSongBtn.addEventListener('click', addSongToPlaylist);

audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', handleTrackEnd);
audio.addEventListener('loadedmetadata', updateTotalTime);

// Functions
function togglePlayPause() {
    if (isPlaying) {
        audio.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        audio.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
    isPlaying = !isPlaying;
}

function playPreviousTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadAndPlayTrack(playlist[currentTrackIndex]);
}

function playNextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadAndPlayTrack(playlist[currentTrackIndex]);
}

function toggleShuffle() {
    isShuffled = !isShuffled;
    shuffleBtn.classList.toggle('active', isShuffled);
}

function toggleRepeat() {
    switch (repeatMode) {
        case 'off':
            repeatMode = 'one';
            repeatBtn.innerHTML = '<i class="fas fa-repeat-1"></i>';
            break;
        case 'one':
            repeatMode = 'all';
            repeatBtn.innerHTML = '<i class="fas fa-repeat"></i>';
            break;
        case 'all':
            repeatMode = 'off';
            repeatBtn.innerHTML = '<i class="fas fa-repeat" style="opacity: 0.5;"></i>';
            break;
    }
}

function setVolume() {
    audio.volume = volumeSlider.value;
}

function seekTo() {
    const seekTime = audio.duration * (progressSlider.value / 100);
    audio.currentTime = seekTime;
}

function updateProgress() {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressSlider.value = progress;
    currentTimeEl.textContent = formatTime(audio.currentTime);
}

function updateTotalTime() {
    totalTimeEl.textContent = formatTime(audio.duration);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function handleTrackEnd() {
    if (repeatMode === 'one') {
        audio.play();
    } else if (repeatMode === 'all' || currentTrackIndex < playlist.length - 1) {
        playNextTrack();
    } else {
        isPlaying = false;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

function addSongToPlaylist() {
    // This function would typically open a file dialog or prompt for a URL
    // For this example, we'll just add a dummy track
    const dummyTrack = {
        title: 'New Track ' + (playlist.length + 1),
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        albumArt: 'default-art.jpg',
        audioSrc: 'path/to/audio/file.mp3',
        lyrics: 'No lyrics available'
    };
    playlist.push(dummyTrack);
    updatePlaylistUI();
}

function updatePlaylistUI() {
    playlistEl.innerHTML = '';
    playlist.forEach((track, index) => {
        const li = document.createElement('li');
        li.textContent = `${track.title} - ${track.artist}`;
        li.addEventListener('click', () => loadAndPlayTrack(track, index));
        playlistEl.appendChild(li);
    });
}

function loadAndPlayTrack(track, index) {
    audio.src = track.audioSrc;
    albumArt.src = track.albumArt;
    trackTitle.textContent = track.title;
    artistName.textContent = track.artist;
    albumName.textContent = track.album;
    releaseDate.textContent = track.releaseDate || 'Unknown';
    lyricsEl.textContent = track.lyrics;

    miniAlbumArt.src = track.albumArt;
    miniTrackTitle.textContent = track.title;
    miniArtist.textContent = track.artist;

    currentTrackIndex = index !== undefined ? index : playlist.indexOf(track);
    audio.play();
    isPlaying = true;
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

// Initialize the player
function initPlayer() {
    // Load initial playlist (this would typically come from a server or local storage)
    playlist = [
        {
            title: 'Sample Track 1',
            artist: 'Artist 1',
            album: 'Album 1',
            albumArt: 'path/to/album-art-1.jpg',
            audioSrc: 'path/to/audio-1.mp3',
            lyrics: 'Sample lyrics for track 1...'
        },
        // Add more tracks here
    ];
    updatePlaylistUI();
    if (playlist.length > 0) {
        loadAndPlayTrack(playlist[0], 0);
    }
}

// Call initPlayer when the page loads
window.addEventListener('load', initPlayer);