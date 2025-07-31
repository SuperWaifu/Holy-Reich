document.addEventListener('DOMContentLoaded', () => {
    const playIcon = document.getElementById('play-icon');
    const progressBar = document.getElementById('progress-bar');
    const volumeControl = document.getElementById('volume-control');

    // Sélection des éléments pour le titre et l'auteur dans la barre de lecture
    const playerTitle = document.getElementById('player-title'); 
    const playerArtist = document.getElementById('player-artist'); 

    // Sélection des éléments pour le titre et l'auteur dans la section centrale
    const mainMusicTitle = document.getElementById('main-music-title'); 
    const mainMusicArtist = document.getElementById('main-music-artist'); 

	const lyricsBtn = document.getElementById('lyrics-btn');
    const classicView = document.getElementById('classic-view');
    const lyricsView = document.getElementById('lyrics-view');
    const lyricsText = document.getElementById('lyrics-text');
    const lyricsTitle = document.getElementById('lyrics-title');

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
            playIcon.src = "logo/pause.png";
        } else {
            audio.pause();
            playIcon.src = "logo/play.png";
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
    playIcon.addEventListener('click', () => {
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
                playIcon.src = 'logo/play.png';
                progressBar.value = 0;
            }
        });
    });
	
	// Événement au clic sur le bouton Paroles
	lyricsBtn.addEventListener('click', toggleLyricsView);

	// Fonction pour basculer entre les vues
	function toggleLyricsView() {
		if (lyricsBtn.classList.contains('active')) {
			// Revenir à la vue classique
			lyricsBtn.classList.remove('active');
			lyricsView.classList.add('hidden');
			classicView.classList.remove('hidden');
			lyricsView.style.display = "none"; // Cache la vue des paroles
			classicView.style.display = "block"; // Réaffiche la vue classique
		} else {
			// Afficher les paroles
			lyricsBtn.classList.add('active');
			lyricsView.classList.remove('hidden');
			classicView.classList.add('hidden');
			lyricsView.style.display = "block"; // Affiche la vue des paroles
			classicView.style.display = "none"; // Cache la vue classique

				// Charger les paroles de la musique en cours
			if (currentMusicTitle && lyricsDatabase[currentMusicTitle]) {
				lyricsTitle.textContent = `Paroles de "${currentMusicTitle}"`; // Affiche le titre
				lyricsText.innerHTML = lyricsDatabase[currentMusicTitle]; // Affiche les paroles avec HTML interprété
			} else {
				lyricsTitle.textContent = "Paroles indisponibles";
				lyricsText.textContent = "Les paroles de cette musique ne sont pas disponibles.";
			}
		}
	}

	// Base de données de paroles
	const lyricsDatabase = {
		"Hymne du Holy-Reich": "<strong>Couplet 1 :</strong><br>Vers les cieux se dresse notre bannière,<br>Sous le regard des anges, nous marchons fiers.<br>Holy-Reich, notre empire sacré,<br>À jamais fort, jamais brisé.<br><br><strong>Refrain :</strong><br>Holy-Reich, terre de lumière,<br>Gloire et honneur à nos vaillants guerriers.<br>Sous ta protection, nous sommes unis,<br>Pour la justice, pour la paix, nous combattons sans répit.<br><br><strong>Couplet 2 :</strong><br>Au loin s'élèvent les ombres de Haremcia,<br>Avec leurs démons, ils sèment l'anarchie.<br>Mais nous, soldats de la foi, indomptables,<br>Repousserons les ténèbres, notre cause est implacable.<br><br><strong>[Refrain]</strong><br><br><strong>Couplet 3 :</strong><br>Dans la lumière, notre guide éclatant,<br>La vérité triomphe, jamais hésitant.<br>Nos cœurs battent d'un même élan glorieux,<br>Pour notre empire, pour nos cieux lumineux.<br><br><strong>[Refrain]</strong><br><br><strong>Couplet 4 :</strong><br>Que le tonnerre résonne, que le soleil brille,<br>Dans chaque bataille, notre courage scintille.<br>Holy-Reich, empire béni, notre foyer,<br>Nous marcherons toujours pour toi, sous les feux des éclats d'acier.<br><br><strong>[Refrain]</strong><br><br><strong>Couplet 5 :</strong><br>Nos ennemis tremblent face à notre foi,<br>Car dans nos âmes, l’espoir jamais ne ploie.<br>Holy-Reich, toi l'éternelle clarté,<br>À jamais victorieux, notre serment est scellé.<br><br><strong>[Refrain]</strong>",
		"L'alliance divine": "<strong>Verset 1 :</strong><br>Sous le ciel d’ébène, où les étoiles s’effacent,<br>L’Empereur s’avance, dans le désert sans trace.<br>Le Sultanat d'or, jadis brillant trésor,<br>N'est plus que cendre, sous le souffle du sort.<br><br><strong>Refrain :</strong><br>Ô Harpie céleste, toi la vengeance incarnée,<br>Aux ailes de tempête, aux serres acérées,<br>Dans la nuit des flammes, nos destins se sont liés,<br>Désormais ton serment, à jamais gravé.<br><br><strong>Verset 2 :</strong><br>Les dunes se lèvent, murmures d’un temps passé,<br>Les âmes des perdus, dans le vent se sont mêlées.<br>Mais de ces cendres froides, émergea la clarté,<br>Une Harpie divine, de fureur animée.<br><br><strong>Pont :</strong><br>Tu as vu les ruines, ce que l’homme peut briser,<br>Et dans ton cœur brûlant, une flamme s’est dressée.<br>« Jurerais-je fidélité, à celui qui m'a vu naître,<br>Ou plutôt à cet Empereur, dont l’âme est prête ? »<br><br><strong>[Refrain]</strong><br><br><strong>Verset 3 :</strong><br>Ensemble, nous avons bâti un empire de foi,<br>Un bastion divin, sur ce continent sans loi.<br>L’Empereur et la Harpie, unis dans la clarté,<br>Portant la lumière, là où règne l’obscurité.<br><br><strong>Coda :</strong><br>Les cieux nous contemplent, le serment est scellé,<br>L’Empereur et la Harpie, à jamais enlacés.<br>Sur les terres ravagées, une nouvelle ère est née,<br>L’alliance immortelle, (où) la justice est sacrée.<br><br><strong>[Refrain]</strong><br><br><strong>Outro :</strong><br>Sous les voûtes d’azur, notre empire grandit,<br>L’Empereur et la Harpie, gardiens de l’infini.",
		"Hymne de New-Ark": "<strong>Couplet 1 :</strong><br>Au milieu des dunes et des tempêtes,<br>New Ark se dresse, en ordre parfait.<br>Sous le soleil brûlant, nos armes levées,<br>Dans ce désert, notre puissance forgée.<br><br><strong>Refrain :</strong><br>New Ark, notre bastion,<br>Unis sous le ciel de la nation.<br>Guidés par la Leader Suprême,<br>Nous sommes les flammes, l'élite suprême.<br><br><strong>Couplet 2 :</strong><br>Des nomades et brigands, soldats de fer,<br>Pour conquérir, pour un nouvel ère.<br>Dans les sables mouvants, notre discipline,<br>Est une forteresse, notre ligne de front ultime.<br><br><strong>[Refrain]</strong><br><br><strong>Pont :</strong><br>Quand l'espoir semble s'éteindre,<br>Nos cœurs continuent de se joindre.<br>Dans chaque battement, dans chaque marche,<br>La force de New Ark se déclare.<br><br><strong>[Refrain]</strong><br><br><strong>Outro :</strong><br>Pour chaque grain de sable, chaque combat,<br>Nous marchons ensemble, droit et sans trêve.<br>New Ark brille, en ordre et en force,<br>Sous la bannière de notre emblème.",
		"Les échos de Melynas": "<strong>Couplet 1 :</strong><br>Dans les brumes du grand lac,<br>Où dansent les feux follets,<br>Sous le ciel de Melynas,<br>Nos chants jamais ne cesseront.<br>Du narval nous fêtons la course,<br>Le temps des récoltes est venu,<br>Avec nos mains qui forgent la terre,<br>Nous bâtirons un avenir fort.<br><br><strong>Refrain :</strong><br>Mais l'hermine court encore,<br>Sur les terres de Melynas,<br>Le vent portera nos efforts,<br>Et nos cœurs, jamais las.<br><br><strong>Couplet 2 :</strong><br>Là-bas, aux frontières lointaines,<br>Les ombres de l’ennemi grandissent,<br>Mais ici, nos foyers s’embrasent,<br>De courage, que rien ne ternisse.<br>Pour chaque pierre que l'on soulève,<br>C'est notre honneur qui se dresse,<br>Face aux vents qui menacent nos rêves,<br>Nous serons l'arme et la promesse.<br><br><strong>[Refrain]</strong><br><br><strong>Couplet 3 :</strong><br>Qu'importe les orages qui grondent,<br>Sur la lisière de nos champs,<br>Ici se lèvent nos frères et sœurs,<br>Gardant vivants nos vieux chants.<br>Par nos traditions, nos fêtes, nos mains,<br>Melynas restera debout,<br>Et s’il le faut, sur ces chemins,<br>Nous défendrons tout ce qui est nous.<br><br><strong>[Refrain]</strong><br><br><strong>Couplet 4 :</strong><br>Lorsque l’appel résonnera,<br>Pour protéger notre héritage,<br>Nous serons mille, nous serons là,<br>Fiers de notre enracinage.<br>Dans chaque souffle et chaque cri,<br>S'élève l'âme de nos montagnes,<br>Et si l'ennemi venait ici,<br>Nous serons l'épée, le bouclier, la flamme.<br><br><strong>[Refrain]</strong>",
	};
});