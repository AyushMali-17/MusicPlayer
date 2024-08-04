document.addEventListener('DOMContentLoaded', () => {
    const playPauseBtn = document.getElementById('play-pause');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const shuffleBtn = document.getElementById('shuffle');
    const repeatBtn = document.getElementById('repeat');
    const volumeControl = document.getElementById('volume');
    const progressBar = document.getElementById('progress');
    const currentTimeDisplay = document.getElementById('current-time');
    const totalTimeDisplay = document.getElementById('total-time');
    const playlistItems = document.querySelectorAll('#playlist li');
    const visualizerCanvas = document.getElementById('visualizer');
    const ctx = visualizerCanvas.getContext('2d');
    const addSongBtn = document.getElementById('add-song');
    const fileInput = document.getElementById('file-input');
    const settingsBtn = document.getElementById('settings');
    const settingsPanel = document.getElementById('settings-panel');
    const themeSelect = document.getElementById('theme');
    const speedInput = document.getElementById('speed');

    let audio = new Audio();
    let currentIndex = 0;
    let isPlaying = false;
    let isShuffling = false;
    let isRepeating = false;
    let audioContext, analyser, source, bufferLength, dataArray;

    const loadSong = (index) => {
        audio.src = playlistItems[index].getAttribute('data-src');
        audio.load();
        updatePlaylistUI(index);
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

    const nextSong = () => {
        if (isShuffling) {
            currentIndex = Math.floor(Math.random() * playlistItems.length);
        } else {
            currentIndex = (currentIndex + 1) % playlistItems.length;
        }
        loadSong(currentIndex);
        if (isPlaying) playSong();
    };

    const prevSong = () => {
        currentIndex = (currentIndex - 1 + playlistItems.length) % playlistItems.length;
        loadSong(currentIndex);
        if (isPlaying) playSong();
    };

    const toggleShuffle = () => {
        isShuffling = !isShuffling;
        shuffleBtn.classList.toggle('active', isShuffling);
    };

    const toggleRepeat = () => {
        isRepeating = !isRepeating;
        repeatBtn.classList.toggle('active', isRepeating);
    };

    const updatePlaylistUI = (index) => {
        playlistItems.forEach((item, idx) => {
            item.classList.toggle('playing', idx === index);
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
        const barWidth = (visualizerCanvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;
            ctx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
            ctx.fillRect(x, visualizerCanvas.height - barHeight / 2, barWidth, barHeight);
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
                currentIndex = Array.from(playlistItems).indexOf(newSong);
                loadSong(currentIndex);
                playSong();
            });
            document.getElementById('playlist').appendChild(newSong);
            fileInput.value = ''; // Clear the file input
        }
    };

    const changeTheme = (theme) => {
        if (theme === 'light') {
            document.body.classList.add('light');
        } else {
            document.body.classList.remove('light');
        }
    };

    const changeSpeed = (speed) => {
        audio.playbackRate = speed;
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
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    addSongBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    settingsBtn.addEventListener('click', () => {
        settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
    });
    themeSelect.addEventListener('change', (e) => changeTheme(e.target.value));
    speedInput.addEventListener('input', (e) => changeSpeed(e.target.value));

    volumeControl.addEventListener('input', (e) => {
        audio.volume = e.target.value;
    });

    progressBar.addEventListener('input', (e) => {
        const seekTime = (e.target.value / 100) * audio.duration;
        audio.currentTime = seekTime;
    });

    audio.addEventListener('timeupdate', () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.value = progress;
        updateTimeDisplay();
    });

    audio.addEventListener('ended', () => {
        if (isRepeating) {
            playSong();
        } else {
            nextSong();
        }
    });

    playlistItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            currentIndex = index;
            loadSong(currentIndex);
            playSong();
        });
    });

    // Initial load
    loadSong(currentIndex);
    updateTimeDisplay();
});
