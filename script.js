function Gameboard() {
  const rows = 3;
  const columns = 3;
  let board;
  initializeBoard();

  const getBoard = () => board;

  function initializeBoard() {
    board = [];
    for (let i = 0; i < rows; i++) {
      board[i] = [];
      for (let j = 0; j < columns; j++) {
        board[i].push(Cell());
      }
    }
  }

  const dropToken = (row, column, player) => {
    const isCellAvailable = board[row][column].getValue() === "";

    if (!isCellAvailable) return false;

    board[row][column].addToken(player);
    return true;
  };

  const printBoard = () => {
    const boardWithCellValues = board.map((row) =>
      row.map((cell) => cell.getValue())
    );

    console.log(boardWithCellValues);
  };

  return {
    getBoard,
    initializeBoard,
    dropToken,
    printBoard,
  };
}

function Cell() {
  let value = "";

  const addToken = (player) => {
    value = player;
  };

  const getValue = () => value;

  return {
    addToken,
    getValue,
  };
}

function GameController(
  playerOneName,
  playerOneToken,
  playerTwoName,
  playerTwoToken,
  isPlayerTwoComputer
) {
  const board = Gameboard();

  const players = [
    {
      name: playerOneName,
      token: playerOneToken,
      score: 0,
    },
    {
      name: playerTwoName,
      token: playerTwoToken,
      score: 0,
      isComputer: isPlayerTwoComputer,
    },
  ];

  let activePlayer = players[0].token === "x" ? players[0] : players[1];

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const resetActivePlayer = () =>
    (activePlayer = players[0].token === "x" ? players[0] : players[1]);

  const getPlayerScores = () => [players[0].score, players[1].score];

  const getActivePlayer = () => activePlayer;

  const checkGameResult = (row, column, activePlayerToken, moveCount) => {
    const boardMatrix = board.getBoard();
    // Check column
    for (let i = 0; i < 3; i++) {
      if (boardMatrix[row][i].getValue() !== activePlayerToken) {
        break;
      }

      if (i === 2) {
        return "win";
      }
    }

    // Check row
    for (let i = 0; i < 3; i++) {
      if (boardMatrix[i][column].getValue() !== activePlayerToken) {
        break;
      }

      if (i === 2) {
        return "win";
      }
    }

    // Check diag
    if (row === column) {
      for (let i = 0; i < 3; i++) {
        if (boardMatrix[i][i].getValue() !== activePlayerToken) {
          break;
        }

        if (i === 2) {
          return "win";
        }
      }
    }

    // Check anti diag
    if (row + column === 2) {
      for (let i = 0; i < 3; i++) {
        if (boardMatrix[i][2 - i].getValue() !== activePlayerToken) {
          break;
        }

        if (i === 2) {
          return "win";
        }
      }
    }

    // Check move count
    if (moveCount === 3 * 3) {
      return "draw";
    }

    return "continue";
  };

  const makeComputerMove = () => {
    const emptyCells = [];
    const boardMatrix = board.getBoard();

    // Find all empty cells
    boardMatrix.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if (cell.getValue() === "") emptyCells.push([rowIndex, columnIndex]);
      });
    });

    if (emptyCells.length > 0) {
      // Select a random empty cell
      const [row, column] =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
      playRound(row, column); // Play computer's move
    }
  };

  const resetGame = () => {
    moveCount = 0;
    isGameEnd = false;
    board.initializeBoard();
    resetActivePlayer();
  };

  let moveCount = 0;
  let isGameEnd = false;
  const playRound = (row, column) => {
    const activePlayerName = getActivePlayer().name;
    const activePlayerToken = getActivePlayer().token;

    console.log(
      `Dropping ${activePlayerName}'s token into row ${row + 1}, column ${
        column + 1
      }`
    );

    // Game logic
    let validMove = board.dropToken(row, column, activePlayerToken);
    if (validMove) {
      moveCount++;
      board.printBoard();

      let gameResult = checkGameResult(
        row,
        column,
        activePlayerToken,
        moveCount
      );
      if (gameResult === "continue") {
        switchPlayerTurn();
        if (getActivePlayer().isComputer) {
          makeComputerMove();
        }
      } else {
        isGameEnd = true;
        if (gameResult === "draw") {
          console.log("Draw");
        } else {
          console.log(`${activePlayerName} wins.`);
          getActivePlayer().score++;
        }
      }
    } else {
      console.log("Invalid move");
    }
  };

  // When create new game, if computer is x, play the first move
  if (getActivePlayer().isComputer) {
    makeComputerMove();
  }

  return {
    playRound,
    getActivePlayer,
    getBoard: board.getBoard,
    resetGame,
    isGameEnd: () => isGameEnd,
    getPlayerScores,
    makeComputerMove,
  };
}

function ScreenController() {
  let game;
  let playerOneToken = "x";
  let playerTwoToken = "o";
  let playerTwoName = "Player";

  const boardDiv = document.querySelector(".board");
  const newRoundBtn = document.querySelector("#newRoundBtn");
  const newGameBtn = document.querySelector("#newGameBtn");
  const chooseXBtn = document.querySelector("#chooseX");
  const chooseOBtn = document.querySelector("#chooseO");
  const playerOneScoreSpan = document.querySelector("#playerOneScore");
  const playerTwoScoreSpan = document.querySelector("#playerTwoScore");
  const playerOneInfoSpan = document.querySelector("#playerOneInfo");
  const playerTwoInfoSpan = document.querySelector("#playerTwoInfo");
  const turnIndicatorDiv = document.querySelector(".turn-indicator");
  const opponentSelect = document.querySelector("#opponent");

  chooseXBtn.addEventListener("click", () => {
    playerOneToken = "x";
    playerTwoToken = "o";
    startNewGame();
  });

  chooseOBtn.addEventListener("click", () => {
    playerOneToken = "o";
    playerTwoToken = "x";
    startNewGame();
  });

  opponentSelect.addEventListener("change", (e) => {
    playerTwoName = e.target.value;
    startNewGame();
  });

  function startNewGame() {
    game = GameController(
      "Player",
      playerOneToken,
      playerTwoName,
      playerTwoToken,
      playerTwoName === "Computer"
    );
    playerOneInfoSpan.textContent = `Player (${playerOneToken})`;
    playerTwoInfoSpan.textContent = `${playerTwoName} (${playerTwoToken})`;
    boardDiv.addEventListener("click", boardHandler);
    updateScreen();
  }

  const updateTurnIndicator = () => {
    const activePlayer = game.getActivePlayer();
    turnIndicatorDiv.textContent = `${activePlayer.name}'s Turn (${activePlayer.token})`;

    // Update the class for styling based on the active player
    turnIndicatorDiv.classList.remove("player-x", "player-o");
    if (activePlayer.token === "x") {
      turnIndicatorDiv.classList.add("player-x");
    } else {
      turnIndicatorDiv.classList.add("player-o");
    }
  };

  const updateScreen = () => {
    // Clear the board
    boardDiv.textContent = "";

    // Get the new board
    const board = game.getBoard();

    // Render the board squares
    board.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        const cellDiv = document.createElement("div");
        cellDiv.classList.add("cell");
        cellDiv.dataset.row = rowIndex;
        cellDiv.dataset.column = columnIndex;
        cellDiv.textContent = cell.getValue();
        boardDiv.appendChild(cellDiv);
      });
    });

    // Update score
    [playerOneScoreSpan.textContent, playerTwoScoreSpan.textContent] =
      game.getPlayerScores();

    // Update indicator
    updateTurnIndicator();
  };

  newRoundBtn.addEventListener("click", () => {
    game.resetGame();
    boardDiv.addEventListener("click", boardHandler);
    // When restart game, if computer is x, make the first move
    if (game.getActivePlayer().isComputer) {
      game.makeComputerMove();
    }
    updateScreen();
  });

  newGameBtn.addEventListener("click", () => {
    startNewGame();
  });

  const boardHandler = (e) => {
    const selectedRow = parseInt(e.target.dataset.row);
    const selectedColumn = parseInt(e.target.dataset.column);

    // Make sure click on cell, not the gap
    if (selectedRow === "") return;

    game.playRound(selectedRow, selectedColumn);
    updateScreen();

    if (game.isGameEnd()) {
      boardDiv.removeEventListener("click", boardHandler);
      const activePlayer = game.getActivePlayer();
      turnIndicatorDiv.textContent = `${activePlayer.token} Wins`;
    }
  };

  startNewGame();
}

ScreenController();
