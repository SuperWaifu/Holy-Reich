 function lore(element) {
	var modal = document.querySelector(".lore");
	var captionText = document.querySelector("#lore-caption");
		modal.style.display = "flex";
		captionText.innerHTML = element.querySelector("h4").innerHTML;
}


function closelore() {
	document.querySelector(".lore").style.display = "none";
}

document.addEventListener("keydown", handleKeyDown);

function openModal(img) {
	var modal = document.querySelector(".modal");
	var modalImg = document.querySelector("#modal-img");
	var captionText = document.querySelector("#modal-caption");
	modal.style.display = "flex";
	document.body.style.overflow = 'hidden';
	modalImg.src = img.src;
	captionText.innerHTML = img.nextElementSibling.innerHTML;
	
	// Store the parent container of the clicked image
	var imageContainer = img.parentNode.parentNode;
	// Store all the images and captions within the same container
	images = Array.from(imageContainer.querySelectorAll("img"));
	captions = Array.from(imageContainer.querySelectorAll("figcaption"));
	
	// Find the index of the clicked image
	currentIndex = images.indexOf(img);
}

function showCaption(element) {
	var h6Text = element.querySelector("h6").innerHTML;
	var modalDetails = document.querySelector(".modal-details");
	var existingDetails = modalDetails.innerHTML;

	var paragraph = "<h7>" + h6Text + "</h7>";

	if (existingDetails.includes(paragraph)) {
    // Le texte est déjà présent, le supprimer
    modalDetails.innerHTML = existingDetails.replace(paragraph, '');
	} else {
    // Le texte n'est pas présent, l'ajouter
    modalDetails.innerHTML = existingDetails + paragraph;
	}
}

function handleKeyDown(event) {
	if (event.key === "ArrowLeft") {
		prevImage();
	} else if (event.key === "ArrowRight") {
		nextImage();
	} else if (event.key === "Escape") {
		closeModal();
		closelore();
		closeSong();
	}
}

function prevImage() {
	var prevIndex = (currentIndex - 1 + images.length) % images.length;
	while (images[prevIndex].parentNode.parentNode !== images[currentIndex].parentNode.parentNode) {
		prevIndex = (prevIndex - 1 + images.length) % images.length;
	}
	currentIndex = prevIndex;
	showImage(currentIndex);
}

function nextImage() {
	var nextIndex = (currentIndex + 1) % images.length;
	while (images[nextIndex].parentNode.parentNode !== images[currentIndex].parentNode.parentNode) {
		nextIndex = (nextIndex + 1) % images.length;
	}
	currentIndex = nextIndex;
	showImage(currentIndex);
}

function showImage(index) {
  var modalImg = document.querySelector("#modal-img");
  var modalDetails = document.querySelector(".modal-details");
  var captionText = document.querySelector("#modal-caption");
  
  // Réinitialiser les détails
  modalDetails.innerHTML = "";

  modalImg.src = images[index].src;
  captionText.innerHTML = captions[index].innerHTML;
}

function closeModal() {
	document.querySelector(".modal").style.display = "none";
	document.body.style.overflow = 'auto';
}


document.addEventListener('DOMContentLoaded', function() {
    const audioPlayers = document.querySelectorAll('.audio-player');
    const playButtons = document.querySelectorAll('.play-button');
    const pauseButtons = document.querySelectorAll('.pause-button');
    const stopButtons = document.querySelectorAll('.stop-button');
    const progressBars = document.querySelectorAll('.progress-bar');
    const volumeSliders = document.querySelectorAll('.volume-slider');
    const timestamps = document.querySelectorAll('.timestamp');
  
    // Play function
    function playAudio(index) {
      audioPlayers[index].play();
    }
  
    // Pause function
    function pauseAudio(index) {
      audioPlayers[index].pause();
    }
  
    // Stop function
    function stopAudio(index) {
      audioPlayers[index].pause();
      audioPlayers[index].currentTime = 0;
    }
  
    // Volume slider function
    function setVolume(index, volume) {
      audioPlayers[index].volume = volume;
    }
  
    // Update progress bar function
    function updateProgressBar(index) {
      const progress = (audioPlayers[index].currentTime / audioPlayers[index].duration) * 100;
      progressBars[index].style.width = `${progress}%`;
  
      // Update timestamp
      const currentMinutes = Math.floor(audioPlayers[index].currentTime / 60);
      const currentSeconds = Math.floor(audioPlayers[index].currentTime % 60);
      const durationMinutes = Math.floor(audioPlayers[index].duration / 60);
      const durationSeconds = Math.floor(audioPlayers[index].duration % 60);
  
      timestamps[index].textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds} / ${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`;
    }
  
    // Event listeners for each player
    playButtons.forEach((button, index) => {
      button.addEventListener('click', () => playAudio(index));
    });
  
    pauseButtons.forEach((button, index) => {
      button.addEventListener('click', () => pauseAudio(index));
    });
  
    stopButtons.forEach((button, index) => {
      button.addEventListener('click', () => stopAudio(index));
    });
  
    volumeSliders.forEach((slider, index) => {
      slider.addEventListener('input', () => setVolume(index, slider.value));
    });
  
    audioPlayers.forEach((player, index) => {
      player.addEventListener('timeupdate', () => updateProgressBar(index));
    });
  });

document.addEventListener('DOMContentLoaded', function() {  
    var textedelettres = document.querySelectorAll('.textedelettre');
    var lettres = document.querySelectorAll('.lettre');

    textedelettres.forEach(function(text, index) {
        text.addEventListener('click', function() {
            var lettre = lettres[index];
            if (lettre.classList.contains('cache')) {
                lettre.classList.remove('cache');
            } else {
                lettre.classList.add('cache');
            }
        });
    });
});