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
    const nowPlayingTrack = document.getElementById('now-playing-track');
    const sortPlaylistBtn = document.getElementById('sort-playlist');
    const removeSelectedBtn = document.getElementById('remove-selected');
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
            lyricsDisplay.textContent = 'No lyrics available'; // Placeholder
            nowPlayingTrack.textContent = song.textContent;
            audio.load();
            updateUI();
        }
    };

    const playSong = () => {
        audio.play();
        isPlaying = true;
        playPauseBtn.textContent = 'Pause';
        startVisualization();
    };

    const pauseSong = () => {
        audio.pause();
        isPlaying = false;
        playPauseBtn.textContent = 'Play';
        stopVisualization();
    };

    const stopSong = () => {
        audio.pause();
        audio.currentTime = 0;
        isPlaying = false;
        playPauseBtn.textContent = 'Play';
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
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            source = audioContext.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            analyser.fftSize = 256;
            bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
        }
        requestAnimationFrame(drawVisualizer);
    };

    const stopVisualization = () => {
        ctx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
    };

    const drawVisualizer = () => {
        if (isPlaying) {
            requestAnimationFrame(drawVisualizer);
        }
        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
        const barWidth = (visualizerCanvasWidth / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;
            ctx.fillStyle = `rgb(${barHeight + 100},50,50)`;
            ctx.fillRect(x, visualizerCanvasHeight - barHeight / 2, barWidth, barHeight);
            x += barWidth + 1;
        }
    };

    const handleFileSelect = () => {
        const file = fileInput.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            const newSong = document.createElement('li');
            newSong.textContent = file.name;
            newSong.setAttribute('data-src', url);
            newSong.addEventListener('click', () => {
                currentIndex = Array.from(playlist.children).indexOf(newSong);
                loadSong(currentIndex);
                playSong();
            });
            playlist.appendChild(newSong);
            fileInput.value = ''; // Clear the file input
        }
    };

    const changeTheme = (theme) => {
        document.body.classList.toggle('light', theme === 'light');
    };

    const changeSpeed = (speed) => {
        audio.playbackRate = speed;
    };

    const changeBalance = (balance) => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            source = audioContext.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
        }
        const panNode = audioContext.createStereoPanner();
        source.connect(panNode);
        panNode.connect(audioContext.destination);
        panNode.pan.value = balance;
    };

    const sortPlaylist = () => {
        const songs = Array.from(playlist.children);
        songs.sort((a, b) => a.textContent.localeCompare(b.textContent));
        playlist.innerHTML = '';
        songs.forEach(song => playlist.appendChild(song));
    };

    const removeSelected = () => {
        const selected = Array.from(playlist.querySelectorAll('li.selected'));
        selected.forEach(song => playlist.removeChild(song));
        if (playlist.children.length > 0) {
            loadSong(currentIndex);
        } else {
            trackTitle.textContent = 'Track Title';
            artist.textContent = 'Artist Name';
            lyricsDisplay.textContent = 'No lyrics available';
            nowPlayingTrack.textContent = 'None';
        }
    };

    const toggleDarkMode = () => {
        document.body.classList.toggle('dark-mode');
    };

    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    });

    nextBtn.addEventListener('click', nextSong);
    prevBtn.addEventListener('click', prevSong);
    stopBtn.addEventListener('click', stopSong);
    muteBtn.addEventListener('click', muteSong);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    addSongBtn.addEventListener('click', () => fileInput.click());
    clearPlaylistBtn.addEventListener('click', () => playlist.innerHTML = '');
    sortPlaylistBtn.addEventListener('click', sortPlaylist);
    removeSelectedBtn.addEventListener('click', removeSelected);
    settingsBtn.addEventListener('click', () => {
        settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
    });
    themeSelect.addEventListener('change', (e) => changeTheme(e.target.value));
    speedInput.addEventListener('input', (e) => changeSpeed(e.target.value));
    balanceControl.addEventListener('input', (e) => changeBalance(e.target.value));
    fileInput.addEventListener('change', handleFileSelect);

    // Initialize UI
    changeTheme(themeSelect.value);
    changeSpeed(speedInput.value);
    changeBalance(balanceControl.value);
});
