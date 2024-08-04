document.addEventListener('DOMContentLoaded', () => {
    const playPauseBtn = document.getElementById('play-pause');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const playlistItems = document.querySelectorAll('#playlist li');
    let audio = new Audio();
    let currentIndex = 0;
    let isPlaying = false;

    const loadSong = (index) => {
        audio.src = playlistItems[index].getAttribute('data-src');
        audio.load();
    };

    const playSong = () => {
        audio.play();
        isPlaying = true;
        playPauseBtn.textContent = 'Pause';
    };

    const pauseSong = () => {
        audio.pause();
        isPlaying = false;
        playPauseBtn.textContent = 'Play';
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

    
    loadSong(currentIndex);
});
