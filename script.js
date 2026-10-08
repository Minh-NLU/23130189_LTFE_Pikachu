var rows =9;
var cols = 16;

var MATRIX_rows = rows+2;
var MATRIX_cols = cols+2;

var pokemon = [];
for (var i = 1; i <= 36; i++) {
    // pokemon[i] = `images/${i}.png`;
    pokemon[i] = i;
}

var board = [];
var firstSelected = null;
var lastSelected = null;
var score = 0;
var currentLevel = 1;
var matchedPairs = 0;
var totalPairs = (rows*cols)/2;

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(function(s) {
        s.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}
function togglePopup(show) {
    var popup = document.querySelector('.popup-overlay');
    if (show) {
        popup.classList.add('active');
    } else {
        popup.classList.remove('active');
    }
}
function selectLevel(level) {
    currentLevel = level;
    document.getElementById('level').innerText = currentLevel;
    startgame();
}
function startgame() {
    switchScreen("game-screen");
    score = 0;
    matchedPairs = 0;
    firstSelected = null;
    lastSelected = null;
    document.getElementById("score").innerText = score;
    document.getElementById("level").innerText = currentLevel;

    initBoard();
    renderBoard();
}
function initBoard() {
    var cards = [];
    for (var i = 1; i < pokemon.length; i++) {
        cards.push(pokemon[i]);
        cards.push(pokemon[i]);
        cards.push(pokemon[i]);
        cards.push(pokemon[i]);
    }

    for (var i = 0; i < cards.length; i++) {
        var randomCard = Math.floor(Math.random() * cards.length);
        var temp = cards[i];
        cards[i] = cards[randomCard];
        cards[randomCard] = temp;
    }
    board = [];
    var cardIndex = 0;

    for (var r = 0; r < MATRIX_rows; r++) {
        var row = [];
        for (var c = 0; c < MATRIX_cols; c++) {
            if(r===0||r===MATRIX_rows-1||c===MATRIX_cols-1||c===0){
                row.push(0);
            } else{
                row.push(cards[cardIndex]);
                cardIndex++;
            }
        }
        board.push(row);
    }
}
function renderBoard() {
    var boardElements = document.querySelector('.game-board');
    boardElements.innerHTML = '';
    for (var r = 1; r <= rows; r++) {
        for (var c = 1; c <= cols; c++) {
            var tile = document.createElement('tile');
            tile.dataset.r = r;
            tile.dataset.c = c;

            var value = board[r][c];
            if(value === 0) {
                tile.className = 'title empty';
            } else{
                tile.className = 'title';
                tile.innerHTML = value;
                tile.onclick = function () {

                }
            }
            boardElements.appendChild(tile);
        }
    }
}