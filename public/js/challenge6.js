let usedHints = new Set();
let initialScore = 75; // Score initial du challenge
let currentChallengeScore = initialScore;
let finalChallengeScore = initialScore;
let hintCount = 0;
const totalHints = 4;

// Configuration des indices
const hints = {
    1: { cost: 0, icon: 'fa-unlock-alt' },
    2: { cost: 5, icon: 'fa-lock' },
    3: { cost: 10, icon: 'fa-lock' },
    4: { cost: 25, icon: 'fa-lock' }
};

// Système de fichiers simulé
let currentDirectory = '~';
let fileSystem = {
    '~': {
        type: 'directory',
        '.bash_logout': { type: 'file', content: '# ~/.bash_logout' },
        '.bashrc': { type: 'file', content: '# ~/.bashrc' },
        '.profile': { type: 'file', content: '# ~/.profile' },
        'Documents': {
            type: 'directory',
            '.secret': { type: 'file', content: 'FLAG{HIDDEN_FILE}' }
        },
        'Downloads': { type: 'directory' }
    }
};

// Historique des commandes
let commandHistory = [];
let historyIndex = -1;

// Fonction pour initialiser le terminal
function initializeTerminal() {
    const terminal = document.querySelector('.terminal-content');
    if (!terminal) return;

    // Nettoyer le terminal
    terminal.innerHTML = '';

    // Créer la première ligne de prompt
    const promptLine = document.createElement('div');
    promptLine.className = 'terminal-line current-line';
    promptLine.innerHTML = `<span class="prompt">~$</span> <span class="command-text"></span>`;
    terminal.appendChild(promptLine);

    // Créer l'input caché
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'terminal-input';
    terminal.appendChild(input);

    // Gestionnaires d'événements
    input.addEventListener('keydown', handleTerminalInput);
    input.addEventListener('input', (e) => updateCurrentLine(e.target.value));
    terminal.addEventListener('click', () => {
        input.focus();
        input.selectionStart = input.selectionEnd = input.value.length;
    });

    // Focus initial
    input.focus();
}

// Gérer les entrées du terminal
function handleTerminalInput(e) {
    const input = e.target;
    const terminal = document.querySelector('.terminal-content');
    const currentPrompt = terminal.querySelector('.current-line');

    if (e.key === 'Enter') {
        e.preventDefault();
        const command = input.value.trim();
        if (command) {
            // Mettre à jour la ligne actuelle avec la commande
            currentPrompt.innerHTML = `<span class="prompt">${currentDirectory}$</span> ${command}`;
            currentPrompt.classList.remove('current-line');
            
            // Exécuter la commande
            commandHistory.push(command);
            historyIndex = commandHistory.length;
            
            const output = executeCommand(command);
            if (output) {
                const outputDiv = document.createElement('div');
                outputDiv.className = 'terminal-output';
                outputDiv.innerHTML = output;
                terminal.appendChild(outputDiv);
            }

            // Créer une nouvelle ligne de prompt
            const newPrompt = document.createElement('div');
            newPrompt.className = 'terminal-line current-line';
            newPrompt.innerHTML = `<span class="prompt">${currentDirectory}$</span> <span class="command-text"></span>`;
            terminal.appendChild(newPrompt);

            // Réinitialiser l'input
            input.value = '';
            terminal.scrollTop = terminal.scrollHeight;
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            input.value = commandHistory[historyIndex];
            updateCurrentLine(input.value);
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            input.value = commandHistory[historyIndex];
            updateCurrentLine(input.value);
        } else {
            historyIndex = commandHistory.length;
            input.value = '';
            updateCurrentLine('');
        }
    } else {
        // Mettre à jour le texte affiché pendant la frappe
        setTimeout(() => updateCurrentLine(input.value), 0);
    }
}

// Ajouter cette nouvelle fonction pour mettre à jour la ligne courante
function updateCurrentLine(text) {
    const currentPrompt = document.querySelector('.current-line');
    if (currentPrompt) {
        const commandText = currentPrompt.querySelector('.command-text');
        if (commandText) {
            commandText.textContent = text;
        } else {
            const span = document.createElement('span');
            span.className = 'command-text';
            span.textContent = text;
            currentPrompt.appendChild(span);
        }
    }
}

// Fonction pour exécuter les commandes
function executeCommand(command) {
    const args = command.trim().split(/\s+/);
    const cmd = args[0].toLowerCase();

    switch(cmd) {
        case 'ls':
            return handleLs(args);
        case 'cd':
            return handleCd(args[1]);
        case 'cat':
            return handleCat(args[1]);
        case 'pwd':
            return currentDirectory;
        case 'clear':
            clearTerminal();
            return '';
        case 'help':
            return 'Commandes disponibles: ls, cd, cat, pwd, clear, help';
        default:
            return `Command not found: ${cmd}`;
    }
}

// Gestionnaire de la commande ls
function handleLs(args) {
    const showHidden = args.includes('-a') || args.includes('-la');
    const showDetails = args.includes('-l') || args.includes('-la');
    
    let currentDir = getCurrentDirObject();
    if (!currentDir) return 'Erreur: répertoire invalide';

    let output = '';
    const entries = Object.entries(currentDir)
        .filter(([name]) => name !== 'type')
        .sort(([nameA, itemA], [nameB, itemB]) => {
            if (itemA.type !== itemB.type) {
                return itemA.type === 'directory' ? -1 : 1;
            }
            return nameA.localeCompare(nameB);
        });

    if (showDetails) {
        output += 'total ' + entries.length + '\n';
        if (showHidden) {
            output += 'drwxr-xr-x 2 user user 4096 Feb 1 10:00 .\n';
            output += 'drwxr-xr-x 3 user user 4096 Feb 1 10:00 ..\n';
        }
    }

    entries.forEach(([name, item]) => {
        if (!showHidden && name.startsWith('.')) return;

        if (showDetails) {
            const perms = item.type === 'directory' ? 'drwxr-xr-x' : '-rw-r--r--';
            output += `${perms} 1 user user 4096 Feb 1 10:00 ${name}\n`;
        } else {
            const className = item.type === 'directory' ? 'directory' : 'file';
            output += `<span class="${className}">${name}${item.type === 'directory' ? '/' : ''}</span>  `;
        }
    });

    return output;
}

// Gestionnaire de la commande cd
function handleCd(dir) {
    if (!dir || dir === '~') {
        currentDirectory = '~';
        return '';
    }

    if (dir === '..') {
        if (currentDirectory === '~') return '';
        currentDirectory = currentDirectory.split('/').slice(0, -1).join('/') || '~';
        return '';
    }

    const newPath = dir.startsWith('/')
        ? dir
        : currentDirectory === '~'
            ? `~/${dir}`
            : `${currentDirectory}/${dir}`;

    const targetDir = getObjectAtPath(newPath);
    if (!targetDir || targetDir.type !== 'directory') {
        return `cd: ${dir}: No such directory`;
    }

    currentDirectory = newPath;
    return '';
}

// Gestionnaire de la commande cat
function handleCat(filename) {
    if (!filename) return 'cat: missing operand';

    const currentDir = getCurrentDirObject();
    if (!currentDir || !currentDir[filename]) {
        return `cat: ${filename}: No such file`;
    }

    if (currentDir[filename].type !== 'file') {
        return `cat: ${filename}: Is a directory`;
    }

    return currentDir[filename].content;
}

// Fonctions utilitaires pour le système de fichiers
function getCurrentDirObject() {
    return getObjectAtPath(currentDirectory);
}

function getObjectAtPath(path) {
    if (path === '~') return fileSystem['~'];
    const parts = path.replace(/^~\//, '').split('/');
    let current = fileSystem['~'];
    
    for (const part of parts) {
        if (!current || current.type !== 'directory') return null;
        if (part === '' || part === '.') continue;
        if (part === '..') {
            // Implémenter la logique pour remonter d'un niveau
            continue;
        }
        current = current[part];
    }
    
    return current;
}

function clearTerminal() {
    const terminal = document.querySelector('.terminal-content');
    while (terminal.firstChild) {
        terminal.removeChild(terminal.firstChild);
    }
    // Ajouter une nouvelle ligne de prompt après le clear
    const promptLine = document.createElement('div');
    promptLine.className = 'terminal-line current-line';
    promptLine.innerHTML = `<span class="prompt">~$</span> <span class="command-text"></span>`;
    terminal.appendChild(promptLine);

    // Réinitialiser l'input
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'terminal-input';
    terminal.appendChild(input);
    input.focus();
}

// Fonction pour afficher les notifications
function showNotification(type, title, message, duration = 5000, withConfirmation = false, confirmCallback = null) {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `custom-notification notification-${type}`;
    
    notification.innerHTML = `
        <i class="fas ${type === 'warning' ? 'fa-exclamation-triangle' : 
                       type === 'success' ? 'fa-check-circle' : 
                       type === 'error' ? 'fa-times-circle' : 
                       'fa-info-circle'} notification-icon"></i>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        ${withConfirmation ? `
            <div class="notification-buttons">
                <button class="confirm-hint">Confirmer</button>
                <button class="cancel-hint">Annuler</button>
            </div>
        ` : ''}
    `;

    container.appendChild(notification);

    if (withConfirmation && confirmCallback) {
        const confirmBtn = notification.querySelector('.confirm-hint');
        const cancelBtn = notification.querySelector('.cancel-hint');

        confirmBtn.addEventListener('click', () => {
            confirmCallback();
            notification.remove();
        });

        cancelBtn.addEventListener('click', () => {
            notification.remove();
        });
    } else if (duration > 0) {
        setTimeout(() => {
            notification.remove();
        }, duration);
    }
}

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
        
        if (percentage > 75) {
            penaltyBar.className = 'progress-bar bg-success';
        } else if (percentage > 50) {
            penaltyBar.className = 'progress-bar bg-warning';
        } else {
            penaltyBar.className = 'progress-bar bg-danger';
        }
    }
}

// Fonction pour gérer l'ouverture des indices
function showHint(hintNumber) {
    if (usedHints.has(hintNumber)) {
        const hintContent = document.getElementById(`hint${hintNumber}`);
        if (hintContent) {
            hintContent.style.display = hintContent.style.display === 'none' ? 'block' : 'none';
        }
        return;
    }

    const cost = hints[hintNumber].cost;
    if (cost > 0) {
        showNotification(
            'warning',
            'Confirmation',
            `Cet indice coûtera ${cost} points. Voulez-vous continuer ?`,
            0,
            true,
            () => unlockHint(hintNumber)
        );
    } else {
        unlockHint(hintNumber);
    }
}

// Fonction pour déverrouiller un indice
function unlockHint(hintNumber) {
    const hintContent = document.getElementById(`hint${hintNumber}`);
    const hintButton = document.querySelector(`button[onclick="showHint(${hintNumber})"]`);
    
    if (hintContent && hintButton) {
        // Mettre à jour le score
        if (hints[hintNumber].cost > 0) {
            currentChallengeScore -= hints[hintNumber].cost;
            localStorage.setItem('challenge6Score', currentChallengeScore);
            updatePenaltyDisplay();
            updateHintProgressBar();
        }

        // Déverrouiller l'indice
        usedHints.add(hintNumber);
        if (hintNumber !== 1) hintCount++;
        
        // Mettre à jour le stockage local
        localStorage.setItem('usedHints6', JSON.stringify([...usedHints]));

        // Mettre à jour l'affichage
        const icon = hintButton.querySelector('.hint-icon');
        if (icon) {
            icon.classList.remove('fa-lock');
            icon.classList.add('fa-unlock');
        }

        hintContent.classList.remove('locked');
        const overlay = hintContent.querySelector('.hint-lock-overlay');
        if (overlay) overlay.style.display = 'none';
        hintContent.style.display = 'block';

        // Mettre à jour le compteur d'indices
        document.querySelector('.hint-count').textContent = `(${hintCount}/${totalHints} utilisés)`;
    }
}

// Fonction pour vérifier le flag
function submitFlag(event) {
    event.preventDefault();
    const flagInput = document.getElementById('flagInput');
    const userFlag = flagInput.value.trim().toUpperCase();
    const submittedFlag = userFlag.startsWith('FLAG{') ? userFlag : `FLAG{${userFlag}}`;
    const correctFlag = 'FLAG{HIDDEN_FILE}';

    const resultMessage = document.getElementById('result-message');

    if (submittedFlag === correctFlag) {
        finalChallengeScore = currentChallengeScore;
        
        // Mettre à jour le score global
        let globalScore = parseInt(localStorage.getItem('ctfScore')) || 0;
        globalScore += finalChallengeScore;
        localStorage.setItem('ctfScore', globalScore);

        // Ajouter aux challenges complétés
        let completedChallenges = JSON.parse(localStorage.getItem('completedChallenges')) || [];
        if (!completedChallenges.includes('6')) {
            completedChallenges.push('6');
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
                </div>
            </div>
        `;

        updateHomePageScore();
        
        // Désactiver le formulaire
        flagInput.disabled = true;
        flagInput.form.querySelector('button[type="submit"]').disabled = true;

    } else {
        resultMessage.innerHTML = `
            <div class="error-message">
                <h4>❌ Incorrect</h4>
                <p>Ce n'est pas le bon flag. Réessayez !</p>
            </div>
        `;
        
        flagInput.value = '';
        flagInput.focus();
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le terminal
    initializeTerminal();

    // Cacher tous les indices au départ
    document.querySelectorAll('.hint-content').forEach(hint => {
        hint.style.display = 'none';
        hint.classList.add('locked');
    });

    // Restaurer l'état
    currentChallengeScore = parseInt(localStorage.getItem('challenge6Score')) || initialScore;
    const usedHintsStored = JSON.parse(localStorage.getItem('usedHints6')) || [];
    
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
    updatePenaltyDisplay();
    updateHintProgressBar();

    // Gestionnaire de soumission du flag
    const flagForm = document.getElementById('flagForm');
    if (flagForm) {
        flagForm.addEventListener('submit', submitFlag);
    }
});

// Fonction pour mettre à jour la barre de progression
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

// Fonction pour mettre à jour l'affichage des pénalités
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