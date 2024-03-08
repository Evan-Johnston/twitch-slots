document.addEventListener('DOMContentLoaded', () => {
    const symbols = ['Kappa', 'ResidentSleeper', 'LUL', 'PogChamp', 'Kreygasm', 'Bonus'];
    const reels = ['reel1', 'reel2', 'reel3'];
    const spinButton = document.getElementById('spinButton');
    const chatterNameDisplay = document.getElementById('chatterName');
    const balanceDisplay = document.getElementById('balance');
    const leaderboardDisplay = document.getElementById('leaderboard');

    let playerBalance = 100; // Starting player balance
    balanceDisplay.textContent = `Balance: ${playerBalance}`;

    const imagePaths = {
        'Kappa': 'assets/Kappa.png',
        'ResidentSleeper': 'assets/ResidentSleeper.png',
        'LUL': 'assets/LUL.png',
        'PogChamp': 'assets/PogChamp.png',
        'Kreygasm': 'assets/Kreygasm.png',
        'Bonus': 'assets/Bonus.png'
    };
    
    const toggleMenuButton = document.getElementById('toggleMenu');
    const menuContent = document.getElementById('menuContent');
    menuContent.style.display = "none"; // Ensure menu is hidden initially

    toggleMenuButton.addEventListener('click', () => {
        menuContent.style.display = menuContent.style.display === "block" ? "none" : "block";
    });

    let playerName = "Player Name"; // Static for demonstration; could be dynamic based on your app's functionality
    let playerSpins = 0; // Initialize spins count

    // Assuming you have elements for displaying player name and spin count in your HTML
    const playerNameDisplay = document.getElementById('playerName');
    const spinCountDisplay = document.getElementById('spinCount');

    // Function to update leaderboard with player stats
    function updateLeaderboard() {
        // Example leaderboard logic; in a real app, this could pull from an array of player objects
        const leaderboardHTML = `
            <div>Rank 1: ${playerName} - Balance: ${playerBalance} - Spins: ${playerSpins}</div>
        `;
        leaderboardDisplay.innerHTML = leaderboardHTML;
    }

    // Load player stats from localStorage
    function loadPlayerStats() {
        const stats = JSON.parse(localStorage.getItem('playerStats'));
        if (stats) {
            playerName = stats.name;
            playerBalance = stats.balance;
            playerSpins = stats.spins;
            updateUI(); // Ensure the UI is updated with loaded stats
        }
    }

    // Save player stats to localStorage
    function savePlayerStats() {
        const stats = {
            name: playerName,
            balance: playerBalance,
            spins: playerSpins,
        };
        localStorage.setItem('playerStats', JSON.stringify(stats));
    }

    // Update the UI to reflect current player stats
    function updateUI() {
        balanceDisplay.textContent = `Balance: ${playerBalance}`;
        playerNameDisplay.textContent = playerName; // Assuming you have a spot in your HTML for this
        spinCountDisplay.textContent = `Spins: ${playerSpins}`; // Ditto
        updateLeaderboard(); // Refresh leaderboard display
    }

    // Modify existing spinButton click listener
    spinButton.addEventListener('click', () => {
        if (playerBalance <= 0) {
            alert('You have no more currency to spin. Please add more to continue.');
            return;
        }
        playerBalance -= 10; // Deduct cost per spin
        playerSpins++; // Increment spins
        savePlayerStats(); // Save stats after each spin
        updateUI(); // Update the UI with new stats
        // The rest of your spin logic here...
    });

    // Initial load of player stats and UI update
    loadPlayerStats();
    updateUI();

    spinButton.addEventListener('click', () => {
        if (playerBalance <= 0) {
            alert('You have no more currency to spin. Please add more to continue.');
            return;
        }
        playerBalance -= 10; // Deduct cost per spin
        balanceDisplay.textContent = `Balance: ${playerBalance}`;

        let completedSpins = 0;

        reels.forEach((reelId, index) => {
            const reelElement = document.getElementById(reelId);
            populateReelWithSymbols(reelElement, symbols, false);

            const delay = index * 500;
            spinReel(reelElement, delay, () => {
                completedSpins++;
                if (completedSpins === reels.length) {
                    announceResult();
                }
            });
        });
    });

    function announceResult() {
        let winningSymbols = reels.map(reelId => {
            const reelElement = document.getElementById(reelId);
            const symbolsContainer = reelElement.querySelector('.symbols-container');
            const winningSymbolElement = symbolsContainer.children[1];
            return winningSymbolElement ? winningSymbolElement.alt : null;
        });

        const bonusCount = winningSymbols.filter(symbol => symbol === 'Bonus').length;
        const uniqueSymbols = new Set(winningSymbols.filter(symbol => symbol !== 'Bonus'));
        let winAmount = 0;

        if (bonusCount === 3) {
            winAmount = 100;
        } else if (bonusCount === 2 && uniqueSymbols.size === 1) {
            winAmount = 75;
        } else if (bonusCount === 1 && uniqueSymbols.size === 1) {
            winAmount = 50;
        } else if (uniqueSymbols.size === 1 && bonusCount === 0) {
            winAmount = 30;
        }

        if (winAmount > 0) {
            playerBalance += winAmount;
            balanceDisplay.textContent = `Balance: ${playerBalance}`;
            chatterNameDisplay.textContent = `Win! You won ${winAmount}!`;
            triggerConfetti();
            updateLeaderboard(playerBalance);
        } else {
            chatterNameDisplay.textContent = 'Spin complete. Better luck next time.';
        }
    }

    function triggerConfetti() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    function updateLeaderboard(balance) {
        const entry = `Player balance: ${balance}`;
        leaderboardDisplay.textContent = `Leaderboard:\n${entry}`;
    }

    // Helper functions
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Swap elements
        }
    }

    function adjustSymbolDistribution(symbols, symbolToReduce, reductionFactor) {
        let adjustedSymbols = [];
        symbols.forEach(symbol => {
            if (symbol === symbolToReduce) {
                // For the "Bonus" symbol, push it less frequently based on the reductionFactor
                if (Math.random() < reductionFactor) {
                    adjustedSymbols.push(symbol);
                }
            } else {
                // Push all other symbols normally
                adjustedSymbols.push(symbol);
            }
        });
        return adjustedSymbols;
    }

    function populateReelWithSymbols(reelElement, symbols, forceWin = false) {
        const symbolsContainer = reelElement.querySelector('.symbols-container');
        symbolsContainer.innerHTML = ''; // Clear previous symbols

        const adjustedSymbols = forceWin ? [symbols[0], symbols[0], symbols[0]] : adjustSymbolDistribution(symbols, 'Bonus', 0.05);

        if (!forceWin) {
            shuffleArray(adjustedSymbols); // Shuffle for variety only if not forcing a win
        }

        for (let i = 0; i < 2; i++) {
            adjustedSymbols.forEach(symbol => {
                const img = document.createElement('img');
                img.src = imagePaths[symbol];
                img.alt = symbol;
                symbolsContainer.appendChild(img);
            });
        }
    }

    function spinReel(reelElement, delay, callback) {
        setTimeout(() => {
            const symbolsContainer = reelElement.querySelector('.symbols-container');
            let start = null;
            const spinDuration = 3000; // Total duration of the spin

            function animate(time) {
                if (!start) start = time;
                const runtime = time - start;
                const progress = runtime / spinDuration;

                const easeOutCubic = (t) => (--t) * t * t + 1;
                const easedProgress = easeOutCubic(progress);

                const totalHeight = symbolsContainer.scrollHeight;
                let position = easedProgress * totalHeight;

                symbolsContainer.style.transform = `translateY(-${totalHeight - (position % totalHeight)}px)`;

                if (runtime < spinDuration) {
                    requestAnimationFrame(animate);
                } else {
                    symbolsContainer.style.transform = ''; // Reset or adjust based on final alignment logic
                    if (callback) callback();
                }
            };

            requestAnimationFrame(animate);
        }, delay);
    }
});
