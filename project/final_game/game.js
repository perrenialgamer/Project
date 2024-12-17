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

    var Finalscore=0;
    let score = 0;
    let lives = 5;
    let gameActive = true;
    let fruitCount = 0; 
    let activeFruits = new Set(); 
    let fruitInterval; 
    let animationId; 

    const maxFruits = 3; 
    const fruits = ['apple.png', 'banana.png', 'sandia.png']; 
    const bomb = 'bomb.png'; 

    
    let highScore = serverHighestscore
    console.log(`Highscore is ${highScore}`);
    window.missFruit = function(fruit) {
        if (gameActive && activeFruits.has(fruit)) {
            activeFruits.delete(fruit); 
            if (lives > 0 && !fruit.style.backgroundImage.includes('bomb.png')) {
                
                lives--;
                lifeIcons[lives].src = 'red_cross.png'; 
                console.log(`Lives remaining: ${lives}`); 
                if (lives === 0) {
                    endGame();
                }
            }
        }
    };

    function increaseScore() {
        score++;
        scoreDisplay.textContent = `Score: ${score}`; 
    }

    function createFruit() {
        if (!gameActive || fruitCount >= maxFruits) return; 

        const fruit = document.createElement('div');
        fruit.classList.add('fruit');

        
        const isBomb = Math.random() < 0.3; 
        const randomFruit = isBomb ? bomb : fruits[Math.floor(Math.random() * fruits.length)];
        fruit.style.backgroundImage = `url(${randomFruit})`;

        if (randomFruit === 'sandia.png') {
            fruit.style.width = '100px'; 
            fruit.style.height = '100px';
        } else if (randomFruit === 'bomb.png') {
            fruit.style.width = '80px'; 
            fruit.style.height = '80px';
            fruit.style.zIndex = 1; 
        } else {
            fruit.style.width = '70px'; 
            fruit.style.height = '70px';
            fruit.style.zIndex = 1; 
        }

        const startX = Math.random() * (gameArea.clientWidth - parseInt(fruit.style.width));
        const endX = Math.random() * (gameArea.clientWidth - parseInt(fruit.style.width));
        const baseDuration = 3; 
        const speedIncrease = Math.min(score * 0.05, 1.5); 
        const duration = Math.max(1.5, baseDuration - speedIncrease); 
        const peakHeight = gameArea.clientHeight * (0.5 + Math.random() * 0.25); 

        fruit.style.left = startX + 'px';
        fruit.style.bottom = '-100px'; 

        gameArea.appendChild(fruit);
        fruitCount++;
        activeFruits.add(fruit); 

        
        let startTime = null;

        function animateFruit(timestamp) {
            if (!gameActive) return; 
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / (duration * 1000); 

            if (progress < 1) {
                const currentX = startX + (endX - startX) * progress;
                const currentY = peakHeight * (1 - 4 * (progress - 0.5) ** 2) - 100; 

                fruit.style.left = currentX + 'px';
                fruit.style.bottom = currentY + 'px';

                animationId = requestAnimationFrame(animateFruit);
            } else {
                fruit.remove();
                fruitCount--;
                missFruit(fruit); 
            }
        }

        animationId = requestAnimationFrame(animateFruit);

        
        fruit.addEventListener('click', () => {
            if (gameActive && activeFruits.has(fruit)) {
                if (randomFruit === 'bomb.png') {
                    increaseBrightnessAndEndGame();
                } else {
                    activeFruits.delete(fruit); 
                    fruit.remove();
                    if (lives!=0){increaseScore();}
                    fruitCount--;
                }
            }
        });
    }

    function increaseBrightnessAndEndGame() {
        gameActive = false; 
        gameArea.style.transition = 'filter 1s';
        gameArea.style.filter = 'brightness(2)'; 

        
        activeFruits.forEach(fruit => {
            const computedStyle = getComputedStyle(fruit);
            fruit.style.left = computedStyle.left;
            fruit.style.bottom = computedStyle.bottom;
            fruit.style.transform = computedStyle.transform; 
            fruit.style.animation = 'none'; 
            fruit.style.transition = 'none'; 
            fruit.style.position = 'absolute'; 
        });

        cancelAnimationFrame(animationId); 

        setTimeout(() => {
            gameArea.style.filter = 'brightness(1)'; 
            endGame(); 
        }, 1000); 
    }

    function clearGameArea() {
        const fruits = gameArea.querySelectorAll('.fruit'); 
        fruits.forEach(fruit => fruit.remove()); 
        fruitCount = 0;
        activeFruits.clear();
    }

    function spawnFruits() {
        if (!gameActive) return; 
        const simultaneousFruits = Math.min(maxFruits - fruitCount, 3); 
        for (let i = 0; i < simultaneousFruits; i++) {
            setTimeout(createFruit, i * 500); 
        }
    }

    function resetGame() {
        clearGameArea(); 
        score = 0;
        lives = 5;
        gameActive = true;
        fruitCount = 0; 
        scoreDisplay.style.display = 'block'; 
        livesContainer.style.display = 'flex'; 
        scoreDisplay.textContent = `Score: ${score}`; 
        lifeIcons.forEach(icon => icon.src = 'cross.png'); 
        gameOverText.style.display = 'none'; 
        retryButton.style.display = 'none'; 
        highScoreDisplay.style.display = 'none'; 
        backButton.style.display = 'none'; 

        gameArea.style.filter = 'brightness(1)'; 
        clearInterval(fruitInterval); 

        console.log("Game reset"); 
        setTimeout(() => {
            spawnFruits(); 
        }, 2000); 

        fruitInterval = setInterval(() => {
            if (gameActive) {
                spawnFruits();
            }
        }, 2000); 
    }
    console.log(score);
    function endGame() {
        gameOverText.style.display = 'block';
        retryButton.style.display = 'block';
        highScoreDisplay.style.display = 'block'; 
        backButton.style.display = 'block'; 
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


fruitInterval = setInterval(() => {
    if (gameActive) {
        spawnFruits();
    }
}, 2000); 
});
export {Finalscore};
