const gameBoardContainer = document.getElementById('boardContainer');
const gameStatus = document.getElementById('playerStatus');
const rows = 4;
const cols = 7;

// Function to update the game board display
function createBoard() {
    // Clear the current board display
    gameBoardContainer.innerHTML = '';
    // Generate the new board display
    for (let i = 0; i < rows; i++) {
        const row = gameBoardContainer.appendChild(document.createElement('div'));
        row.classList.add('row');
        for (let j = 0; j < cols; j++) {
            const cell = row.appendChild(document.createElement('div'));
            cell.classList.add('cell');
            cell.innerHTML = '&nbsp;';
        }
    }
}

// Function to update the game board display
function updateBoard(board, winner) {
    // Clear the current board display
    gameBoardContainer.innerHTML = '';

    // Generate the new board display
    for (let i = 0; i < rows; i++) {
        const row = gameBoardContainer.appendChild(document.createElement('div'));
        row.classList.add('row');
        for (let j = 0; j < cols; j++) {
            const cell = row.appendChild(document.createElement('div'));
            cell.classList.add('cell');
            cell.innerHTML = '&nbsp;';
            if (board[i][j] === 1) {
                cell.classList.add('blue');
            } else if (board[i][j] === 2) {
                cell.classList.add('red');
            }
        }
    }
}


// Function to start a new game
function startGame() {
    fetch('http://localhost:8082/connect-four/startgame', {method: 'POST'})
        .then(response => response.json())
        .then(data => {
            console.log(data);
            createBoard();
            gameStatus.textContent = `Current Turn: Player ${data.turn}`;
        });
}

// Function to drop a token in the specified column
function dropToken(column) {
    fetch(`http://localhost:8082/connect-four/droptoken?column=${column}`, {method: 'GET'})
      .then(response => response.json())
      .then(data => {
        console.log(data);
        updateBoard(data.board);
        gameStatus.textContent = `Current Turn: Player ${data.turn}`;
      });
  }
  
  // listen for updates
  function listenForUpdates() {
    const source = new EventSource('http://localhost:8082/connect-four/events');
    source.onmessage = function(event) {
        const gameState = JSON.parse(event.data);
        updateBoard(gameState.board);
        gameStatus.textContent = `Current Turn: Player ${gameState.turn}`;
    
        if (gameState.winner) {
            alert(`Player ${gameState.winner} wins!`);
            // Disable input
            const controlPanelButtons = document.querySelectorAll('#controlPanel button');
            controlPanelButtons.forEach(button => {
                button.disabled = true;
            });
        }
    };
  }
  
  // Call the listenForUpdates function when the page loads
  window.onload = function() {
    createBoard();
    gameStatus.textContent = `Current Turn: Player 1`;
    listenForUpdates();
  };

// Start a new game when the page loads
//window.onload = startGame;
