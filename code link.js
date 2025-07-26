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


document.addEventListener('DOMContentLoaded', () => {
  const accordButtons = document.querySelectorAll('.accord-btn');

  accordButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      event.preventDefault();

      const targetId = button.dataset.target;
      const box = document.getElementById(targetId);

      if (!box) {
        console.warn(`Aucune boîte trouvée pour l'ID : ${targetId}`);
        return;
      }

      // Fermer toutes les autres boîtes sauf celle ciblée
      document.querySelectorAll('.accords-box.visible').forEach(openBox => {
        if (openBox !== box) {
          openBox.classList.remove('visible');
          openBox.classList.add('hidden');
        }
      });

      // Toggle visibilité de la boîte cible
      if (box.classList.contains('hidden') || !box.classList.contains('visible')) {
        box.classList.remove('hidden');
        box.classList.add('visible');

        // Positionner la boîte centrée au niveau du bouton cliqué
        const rect = button.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

        box.style.top = (rect.top + scrollTop - box.offsetHeight - 10) + 'px';
        box.style.left = (rect.left + scrollLeft + rect.width / 2 - box.offsetWidth / 2) + 'px';

      } else {
        box.classList.remove('visible');
        box.classList.add('hidden');
      }
    });
  });

  // Clic en dehors pour fermer toutes les boîtes ouvertes
  document.addEventListener('click', (e) => {
    // Si on ne clique pas sur un bouton ou une boîte
    if (!e.target.closest('.accord-btn') && !e.target.closest('.accords-box')) {
      document.querySelectorAll('.accords-box.visible').forEach(box => {
        box.classList.remove('visible');
        box.classList.add('hidden');
      });
    }
  });
});