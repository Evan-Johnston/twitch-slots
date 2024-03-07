document.addEventListener('DOMContentLoaded', () => {
    const symbols = ['Kappa', 'ResidentSleeper', 'LUL', 'PogChamp', 'Kreygasm', 'Bonus'];
    const reels = ['reel1', 'reel2', 'reel3'];
    const spinButton = document.getElementById('spinButton');
    const chatterNameDisplay = document.getElementById('chatterName');
    const imagePaths = {
        'Kappa': 'assets/Kappa.png',
        'ResidentSleeper': 'assets/ResidentSleeper.png',
        'LUL': 'assets/LUL.png',
        'PogChamp': 'assets/PogChamp.png',
        'Kreygasm': 'assets/Kreygasm.png',
        'Bonus': 'assets/Bonus.png'
    };

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
    
        // Assuming we're populating enough symbols for a full cycle (twice the visible symbols for the animation)
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
                
                // Implementing an ease-out cubic function for smooth deceleration
                const easeOutCubic = (t) => (--t) * t * t + 1;
                const easedProgress = easeOutCubic(progress);
    
                // Calculate the position. Assuming totalHeight is twice the height of the symbols container
                // for a complete cycle, adjust according to your setup
                const totalHeight = symbolsContainer.scrollHeight;
                let position = easedProgress * totalHeight; // This would now make it move upwards initially
                
                // To reverse direction, subtract position from total height
                symbolsContainer.style.transform = `translateY(-${totalHeight - (position % totalHeight)}px)`;
    
                if (runtime < spinDuration) {
                    requestAnimationFrame(animate);
                } else {
                    // Adjust final position for alignment if necessary
                    symbolsContainer.style.transform = ''; // Reset or adjust based on final alignment logic
                    if (callback) callback();
                }
            };
    
            requestAnimationFrame(animate);
        }, delay);
    }
    
    

    spinButton.addEventListener('click', () => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const testWin = urlParams.has('testWin'); // Check if "?testWin" is present in the URL
    
        chatterNameDisplay.textContent = 'Spinning...';
        let completedSpins = 0;
    
        reels.forEach((reelId, index) => {
            const reelElement = document.getElementById(reelId);
            populateReelWithSymbols(reelElement, symbols, testWin); // Pass testWin flag
    
            const delay = index * 500;
            spinReel(reelElement, delay, () => {
                completedSpins++;
                if (completedSpins === reels.length) {
                    chatterNameDisplay.textContent = 'Spin complete.';
                    announceResult();
                }
            });
        });
    });
    

    function announceResult() {
        // Assuming there are at least 3 symbols per reel and the winning symbols are always in the second position
        let winningSymbols = reels.map(reelId => {
            const reelElement = document.getElementById(reelId);
            const symbolsContainer = reelElement.querySelector('.symbols-container');
            // The winning symbol will be the second child in the container (index 1 for zero-based indexing)
            const winningSymbolElement = symbolsContainer.children[1]; // Second child
            return winningSymbolElement ? winningSymbolElement.alt : null;
        });
    
        const win = winningSymbols.every((symbol, _, arr) => symbol && symbol === arr[0]);
    
        if (win) {
            chatterNameDisplay.textContent = `Win! Symbols match: ${winningSymbols[0]}`;
            chatterNameDisplay.classList.add('win');
            triggerConfetti();
        } else {
            chatterNameDisplay.textContent = `Spin complete. Better luck next time.`;
            chatterNameDisplay.classList.remove('win');
        }
    }
    
    
    function triggerConfetti() {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 } // Adjust as needed
        });
    }
    
    
});
