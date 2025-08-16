document.addEventListener('DOMContentLoaded', () => {

    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    document.body.appendChild(overlay);

    document.querySelectorAll('.enveloppe-dossier').forEach(env => {
        env.addEventListener('click', () => {
            let targetId = env.dataset.dossier;
            let contenu = document.getElementById('dossier' + targetId);

            let son = new Audio('Musiques/Bruitage/grande feuille.mp3');
            son.play();

            contenu.classList.toggle('cache');
        });
    });

    document.querySelectorAll('.carte').forEach(carte => {
		carte.addEventListener('click', () => {
			// Cloner la carte
			const clone = carte.cloneNode(true);
			clone.classList.add('active');

			// Ajouter l'overlay si pas déjà présent
			let overlay = document.querySelector('.overlay');
			if(!overlay){
				overlay = document.createElement('div');
				overlay.className = 'overlay visible';
				document.body.appendChild(overlay);
			} else {
				overlay.classList.add('visible');
			}

			// Ajouter le clone dans l'overlay
			overlay.innerHTML = '';
			overlay.appendChild(clone);

			// Cliquer sur overlay pour fermer
			overlay.addEventListener('click', () => {
				overlay.classList.remove('visible');
				overlay.innerHTML = '';
			}, { once: true });
			let son = new Audio('Musiques/Bruitage/petite feuille.mp3');
            son.play();
		});
	});
	
	
	document.querySelectorAll('.tableau-image').forEach(img => {
		img.addEventListener('click', () => {
			img.classList.add('active');
			document.querySelector('.overlay').classList.add('visible');
			let son = new Audio('Musiques/Bruitage/objet.mp3');
            son.play();
		});
	});

	document.querySelector('.overlay').addEventListener('click', () => {
		document.querySelectorAll('.tableau-image.active').forEach(img => {
			img.classList.remove('active');
		});
		document.querySelector('.overlay').classList.remove('visible');
	});

});


