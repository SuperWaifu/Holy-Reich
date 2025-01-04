document.addEventListener('DOMContentLoaded', () => {
    const prevention = document.getElementById('prevention-modal');
    const continueBtn = document.getElementById('continue-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    let currentLink = null;

    // Ajout d'un gestionnaire d'événements sur les liens externes
    document.querySelectorAll('.external-link').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Empêche la navigation immédiate
            currentLink = link.href; // Stocke l'URL du lien
            prevention.classList.remove('hidden'); // Affiche le modal
        });
    });

    // Bouton "Continuer"
    continueBtn.addEventListener('click', () => {
        prevention.classList.add('hidden'); // Cache le modal
        if (currentLink) {
            window.location.href = currentLink; // Redirige vers l'URL
        }
    });

    // Bouton "Annuler"
    cancelBtn.addEventListener('click', () => {
        prevention.classList.add('hidden'); // Cache le modal
        currentLink = null; // Réinitialise l'URL
    });
});