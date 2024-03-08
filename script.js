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
    
    // Initialize WebSocket connection
    const socket = new WebSocket('ws://localhost:5500');

    socket.addEventListener('message', function (event) {
        try {
            const data = JSON.parse(event.data); // Attempt to parse JSON
            // Handle the parsed data
            if (data.command === 'spin') {
                document.getElementById('spinButton').click();
                if (data.twitchUser) {
                    updatePlayerName(data.twitchUser);
                }
            }
        } catch (e) {
            // If an error occurs, it's likely because the message wasn't in JSON format
            if (event.data === 'spin') {function savePlayerStats() {
                let players = JSON.parse(localStorage.getItem('playerStats')) || []; // Ensure it's an array
                if (!Array.isArray(players)) { // Additional check to ensure players is an array
                    players = []; // Reset to empty array if not
                }
            
                const playerIndex = players.findIndex(p => p.name === playerName);
            
                if (playerIndex > -1) {
                    // Update existing player
                    players[playerIndex].balance = playerBalance;
                    players[playerIndex].spins = playerSpins;
                } else {
                    // Add new player
                    players.push({
                        name: playerName,
                        balance: playerBalance,
                        spins: playerSpins,
                    });
                }
            
                localStorage.setItem('playerStats', JSON.stringify(players));
            }
            
                // Handle the plain string message
                document.getElementById('spinButton').click();
            } else {
                console.error("Received non-JSON message:", event.data);
            }
        }
    });
    function updatePlayerName(twitchUser) {
        playerName = twitchUser; // Update playerName globally
        savePlayerStats(); // Reflect this change in localStorage
        updateUI(); // Refresh UI to display the new playerName
    }
    
    socket.addEventListener('message', function (event) {
        if (event.data === 'spin') {
            document.getElementById('spinButton').click();
        }
    });
    

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
    
    // Load player stats from localStorage
    function loadPlayerStats() {
        const players = JSON.parse(localStorage.getItem('playerStats')) || [];
        updateLeaderboard(players); // Pass the players array to the updateLeaderboard function
    }
    
    updateLeaderboard();

        // Function to update leaderboard with player stats
        function updateLeaderboard() {
            const players = JSON.parse(localStorage.getItem('playerStats')) || [];
            let leaderboardHTML = '<h2>Leaderboard</h2>'; // Start the leaderboard HTML
        
            // Assuming you want to sort players by their balance in descending order
            players.sort((a, b) => b.balance - a.balance);
        
            players.forEach((player, index) => {
                leaderboardHTML += `<div class="leaderboard-entry">Rank ${index + 1}: ${player.name} - Balance: ${player.balance} - Spins: ${player.spins}</div>`;
            });
        
            // Ensure the leaderboardDisplay is defined and correctly pointing to your leaderboard container
            leaderboardDisplay.innerHTML = leaderboardHTML;
        }

    // Save player stats to localStorage
    function savePlayerStats() {
        let players = JSON.parse(localStorage.getItem('playerStats')) || [];
        const playerIndex = players.findIndex(p => p.name === playerName);
    
        if (playerIndex !== -1) {
            // Update existing player
            players[playerIndex].balance = playerBalance;
            players[playerIndex].spins = playerSpins;
        } else {
            // Add new player
            players.push({ name: playerName, balance: playerBalance, spins: playerSpins });
        }
    
        localStorage.setItem('playerStats', JSON.stringify(players));
    }
    
    

    // Update the UI to reflect current player stats
    function updateUI() {
        balanceDisplay.textContent = `Balance: ${playerBalance}`;
        playerNameDisplay.textContent = playerName; // Assuming you have a spot in your HTML for this
        spinCountDisplay.textContent = `Spins: ${playerSpins}`; // Ditto
        updateLeaderboard(); // Refresh leaderboard display
    }

    loadPlayerStats(); // Make sure this is defined to load stats from localStorage
    updateUI();

    spinButton.addEventListener('click', () => {
        if (playerBalance <= 0) {
            alert('You have no more currency to spin. Please add more to continue.');
            return;
        }
        playerBalance -= 10; // Deduct cost per spin
        balanceDisplay.textContent = `Balance: ${playerBalance}`;
    
        // Update the text to indicate spinning has started
        chatterNameDisplay.textContent = 'Spinning...';
    
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
    
            // Display win amount in the announcement
            const winAnnouncement = document.getElementById('winAnnouncement');
            document.getElementById('winAmount').textContent = winAmount;
    
            // Show win announcement
            winAnnouncement.classList.add('show');
    
            // Add glow effect to slot machine
            const slotMachine = document.querySelector('.slot-machine');
            slotMachine.classList.add('glow');
    
            // Remove the announcement and glow effect after a few seconds
            setTimeout(() => {
                winAnnouncement.classList.remove('show');
                slotMachine.classList.remove('glow');
            }, 5000);
    
            triggerConfetti();
            updateLeaderboard(playerBalance);
        } else {
            // Display message for no win
            chatterNameDisplay.textContent = 'Spin complete. Better luck next time.';
            // Remove the message after a few seconds
            setTimeout(() => {
                chatterNameDisplay.textContent = 'Waiting for !spin...'; // Change text back to "Waiting for !spin..."
            }, 2250);
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