import { serverHighestscore } from "./highscore.js";

document.addEventListener('DOMContentLoaded', () => {
    const gameArea = document.getElementById('gameArea');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const livesContainer = document.getElementById('livesContainer');
    const lifeIcons = livesContainer.querySelectorAll('.life');
    const gameOverText = document.getElementById('gameOver');
    const retryButton = document.getElementById('retryButton');
    const highScoreDisplay = document.getElementById('highScoreDisplay');
    const backButton = document.getElementById('backButton');

    var Finalscore;
    let score = 0;
    let lives = 5;
    let gameActive = true;
    let fruitCount = 0; // Ensure fruitCount is defined globally
    let activeFruits = new Set(); // Track active fruits
    let fruitInterval; // Store the interval ID for fruit spawning
    let animationId; // Store the requestAnimationFrame ID

    const maxFruits = 3; // Set a limit for the number of fruits
    const fruits = ['apple.png', 'banana.png', 'sandia.png']; // Array of normal fruit images
    const bomb = 'bomb.png'; // Bomb fruit image

    // Retrieve high score from local storage
    let highScore = serverHighestscore
    console.log(`Highscore is ${highScore}`);
    window.missFruit = function(fruit) {
        if (gameActive && activeFruits.has(fruit)) {
            activeFruits.delete(fruit); // Remove fruit from active set
            if (lives > 0 && !fruit.style.backgroundImage.includes('bomb.png')) {
                // Only decrease life if it's not a bomb
                lives--;
                lifeIcons[lives].src = 'red_cross.png'; // Change life icon to red cross
                console.log(`Lives remaining: ${lives}`); // Debugging: log remaining lives
                if (lives === 0) {
                    endGame();
                }
            }
        }
    };

    function increaseScore() {
        score++;
        scoreDisplay.textContent = `Score: ${score}`; // Update the score display
    }

    function createFruit() {
        if (!gameActive || fruitCount >= maxFruits) return; // Exit if the game is over or the fruit limit is reached

        const fruit = document.createElement('div');
        fruit.classList.add('fruit');

        // Adjusted spawn rate logic for the bomb
        const isBomb = Math.random() < 0.3; // 30% chance for a bomb
        const randomFruit = isBomb ? bomb : fruits[Math.floor(Math.random() * fruits.length)];
        fruit.style.backgroundImage = `url(${randomFruit})`;

        if (randomFruit === 'sandia.png') {
            fruit.style.width = '100px'; // Larger size for watermelon
            fruit.style.height = '100px';
        } else if (randomFruit === 'bomb.png') {
            fruit.style.width = '80px'; // Standard size for bomb
            fruit.style.height = '80px';
            fruit.style.zIndex = 1; // Set lower z-index for bomb
        } else {
            fruit.style.width = '70px'; // Standard size for other fruits
            fruit.style.height = '70px';
            fruit.style.zIndex = 1; // Set lower z-index for fruits
        }

        const startX = Math.random() * (gameArea.clientWidth - parseInt(fruit.style.width));
        const endX = Math.random() * (gameArea.clientWidth - parseInt(fruit.style.width));
        const baseDuration = 3; // Base duration adjusted for balanced start
        const speedIncrease = Math.min(score * 0.05, 1.5); // Increase speed as score increases but cap the increase
        const duration = Math.max(1.5, baseDuration - speedIncrease); // Duration should be at least 1.5 seconds
        const peakHeight = gameArea.clientHeight * (0.5 + Math.random() * 0.25); // Max height at 3/4th of the game area

        fruit.style.left = startX + 'px';
        fruit.style.bottom = '-100px'; // Start from below the screen

        gameArea.appendChild(fruit);
        fruitCount++;
        activeFruits.add(fruit); // Add to active set

        // Animate the fruit along a parabolic trajectory
        let startTime = null;

        function animateFruit(timestamp) {
            if (!gameActive) return; // Stop animation if game is inactive
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / (duration * 1000); // Normalized time [0, 1]

            if (progress < 1) {
                const currentX = startX + (endX - startX) * progress;
                const currentY = peakHeight * (1 - 4 * (progress - 0.5) ** 2) - 100; // Adjust for starting below the screen

                fruit.style.left = currentX + 'px';
                fruit.style.bottom = currentY + 'px';

                animationId = requestAnimationFrame(animateFruit);
            } else {
                fruit.remove();
                fruitCount--;
                missFruit(fruit); // Ensure missFruit is correctly called here
            }
        }

        animationId = requestAnimationFrame(animateFruit);

        // Add click event for bomb fruit to trigger game over with brightness effect
        fruit.addEventListener('click', () => {
            if (gameActive && activeFruits.has(fruit)) {
                if (randomFruit === 'bomb.png') {
                    increaseBrightnessAndEndGame();
                } else {
                    activeFruits.delete(fruit); // Remove from active set
                    fruit.remove();
                    if (lives!=0){increaseScore();}
                    fruitCount--;
                }
            }
        });
    }

    function increaseBrightnessAndEndGame() {
        gameActive = false; // Stop the game
        gameArea.style.transition = 'filter 1s';
        gameArea.style.filter = 'brightness(2)'; // Increase brightness to maximum

        // Stop all active fruits in place, preserving their orientations
        activeFruits.forEach(fruit => {
            const computedStyle = getComputedStyle(fruit);
            fruit.style.left = computedStyle.left;
            fruit.style.bottom = computedStyle.bottom;
            fruit.style.transform = computedStyle.transform; // Preserve the current transform
            fruit.style.animation = 'none'; // Disable any ongoing animations
            fruit.style.transition = 'none'; // Prevent further movement
            fruit.style.position = 'absolute'; // Fix position
        });

        cancelAnimationFrame(animationId); // Cancel the ongoing animation

        setTimeout(() => {
            gameArea.style.filter = 'brightness(1)'; // Reset brightness
            endGame(); // Trigger game over after brightness effect
        }, 1000); // Duration should match the transition time
    }

    function clearGameArea() {
        const fruits = gameArea.querySelectorAll('.fruit'); // Select only fruit elements
        fruits.forEach(fruit => fruit.remove()); // Remove each fruit
        fruitCount = 0;
        activeFruits.clear();
    }

    function spawnFruits() {
        if (!gameActive) return; // Exit if the game is over
        const simultaneousFruits = Math.min(maxFruits - fruitCount, 3); // Spawn only up to the remaining limit
        for (let i = 0; i < simultaneousFruits; i++) {
            setTimeout(createFruit, i * 500); // Staggered spawn with 500ms delay
        }
    }

    function resetGame() {
        clearGameArea(); // Clear the game area
        score = 0;
        lives = 5;
        gameActive = true;
        fruitCount = 0; // Reset fruit count
        scoreDisplay.style.display = 'block'; // Ensure score display is visible
        livesContainer.style.display = 'flex'; // Ensure lives container is visible
        scoreDisplay.textContent = `Score: ${score}`; // Reset score display
        lifeIcons.forEach(icon => icon.src = 'cross.png'); // Reset life icons
        gameOverText.style.display = 'none'; // Hide the game over text
        retryButton.style.display = 'none'; // Hide the retry button
        highScoreDisplay.style.display = 'none'; // Hide high score display
        backButton.style.display = 'none'; // Hide the back button

        gameArea.style.filter = 'brightness(1)'; // Reset brightness
        clearInterval(fruitInterval); // Clear any existing fruit spawning interval

        console.log("Game reset"); // Debugging: log game reset
        setTimeout(() => {
            spawnFruits(); // Start spawning fruits after a short delay
        }, 2000); // Adjust the delay as needed

        fruitInterval = setInterval(() => {
            if (gameActive) {
                spawnFruits();
            }
        }, 2000); // Restart fruit spawning interval
    }
    console.log(score);
    function endGame() {
        gameOverText.style.display = 'block';
        retryButton.style.display = 'block';
        highScoreDisplay.style.display = 'block'; // Show high score display
        backButton.style.display = 'block'; // Show the back button
        console.log(score);
        
        console.log('highscore '+highScore);
        if (score > highScore) {
            
            highScore = score;
            console.log(highScore);
            
            scorePrint();
        }
        else{
            scorePrint();
        }
       

    clearInterval(fruitInterval); 
    console.log("Game Over"); 
}
function scorePrint(){
    highScoreDisplay.textContent = `High Score: ${highScore}`;
    Finalscore=highScore;
}




retryButton.addEventListener('click', resetGame);

backButton.addEventListener('click', () => {
    window.location.href = 'start.html'; 
});

// Initialize the game
fruitInterval = setInterval(() => {
    if (gameActive) {
        spawnFruits();
    }
}, 2000); // Spawn new fruits every 2 seconds
});
export {Finalscore};