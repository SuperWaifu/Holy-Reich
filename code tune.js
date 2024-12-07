document.addEventListener('DOMContentLoaded', () => {
    const playBtn = document.getElementById('play-btn');
    const progressBar = document.getElementById('progress-bar');
    const volumeControl = document.getElementById('volume-control');

    // Sélection des éléments pour le titre et l'auteur dans la barre de lecture
    const playerTitle = document.getElementById('player-title'); 
    const playerArtist = document.getElementById('player-artist'); 

    // Sélection des éléments pour le titre et l'auteur dans la section centrale
    const mainMusicTitle = document.getElementById('main-music-title'); 
    const mainMusicArtist = document.getElementById('main-music-artist'); 

    let currentAudioPlayer = null; // Référence de l'audio actuellement en lecture
    let currentMusicTitle = '';
    let currentMusicArtist = '';

    // Sélection de tous les conteneurs de musiques et des éléments audio
    const musicItems = document.querySelectorAll('.music-item');
    const audioPlayers = document.querySelectorAll('audio');
	
	const playerCover = document.getElementById('player-cover'); // Cover dans la barre du bas
	const mainMusicCover = document.getElementById('album-cover'); // Cover dans la section centrale

    // Vérification si des musiques sont présentes dans la page
    if (musicItems.length === 0 || audioPlayers.length === 0) {
        console.warn("Aucune musique disponible dans la page.");
        return;
    }

    // Fonction pour arrêter toute musique en cours
    function stopAllMusic() {
        audioPlayers.forEach(audio => {
            audio.pause();
            audio.currentTime = 0; // Réinitialiser la lecture au début
        });
    }

    // Fonction pour mettre à jour les informations de la musique dans toute la page
    function updateMusicInfo(title, artist, cover) {
        currentMusicTitle = title;
        currentMusicArtist = artist;

        // Mise à jour des informations dans la barre de lecture
        playerTitle.textContent = currentMusicTitle;
        playerArtist.textContent = currentMusicArtist;

        // Mise à jour des informations dans la section centrale
        mainMusicTitle.textContent = currentMusicTitle;
        mainMusicArtist.textContent = currentMusicArtist;
		
		// Mettre à jour les covers
		playerCover.src = cover; // Image de la barre du bas
		mainMusicCover.src = cover; // Image de la section centrale
    }

    // Fonction pour gérer la lecture/pause de la musique
    function togglePlayPause(audio) {
        if (audio.paused) {
            audio.play();
            playBtn.textContent = '⏸️'; // Mettre le bouton sur pause
        } else {
            audio.pause();
            playBtn.textContent = '⏯️'; // Mettre le bouton sur lecture
        }
    }

    // Ajoute un événement de clic sur chaque conteneur de musique
    musicItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            console.log("Musique cliquée :", item);

            // Arrêter toutes les musiques en cours
            stopAllMusic();

            // Sélectionner l'audio correspondant à ce conteneur
            currentAudioPlayer = audioPlayers[index];

            // Mettre à jour les informations de la musique en cours
            const musicTitle = item.getAttribute('data-title');
            const musicArtist = item.getAttribute('data-artist');
			const musicCover = item.getAttribute('data-cover');
            updateMusicInfo(musicTitle, musicArtist, musicCover);

            // Démarrer la lecture de la musique sélectionnée
            togglePlayPause(currentAudioPlayer);
        });
    });

    // Ajoute l'événement de lecture/pause sur le bouton de la barre de lecture
    playBtn.addEventListener('click', () => {
        if (currentAudioPlayer) {
            togglePlayPause(currentAudioPlayer);
        } else {
            console.warn("Aucune musique n'a été sélectionnée pour la lecture.");
        }
    });

   // Mettre à jour la barre de progression selon le temps de la musique
    audioPlayers.forEach(audio => {
        audio.addEventListener('timeupdate', () => {
            if (audio === currentAudioPlayer) {
                const progress = (audio.currentTime / audio.duration) * 100;
                progressBar.value = progress;

                // Vérifier que le calcul de la progression est correct
                console.log(`Progression : ${progress}%`);

                // Mettre à jour la couleur de la barre de progression avec la partie lue
                updateProgressBar(progress);
            }
        });
    });

    // Changer le temps de lecture quand on déplace le curseur de la barre de progression
    progressBar.addEventListener('input', (event) => {
        if (currentAudioPlayer) {
            const newTime = (event.target.value / 100) * currentAudioPlayer.duration;
            currentAudioPlayer.currentTime = newTime;

            // Mettre à jour la couleur de la barre de progression même lors du déplacement manuel
            const progress = (newTime / currentAudioPlayer.duration) * 100;
            console.log(`Progression après déplacement : ${progress}%`);
            updateProgressBar(progress);
        }
    });

    // Fonction pour mettre à jour la couleur de la barre de progression
    function updateProgressBar(progress) {
        // Mettre à jour le `background` avec un gradient qui montre la partie lue et non lue
        progressBar.style.background = `linear-gradient(to right, #621bc1 ${progress}%, #e0e0e0 ${progress}%)`;
        console.log(`Mise à jour de la barre : ${progressBar.style.background}`);
    }

    // Initialiser la barre avec une couleur par défaut à 0% de progression
    updateProgressBar(0);

    // Gestion du volume de la musique
    if (volumeControl) {
        volumeControl.addEventListener('input', (event) => {
            if (currentAudioPlayer) {
                currentAudioPlayer.volume = event.target.value / 100;
            }
        });
    }

    // Remettre le bouton de lecture/pause à l'état initial quand la musique est terminée
    audioPlayers.forEach(audio => {
        audio.addEventListener('ended', () => {
            if (audio === currentAudioPlayer) {
                playBtn.textContent = '⏯️';
                progressBar.value = 0;
            }
        });
    });
});