const boardSize = 10;
const totalTilesToFlip = 10;
let flippedTileCount = 0;
let revealedGroupsCount = 0;
let revealedImagesSum = 0;
let remainingRetries = 10; // Starting retries

// Define the image paths
const imagePaths = [
    '1.jpg',
    '2.jpg',
    '3.jpg',
    '4.jpg',
    '5.jpg'
];

function createGameBoard() {
    const board = [];
    const columnLetters = 'ABCDEFGHIJ'.split('');
    const gameGrid = document.getElementById('game-grid');

    // Add top-left corner empty cell
    const emptyCorner = document.createElement('div');
    gameGrid.appendChild(emptyCorner);

    // Create column labels
    columnLetters.forEach(letter => {
        const label = document.createElement('div');
        label.classList.add('column-label');
        label.textContent = letter;
        gameGrid.appendChild(label);
    });

    // Create row labels and tiles
    for (let row = 0; row < boardSize; row++) {
        // Row label
        const rowLabel = document.createElement('div');
        rowLabel.classList.add('row-label');
        rowLabel.textContent = row + 1;
        gameGrid.appendChild(rowLabel);

        const rowArray = [];
        for (let col = 0; col < boardSize; col++) {
            const tile = document.createElement('div');
            tile.id = `tile-${row}-${col}`;
            tile.classList.add('tile');
            rowArray.push({ element: tile, image: null });
            gameGrid.appendChild(tile);
        }
        board.push(rowArray);
    }

    populateBoard(board, imagePaths);
}

function populateBoard(board, imagePaths) {
    const imageCounts = {
        [imagePaths[0]]: 1,
        [imagePaths[1]]: 2,
        [imagePaths[2]]: 3,
        [imagePaths[3]]: 4,
        [imagePaths[4]]: 5
    };

    const revealedImages = {};

function canPlaceImage(board, row, col, direction, count) {
    // Check if the image group fits within the board boundaries
    if (direction === 'horizontal') {
        if (col + count > boardSize) return false;
    } else if (direction === 'vertical') {
        if (row + count > boardSize) return false;
    }

    // Ensure surrounding area is clear
    for (let i = 0; i < count; i++) {
        if (direction === 'horizontal') {
            // Check the tile itself and tiles above, below, and to the left and right
            if (
                board[row][col + i].image !== null || // Current tile
                (row > 0 && board[row - 1][col + i].image !== null) || // Above
                (row < boardSize - 1 && board[row + 1][col + i].image !== null) || // Below
                (col > 0 && board[row][col + i - 1].image !== null) || // Left
                (col + i < boardSize - 1 && board[row][col + i + 1].image !== null) || // Right
                (row > 0 && col > 0 && board[row - 1][col + i - 1].image !== null) || // Top-left diagonal
                (row > 0 && col + i < boardSize - 1 && board[row - 1][col + i + 1].image !== null) || // Top-right diagonal
                (row < boardSize - 1 && col > 0 && board[row + 1][col + i - 1].image !== null) || // Bottom-left diagonal
                (row < boardSize - 1 && col + i < boardSize - 1 && board[row + 1][col + i + 1].image !== null) // Bottom-right diagonal
            ) {
                return false;
            }
        } else if (direction === 'vertical') {
            // Check the tile itself and tiles above, below, and to the left and right
            if (
                board[row + i][col].image !== null || // Current tile
                (col > 0 && board[row + i][col - 1].image !== null) || // Left
                (col < boardSize - 1 && board[row + i][col + 1].image !== null) || // Right
                (row > 0 && board[row + i - 1][col].image !== null) || // Above
                (row + i < boardSize - 1 && board[row + i + 1][col].image !== null) || // Below
                (row > 0 && col > 0 && board[row + i - 1][col - 1].image !== null) || // Top-left diagonal
                (row > 0 && col < boardSize - 1 && board[row + i - 1][col + 1].image !== null) || // Top-right diagonal
                (row + i < boardSize - 1 && col > 0 && board[row + i + 1][col - 1].image !== null) || // Bottom-left diagonal
                (row + i < boardSize - 1 && col < boardSize - 1 && board[row + i + 1][col + 1].image !== null) // Bottom-right diagonal
            ) {
                return false;
            }
        }
    }

    return true;
}


    function placeImage(image, count) {
        let placed = false;
        while (!placed) {
            let row, col;
            row = Math.floor(Math.random() * (boardSize - count + 1));
            col = Math.floor(Math.random() * (boardSize - count + 1));

            const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';

            if (canPlaceImage(board, row, col, direction, count)) {
                for (let i = 0; i < count; i++) {
                    if (direction === 'horizontal') {
                        board[row][col + i].image = image;
                    } else {
                        board[row + i][col].image = image;
                    }
                }
                placed = true;
            }
        }
    }

    for (let image of imagePaths) {
        placeImage(image, imageCounts[image]);
        revealedImages[image] = 0;  // Initialize revealed images counter
    }

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const tileObj = board[row][col];
            const tile = tileObj.element;

            tile.addEventListener('click', () => {
                if (!tile.classList.contains('flipped') && !tile.classList.contains('empty')) {
                    tile.classList.add('flipped');
                    flippedTileCount++;
                    const image = tileObj.image;
                    if (image) {
                        tile.style.backgroundImage = `url(${image})`;

                        // Increment the count of revealed images for this specific image
                        revealedImages[image]++;

                        // Check if all images of this type are revealed
                        if (revealedImages[image] === imageCounts[image]) {
                            animateImageGroup(board, image);
                            revealAdjacentCells(board, image);

                            revealedGroupsCount++; // Increment the revealed group count
                            revealedImagesSum += imageCounts[image]; // Add to the sum of revealed images

                            createExplosionEffect(tileObj.element); // Trigger explosion effect
                        }

                    } else {
                        tile.classList.add('empty');
                    }
					remainingRetries--;
					updateRetryCounter(); // Update the retry counter after each click

                    // Check if 10 tiles have been flipped
                    if (flippedTileCount === totalTilesToFlip) {
                        remainingRetries = 0;
                        updateRetryCounter(); // Update to 0 after final click
                        disableClicks();
                        setTimeout(() => {
                            showMessage();
                        }, 1000); // 2-second delay
                    }
                }
            });
        }
    }
}

function animateImageGroup(board, image) {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col].image === image) {
                const tile = board[row][col].element;
                tile.style.animation = 'flash 500ms ease-in-out 3';
                setTimeout(() => {
                    tile.style.borderColor = '#ff0000'; // Final border color
                }, 1500); // 3 flashes x 500ms
            }
        }
    }
}

function revealAdjacentCells(board, image) {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col].image === image) {
                // Check and flip adjacent cells, including diagonals
                flipAdjacent(board, row, col);
            }
        }
    }
}

function flipAdjacent(board, row, col) {
    const adjacentCoords = [
        [row - 1, col],     // above
        [row + 1, col],     // below
        [row, col - 1],     // left
        [row, col + 1],     // right
        [row - 1, col - 1], // top-left diagonal
        [row - 1, col + 1], // top-right diagonal
        [row + 1, col - 1], // bottom-left diagonal
        [row + 1, col + 1]  // bottom-right diagonal
    ];

    adjacentCoords.forEach(([adjRow, adjCol]) => {
        if (adjRow >= 0 && adjRow < boardSize && adjCol >= 0 && adjCol < boardSize) {
            const adjacentTile = board[adjRow][adjCol];
            if (!adjacentTile.element.classList.contains('flipped') && adjacentTile.image === null) {
                adjacentTile.element.classList.add('flipped', 'empty');
            }
        }
    });
}

function createExplosionEffect(element) {
    const colors = ['#ff0000', '#00a69e', '#ffbb95'];
    const numParticles = 50; // Increase number of particles for better visibility
    const explosionContainer = document.createElement('div');
    explosionContainer.classList.add('explosion-container');

    // Position explosion container relative to the tile's position
    const rect = element.getBoundingClientRect();
    explosionContainer.style.position = 'fixed';
    explosionContainer.style.left = `${rect.left + rect.width / 2}px`;
    explosionContainer.style.top = `${rect.top + rect.height / 2}px`;

    document.body.appendChild(explosionContainer);

    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        explosionContainer.appendChild(particle);

        // Set random direction and speed
        const angle = Math.random() * 360;
        const distance = Math.random() * 150 + 50; // Random distance
        particle.style.transform = `rotate(${angle}deg) translate(${distance}px)`;
        particle.style.animationDuration = `${Math.random() * 1.5 + 1.5}s`; // Randomize duration
    }

    // Remove the explosion effect after 3 seconds
    setTimeout(() => {
        explosionContainer.remove();
    }, 3000);
}




function showMessage() {
    const messageDisplay = document.getElementById('message');
    messageDisplay.innerHTML = `<span id="close-popup">&times;</span><p><br>Odkritih naprav: ${revealedGroupsCount}<br>Dosežena stopnja: ${revealedImagesSum}</p><button id="restart-button">Ponovi</button>`;
    messageDisplay.style.display = 'block';

    const closePopup = document.getElementById('close-popup');
    closePopup.addEventListener('click', hideMessage);

    const restartButton = document.getElementById('restart-button');
    restartButton.addEventListener('click', () => {
        restartGame();
    });
}


function hideMessage() {
    const messageDisplay = document.getElementById('message');
    messageDisplay.style.display = 'none';
}

function disableClicks() {
    const gameGrid = document.getElementById('game-grid');
    gameGrid.style.pointerEvents = 'none'; // Disable all clicks
}

function enableClicks() {
    const gameGrid = document.getElementById('game-grid');
    gameGrid.style.pointerEvents = 'auto'; // Enable clicks
}

function updateRetryCounter() {
    const retryCounter = document.getElementById('retry-counter');
    retryCounter.textContent = `${remainingRetries}`; // Display only the number
}

function restartGame() {
    hideMessage();
    flippedTileCount = 0;
    revealedGroupsCount = 0;
    revealedImagesSum = 0;
    remainingRetries = 10; // Reset retries
    updateRetryCounter(); // Reset the retry counter
    const gameGrid = document.getElementById('game-grid');
    gameGrid.innerHTML = ''; // Clear the board
    createGameBoard(); // Redraw the board
    enableClicks(); // Re-enable clicks
}

createGameBoard();
updateRetryCounter(); // Initialize the retry counter
