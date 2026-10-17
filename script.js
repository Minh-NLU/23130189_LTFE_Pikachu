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
var score = 0;
var currentLevel = 1;
var matchedPairs = 0;
var totalPairs = (rows * cols) / 2;
var totalTime = 120;
var timeRemaining = 0;
var timeInterval;
var isProcessing = false;
var isPaused = false;

function switchScreen(screenId) {
    stopTimer();
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
    startGame();
}

function startGame() {
    switchScreen("game-screen");
    score = 0;
    matchedPairs = 0;
    firstSelected = null;
    document.getElementById("score").innerText = score;
    document.getElementById("level").innerText = currentLevel;

    clearPath();
    initBoard();
    checkHandleNoMoves();
    renderBoard();
    startTimer();
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
    var svgElements = document.getElementById('line-canvas');
    boardElements.innerHTML = '';
    if(svgElements) {
        boardElements.appendChild(svgElements);
    }
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
    if(isProcessing) return;
    var r2 = parseInt(elem.dataset.r);
    var c2 = parseInt(elem.dataset.c);
    if (board[r2][c2] === 0) {
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
    var path = canConnect(r1, c1, r2, c2);
    if (board[r1][c1] === board[r2][c2] && path!=null) {
        isProcessing = true;
        drawPath(path);
        setTimeout(function () {
            clearPath();
            board[r1][c1] = 0;
            board[r2][c2] = 0;
            firstSelected.className = 'tile empty';
            firstSelected.innerHTML = '';
            elem.className = 'tile empty';
            elem.innerHTML = '';
            firstSelected = null;
            isProcessing = false;
            score +=10;
            matchedPairs++;
            document.getElementById("score").innerText = score;
            if(matchedPairs === totalPairs) {
                stopTimer();
                setTimeout(function () {
                    showPopupResult("CHIẾN THẮNG",
                        `<p>Chúc mừng bạn đã giành chiến thắng Màn: ${currentLevel} </p>
                        <p>Điểm số: ${score}</p>`
                    );
                }, 200);
            } else{
                checkHandleNoMoves();
            }
            }, 200);
    } else{
        firstSelected.classList.remove('selected');
        elem.classList.remove('selected');
        firstSelected = null;
    }
}
function canConnect(r1,c1,r2,c2) {
    var path = checkLinePath(r1,c1,r2,c2);
    if(path!=null) return path;
    var path = checkLPath(r1,c1,r2,c2);
    if(path!=null) return path;
    var path = checkZPath(r1,c1,r2,c2);
    if(path!=null) return path;
    return null;
}
function checkLinePath(r1,c1,r2,c2) {
    if(r1 !== r2 && c1 !== c2) return null;
    if(c1 === c2){
        minRow = Math.min(r1,r2);
        maxRow = Math.max(r1,r2);
        for (var i = minRow + 1; i< maxRow; i++) {
            if(board[i][c1] !==0) return null;
        }
        return [{r:r1, c:c1},{r:r2, c:c2}];
    }
    if(r1 === r2){
        minCol = Math.min(c1,c2);
        maxCol = Math.max(c1,c2);
        for (var i = minCol + 1; i< maxCol; i++) {
            if(board[r1][i] !==0) return null;
        }
        return [{r:r1, c:c1},{r:r2, c:c2}];
    }
    return null;
}
function checkLPath(r1,c1,r2,c2) {
    if(board[r1][c2] === 0) {
        if (checkLinePath(r1,c1,r1,c2) && checkLinePath(r1,c2,r2,c2)) {
            return [{r:r1, c:c1},{r:r1, c:c2},{r:r2, c:c2}];
        }
    }
    if(board[r2][c1] === 0) {
        if (checkLinePath(r1,c1,r2,c1) && checkLinePath(r2,c1,r2,c2)) {
            return [{r:r1, c:c1},{r:r2, c:c1},{r:r2, c:c2}];
        }
    }
    return null;
}
function checkZPath(r1,c1,r2,c2) {
    for(var y = 0; y < MATRIX_cols; y++) {
        if(board[r1][y] === 0 || y === c2) {
            if (checkLinePath(r1,c1,r1,y) && checkLPath(r1,y,r2,c2)) {
                var lPath = checkLPath(r1,y,r2,c2);
                return [{r:r1, c:c1}].concat(lPath);
            }
        }
    }
    for(var x = 0; x < MATRIX_rows; x++) {
        if(board[x][c1] === 0 || x === r2) {
            if (checkLinePath(r1,c1,x,c1) && checkLPath(x,c1,r2,c2)) {
                var lPath = checkLPath(x,c1,r2,c2);
                return [{r:r1, c:c1}].concat(lPath);
            }
        }
    }
    return null;
}
function drawPath(path) {
    var svg =document.getElementById('line-canvas');
    if(!svg) return;
    var tileSize = 40;
    var gap = 8;
    var padding = 20;
    var points ="";
    for (var i = 0; i < path.length; i++) {
        var cell = path[i];
        var x = padding + (cell.c - 1) * (tileSize + gap) + tileSize / 2;
        var y = padding + (cell.r - 1) * (tileSize + gap) + tileSize / 2;
        points += x + "," + y + " ";
    }
    svg.innerHTML = '<polyline class="polyline-path" points="'+points.trim()+'"/>';
}
function clearPath() {
    var svg = document.getElementById('line-canvas');
    if(svg){
        svg.innerHTML='';
    }
}
function startTimer() {
    clearInterval(timeInterval);
    timeRemaining = totalTime;
    updateTimerUI();
    runtimer();
}
function runtimer(){
    timeInterval = setInterval(function () {
        timeRemaining--;
        updateTimerUI();
        if(timeRemaining === 0) {
            stopTimer();
            showPopupResult("Hết giờ",
                '<p>Rất tiếc! Bạn đã hết thời gian để hoàn thành màn chơi. Điểm số: ${score}</p>')
        }
    },1000);
}
function updateTimerUI() {
    var timer = document.getElementById('time');
    if(timer) {
        var percent = (timeRemaining/totalTime) * 100;
        timer.style.width = percent + "%";
    }
}
function stopTimer() {
    clearInterval(timeInterval);
}
function showPopupResult(result, message) {
    document.getElementById('result-title').innerHTML = result;
    document.getElementById('result-message').innerHTML = message;
    document.getElementById('result-popup').classList.add('active');
}
function closePopupResult() {
    document.getElementById('result-popup').classList.remove('active');
}
function nextLevelResult() {
    closePopupResult();
    switchScreen('level-menu')
}
function checkHasAvailablePair(){
    for (var r1 = 1; r1 <= rows; r1++) {
        for (var c1 = 1; c1 <= cols; c1++) {
            if(board[r1][c1] !== 0) {
                for (var r2 = 1; r2 <= rows; r2++) {
                    for (var c2 = 1; c2 <= cols; c2++) {
                        if(r1===r2 && c1===c2) continue;
                        if(board[r2][c2] !==0 && board[r2][c2] === board[r1][c1]){
                            if(canConnect(r1,c1,r2,c2) !== null){
                                return true;
                            }
                        }
                    }
                }

            }
        }
    }
    return false;
}
function shuffleBoard(){
    var remainCards =[];
    for(var r1 = 0; r1 <= rows; r1++){
        for(var c1 = 0; c1 <= cols; c1++) {
            if(board[r1][c1] !== 0) {
                remainCards.push(board[r1][c1]);
            }
        }
    }
    for(var i = 0; i < remainCards.length; i++) {
        var randomCard = Math.floor(Math.random()*remainCards.length);
        var temp = remainCards[i];
        remainCards[i] = remainCards[randomCard];
        remainCards[randomCard] = temp;
    }
    var index = 0;
    for(var r1 = 0; r1 <= rows; r1++) {
        for(var c1 = 0; c1 <= cols; c1++) {
            if(board[r1][c1] !== 0) {
                board[r1][c1] = remainCards[index];
                index++;
            }
        }
    }
    renderBoard();
}
function checkHandleNoMoves(){
    while(!checkHasAvailablePair()){
        shuffleBoard();
    }
}
function togglePause(){
    var pausebtn = document.getElementById('pause-btn');
    var boardElement = document.querySelector('.game-board');
    if(!isPaused){
        isPaused = true;
        clearInterval(timeInterval);
        boardElement.classList.add('paused');
        if(pausebtn) pausebtn.innerText = 'tiếp tục';
    } else{
        isPaused = false;
        boardElement.classList.remove('paused');
        if(pausebtn) pausebtn.innerText = 'Tạm dừng';
        runtimer();
    }
}
function changeLevel(){
    stopTimer();
    resetPauseState();
    switchScreen('level-menu');
}
function exit(){
    stopTimer();
    resetPauseState();
    switchScreen('main-menu');
}
function resetPauseState(){
    isPaused = false;
    var boardElement = document.querySelector('.game-board');
    if(boardElement) boardElement.classList.remove('paused');
    var pausebtn = document.getElementById('pause-btn');
    if(pausebtn) pausebtn.innerText = 'Tạm dừng'
}