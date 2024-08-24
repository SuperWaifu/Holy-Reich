// Fonction pour démarrer le fondu et rediriger ensuite
    function fadeOutAndRedirect(url) {
        const body = document.querySelector('body');
        body.classList.add('fade');
        setTimeout(function () {
            window.location.href = url;
        }, 1000); // La durée ici doit correspondre à la durée de la transition CSS
    }