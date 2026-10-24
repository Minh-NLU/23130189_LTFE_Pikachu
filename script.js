var rows = 9;
var cols = 16;

var MATRIX_rows = rows + 2;
var MATRIX_cols = cols + 2;

var levelsIntro = {
    1:{
        title:"Màn 1: Cổ điển",
        message:"Màn chơi cơ bản. Ăn ô nào thì ô đó mất, bàn cờ đứng yên"
    },
    2:{
        title:"Màn 2: Dồn ô xuống đáy",
        message: "Sau khi ăn thành công thì toàn bộ các ô phía trên sẽ dồn xuống dưới để điền vào khoảng trống"
    },
    3:{
        title:"Màn 3: Dồn ô về bên trái",
        message: "Sau khi ăn thành công một cặp thì toàn bộ các ô sẽ trượt về bên trái"
    },
    4:{
        title:"Màn 4: Xáo bài định kỳ",
        message: "Cứ sau mỗi 3 hình ăn thành công, toàn bộ bàn cờ sẽ tự động đổi vị trí"
    },
    5:{
        title:"Màn 5: Thử thách ghi nhớ",
        message:"Toàn bộ bài sẽ ngửa trong 3 giây đầu sau đó sẽ tự động lật lại. Chọn sai thì các ô sẽ tự úp xuống"
    },
    6:{
        title:"Màn 6: Chướng ngại vật",
        message:"Bàn cờ sẽ xuất hiện những ô bị khóa không thể chọn và sẽ chặn các đường nối của các ô khác"
    }
}

var pokemon = [];
for (var i = 1; i <= 24; i++) {
    pokemon[i] = `images/pieces${i}.png`;
    // pokemon[i] = i;
}

var board = [];
var firstSelected = null;
var score = 0;
var currentLevel = 1;
var matchedPairs = 0;
var totalPairs = 0;
var totalTime = 480;
var timeRemaining = 0;
var timeInterval;
var isProcessing = false;
var isPaused = false;
var isMemory = false;

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
    var intro = levelsIntro[level];
    document.getElementById('level-intro-title').innerText = intro.title;
    document.getElementById('level-intro-message').innerHTML = `<p>${intro.message}</p>`;
    document.getElementById('level-intro').classList.add('active');
}

function confirmLevel() {
    document.getElementById('level-intro').classList.remove('active');
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
    if(currentLevel === 5) {
        isMemory = true;
        renderBoard();
        setTimeout(function () {
            isMemory = false;
            renderBoard();
        },3000);
    } else{
        renderBoard();
    }
    startTimer();
}

function initBoard() {
    if(currentLevel === 6) {
        var numObstacle = 12;
        var totalTile = (rows * cols) - numObstacle;
        totalPairs = totalTile / 2;
        var cards = [];
        for (var i = 1; i < pokemon.length-2; i++) {
            cards.push(pokemon[i]);
            cards.push(pokemon[i]);
            cards.push(pokemon[i]);
            cards.push(pokemon[i]);
            cards.push(pokemon[i]);
            cards.push(pokemon[i]);
        }
        for (var j = 0; j < cards.length; j++) {
            var randomCard = Math.floor(Math.random() * cards.length);
            var temp = cards[j];
            cards[j] = cards[randomCard];
            cards[randomCard] = temp;
        }
        board = [];
        for (var r = 0; r < MATRIX_rows; r++) {
            var row = [];
            for (var c = 0; c < MATRIX_cols; c++) {
                row.push(0);
            }
            board.push(row);
        }
        var obstacles = 0;
        while (obstacles < numObstacle) {
            var ranR = Math.floor(Math.random() * rows) + 1;
            var ranC = Math.floor(Math.random() * cols) + 1;
            if(board[ranR][ranC]===0){
                board[ranR][ranC] = -1;
                obstacles++;
            }
        }
        var cardIndex =0;
        for (var r = 1; r <= rows; r++) {
            for (var c = 1; c <= cols; c++) {
                if (board[r][c] !== -1) {
                    board[r][c] = cards[cardIndex];
                    cardIndex++;
                }
            }
        }
    } else{
        totalPairs = (rows * cols) / 2;
        var cards = [];
        for (var i = 1; i < pokemon.length; i++) {
            cards.push(pokemon[i]);
            cards.push(pokemon[i]);
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
                tile.className = 'tile empty';
            } else if(value === -1) {
                tile.className = 'tile obstacle';
            } else {
                if(currentLevel === 5 && !isMemory){
                    tile.className = 'tile covered';
                } else{
                    tile.className = 'tile';
                }
                tile.innerHTML = `<img src="`+value+`" alt="pokemon">`;
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
    if (board[r2][c2] === 0||board[r2][c2] === -1) {
        return;
    }
    elem.classList.remove('covered');
    if (firstSelected === null) {
        firstSelected = elem;
        elem.classList.add('selected');
        return;
    }
    if (firstSelected === elem) {
        firstSelected = null;
        elem.classList.remove('selected');
        if(currentLevel === 5) {
            elem.classList.add('covered');
        }
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
            matchedPairs++;
            applyLevelSlide();
            renderBoard();
            score +=10;
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
        var temp = firstSelected;
        firstSelected = null;
        setTimeout(function () {
            if(currentLevel === 5) {
                temp.classList.add('covered');
                elem.classList.add('covered');
            }
        },500);
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
                `<p>Rất tiếc! Bạn đã hết thời gian để hoàn thành màn chơi. Điểm số: ${score}</p>`)
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
            if(board[r1][c1] !== 0 && board[r1][c1] !== -1) {
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
    for(var r1 = 1; r1 <= rows; r1++){
        for(var c1 = 1; c1 <= cols; c1++) {
            if(board[r1][c1] !== 0 && board[r1][c1] !== -1) {
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
    for(var r1 = 1; r1 <= rows; r1++) {
        for(var c1 = 1; c1 <= cols; c1++) {
            if(board[r1][c1] !== 0 && board[r1][c1] !== -1) {
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
function applyLevelSlide(){
    if(currentLevel === 2){
        for (var c1 = 1; c1 <= cols; c1++) {
            var temp = [];
            for(var r1 = 1; r1 <= rows; r1++) {
                if(board[r1][c1] !== 0) {
                    temp.push(board[r1][c1]);
                }
            }
            var emptyCount = rows - temp.length;
            for(var r2 = 1; r2 <= emptyCount; r2++) {
                board[r2][c1] = 0;
            }
            for(var r3 = emptyCount + 1; r3 <= rows; r3++) {
                board[r3][c1] = temp[r3-emptyCount-1];
            }
        }
    }
    else if(currentLevel === 3){
        for (var r1 = 1; r1 <= rows; r1++) {
            var temp = [];
            for(var c1 = 1; c1 <= cols; c1++) {
                if(board[r1][c1] !== 0) {
                    temp.push(board[r1][c1]);
                }
            }
            for(var c2 = 1; c2 <= temp.length; c2++) {
                board[r1][c2] = temp[c2-1];
            }
            for(var c3 = temp.length + 1; c3 <= cols; c3++) {
                board[r1][c3] = 0;
            }
        }
    }
    else if(currentLevel === 4){
        if(matchedPairs % 3 === 0){
            shuffleBoard();
        }
    }
}