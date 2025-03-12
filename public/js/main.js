document.addEventListener('DOMContentLoaded', function() {
    // Initialisation du score depuis le localStorage
    let score = parseInt(localStorage.getItem('ctfScore')) || 0;
    let completedChallenges = JSON.parse(localStorage.getItem('completedChallenges')) || [];
    
    // Éléments du DOM
    const scoreDisplay = document.getElementById('currentScore');
    const scoreProgress = document.getElementById('scoreProgress');
    const resetButton = document.getElementById('resetScore');
    const completedList = document.getElementById('completedChallenges');
    
    // Configuration des challenges
    const challenges = {
        1: { points: 50, name: 'Cryptographie' },
        2: { points: 50, name: 'Stéganographie' },
        3: { points: 75, name: 'Web' },
        4: { points: 75, name: 'Réseau' },
        5: { points: 50, name: 'SQL' },
        6: { points: 75, name: 'Système' }
    };
    
    const totalPossibleScore = 375; // Total des points possibles

    // Fonction pour mettre à jour l'affichage
    function updateScoreDisplay() {
        scoreDisplay.textContent = score;
        const percentage = (score / totalPossibleScore) * 100;
        scoreProgress.style.width = `${percentage}%`;
        
        // Mise à jour de la liste des challenges complétés
        completedList.innerHTML = completedChallenges
            .map(id => `
                <div class="completed-challenge">
                    <span class="challenge-name">${challenges[id].name}</span>
                    <span class="challenge-points">+${challenges[id].points}</span>
                </div>
            `).join('');
    }

    // Réinitialisation du score
    resetButton.addEventListener('click', function() {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser votre score ?')) {
            score = 0;
            completedChallenges = [];
            localStorage.setItem('ctfScore', score);
            localStorage.setItem('completedChallenges', JSON.stringify(completedChallenges));
            updateScoreDisplay();
        }
    });

    // Gestion de la validation des flags
    const flagForms = document.querySelectorAll('form[data-challenge-id]');
    flagForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const challengeId = form.getAttribute('data-challenge-id');
            
            if (!completedChallenges.includes(challengeId)) {
                // Vérification du flag via l'API
                try {
                    const response = await fetch('/api/verify', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            challengeId: challengeId,
                            flag: form.querySelector('input[type="text"]').value
                        })
                    });

                    const data = await response.json();
                    
                    if (data.success) {
                        score += challenges[challengeId].points;
                        completedChallenges.push(challengeId);
                        localStorage.setItem('ctfScore', score);
                        localStorage.setItem('completedChallenges', JSON.stringify(completedChallenges));
                        updateScoreDisplay();
                    }
                } catch (error) {
                    console.error('Erreur:', error);
                }
            }
        });
    });

    // Initialisation de l'affichage
    updateScoreDisplay();

    // Animation pour les cartes au chargement
    const cards = document.querySelectorAll('.challenge-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });

    // Ajouter la fonction pour réinitialiser tous les scores et pénalités
    function resetAllScores() {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les scores ? Cette action est irréversible.')) {
            // Réinitialiser le score global
            localStorage.setItem('ctfScore', '0');
            
            // Réinitialiser les scores et états de chaque challenge
            for (let i = 1; i <= 6; i++) {
                localStorage.removeItem(`challenge${i}Score`);
                localStorage.removeItem(`usedHints${i}`);
            }

            // Mettre à jour l'affichage du score
            const scoreDisplay = document.getElementById('currentScore');
            const progressBar = document.getElementById('scoreProgress');
            if (scoreDisplay) scoreDisplay.textContent = '0';
            if (progressBar) progressBar.style.width = '0%';

            // Réinitialiser les challenges complétés
            const completedChallenges = document.getElementById('completedChallenges');
            if (completedChallenges) {
                completedChallenges.innerHTML = '';
            }

            showNotification(
                'success',
                'Réinitialisation effectuée',
                'Tous les scores et pénalités ont été réinitialisés.',
                3000
            );

            // Recharger la page pour mettre à jour tous les éléments
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }
    }

    // Ajouter l'écouteur d'événement pour le bouton de réinitialisation
    if (resetButton) {
        resetButton.addEventListener('click', resetAllScores);
    }

    // Fonction de notification (si pas déjà présente)
    function showNotification(type, title, message, duration = 5000) {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `custom-notification notification-${type}`;
        
        let icon = '';
        switch(type) {
            case 'warning': icon = 'fa-exclamation-triangle'; break;
            case 'success': icon = 'fa-check-circle'; break;
            case 'error': icon = 'fa-times-circle'; break;
        }

        notification.innerHTML = `
            <i class="fas ${icon} notification-icon"></i>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(notification);

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        });

        if (duration) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.style.animation = 'slideOut 0.3s ease forwards';
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);
        }
    }
}); 