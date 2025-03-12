let usedHints = new Set();
let initialScore = 50; // Score initial du challenge
let currentChallengeScore = initialScore;
let finalChallengeScore = initialScore; // Score qui sera réellement ajouté
let hintCount = 0;
const totalHints = 4;

// Configuration des indices
const hints = {
    1: { cost: 0, icon: 'fa-unlock-alt' },
    2: { cost: 5, icon: 'fa-lock' },
    3: { cost: 10, icon: 'fa-lock' },
    4: { cost: 25, icon: 'fa-lock' }
};

// Fonction pour mettre à jour l'affichage des scores
function updateScoreDisplay() {
    const scoreInfo = document.getElementById('challenge-score-info');
    const hintCountDisplay = document.querySelector('.hint-count');
    const penaltyBar = document.getElementById('hintPenaltyBar');
    
    if (scoreInfo) {
        scoreInfo.innerHTML = `
            <div class="score-details">
                <p>Score initial: ${initialScore} points</p>
                <p class="penalty-text">Pénalités actuelles: -${initialScore - currentChallengeScore} points</p>
                <p class="final-score">Score actuel: ${currentChallengeScore} points</p>
            </div>
        `;
    }

    if (hintCountDisplay) {
        hintCountDisplay.textContent = `(${hintCount}/${totalHints} utilisés)`;
    }

    if (penaltyBar) {
        const percentage = (currentChallengeScore / initialScore) * 100;
        penaltyBar.style.width = `${percentage}%`;
        penaltyBar.style.transition = 'width 0.3s ease';
        
        if (percentage > 75) {
            penaltyBar.className = 'progress-bar bg-success';
        } else if (percentage > 50) {
            penaltyBar.className = 'progress-bar bg-warning';
        } else {
            penaltyBar.className = 'progress-bar bg-danger';
        }
    }
}

// Fonction pour afficher les notifications
function showNotification(type, title, message, duration = 5000, withConfirmation = false, confirmCallback = null) {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `custom-notification notification-${type}`;
    
    let icon = '';
    switch(type) {
        case 'warning': icon = 'fa-exclamation-triangle'; break;
        case 'success': icon = 'fa-check-circle'; break;
        case 'error': icon = 'fa-times-circle'; break;
        case 'info': icon = 'fa-info-circle'; break;
    }

    notification.innerHTML = `
        <i class="fas ${icon} notification-icon"></i>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        ${withConfirmation ? `
            <div class="notification-buttons">
                <button class="btn btn-sm btn-success confirm-action">Confirmer</button>
                <button class="btn btn-sm btn-danger cancel-action">Annuler</button>
            </div>
        ` : `
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `}
    `;

    container.appendChild(notification);

    if (withConfirmation) {
        const confirmBtn = notification.querySelector('.confirm-action');
        const cancelBtn = notification.querySelector('.cancel-action');

        confirmBtn.addEventListener('click', () => {
            notification.remove();
            if (confirmCallback) confirmCallback();
        });

        cancelBtn.addEventListener('click', () => {
            notification.remove();
        });
    } else {
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
}

// Fonction pour gérer l'ouverture des indices
function showHint(hintNumber) {
    const hintContent = document.getElementById(`hint${hintNumber}`);
    const hintButton = document.querySelector(`button[onclick="showHint(${hintNumber})"]`);
    
    if (!hintContent || !hintButton) return;

    const hintCost = hints[hintNumber].cost;

    // Si l'indice n'est pas encore déverrouillé
    if (!usedHints.has(hintNumber)) {
        // Pour l'indice gratuit
        if (hintCost === 0) {
            showNotification(
                'info',
                'Indice gratuit',
                'Cet indice est gratuit et n\'entraînera aucune pénalité.',
                3000
            );
            setTimeout(() => {
                unlockHint(hintNumber);
            }, 1000);
            return;
        }

        // Pour les indices payants
        const notification = document.createElement('div');
        notification.className = 'custom-notification notification-warning';
        notification.innerHTML = `
            <i class="fas fa-exclamation-triangle notification-icon"></i>
            <div class="notification-content">
                <div class="notification-title">Attention - Pénalité</div>
                <div class="notification-message">
                    L'utilisation de cet indice entraînera une pénalité de ${hintCost} points.<br>
                    Votre score actuel: ${currentChallengeScore} points
                </div>
                <div class="notification-buttons mt-2">
                    <button class="btn btn-sm btn-success confirm-hint">Confirmer</button>
                    <button class="btn btn-sm btn-danger cancel-hint">Annuler</button>
                </div>
            </div>
        `;

        document.getElementById('notification-container').appendChild(notification);

        notification.querySelector('.confirm-hint').addEventListener('click', () => {
            if (currentChallengeScore >= hintCost) {
                notification.remove();
                unlockHint(hintNumber);
                applyHintPenalty(hintNumber);
            } else {
                notification.remove();
                showNotification(
                    'error',
                    'Score insuffisant',
                    'Vous n\'avez pas assez de points pour débloquer cet indice.',
                    3000
                );
            }
        });

        notification.querySelector('.cancel-hint').addEventListener('click', () => {
            notification.remove();
        });
        return;
    }

    // Si l'indice est déjà déverrouillé, basculer son affichage
    if (hintContent.style.display === 'none') {
        hintContent.style.display = 'block';
    } else {
        hintContent.style.display = 'none';
    }
}

// Fonction pour déverrouiller un indice
function unlockHint(hintNumber) {
    const hintContent = document.getElementById(`hint${hintNumber}`);
    const hintButton = document.querySelector(`button[onclick="showHint(${hintNumber})"]`);
    
    if (!hintContent || !hintButton) return;

    // Afficher l'indice
    hintContent.style.display = 'block';
    hintContent.classList.remove('locked');
    
    // Cacher l'overlay
    const overlay = hintContent.querySelector('.hint-lock-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }

    // Mettre à jour l'icône
    const icon = hintButton.querySelector('.hint-icon');
    if (icon) {
        icon.classList.remove('fa-lock');
        icon.classList.add('fa-unlock');
    }

    // Ajouter à la liste des indices utilisés
    if (!usedHints.has(hintNumber)) {
        usedHints.add(hintNumber);
        hintCount++;
        updateScoreDisplay();
        updateHintProgressBar();
    }
}

// Fonction pour appliquer la pénalité
function applyHintPenalty(hintNumber) {
    const hintCost = hints[hintNumber].cost;
    
    // Appliquer la pénalité
    currentChallengeScore = Math.max(0, currentChallengeScore - hintCost);
    
    // Sauvegarder l'état
    localStorage.setItem('challenge1Score', currentChallengeScore);
    localStorage.setItem('usedHints1', JSON.stringify([...usedHints]));
    
    // Mettre à jour les affichages
    updateScoreDisplay();
    updateHintProgressBar();
    updatePenaltyDisplay();

    showNotification(
        'success',
        'Indice débloqué',
        `Indice déverrouillé avec succès. Pénalité appliquée: -${hintCost} points`,
        3000
    );
}

// Fonction pour vérifier le flag
function submitFlag(event) {
    event.preventDefault();
    const flagInput = document.getElementById('flagInput');
    // Nettoyer et formater le flag
    const userFlag = flagInput.value.trim().toUpperCase();
    const submittedFlag = userFlag.startsWith('FLAG{') ? userFlag : `FLAG{${userFlag}}`;
    const correctFlag = 'FLAG{CRYPTO_EASY}';

    const resultMessage = document.getElementById('result-message');

    // Vérifier si le flag est correct
    if (submittedFlag === correctFlag) {
        // Calculer le score final
        finalChallengeScore = currentChallengeScore;
        
        // Mettre à jour le score global
        let globalScore = parseInt(localStorage.getItem('ctfScore')) || 0;
        globalScore += finalChallengeScore;
        localStorage.setItem('ctfScore', globalScore);

        // Ajouter le challenge aux challenges complétés
        let completedChallenges = JSON.parse(localStorage.getItem('completedChallenges')) || [];
        if (!completedChallenges.includes('1')) {
            completedChallenges.push('1');
            localStorage.setItem('completedChallenges', JSON.stringify(completedChallenges));
        }

        resultMessage.innerHTML = `
            <div class="success-message">
                <h4>🎉 Félicitations !</h4>
                <p>Flag correct ! Vous avez gagné ${finalChallengeScore} points.</p>
                <div class="score-summary">
                    <p>Score initial: ${initialScore} points</p>
                    <p>Pénalités totales: -${initialScore - currentChallengeScore} points</p>
                    <p>Indices utilisés: ${hintCount}/${totalHints}</p>
                    <p class="final-score">Score final obtenu: ${finalChallengeScore} points</p>
                    <p>Score total: ${globalScore} points</p>
                </div>
                <div class="navigation-buttons mt-3">
                    <a href="/" class="btn btn-primary">
                        <i class="fas fa-home"></i> Retour à l'accueil
                    </a>
                    <a href="/challenge/2" class="btn btn-success">
                        <i class="fas fa-forward"></i> Challenge suivant
                    </a>
                </div>
            </div>
        `;

        // Mettre à jour le score sur la page d'accueil
        updateHomePageScore();

        // Désactiver le formulaire après la réussite
        flagInput.disabled = true;
        flagInput.form.querySelector('button[type="submit"]').disabled = true;

    } else {
        resultMessage.innerHTML = `
            <div class="error-message">
                <h4>❌ Incorrect</h4>
                <p>Ce n'est pas le bon flag. Réessayez !</p>
            </div>
        `;
        
        // Vider le champ de saisie
        flagInput.value = '';
        flagInput.focus();
    }
}

// Fonction pour mettre à jour le score sur la page d'accueil
function updateHomePageScore() {
    const globalScore = parseInt(localStorage.getItem('ctfScore')) || 0;
    const scoreDisplay = document.getElementById('currentScore');
    const progressBar = document.getElementById('scoreProgress');
    
    if (scoreDisplay) {
        scoreDisplay.textContent = globalScore;
    }
    
    if (progressBar) {
        const totalPossible = 375; // Score total possible
        const percentage = (globalScore / totalPossible) * 100;
        progressBar.style.width = `${percentage}%`;
    }
}

// Animation de déverrouillage
const style = document.createElement('style');
style.textContent = `
    @keyframes unlockAnimation {
        0% { transform: scale(0.95); opacity: 0.5; }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); opacity: 1; }
    }
`;
document.head.appendChild(style);

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Cacher tous les indices au départ
    document.querySelectorAll('.hint-content').forEach(hint => {
        hint.style.display = 'none';
        hint.classList.add('locked');
    });

    // Restaurer l'état
    currentChallengeScore = parseInt(localStorage.getItem('challenge1Score')) || initialScore;
    const usedHintsStored = JSON.parse(localStorage.getItem('usedHints1')) || [];
    
    usedHintsStored.forEach(hintNumber => {
        usedHints.add(hintNumber);
        if (hintNumber !== 1) hintCount++;
        
        const hintContent = document.getElementById(`hint${hintNumber}`);
        const hintButton = document.querySelector(`button[onclick="showHint(${hintNumber})"]`);
        
        if (hintContent && hintButton) {
            const icon = hintButton.querySelector('.hint-icon');
            if (icon) {
                icon.classList.remove('fa-lock');
                icon.classList.add('fa-unlock');
            }
            hintContent.classList.remove('locked');
            const overlay = hintContent.querySelector('.hint-lock-overlay');
            if (overlay) overlay.style.display = 'none';
        }
    });

    updateScoreDisplay();

    // Gestionnaire de soumission
    const flagForm = document.getElementById('flagForm');
    if (flagForm) {
        flagForm.addEventListener('submit', submitFlag);
    }
});

// Ajouter la fonction updateHintProgressBar
function updateHintProgressBar() {
    const penaltyBar = document.getElementById('hintPenaltyBar');
    if (penaltyBar) {
        const percentage = (currentChallengeScore / initialScore) * 100;
        penaltyBar.style.width = `${percentage}%`;
        
        if (percentage > 75) {
            penaltyBar.className = 'progress-bar bg-success';
        } else if (percentage > 50) {
            penaltyBar.className = 'progress-bar bg-warning';
        } else {
            penaltyBar.className = 'progress-bar bg-danger';
        }
    }
}

// Ajouter une nouvelle fonction pour mettre à jour l'affichage des pénalités
function updatePenaltyDisplay() {
    const penaltyDisplay = document.getElementById('penalty-display');
    if (penaltyDisplay) {
        const penalties = initialScore - currentChallengeScore;
        if (penalties > 0) {
            penaltyDisplay.innerHTML = `
                <div class="penalty-alert">
                    <i class="fas fa-exclamation-triangle"></i>
                    Pénalités: -${penalties} points
                </div>
            `;
            penaltyDisplay.style.display = 'block';
        } else {
            penaltyDisplay.style.display = 'none';
        }
    }
} 