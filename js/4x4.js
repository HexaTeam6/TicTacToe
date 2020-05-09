// board setting
let BLANK = new Image()
let BOARD_SIZE = 16;
let NOT_OCCUPIED = ' ';
let KUCING = 'O';
let ANJING = 'X';

let board = new Array()
let choice;
let active_turn = "KUCING";
let messages = ["Permainan belum selesai",
    "Permainan seri, Kucing belum bisa kabur dari Anjing",
    "Selamat! Kucing berhasil kabur dari Anjing",
    "HUAHAHAHA sayang sekali, Anjing berhasil menangkap Kucing :("]

let kucingImgPath = './images/O.png';
let anjingImgPath = './images/X.png';

let kucingImg = new Image()
let anjingImg = new Image()

let blank_src = './images/blank.png'
let blank_on_hover_src = './images/blank2.png'

kucingImg.src = kucingImgPath;
anjingImg.src = anjingImgPath;


let params = (new URL(document.location)).searchParams;
let name = params.get('name');
let level = params.get('level');

var moveSound = new Audio('./music/soundeffects.wav')
var loseSound = new Audio('./music/lose.wav');
var tieSound = new Audio('./music/drawresult.wav')
var winSound = new Audio ('./music/win.wav')

function validTurn() {
    X_sum = name == "anjing" ? 1 : 0;
    O_sum = 0
    for(var i = 0; i < BOARD_SIZE; i++) {
        if(board[i] == 'X') {
            X_sum++;
        } else if (board[i] == "O"){
            O_sum++;
        }
    }
    isValid =  (X_sum + O_sum) % 2 == 0;
    return isValid
}

function newboard() {
    for (let i = 0; i < BOARD_SIZE; i++) {
        board[i] = NOT_OCCUPIED;
        document.images[i].src = blank_src;

        tile = document.images[i];
        tile.onmouseover = function(){
            this.src = blank_on_hover_src;
            this.style.cursor="pointer";
        };
        tile.onmouseout = function(){
            this.src = blank_src;
            this.style.cursor="default";
        };
    }

    if (BOARD_SIZE == 16) {
        document.getElementById("size4").disabled = true;;
    }

    var turnInfo = document.getElementById("turnInfo");
    if (name === "anjing") {
        active_turn = "ANJING";
        turnInfo.innerHTML = "Anjing sebagai pemain pertama yang jalan";
        setTimeout(moveButoIjo, 500);
    } else if (name === "kucing") {
        active_turn = "KUCING";
        turnInfo.innerHTML = 'Kucing sebagai pemain pertama yang jalan, monggo..';
    }
}

function makeMove(pieceMove) {

    if(!validTurn()) {
        return 
    }

    if (!isGameOver(board) && board[pieceMove] === NOT_OCCUPIED) {
        board[pieceMove] = KUCING;
        document.images[pieceMove].src = kucingImgPath;
        document.images[pieceMove].setAttribute("onmouseover", kucingImgPath)
        document.images[pieceMove].setAttribute("onmouseout", kucingImgPath)
        document.images[pieceMove].style.cursor="default";
        moveSound.play()

        if (!isGameOver(board)) {
            var alert = document.getElementById("turnInfo");
            active_turn = "ANJING";
            alert.innerHTML = "Giliran Anjing mengejar"
            setTimeout(moveButoIjo, 500);
        }
    }
}

function moveButoIjo() {
    minimax(board, 0, -Infinity, +Infinity);
    var move = choice;
    board[move] = ANJING;
    document.images[move].src = anjingImgPath;
    document.images[move].setAttribute("onmouseover", anjingImgPath)
    document.images[move].setAttribute("onmouseout", anjingImgPath)
    document.images[move].style.cursor="default";
    choice = [];
    active_turn = "KUCING"
    if (!isGameOver(board)) {
        var alert = document.getElementById("turnInfo");
        alert.innerHTML = "Giliran Kucing untuk kabur dari Anjing, pikirkan strategi yang terbaik!";
    }
}

function gameScore(currentBoard, depth) {
    var score = checkWinningCondition(currentBoard);
    if (score === 1) {
        return 0;
    } else if (score === 2) {
        return depth - 10;
    } else if (score === 3) {
        return 10 - depth;
    } else {
        return 0;
    }
}

function minimax(node, depth, alpha, beta) {
    if (checkWinningCondition(node) === 1 ||
        checkWinningCondition(node) === 2 ||
        checkWinningCondition(node) === 3 ||
        depth === 6 || (level == 'easy' && depth == 1 && (Math.random() < 0.10) )) {
        return gameScore(node, depth);
    }

    // the deeper the recursion, the higher the depths
    depth += 1;

    var availableMoves = getAvailableMoves(node);
    var move, result, possibleGameResult;
    if (active_turn === "ANJING") {
        for (var i = 0; i < availableMoves.length; i++) {
            move = availableMoves[i];
            possibleGameResult = getNewState(move, node);
            result = minimax(possibleGameResult, depth, alpha, beta);
            node = undoMove(node, move);
            if (result > alpha) {
                alpha = result
                if (depth === 1) {
                    choice = move
                }
            } else if (alpha >= beta) {
                return alpha;
            }
        }
        return alpha;
    } else {
        for (var i = 0; i < availableMoves.length; i++) {
            move = availableMoves[i];
            possibleGameResult = getNewState(move, node);
            result = minimax(possibleGameResult, depth, alpha, beta);
            node = undoMove(node, move);
            if (result < beta) {
                beta = result
                if (depth === 1) {
                    choice = move
                }
            } else if (beta <= alpha) {
                return beta;
            }
        }
        return beta;
    }
}

function undoMove(currentBoard, move) {
    currentBoard[move] = NOT_OCCUPIED;
    changeTurn();
    return currentBoard;
}

function getNewState(move, currentBoard) {
    var piece = changeTurn();
    currentBoard[move] = piece;
    return currentBoard;
}

function changeTurn() {
    var piece;
    if (active_turn === "ANJING") {
        piece = 'X';
        active_turn = "KUCING";
    } else {
        piece = 'O';
        active_turn = 'ANJING';
    }
    return piece;
}

function getAvailableMoves(currentBoard) {
    var possibleMoves = new Array();
    for (var i = 0; i < BOARD_SIZE; i++) {
        if (currentBoard[i] === NOT_OCCUPIED) {
            possibleMoves.push(i);
        }
    }
    return possibleMoves;
}

// Check for a winner.  Return
//   0 if no winner or tie yet
//   1 if it's a tie
//   2 if KUCING MENANG
//   3 if ANJING MENANG
function checkWinningCondition(currentBoard) {

    // checking for horizontal wins
    for (i = 0; i <= 12; i += 4) {
        if (currentBoard[i] === KUCING && currentBoard[i + 1] === KUCING && currentBoard[i + 2] === KUCING && currentBoard[i + 3] === KUCING)
            return 2;
        if (currentBoard[i] === ANJING && currentBoard[i + 1] === ANJING && currentBoard[i + 2] === ANJING && currentBoard[i + 3] === ANJING)
            return 3;
    }

    // Check for vertical wins
    for (i = 0; i <= 3; i++) {
        if (currentBoard[i] === KUCING && currentBoard[i + 4] === KUCING && currentBoard[i + 8] === KUCING && currentBoard[i + 12] === KUCING)
            return 2;
        if (currentBoard[i] === ANJING && currentBoard[i + 4] === ANJING && currentBoard[i + 8] === ANJING && currentBoard[i + 12] === ANJING)
            return 3;
    }

    // Check for diagonal wins
    if ((currentBoard[0] === KUCING && currentBoard[5] === KUCING && currentBoard[10] === KUCING && currentBoard[15] === KUCING) ||
        (currentBoard[3] === KUCING && currentBoard[6] === KUCING && currentBoard[9] === KUCING && currentBoard[12] === KUCING))
        return 2;

    if ((currentBoard[0] === ANJING && currentBoard[5] === ANJING && currentBoard[10] === ANJING && currentBoard[15] === ANJING) ||
        (currentBoard[3] === ANJING && currentBoard[6] === ANJING && currentBoard[9] === ANJING && currentBoard[12] === ANJING))
        return 3;

    // Check for tie
    for (i = 0; i < BOARD_SIZE; i++) {
        if (currentBoard[i] !== KUCING && currentBoard[i] !== ANJING)
            return 0;
    }
    return 1;
}

// Check for a winner.  Return
//   0 if no winner or tie yet
//   1 if it's a tie
//   2 if KUCING won
//   3 if ANJING won
function isGameOver(board) {
    if (checkWinningCondition(board) === 0) {
        return false
    } else if (checkWinningCondition(board) === 1) {
        var turnInfo = document.getElementById("turnInfo");
        tieSound.play();
        turnInfo.innerHTML = messages[1];
    } else if (checkWinningCondition(board) === 2) {
        var turnInfo = document.getElementById("turnInfo");
        winSound.play();
        turnInfo.innerHTML = messages[2];
    } else {
        var turnInfo = document.getElementById("turnInfo");
        loseSound.play();
        turnInfo.innerHTML = messages[3];
    }
    return true;
}