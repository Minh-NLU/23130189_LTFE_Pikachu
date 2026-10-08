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