var rows = 9;
var cols = 16;

var MATRIX_rows = rows + 2;
var MATRIX_cols = cols + 2;

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
var totalPairs = (rows * cols) / 2;

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(function (s) {
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
            if (r === 0 || r === MATRIX_rows - 1 || c === MATRIX_cols - 1 || c === 0) {
                row.push(0);
            } else {
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
            if (value === 0) {
                tile.className = 'title empty';
            } else {
                tile.className = 'title';
                tile.innerHTML = value;
                tile.onclick = function () {
                    handleTileClick(this);
                }
            }
            boardElements.appendChild(tile);
        }
    }
}

function handleTileClick(elem) {
    var r = parseInt(elem.dataset.r);
    var c = parseInt(elem.dataset.c);
    if (board[r][c] === 0) {
        return;
    }
    if (firstSelected === null) {
        firstSelected = elem;
        elem.classList.add('selected');
        return;
    }
    if (firstSelected === elem) {
        firstSelected = null;
        elem.classList.remove('selected');
        return;
    }
    var r1 = parseInt(firstSelected.dataset.r);
    var c1 = parseInt(firstSelected.dataset.c);

    if (board[r1][c1] === board[r][c] && canConnect(r1, c1, r, c)) {
        board[r1][c1] = 0;
        board[r][c] = 0;
        firstSelected.className = 'tile empty';
        firstSelected.innerHTML = '';
        elem.className = 'tile empty';
        elem.innerHTML = '';
        firstSelected = null;
        score +=10;
        matchedPairs++;
        document.getElementById("score").innerText = score;
        if(matchedPairs === totalPairs) {
            setTimeout(function () {
                alert("Chúc mừng bạn đã chiến thắng");
            }, 200);
        }
    } else{
        firstSelected.classList.remove('selected');
        elem.classList.remove('selected');
        firstSelected = null;
    }
}
function canConnect(r1,c1,r,c) {
    if(checkLinePath(r1,c1,r,c)) return true;
    if(checkLPath(r1,c1,r,c)) return true;
    if(checkZPath(r1,c1,r,c)) return true;
    return false;
}
function checkLinePath(r1,c1,r,c) {
    if(r1 !== r && c1 !== c) return false;
    if(c1 === c){
        minRow = Math.min(r1,r);
        maxRow = Math.max(r1,r);
        for (var i = minRow + 1; i< maxRow; i++) {
            if(board[i][c1] !==0) return false;
        }
        return true;
    }
    if(r1 === r){
        minCol = Math.min(c1,c);
        maxCol = Math.max(c1,c);
        for (var i = minCol + 1; i< maxCol; i++) {
            if(board[r1][i] !==0) return false;
        }
        return true;
    }
    return false;
}
function checkLPath(r1,c1,r,c) {
    if(board[r1][c] === 0) {
        if (checkLinePath(r1,c1,r1,c) && checkLinePath(r1,c,r,c)) {
            return true;
        }
    }
    if(board[r][c1] === 0) {
        if (checkLinePath(r1,c1,r,c1) && checkLinePath(r,c1,r,c)) {
            return true;
        }
    }
}
function checkZPath(r1,c1,r,c) {
    for(var y = 0; y < MATRIX_cols; y++) {
        if(board[r1][y] === 0 || y === c) {
            if (checkLinePath(r1,c1,r1,y) && checkLPath(r1,y,r,c)) {
                return true;
            }
        }
    }
    for(var x = 0; x < MATRIX_rows; x++) {
        if(board[x][c1] === 0 || x === r) {
            if (checkLinePath(r1,c1,x,c1) && checkLPath(x,c1,r,c)) {
                return true;
            }
        }
    }
    return false;
}