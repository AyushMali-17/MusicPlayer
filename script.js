document.addEventListener('DOMContentLoaded', () => {
    const playPauseBtn = document.getElementById('play-pause');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const playlistItems = document.querySelectorAll('#playlist li');
    const visualizerCanvas = document.getElementById('visualizer');
    const ctx = visualizerCanvas.getContext('2d');
    let audio = new Audio();
    let currentIndex = 0;
    let isPlaying = false;
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
        currentIndex = (currentIndex + 1) % playlistItems.length;
        loadSong(currentIndex);
        if (isPlaying) playSong();
    };

    const prevSong = () => {
        currentIndex = (currentIndex - 1 + playlistItems.length) % playlistItems.length;
        loadSong(currentIndex);
        if (isPlaying) playSong();
    };

    const updatePlaylistUI = (index) => {
        playlistItems.forEach((item, idx) => {
            item.classList.toggle('playing', idx === index);
        });
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

    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    });

    nextBtn.addEventListener('click', nextSong);
    prevBtn.addEventListener('click', prevSong);

    playlistItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            currentIndex = index;
            loadSong(currentIndex);
            playSong();
        });
    });

    // Initial load
    loadSong(currentIndex);
});
