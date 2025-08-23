document.addEventListener('DOMContentLoaded', () => {
	
  const video = document.getElementById("introVideo");
  const overlay = document.getElementById("overlay");
  const sound = document.getElementById("introSound");
  const mainContent = document.getElementById("mainContent");

  video.addEventListener("click", () => {
    // Faire disparaître la vidéo
    video.classList.add("hidden");
	console.log("Lancement de l’animation et du son");

    // Jouer le son avec fade in/out
    sound.volume = 0;
    sound.play();
	console.log("Son d’intro lancé");
	
    let fadeIn = setInterval(() => {
      if (sound.volume < 0.9) {
        sound.volume += 0.1;
      } else {
        clearInterval(fadeIn);
        setTimeout(() => {
          let fadeOut = setInterval(() => {
            if (sound.volume > 0.1) {
              sound.volume -= 0.1;
            } else {
              sound.volume = 0;
              clearInterval(fadeOut);
			  console.log("Son intro terminé");
            }
          }, 200);
        }, 6000);
      }
    }, 200);

    // Lancer l'overlay
    overlay.classList.add("active");
	console.log("Animation démarrée");

    // Quand l’overlay se termine → afficher le contenu principal
    setTimeout(() => {
	  document.body.classList.add('unlocked');
      overlay.classList.remove("active");
	  overlay.style.display = "none";
      mainContent.classList.add("show");
	  console.log("Animation terminée");
	  video.parentElement.classList.add("hidden");
    }, 10000); // durée totale animation
  });

});



window.addEventListener('click', e => {
  let topEl = document.elementFromPoint(e.clientX, e.clientY);
  console.log("Clic détecté sur:", e.target, " → élément au-dessus:", topEl);
});