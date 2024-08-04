document.addEventListener('DOMContentLoaded', () => {
    // Existing element selections
    const playPauseBtn = document.getElementById('play-pause');
    const stopBtn = document.getElementById('stop');
    const nextBtn = document.getElementById('next');
    const prevBtn = document.getElementById('prev');
    const muteBtn = document.getElementById('mute');
    const shuffleBtn = document.getElementById('shuffle');
    const repeatBtn = document.getElementById('repeat');
    const volumeControl = document.getElementById('volume');
    const progressBar = document.getElementById('progress');
    const currentTimeDisplay = document.getElementById('current-time');
    const totalTimeDisplay = document.getElementById('total-time');
    const fileInput = document.getElementById('file-input');
    const playlist = document.getElementById('playlist');
    const addSongBtn = document.getElementById('add-song');
    const clearPlaylistBtn = document.getElementById('clear-playlist');
    const settingsPanel = document.getElementById('settings-panel');
    const settingsBtn = document.getElementById('settings');
    const themeSelect = document.getElementById('theme');
    const speedInput = document.getElementById('speed');
    const balanceControl = document.getElementById('audio-balance');
    const visualizerCanvas = document.getElementById('visualizer');
    const lyricsDisplay = document.getElementById('lyrics');
    const trackTitle = document.getElementById('track-title');
    const artist = document.getElementById('artist');
    const album = document.getElementById('album');
    const releaseDate = document.getElementById('release-date');
    const nowPlayingTrack = document.getElementById('now-playing-track');
    const sortPlaylistBtn = document.getElementById('sort-playlist');
    const removeSelectedBtn = document.getElementById('remove-selected');
    const albumArt = document.getElementById('album-art');
    const miniPlayPauseBtn = document.getElementById('mini-play-pause');
    const miniNextBtn = document.getElementById('mini-next');
    const miniAlbumArt = document.getElementById('mini-album-art');
    const miniTrackTitle = document.getElementById('mini-track-title');
    const ctx = visualizerCanvas.getContext('2d');

    let audio = new Audio();
    let isPlaying = false;
    let isMuted = false;
    let isShuffling = false;
    let isRepeating = false;
    let currentIndex = 0;
    let audioContext, analyser, source;
    let bufferLength, dataArray;
    const visualizerCanvasWidth = visualizerCanvas.width;
    const visualizerCanvasHeight = visualizerCanvas.height;

    const loadSong = (index) => {
        const song = playlist.children[index];
        if (song) {
            audio.src = song.getAttribute('data-src');
            trackTitle.textContent = song.textContent;
            artist.textContent = 'Artist Name'; // Placeholder
            album.textContent = 'Album Name'; // Placeholder
            releaseDate.textContent = 'Release Date'; // Placeholder
            lyricsDisplay.textContent = 'No lyrics available'; // Placeholder
            nowPlayingTrack.textContent = song.textContent;
            albumArt.src = 'default-art.jpg'; // Placeholder
            miniAlbumArt.src = 'default-art.jpg'; // Placeholder
            miniTrackTitle.textContent = song.textContent;
            audio.load();
            updateUI();
        }
    };

    const playSong = () => {
        audio.play();
        isPlaying = true;
        playPauseBtn.textContent = 'Pause';
        miniPlayPauseBtn.textContent = 'Pause';
        startVisualization();
    };

    const pauseSong = () => {
        audio.pause();
        isPlaying = false;
        playPauseBtn.textContent = 'Play';
        miniPlayPauseBtn.textContent = 'Play';
        stopVisualization();
    };

    const stopSong = () => {
        audio.pause();
        audio.currentTime = 0;
        isPlaying = false;
        playPauseBtn.textContent = 'Play';
        miniPlayPauseBtn.textContent = 'Play';
        stopVisualization();
    };

    const nextSong = () => {
        currentIndex = (currentIndex + 1) % playlist.children.length;
        loadSong(currentIndex);
        playSong();
    };

    const prevSong = () => {
        currentIndex = (currentIndex - 1 + playlist.children.length) % playlist.children.length;
        loadSong(currentIndex);
        playSong();
    };

    const muteSong = () => {
        isMuted = !isMuted;
        audio.muted = isMuted;
        muteBtn.textContent = isMuted ? 'Unmute' : 'Mute';
    };

    const toggleShuffle = () => {
        isShuffling = !isShuffling;
        shuffleBtn.classList.toggle('active', isShuffling);
    };

    const toggleRepeat = () => {
        isRepeating = !isRepeating;
        repeatBtn.classList.toggle('active', isRepeating);
    };

    const updateUI = () => {
        playlist.children.forEach((item, idx) => {
            item.classList.toggle('playing', idx === currentIndex);
        });
        miniTrackTitle.textContent = playlist.children[currentIndex]?.textContent || 'Track Title';
    };

    const updateTimeDisplay = () => {
        currentTimeDisplay.textContent = formatTime(audio.currentTime);
        totalTimeDisplay.textContent = formatTime(audio.duration);
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const startVisualization = () => {
        if (audioContext) {
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
            source = audioContext.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            visualize();
        }
    };

    const visualize = () => {
        if (!analyser) return;
        requestAnimationFrame(visualize);
        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, visualizerCanvasWidth, visualizerCanvasHeight);
        const barWidth = (visualizerCanvasWidth / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];
            ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
            ctx.fillRect(x, visualizerCanvasHeight - barHeight / 2, barWidth, barHeight / 2);
            x += barWidth + 1;
        }
    };

    const stopVisualization = () => {
        if (analyser) {
            analyser.disconnect();
            analyser = null;
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            audio.src = url;
            audio.load();
            updateUI();
        }
    };

    const changeTheme = (theme) => {
        document.body.classList.toggle('dark', theme === 'dark');
        document.body.classList.toggle('light', theme === 'light');
    };

    const changeSpeed = (speed) => {
        audio.playbackRate = speed;
    };

    const changeBalance = (value) => {
        if (audioContext) {
            const panNode = audioContext.createStereoPanner();
            panNode.pan.value = parseFloat(value);
            source.connect(panNode);
            panNode.connect(analyser);
        }
    };

    const sortPlaylist = () => {
        const songs = Array.from(playlist.children);
        songs.sort((a, b) => a.textContent.localeCompare(b.textContent));
        playlist.innerHTML = '';
        songs.forEach(song => playlist.appendChild(song));
    };

    const removeSelected = () => {
        Array.from(playlist.children).forEach(song => {
            if (song.classList.contains('selected')) {
                playlist.removeChild(song);
            }
        });
    };

    const toggleDarkMode = () => {
        document.body.classList.toggle('dark');
    };

    // Event listeners
    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    });

    stopBtn.addEventListener('click', stopSong);
    nextBtn.addEventListener('click', nextSong);
    prevBtn.addEventListener('click', prevSong);
    muteBtn.addEventListener('click', muteSong);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    volumeControl.addEventListener('input', (e) => audio.volume = e.target.value);
    progressBar.addEventListener('input', (e) => audio.currentTime = (e.target.value / 100) * audio.duration);
    balanceControl.addEventListener('input', (e) => changeBalance(e.target.value));
    fileInput.addEventListener('change', handleFileSelect);
    settingsBtn.addEventListener('click', () => settingsPanel.classList.toggle('visible'));
    themeSelect.addEventListener('change', (e) => changeTheme(e.target.value));
    speedInput.addEventListener('input', (e) => changeSpeed(e.target.value));
    sortPlaylistBtn.addEventListener('click', sortPlaylist);
    removeSelectedBtn.addEventListener('click', removeSelected);
    document.querySelector('#dark-mode-toggle').addEventListener('click', toggleDarkMode);
    miniPlayPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    });
    miniNextBtn.addEventListener('click', nextSong);

    // Initialize audio context
    if (typeof AudioContext !== 'undefined') {
        audioContext = new AudioContext();
    }
});
