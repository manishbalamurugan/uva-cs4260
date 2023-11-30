const http = require('http');
const cors = require('cors')
const url = require('url');

// Initialize game state
let gameState = {
    board: Array(4).fill().map(() => Array(7).fill(0)), // 6 rows, 7 columns
    turn: 1, // Start with Player 1
    active: true,
    winner: null
};

let clients = [];
function eventsHandler(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.push(res);

  req.on('close', () => {
    clients = clients.filter(client => client !== res);
  });
}


function dropToken(column) {
    // Find the first available cell in the specified column
    for (let i = gameState.board.length - 1; i >= 0; i--) {
        if (!gameState.board[i][column]) {
            // Update the cell with the current player's token
            gameState.board[i][column] = gameState.turn;
            // Switch to the other player
            if (checkWinCondition(gameState.board, i, column)) {
                gameState.winner = gameState.turn;
                gameState.active = false;
            }
            gameState.turn = gameState.turn === 1 ? 2 : 1;
            break; // Exit the loop after dropping the token
        }
    }
    clients.forEach(client =>
        client.write(`data: ${JSON.stringify(gameState)}\n\n`)
    );
    return gameState
}

const server = http.createServer((req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    const reqUrl = url.parse(req.url, true);

    // API endpoint: /startgame
    if (reqUrl.pathname == '/connect-four/startgame') {
        // Reset game state
        gameState = {
            board: Array(4).fill().map(() => Array(7).fill(null)),
            turn: 1,
            active: true,
            winner: null
        };
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({message: 'Game started', board: gameState.board, turn: gameState.turn}));
    }

    // API endpoint: /gameboard
    else if (reqUrl.pathname == '/connect-four/gameboard') {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(gameState.board));
    }

    // API endpoint: /state
    else if (reqUrl.pathname == '/connect-four/state') {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(gameState));
    }

    // API endpoint: /droptoken
    else if (reqUrl.pathname == '/connect-four/droptoken') {
        const column = parseInt(reqUrl.query.column);
        gameState = dropToken(column)
        // Find the first available cell in the specified column
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({board: gameState.board, turn: gameState.turn}));
    }

    // Add this new route
    else if (reqUrl.pathname == '/connect-four/events') {
        eventsHandler(req, res);
    }
    
    else {
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({message: 'Route not found'}));
    }
});

function checkWinCondition() {
    const rows = 4;
    const cols = 7;
    // Check rows
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols - 3; j++) {
            if (gameState.board[i][j] && gameState.board[i][j] === gameState.board[i][j + 1] && gameState.board[i][j] === gameState.board[i][j + 2] && gameState.board[i][j] === gameState.board[i][j + 3]) {
                return gameState.board[i][j];
            }
        }
    }
    // Check columns
    for (let j = 0; j < cols; j++) {
        for (let i = 0; i < rows - 3; i++) {
            if (gameState.board[i][j] && gameState.board[i][j] === gameState.board[i + 1][j] && gameState.board[i][j] === gameState.board[i + 2][j] && gameState.board[i][j] === gameState.board[i + 3][j]) {
                return gameState.board[i][j];
            }
        }
    }
    // Check diagonals (top-left to bottom-right)
    for (let i = 0; i < rows - 3; i++) {
        for (let j = 0; j < cols - 3; j++) {
            if (gameState.board[i][j] && gameState.board[i][j] === gameState.board[i + 1][j + 1] && gameState.board[i][j] === gameState.board[i + 2][j + 2] && gameState.board[i][j] === gameState.board[i + 3][j + 3]) {
                return gameState.board[i][j];
            }
        }
    }
    // Check diagonals (top-right to bottom-left)
    for (let i = 3; i < rows; i++) {
        for (let j = 0; j < cols - 3; j++) {
            if (gameState.board[i][j] && gameState.board[i][j] === gameState.board[i - 1][j + 1] && gameState.board[i][j] === gameState.board[i - 2][j + 2] && gameState.board[i][j] === gameState.board[i - 3][j + 3]) {
                return gameState.board[i][j];
            }
        }
    }
    // No winner
    return null;
}

server.listen(8082, () => {
    console.log('Server running on port 8082');
});
