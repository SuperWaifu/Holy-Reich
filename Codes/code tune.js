document.addEventListener('DOMContentLoaded', () => {
    const playIcon = document.getElementById('play-icon');
    const progressBar = document.getElementById('progress-bar');
    const volumeControl = document.getElementById('volume-control');

    const playerTitle = document.getElementById('player-title');
    const playerArtist = document.getElementById('player-artist');

    const mainMusicTitle = document.getElementById('main-music-title');
    const mainMusicArtist = document.getElementById('main-music-artist');

    const timestamp = document.querySelector('.timestamp');
    const playerCover = document.getElementById('player-cover');
    const mainMusicCover = document.getElementById('album-cover');

	const lyricsBtn = document.getElementById('lyrics-btn');
    const classicView = document.getElementById('classic-view');
    const lyricsView = document.getElementById('lyrics-view');
    const lyricsText = document.getElementById('lyrics-text');
    const lyricsTitle = document.getElementById('lyrics-title');
	
	const queueBtn = document.getElementById('queue-btn');
	const queueView = document.getElementById('queue-view');
    // éléments
    const musicItems = Array.from(document.querySelectorAll('.music-item'));
    const audioPlayers = Array.from(document.querySelectorAll('audio')); // converti en array pour indexOf

    if (musicItems.length === 0 || audioPlayers.length === 0) {
        console.warn("Aucune musique disponible dans la page.");
        return;
    }

    // état global
    let currentAudioPlayer = null;
    let currentMusicTitle = "";
    let currentMusicArtist = "";
    let globalVolume = 0.5;

    // playlist / séquence
    let sequentialPlayActive = false;
    let sequentialPlayList = []; // playlist courante (ordonnée ou mélangée)
    let isShuffleMode = false;
    let currentSequentialIndex = -1;

    // prev longpress
    const longPressDuration = 500;
    let prevButtonPressTimer = null;
    let longClickTriggered = false;

    // ---------- utilitaires ----------
    function stopAllMusic() {
        audioPlayers.forEach(a => { a.pause(); a.currentTime = 0; });
        stopLogoSpin();
    }

    function updateMusicInfo(title, artist, cover) {
		if (title !== undefined) {
            playerTitle.textContent = title;
            mainMusicTitle.textContent = title;
			currentMusicTitle = title;
        }
        if (artist !== undefined) {
            playerArtist.textContent = artist;
            mainMusicArtist.textContent = artist;
			currentMusicArtist = artist;
        }
        if (cover) {
            if (playerCover) playerCover.src = cover;
            if (mainMusicCover) mainMusicCover.src = cover;
        }
    }

    function togglePlayPause(audio) {
        if (!audio) return;
        if (audio.paused) {
            audio.volume = globalVolume;
            audio.play();
            startLogoSpin();
            if (playIcon) playIcon.src = "logo/pause.png";
        } else {
            audio.pause();
            stopLogoSpin();
            if (playIcon) playIcon.src = "logo/play.png";
        }
    }

    // logo spin (petites fonctions)
    function startLogoSpin() {
        const logo = document.getElementById('logo-spinner');
        if (logo) logo.style.animationPlayState = 'running';
    }
    function stopLogoSpin() {
        const logo = document.getElementById('logo-spinner');
        if (logo) logo.style.animationPlayState = 'paused';
    }
    stopLogoSpin();

    // ---------- interaction : clic sur une piste (lecture simple) ----------
    musicItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            // si on clique sur un item appartenant à la playlist en cours, joue via playNext
            if (sequentialPlayActive && sequentialPlayList.includes(item)) {
                const idxInSeq = sequentialPlayList.indexOf(item);
                playNext(idxInSeq);
                return;
            }

            // lecture simple -> arrêter séquence et jouer cet item
            stopAllMusic();
            sequentialPlayActive = false;
            window.updatePlayAllButtonsState(sequentialPlayList, false); // mise à jour UI

            currentAudioPlayer = audioPlayers[index];
            const musicTitle = item.getAttribute('data-title');
            const musicArtist = item.getAttribute('data-artist');
            const musicCover = item.getAttribute('data-cover');
            updateMusicInfo(musicTitle, musicArtist, musicCover);

            currentAudioPlayer.volume = globalVolume;
            currentAudioPlayer.play();
            startLogoSpin();
            if (playIcon) playIcon.src = "logo/pause.png";

            currentAudioPlayer.onended = () => {
                stopLogoSpin();
                if (playIcon) playIcon.src = "logo/play.png";
            };
        });
    });

    // ---------- progress & time ----------
    audioPlayers.forEach(audio => {
        audio.addEventListener('timeupdate', () => {
            if (audio === currentAudioPlayer && audio.duration) {
                const progress = (audio.currentTime / audio.duration) * 100;
                if (progressBar) progressBar.value = progress;
                updateProgressBar(progress);

                const currentMinutes = Math.floor(audio.currentTime / 60);
                const currentSeconds = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
                const totalMinutes = Math.floor(audio.duration / 60);
                const totalSeconds = Math.floor(audio.duration % 60).toString().padStart(2, '0');
                if (timestamp) timestamp.textContent = `${currentMinutes}:${currentSeconds} / ${totalMinutes}:${totalSeconds}`;
            }
        });

        audio.addEventListener('ended', () => {
            if (audio === currentAudioPlayer) {
                if (playIcon) playIcon.src = "logo/play.png";
                if (progressBar) progressBar.value = 0;
                stopLogoSpin();
            }
        });
    });

    if (progressBar) {
        progressBar.addEventListener('input', (event) => {
            if (currentAudioPlayer && currentAudioPlayer.duration) {
                const newTime = (event.target.value / 100) * currentAudioPlayer.duration;
                currentAudioPlayer.currentTime = newTime;
                updateProgressBar((newTime / currentAudioPlayer.duration) * 100);
            }
        });
    }

    function updateProgressBar(progress) {
        if (progressBar) progressBar.style.background = `linear-gradient(to right, #621bc1 ${progress}%, #e0e0e0 ${progress}%)`;
    }
    updateProgressBar(0);

    if (volumeControl) {
        volumeControl.addEventListener('input', (event) => {
            globalVolume = event.target.value / 100;
            if (currentAudioPlayer) currentAudioPlayer.volume = globalVolume;
        });
    }

    // ---------- playNext / playlist ----------
    function playNext(index) {
        if (!sequentialPlayActive || index < 0 || index >= sequentialPlayList.length) {
            window.updatePlayAllButtonsState(sequentialPlayList, false, false);
            sequentialPlayActive = false;
            stopLogoSpin();
            return;
        }

        currentSequentialIndex = index;
        const item = sequentialPlayList[index];
        const audioIdx = musicItems.indexOf(item);
        if (audioIdx === -1) return;
        const audio = audioPlayers[audioIdx];

        // stop other players
        audioPlayers.forEach(a => { if (a !== audio) { a.pause(); a.currentTime = 0; } });

        const musicTitle = item.getAttribute('data-title');
        const musicArtist = item.getAttribute('data-artist');
        const musicCover = item.getAttribute('data-cover');
        updateMusicInfo(musicTitle, musicArtist, musicCover);

        // mise à jour bannière prochain
        const nextItem = sequentialPlayList[index + 1];
        const scrollText = document.getElementById('scrolling-text');
        if (scrollText) {
            if (nextItem) {
                scrollText.textContent = `Prochaine musique : "${nextItem.getAttribute('data-title')}" par "${nextItem.getAttribute('data-artist')}"`;
            } else {
                scrollText.textContent = "Fin de la playlist.";
            }
        }

        currentAudioPlayer = audio;
        currentAudioPlayer.volume = globalVolume;
        currentAudioPlayer.play();
        startLogoSpin();
        if (playIcon) playIcon.src = "logo/pause.png";

        currentAudioPlayer.onended = () => {
            if (index + 1 >= sequentialPlayList.length) stopLogoSpin();
            playNext(index + 1);
        };
		updateQueueList();
    }

    function playMusicListSequentially(startIndex, list, shuffle = false) {
        sequentialPlayList = shuffle ? shuffleArray(list) : list.slice();
        sequentialPlayActive = true;
        isShuffleMode = shuffle;
        currentSequentialIndex = startIndex;
        window.updatePlayAllButtonsState(sequentialPlayList, true, shuffle);
        playNext(startIndex);
    }

    // ---------- play all / shuffle buttons ----------
    const playAllButtons = document.querySelectorAll('.play-all-btn');
    playAllButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const listContainer = button.closest('.music-list');
            const musicList = Array.from(listContainer.querySelectorAll('.music-item'));
            if (musicList.length > 0) playMusicListSequentially(0, musicList, false);
        });
    });

    const shuffleButtons = document.querySelectorAll('.shuffle-btn');
    shuffleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const listContainer = button.closest('.music-list');
            const musicList = Array.from(listContainer.querySelectorAll('.music-item'));
            if (musicList.length > 0) playMusicListSequentially(0, shuffleArray(musicList), true);
        });
    });

    function shuffleArray(array) {
        let newArray = array.slice();
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    // ---------- NEXT ----------
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (sequentialPlayActive) {
                if (currentSequentialIndex < sequentialPlayList.length - 1) playNext(currentSequentialIndex + 1);
            } else if (currentAudioPlayer) {
                const idx = audioPlayers.indexOf(currentAudioPlayer);
                if (idx !== -1 && idx < musicItems.length - 1) {
                    const nextItem = musicItems[idx + 1];
                    stopAllMusic();
                    currentAudioPlayer = audioPlayers[idx + 1];
                    updateMusicInfo(nextItem.getAttribute('data-title'), nextItem.getAttribute('data-artist'), nextItem.getAttribute('data-cover'));
                    currentAudioPlayer.volume = globalVolume;
                    currentAudioPlayer.play();
                    startLogoSpin();
					updateQueueList();
                    currentAudioPlayer.onended = () => stopLogoSpin();
                }
            }
        });
    }

    // ---------- PREV (clic court / long) ----------
    const prevBtn = document.getElementById('prev-btn');
    if (prevBtn) {
        prevBtn.addEventListener('mousedown', () => {
            longClickTriggered = false;
            prevButtonPressTimer = setTimeout(() => {
                longClickTriggered = true;
                if (sequentialPlayActive && sequentialPlayList.length > 0) {
                    playNext(0); // retour au début
                }
            }, longPressDuration);
        });

        prevBtn.addEventListener('mouseup', () => { clearTimeout(prevButtonPressTimer); });
        prevBtn.addEventListener('mouseleave', () => { clearTimeout(prevButtonPressTimer); });

        prevBtn.addEventListener('click', () => {
            if (longClickTriggered) { longClickTriggered = false; return; }

            if (sequentialPlayActive) {
                if (currentSequentialIndex > 0) playNext(currentSequentialIndex - 1);
                else if (currentAudioPlayer) { currentAudioPlayer.currentTime = 0; currentAudioPlayer.play(); }
            } else if (currentAudioPlayer) {
                const idx = audioPlayers.indexOf(currentAudioPlayer);
                if (idx > 0) {
                    const prevItem = musicItems[idx - 1];
                    stopAllMusic();
                    currentAudioPlayer = audioPlayers[idx - 1];
                    updateMusicInfo(prevItem.getAttribute('data-title'), prevItem.getAttribute('data-artist'), prevItem.getAttribute('data-cover'));
                    currentAudioPlayer.volume = globalVolume;
                    currentAudioPlayer.play();
                    startLogoSpin();
					updateQueueList();
                    currentAudioPlayer.onended = () => stopLogoSpin();
                } else {
                    currentAudioPlayer.currentTime = 0; currentAudioPlayer.play();
                }
            }
        });
    }

    // Exposer updatePlayAllButtonsState globalement (remplace le stub défensif)
    function updatePlayAllButtonsState(musicList, isActive, shuffleMode = false) {
        document.querySelectorAll('.play-all-btn, .shuffle-btn').forEach(btn => btn.classList.remove('active'));
        if (!isActive || !musicList || !musicList[0]) return;
        const parentList = musicList[0].closest('.music-list');
        if (!parentList) return;
        const playBtn = parentList.querySelector('.play-all-btn');
        const shuffleBtn = parentList.querySelector('.shuffle-btn');
        if (shuffleMode && shuffleBtn) shuffleBtn.classList.add('active');
        else if (playBtn) playBtn.classList.add('active');
    }
    window.updatePlayAllButtonsState = updatePlayAllButtonsState;

    // toggler play/pause global
    if (playIcon) {
        playIcon.addEventListener('click', () => {
            if (currentAudioPlayer) togglePlayPause(currentAudioPlayer);
            else console.warn("Aucune musique n'a été sélectionnée pour la lecture.");
        });
    }
	
	
	
	
	function showView(viewToShow) {
	  const views = document.querySelectorAll('.view');
	  views.forEach(v => {
		if (v === viewToShow) {
		  v.classList.add('active');
		} else {
		  v.classList.remove('active');
		}
	  });
	}

	function clearActiveButtons() {
		lyricsBtn.classList.remove('active');
		queueBtn.classList.remove('active');
	}

	lyricsBtn.addEventListener('click', () => {
		if (lyricsView.classList.contains('active')) {
			showView(classicView);
			lyricsBtn.classList.remove('active');
		} else {
			showView(lyricsView);
			lyricsBtn.classList.add('active');
			queueBtn.classList.remove('active');
		}
		

		console.log("currentMusicTitle:", currentMusicTitle);

		if (currentMusicTitle && lyricsDatabase[currentMusicTitle]) {
            lyricsTitle.textContent = `Paroles de "${currentMusicTitle}"`;
            console.log("Lyrics found:", lyricsDatabase[currentMusicTitle]);
            lyricsText.innerHTML = lyricsDatabase[currentMusicTitle];
        } else {
            lyricsTitle.textContent = "Paroles indisponibles";
            lyricsText.textContent = "Les paroles de cette musique ne sont pas disponibles.";
            console.log("No lyrics found.");
        }
	});

	queueBtn.addEventListener('click', () => {
	  const isActive = queueView.classList.contains('active');

	  if (isActive) {
		showView(classicView);
		queueBtn.classList.remove('active');
	  } else {
		showView(queueView);
		queueBtn.classList.add('active');
		lyricsBtn.classList.remove('active');
		
		updateQueueList();
		}
	});
	
	function updateQueueList() {
		const queueList = document.getElementById('queueList');
		queueList.innerHTML = "";

		if (currentSequentialIndex === -1 || !sequentialPlayList.length) {
			const li = document.createElement('li');
			li.textContent = "Aucune musique à suivre.";
			queueList.appendChild(li);
			return;
		}

		const startIndex = Math.max(currentSequentialIndex - 1, 0);

		for (let i = startIndex; i < sequentialPlayList.length; i++) {
			const item = sequentialPlayList[i];
			const title = item.getAttribute('data-title') || "Titre inconnu";
			const artist = item.getAttribute('data-artist') || "Artiste inconnu";

			const li = document.createElement('li');
			li.textContent = `${title} — ${artist}`;
			if (i === currentSequentialIndex) {
				li.classList.add('current-track');
			}
			if (i === currentSequentialIndex - 1) {
				li.classList.add('previous-track');
			}
			queueList.appendChild(li);
		}
	}


	// Base de données de paroles
	const lyricsDatabase = {
		"Hymne du Holy-Reich": "<strong>Couplet 1 :</strong><br>Vers les cieux se dresse notre bannière,<br>Sous le regard des anges, nous marchons fiers.<br>Holy-Reich, notre empire sacré,<br>À jamais fort, jamais brisé.<br><br><strong>Refrain :</strong><br>Holy-Reich, terre de lumière,<br>Gloire et honneur à nos vaillants guerriers.<br>Sous ta protection, nous sommes unis,<br>Pour la justice, pour la paix, nous combattons sans répit.<br><br><strong>Couplet 2 :</strong><br>Au loin s'élèvent les ombres de Haremcia,<br>Avec leurs démons, ils sèment l'anarchie.<br>Mais nous, soldats de la foi, indomptables,<br>Repousserons les ténèbres, notre cause est implacable.<br><br><strong>[Refrain]</strong><br><br><strong>Couplet 3 :</strong><br>Dans la lumière, notre guide éclatant,<br>La vérité triomphe, jamais hésitant.<br>Nos cœurs battent d'un même élan glorieux,<br>Pour notre empire, pour nos cieux lumineux.<br><br><strong>[Refrain]</strong><br><br><strong>Couplet 4 :</strong><br>Que le tonnerre résonne, que le soleil brille,<br>Dans chaque bataille, notre courage scintille.<br>Holy-Reich, empire béni, notre foyer,<br>Nous marcherons toujours pour toi, sous les feux des éclats d'acier.<br><br><strong>[Refrain]</strong><br><br><strong>Couplet 5 :</strong><br>Nos ennemis tremblent face à notre foi,<br>Car dans nos âmes, l’espoir jamais ne ploie.<br>Holy-Reich, toi l'éternelle clarté,<br>À jamais victorieux, notre serment est scellé.<br><br><strong>[Refrain]</strong>",
		"L'alliance divine": "<strong>Verset 1 :</strong><br>Sous le ciel d’ébène, où les étoiles s’effacent,<br>L’Empereur s’avance, dans le désert sans trace.<br>Le Sultanat d'or, jadis brillant trésor,<br>N'est plus que cendre, sous le souffle du sort.<br><br><strong>Refrain :</strong><br>Ô Harpie céleste, toi la vengeance incarnée,<br>Aux ailes de tempête, aux serres acérées,<br>Dans la nuit des flammes, nos destins se sont liés,<br>Désormais ton serment, à jamais gravé.<br><br><strong>Verset 2 :</strong><br>Les dunes se lèvent, murmures d’un temps passé,<br>Les âmes des perdus, dans le vent se sont mêlées.<br>Mais de ces cendres froides, émergea la clarté,<br>Une Harpie divine, de fureur animée.<br><br><strong>Pont :</strong><br>Tu as vu les ruines, ce que l’homme peut briser,<br>Et dans ton cœur brûlant, une flamme s’est dressée.<br>« Jurerais-je fidélité, à celui qui m'a vu naître,<br>Ou plutôt à cet Empereur, dont l’âme est prête ? »<br><br><strong>[Refrain]</strong><br><br><strong>Verset 3 :</strong><br>Ensemble, nous avons bâti un empire de foi,<br>Un bastion divin, sur ce continent sans loi.<br>L’Empereur et la Harpie, unis dans la clarté,<br>Portant la lumière, là où règne l’obscurité.<br><br><strong>Coda :</strong><br>Les cieux nous contemplent, le serment est scellé,<br>L’Empereur et la Harpie, à jamais enlacés.<br>Sur les terres ravagées, une nouvelle ère est née,<br>L’alliance immortelle, (où) la justice est sacrée.<br><br><strong>[Refrain]</strong><br><br><strong>Outro :</strong><br>Sous les voûtes d’azur, notre empire grandit,<br>L’Empereur et la Harpie, gardiens de l’infini.",
		"Hymne de New-Ark": "<strong>Couplet 1 :</strong><br>Au milieu des dunes et des tempêtes,<br>New Ark se dresse, en ordre parfait.<br>Sous le soleil brûlant, nos armes levées,<br>Dans ce désert, notre puissance forgée.<br><br><strong>Refrain :</strong><br>New Ark, notre bastion,<br>Unis sous le ciel de la nation.<br>Guidés par la Leader Suprême,<br>Nous sommes les flammes, l'élite suprême.<br><br><strong>Couplet 2 :</strong><br>Des nomades et brigands, soldats de fer,<br>Pour conquérir, pour un nouvel ère.<br>Dans les sables mouvants, notre discipline,<br>Est une forteresse, notre ligne de front ultime.<br><br><strong>[Refrain]</strong><br><br><strong>Pont :</strong><br>Quand l'espoir semble s'éteindre,<br>Nos cœurs continuent de se joindre.<br>Dans chaque battement, dans chaque marche,<br>La force de New Ark se déclare.<br><br><strong>[Refrain]</strong><br><br><strong>Outro :</strong><br>Pour chaque grain de sable, chaque combat,<br>Nous marchons ensemble, droit et sans trêve.<br>New Ark brille, en ordre et en force,<br>Sous la bannière de notre emblème.",
		"Les échos de Melynas": "<strong>Couplet 1 :</strong><br>Dans les brumes du grand lac,<br>Où dansent les feux follets,<br>Sous le ciel de Melynas,<br>Nos chants jamais ne cesseront.<br>Du narval nous fêtons la course,<br>Le temps des récoltes est venu,<br>Avec nos mains qui forgent la terre,<br>Nous bâtirons un avenir fort.<br><br><strong>Refrain :</strong><br>Mais l'hermine court encore,<br>Sur les terres de Melynas,<br>Le vent portera nos efforts,<br>Et nos cœurs, jamais las.<br><br><strong>Couplet 2 :</strong><br>Là-bas, aux frontières lointaines,<br>Les ombres de l’ennemi grandissent,<br>Mais ici, nos foyers s’embrasent,<br>De courage, que rien ne ternisse.<br>Pour chaque pierre que l'on soulève,<br>C'est notre honneur qui se dresse,<br>Face aux vents qui menacent nos rêves,<br>Nous serons l'arme et la promesse.<br><br><strong>[Refrain]</strong><br><br><strong>Couplet 3 :</strong><br>Qu'importe les orages qui grondent,<br>Sur la lisière de nos champs,<br>Ici se lèvent nos frères et sœurs,<br>Gardant vivants nos vieux chants.<br>Par nos traditions, nos fêtes, nos mains,<br>Melynas restera debout,<br>Et s’il le faut, sur ces chemins,<br>Nous défendrons tout ce qui est nous.<br><br><strong>[Refrain]</strong><br><br><strong>Couplet 4 :</strong><br>Lorsque l’appel résonnera,<br>Pour protéger notre héritage,<br>Nous serons mille, nous serons là,<br>Fiers de notre enracinage.<br>Dans chaque souffle et chaque cri,<br>S'élève l'âme de nos montagnes,<br>Et si l'ennemi venait ici,<br>Nous serons l'épée, le bouclier, la flamme.<br><br><strong>[Refrain]</strong>",
		"Hymne du GWE": "<strong>Couplet I :</strong><br>Sous les fastes du ciel boréal,<br>Là où l’écume embrasse la pierre,<br>Se dresse, auguste et sans égale,<br>Notre Empire, dans son mystère.<br>Point ne quérons la main d’autrui,<br>Car tout honneur nous vient du sol,<br>Et c’est la paix, d’airain vêtue,<br>Que nous tissons, loin des paroles.<br><br><strong>Refrain :</strong><br>Ô Bastille, gardienne fière,<br>Toi qui trônes aux vents altiers,<br>Chante encore, vaste lumière,<br>L’âme close de nos sentiers.<br>Par le roc et par le silence,<br>Le G.W.E. (G d'vé E) forge sa défense.<br><br><strong>Couplet II :</strong><br>Nos monts veillent, drapés d’orgueil,<br>Et les forêts, d’un pas feutré,<br>Murmurent l’antique accueil<br>Des cœurs paisibles et sacrés.<br>De l’émeraude aux veines du cuivre,<br>Chaque éclat scelle notre loi :<br>Nul ne saura nous faire vivre<br>Sous d’autres cieux, d’autres toits.<br><br><strong>[Refrain]</strong><br><br><strong>Pont :</strong><br>Nous n’ouvrons point nos portes d’or,<br>Mais nul ne franchit nos frontières ;<br>Ce que l’on croit désert dehors<br>Est flamme au cœur de nos pierres.<br><br><strong>Refrain final :</strong><br>Ô Bastille, flamme éternelle,<br>Tu nous lies à l’horizon,<br>Ton nom sonne, doux rituel,<br>À l’aube, au soir, à l’unisson.<br>Sous ton regard, rien ne chancelle :<br>Great West Empire, noble bastion.",
		"Hymne du Sultanat de poussière d'or": "<strong>Couplet 1 :</strong><br>Sous le ciel brûlant, nos champs s’éveillent,<br>Le fer et l’or brillent au soleil.<br>Les voix s’élèvent, un peuple chante,<br>Fidèle au Sultan, la terre est vivante !<br><br><strong>Refrain :</strong><br>Ô Poussière d’or, lumière éternelle,<br>Comme les lucioles, ton feu nous appelle.<br>De l’aube au désert, ton nom résonnera,<br>Sultanat bien-aimé, jamais tu ne plieras !<br><br><strong>Couplet 2 :</strong><br>Des fleuves fertiles aux vents du couchant,<br>Ta gloire prospère depuis mille ans.<br>Religions unies, savoirs partagés,<br>Ton peuple avance sans jamais plier.<br><br><strong>[Refrain]</strong><br><br><strong>Pont :</strong><br>Danse, ô poussière, danse dans nos veines,<br>Chante, ô Sultanat, efface nos peines !<br>Les étoiles veillent, la nuit nous bénit,<br>Ton nom rayonne au cœur de l’infini.<br><br><strong>Refrain final :</strong><br>Ô Poussière d’or, lumière éternelle,<br>Comme les lucioles, ton feu nous appelle.<br>De l’aube au désert, ton nom résonnera,<br>Sultanat glorieux, jamais tu ne plieras !<br>",
		"Où vais-je ?": "<strong>Couplet 1 :</strong><br>Je marche dans des rues sans nom<br>Les lampadaires brillent, mais je vois pas l’horizon<br>Des papiers, des chiffres, des voix qui m’ignorent<br>Des regards pressés qui fuient quand je m’endors<br><br><strong>Couplet 2 :</strong><br>On me parle d’avenir, de chemin tout tracé<br>Mais j’vois que des murs et des portes fermées<br>On m’a dit “avance”, sans me tendre la main<br>On m’a laissé là, au bord du matin<br><br><strong>Pré-refrain :</strong><br>Et j’ai crié, sans que personne n’écoute<br>Dans ce silence, j’ai perdu la route<br><br><strong>Refrain :</strong><br>Où vais-je, si personne ne me voit ?<br>Si même la lumière oublie ma voix ?<br>Je veux des bras, pas des formulaires<br>Des cœurs ouverts, pas des commentaires<br><br><strong>Pont :</strong><br>Ils parlent de moi comme d’un dossier à gérer<br>Mais jamais d’amour, jamais de vérité<br><br><strong>Pont :</strong><br>Et pendant qu’ils signent, moi j’oublie qui je suis<br>Une enfant, une âme, qu’on abandonne ici<br><br><strong>Refrain final :</strong><br>Où vais-je, si personne ne m’attend ?<br>Si les adultes dorment en ignorant le vent ?<br>Je suis là, je vis, je ressens encore<br>Mais le monde moderne oublie mon corps<br><br><strong>Outro :</strong><br>Alors j’écris sur les murs de ma nuit<br>Pour que demain, on m’écoute… aussi",
		"Au Travers des Vitres": "<strong>Couplet 1 :</strong><br>Je marche le soir dans les quartiers dorés<br>Les lampes scintillent comme des contes oubliés<br>Les pavés brillent sous mes pas hésitants<br>Et les vitres me renvoient d'autres temps<br><br><strong>Couplet 2 :</strong><br>Des carrosses modernes roulent sans bruit<br>Des rires montent d’un balcon ébloui<br>Je m’arrête un instant, je ferme les yeux<br>Et j’entre dans un monde somptueux<br><br><strong>Pré-refrain :</strong><br>Robe de soie, parfum d’élite<br>Je glisse parmi les gens qui m’évitent<br><br><strong>Refrain :</strong><br>À travers les vitres, je vis mes envies<br>J’habite les marbres, je respire la nuit<br>Les lustres s’allument, les violons m’invitent<br>À danser, même si ce n’est qu’un mythe<br><br><strong>Pont :</strong><br>Un opéra, des gants en dentelle<br>Un regard croisé sous les ombrelles<br><br><strong>Pont :</strong><br>Un bal masqué, des secrets murmurés<br>Dans les couloirs d’un palais enchanté<br><br><strong>Refrain final :</strong><br>À travers les vitres, je touche un ailleurs<br>Un monde fragile, un monde de splendeur<br>Je n’y suis pas, mais je le respire<br>Et dans ma marche… je le fais vivre<br><br><strong>Outro : (X2)</strong><br>Et quand je repars, seule dans la nuit<br>Les rêves me suivent, discrets, sans bruit",
		"Feux dans le Sud": "<strong>Intro :</strong><br>Vous avez souillé nos lignées,<br>Semé vos poisons dans nos veines,<br>Érigé des lois contre nos reflets,<br>Alors maintenant, voilà la peine.<br><br><strong>Couplet 1 :</strong><br>Les prêches grondent, les tambours battent,<br>Sous les croix, les chaînes éclatent.<br>On n’a pas fait le voyage en vain,<br>Nos cœurs battent au nom des siens.<br>Ils disaient que nos yeux mentent,<br>Que notre sang n’a pas de sainteté,<br>Mais leurs lois n'ont qu'une sentence :<br>L’oubli pour ceux qu’ils ont chassés.<br><br><strong>Refrain :</strong><br>Ordre et Flamme, fureur des justes,<br>Rien ne reste, que cendres et bustes.<br>Frappez fort, frappez droit, sans peur,<br>Qu’ils sentent enfin notre fureur.<br><br><strong>Couplet 2 :</strong><br>Des temples renversés, des prières en silence,<br>Nous avons vu l’ombre et ses danses.<br>Mais pour un seul regard effacé,<br>Nous avons promis de rester levés.<br><br><strong>Pont :</strong><br>Des murs peints de slogans traîtres,<br>Des écoles aux enfants niés,<br>Ils ont brûlé nos icônes,<br>Alors on brûlera leurs cités.<br><br><strong>Refrain final :</strong><br>Ordre et Flamme, rage sacrée,<br>On ne part qu’une fois la honte lavée.<br>Battez, brisez, purifiez !<br>Qu’ils s’agenouillent ou disparaissent.<br><br><strong>Outro :</strong><br>Vous avez déclaré la guerre,<br>Nous, on vient la finir.",
		"La Septième Marche": "<strong>Intro :</strong><br>Ils croyaient le monde acquis,<br>Ils ont oublié les flammes.<br>Qu’ils lèvent les yeux, nous sommes revenus.<br>Et cette fois, rien ne survivra.<br><br><strong>Couplet 1 :</strong><br>Le Pacte d’Airain n’est plus qu’un souvenir,<br>L'est se dresse, ivre de colère.<br>Ils ont vendu l’âme de leurs empires<br>Aux succubes masquées de lumière.<br><br>Ils invoquent les noms d’en bas,<br>Font commerce avec les déviants et les rois.<br>Mais la Sainte Loi ne pardonne pas —<br>Nous sommes les juges, les croix et les crocs.<br><br><strong>Refrain :</strong><br>Marche Septième, feu du ciel,<br>Qu’ils brûlent tous dans leur fiel.<br>Qu’aucun pactisant ne reste en vie,<br>La Sainte Épée bénit notre folie.<br><br><strong>Pont :</strong><br>Nous irons jusqu’à leurs trônes d’obsidienne.<br>Nous pulvériserons leurs temples fangeux.<br>Nous planterons nos bannières sur leurs ruines,<br>Et sanctifierons la terre par le feu.<br><br><strong>Couplet 2 :</strong><br>Des croisés d'acier, nés du fer,<br>De l'ordre pur, du sang légitime.<br>Le vieux monde revient pour tout refaire,<br>Et sur les cendres… bâtir l’abîme.<br><br><strong>Refrain final :</strong><br>Septième Marche, fin des mensonges,<br>Feux sacrés que le ciel prolonge !<br>Frappez ! Chantez ! Détruisez !<br>Car nous sommes les élus, les derniers.<br><br><strong>Outro :</strong><br>Saint est le feu… Saint est le fer…<br>Saint est le feu… Saint est le fer…",
		"La couronne d'Alita": "<strong>Intro :</strong><br>Dans une grotte sombre, une couronne dormait,<br>Les dieux s’ennuyaient… et décidèrent d’rire un peu !<br><br><strong>Couplet 1 :</strong><br>Ils étaient trois, sans gloire ni fortune,<br>Perdus au matin, mais guidés par la lune.<br>Un caillou brillant, et tout bascula…<br>C’était pas un caillou, mais la couronne d’Alita !<br><br><strong>Refrain :</strong><br>Ôh, le destin, ça pique et ça mord,<br>Les dieux lancent les dés, et rigolent encore !<br>Holy-Reich, montagnes et combats,<br>Tout commence ici : la couronne d’Alita !<br><br><strong>Couplet 2 :</strong><br>À travers les plaines, les rivières, les bois,<br>Ils trébuchent cent fois, mais avancent quand même, crois-moi.<br>Un indice sacré, gravé dans un fromage,<br>Voilà l’héritage, d’un antique lignage !<br><br><strong>[Refrain]</strong><br><br><strong>Pont dramatique :</strong><br>Un dragon en carton, une prophétie bancale,<br>Un dieu maladroit qui se trompe de finale !<br>Mais qu’importe l’erreur, la route est tracée,<br>Leurs pas maladroits feront tout basculer !<br><br><strong>Refrain final :</strong><br>Ôh, le destin, ça pique et ça mord,<br>Les dieux lancent les dés, et rigolent encore !<br>Holy-Reich, montagnes et combats,<br>Chantons tous ensemble : la couronne d’Alita !<br><br><strong>Outro :</strong><br>Trois gamins, un royaume, et personne n’y croit…<br>Mais c’est eux qui portent… la couronne d’Alita !",
	};
});