// Init the gameBoard and other UI elements
const gameBoard = document.querySelector("#gameboard")
const playerDisplay = document.querySelector("#player")
const infoDisplay = document.querySelector("#info-display")
const width = 8

// Global Variable for who's turn it is 
// Set the text on screen accordingly
let playerTurn = 'white'
playerDisplay.textContent = 'white'

let audio = new Audio("move-self.mp3")


// Array of starting positions of the pieces
// Each piece is defined in the pieces.js file as an SVG
// Which is essentially a scalable JPG
const startPieces = [
    rook, knight, bishop, queen, king, bishop, knight, rook,
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn, 
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null, 
    null, null, null, null, null, null, null, null, 
    null, null, null, null, null, null, null, null, 
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn, 
    rook, knight, bishop, queen, king, bishop, knight, rook

]

// Iterates through startingPieces
// Each square has a piece on it
function createBoard() {
    startPieces.forEach((startPiece, i) => {
        // For each of the 64 pieces it creates a square in the DOM
        const square = document.createElement('div')

        // Each square is given a square-id attribute, which is its position on the board 0-63
        // It is also given a row attribute that will be used to color the squares
        square.setAttribute('square-id', i)
        square.setAttribute('row', i / 8)

        // Each square is assigned an element from the startPieces array
        // If  the innerHTML is set to the empty '' element, then nothing appears in the square
        // If the innerHTML is set to one of the pieces from the pieces.js file, then a piece appears in that square
        square.innerHTML = startPiece

        // Each square is given a class list of square and beige
        // Look in the styles.css file to see what those do
        //Each square is also given a draggable attribute which allows it to be dragged, this is how we will moves pieces
        square.classList.add('square')
        square.classList.add('beige')
        square.firstChild?.setAttribute('draggable', true)


        // Draws the checkered pattern on the chess board and appends each square to the gameBoard element
        const row = Math.floor(((63 - i) / 8) + 1)
        if (row % 2 === 0) {
            square.classList.add(i % 2 === 0 ? "brown" : "blue")
        }
        else {
            square.classList.add(i % 2 === 0 ? "blue" : "brown")
        }
        if (i <= 15) {
            square.firstChild.classList.add('black')
        }
        if (i >= 48) {
            square.firstChild.classList.add('white')
        }
        gameBoard.append(square)
        })
    }


// Calling the createBoard function to make the starting board
createBoard();


// Adding eventListeners to all 64 squares on the board
const allSquares = document.querySelectorAll("#gameboard .square")

allSquares.forEach(square => {
    square.addEventListener('dragstart', dragStart)
    square.addEventListener('dragover', dragOver)
    square.addEventListener('drop', dragDrop)
})

let startPositionID
let draggedElement

let blackKingInCheck
let blackKingWasInCheck
let whiteKingInCheck
let whiteKingWasInCheck

let newPos
let oldPos
let revertPiece
let revertTaken
let revertCapturedPiece

// Function is called whenever an element begins to be dragged
// It gets the startPostion of the element from its square-id: the 0-63 number of each square on the board
// It also gets the draggedElement
// The draggedElement is the <div> of the piece. It contains information about what kind of piece it is
function dragStart(e) {
    startPositionID = e.target.parentNode.getAttribute('square-id')
    draggedElement = e.target
}

// Prevents browser weirdness
function dragOver(e) {
    e.preventDefault()
}

// This function currently checks to see if the piece 
function dragDrop(e) {
    e.stopPropagation();

    const correctTurn = draggedElement.classList.contains(playerTurn)
    const taken = e.target.classList.contains('piece')
    const opponentTurn = playerTurn === 'white' ? 'black' : 'white'
    const takingAlly = e.target.classList.contains(playerTurn)

    let targetSquareID;

    if (e.target.getAttribute('square-id') === null) {
        targetSquareID = e.target.parentNode.getAttribute('square-id');
    } else {
        targetSquareID = e.target.getAttribute('square-id');
    }
    
    const valid = checkIfValid(targetSquareID, startPositionID, draggedElement);
    

    console.log("valid move:  " + valid)

    // Checks first to see if the piece can move in a valid manner and if the piece is being moved on the correct turn
    // If it is the correct turn and the move is valid then it moves on
    // If the piece is trying to take one if its own pieces then the function returns nothing and does nothing, the piece is not dropped
    // If the piece is trying to take an opponent piece then the piece is dropped and the opponent piece is removed from the game
    // If the piece is moving to an empty square the piece is dropped there
    // If a piece is succesfully dropped the changePlayer function is called

    if (correctTurn && valid){
        if (taken) {
            revertCapturedPiece = e.target
            e.target.parentNode.append(draggedElement);
            e.target.remove()   
            audio = new Audio("capture.mp3")
        }
    
        else if (!taken) {
            e.target.append(draggedElement);
            audio = new Audio("move-self.mp3")
        }

        revertTaken = !taken
        newPos = targetSquareID
        oldPos = startPositionID
        revertPiece = draggedElement

        if (checkChecker()) {
            revertMove();
        }
        else {
        audio.play();
        changePlayer()
        }
    }
 }

 function revertMoveButton() {
    if (playerTurn == 'white') {
        blackIDs();
    }
    else {
        whiteIDs();
    }
    if (revertTaken) {
        document.querySelector(`[square-id="${oldPos}"]`).append(revertPiece)
        document.querySelector(`[square-id="${newPos}"]`).append(revertCapturedPiece)
    }
    changePlayer();
 }

 function revertMove() {
    if (playerTurn == 'white') {
        whiteIDs();
    }
    else {
        blackIDs();
    }
    if (revertTaken) {
        document.querySelector(`[square-id="${oldPos}"]`).append(revertPiece)
        document.querySelector(`[square-id="${newPos}"]`).append(revertCapturedPiece)
    } 
    else {
        document.querySelector(`[square-id="${oldPos}"]`).append(revertPiece)
    }
}

//Checks to see if a square does not contain a piece
function doesNotContainPiece(startID) {
    return !document.querySelector(`[square-id="${startID}"]`).firstChild || document.querySelector(`[square-id="${startID}"]`).firstChild == " " 
}

// Checks to see if the white or black king is in check
// Also updates if the kings were in check last turn
// If the function resolves to true than the move is reverted
function checkChecker() {
    
    whiteKingWasInCheck = whiteKingInCheck
    whiteKingInCheck = whiteInCheck()

    blackKingWasInCheck = blackKingInCheck
    blackKingInCheck = blackInCheck()

    console.log(blackKingInCheck + " bk in check")

    if (playerTurn === 'black' && !blackKingWasInCheck && blackKingInCheck) {
        return true
    }

    if (playerTurn === 'white' && !whiteKingWasInCheck && whiteKingInCheck) {
        return true
    }

    if (whiteKingWasInCheck && whiteKingInCheck) {
        return true
    }
    if (blackKingWasInCheck && blackKingInCheck) {
        return true
    }

}

// Checks if a move is valid but does not currently check if the move is legal
// Contains all the logic for how pieces should move

function checkIfValid(targetSquare, startPos, piece) {
    const targetID = Number(targetSquare)
    const startID = Number(startPos)
    const pieceID = piece.id

    let pieceColor; 

    if (piece.classList) {
        if (piece.classList.contains('white')) {
            pieceColor = 'white';
        } else {
            pieceColor = 'black';
        }
        if (document.querySelector(`[square-id="${targetID}"]`).firstChild && 
        document.querySelector(`[square-id="${targetID}"]`).firstChild.classList && document.querySelector(`[square-id="${targetID}"]`).firstChild.classList.contains(pieceColor)) {
            return false;
        }
    }

    

    switch(pieceID) {
        case 'pawn' :
            const starterRow = [8, 9, 10, 11, 12, 13, 14, 15]
            if (starterRow.includes(startID) && startID + width * 2 === targetID && !document.querySelector(`[square-id="${startID + width}"]`).firstChild) {
                return true
            }
            if (startID + width === targetID && !document.querySelector(`[square-id="${startID + width}"]`).firstChild) {
                return true
            }
            if (startID + width - 1 === targetID && document.querySelector(`[square-id="${startID + width - 1}"]`).firstChild
            || startID + width + 1 === targetID && document.querySelector(`[square-id="${startID + width + 1}"]`).firstChild) {
                return true
            }
            break;
        case 'knight' :
            if (
                startID + width * 2 - 1 === targetID || startID + width * 2 + 1 === targetID
                || startID + width - 2 === targetID || startID + width + 2 === targetID ||
                startID - width * 2 - 1 === targetID || startID - width * 2 + 1 === targetID
                || startID - width - 2 === targetID || startID - width + 2 === targetID
                
            ) {
                return true;
            }
            break;
        case 'bishop':
            if (document.querySelector(`[square-id="${targetID}"]`).classList.contains('brown') && document.querySelector(`[square-id="${startID}"]`).classList.contains('blue')) {
                return false
            }
            if (document.querySelector(`[square-id="${startID}"]`).classList.contains('brown') && document.querySelector(`[square-id="${targetID}"]`).classList.contains('blue')) {
                return false
            }
            if (
                startID + width + 1 === targetID ||
                (startID + width * 2 + 2 === targetID && !document.querySelector(`[square-id="${startID + width + 1}"]`).firstChild) ||
                (startID + width * 3 + 3 === targetID && 
                    !document.querySelector(`[square-id="${startID + width + 1}"]`).firstChild && 
                    !document.querySelector(`[square-id="${startID + width * 2 + 2}"]`).firstChild) ||
                (startID + width * 4 + 4 === targetID &&
                    !document.querySelector(`[square-id="${startID + width + 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 2 + 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 3 + 3}"]`).firstChild) ||
                (startID + width * 5 + 5 === targetID &&
                    !document.querySelector(`[square-id="${startID + width + 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 2 + 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 3 + 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 4 + 4}"]`).firstChild) ||
                (startID + width * 6 + 6 === targetID &&
                    !document.querySelector(`[square-id="${startID + width + 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 2 + 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 3 + 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 4 + 4}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 5 + 5}"]`).firstChild) ||
                (startID + width * 7 + 7 === targetID &&
                    !document.querySelector(`[square-id="${startID + width + 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 2 + 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 3 + 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 4 + 4}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 5 + 5}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 6 + 6}"]`).firstChild)
            ) {
                return true;
            }
            if (
                startID + width - 1 === targetID ||
                (startID + width * 2 - 2 === targetID && !document.querySelector(`[square-id="${startID + width - 1}"]`).firstChild) ||
                (startID + width * 3 - 3 === targetID && 
                    !document.querySelector(`[square-id="${startID + width - 1}"]`).firstChild && 
                    !document.querySelector(`[square-id="${startID + width * 2 - 2}"]`).firstChild) ||
                // Continue adding conditions...
                (startID + width * 4 - 4 === targetID &&
                    !document.querySelector(`[square-id="${startID + width - 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 2 - 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 3 - 3}"]`).firstChild) ||
                (startID + width * 5 - 5 === targetID &&
                    !document.querySelector(`[square-id="${startID + width - 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 2 - 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 3 - 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 4 - 4}"]`).firstChild) ||
                (startID + width * 6 - 6 === targetID &&
                    !document.querySelector(`[square-id="${startID + width - 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 2 - 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 3 - 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 4 - 4}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 5 - 5}"]`).firstChild) ||
                (startID + width * 7 - 7 === targetID &&
                    !document.querySelector(`[square-id="${startID + width - 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 2 - 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 3 - 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 4 - 4}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 5 - 5}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 6 - 6}"]`).firstChild)
            ) {
                return true;
            }
            if (
                startID - width - 1 === targetID ||
                (startID - width * 2 - 2 === targetID && !document.querySelector(`[square-id="${startID - width - 1}"]`).firstChild) ||
                (startID - width * 3 - 3 === targetID && 
                    !document.querySelector(`[square-id="${startID - width - 1}"]`).firstChild && 
                    !document.querySelector(`[square-id="${startID - width * 2 - 2}"]`).firstChild) ||
                // Continue adding conditions...
                (startID - width * 4 - 4 === targetID &&
                    !document.querySelector(`[square-id="${startID - width - 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 2 - 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 3 - 3}"]`).firstChild) ||
                (startID - width * 5 - 5 === targetID &&
                    !document.querySelector(`[square-id="${startID - width - 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 2 - 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 3 - 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 4 - 4}"]`).firstChild) ||
                (startID - width * 6 - 6 === targetID &&
                    !document.querySelector(`[square-id="${startID - width - 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 2 - 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 3 - 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 4 - 4}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 5 - 5}"]`).firstChild) ||
                (startID - width * 7 - 7 === targetID &&
                    !document.querySelector(`[square-id="${startID - width - 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 2 - 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 3 - 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 4 - 4}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 5 - 5}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 6 - 6}"]`).firstChild)
            ) {
                return true;
            }
            if (
                startID - width + 1 === targetID ||
                (startID - width * 2 + 2 === targetID && !document.querySelector(`[square-id="${startID - width - 1}"]`).firstChild) ||
                (startID - width * 3 + 3 === targetID && 
                    !document.querySelector(`[square-id="${startID - width + 1}"]`).firstChild && 
                    !document.querySelector(`[square-id="${startID - width * 2 + 2}"]`).firstChild) ||
                // Continue adding conditions...
                (startID - width * 4 - 4 === targetID &&
                    !document.querySelector(`[square-id="${startID - width + 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 2 + 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 3 + 3}"]`).firstChild) ||
                (startID - width * 5 - 5 === targetID &&
                    !document.querySelector(`[square-id="${startID - width - 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 2 + 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 3 + 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 4 + 4}"]`).firstChild) ||
                (startID - width * 6 - 6 === targetID &&
                    !document.querySelector(`[square-id="${startID - width + 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 2 + 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 3 + 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 4 + 4}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 5 + 5}"]`).firstChild) ||
                (startID - width * 7 - 7 === targetID &&
                    !document.querySelector(`[square-id="${startID - width + 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 2 + 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 3 + 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 4 + 4}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 5 + 5}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 6 + 6}"]`).firstChild)
            ) {
                return true;
            }
            break;
        case "rook" :
        // Moving Up
        if (
            startID + width === targetID ||
            (startID + width * 2 === targetID && doesNotContainPiece(startID + width)) ||
            (startID + width * 3 === targetID &&
                doesNotContainPiece(startID + width * 2) &&
                doesNotContainPiece(startID + width)) ||
            (startID + width * 4 === targetID &&
                doesNotContainPiece(startID + width * 3) &&
                doesNotContainPiece(startID + width * 2) &&
                doesNotContainPiece(startID + width)) ||
            (startID + width * 5 === targetID &&
                doesNotContainPiece(startID + width * 4) &&
                doesNotContainPiece(startID + width * 3) &&
                doesNotContainPiece(startID + width * 2) &&
                doesNotContainPiece(startID + width)) ||
            (startID + width * 6 === targetID &&
                doesNotContainPiece(startID + width * 5) &&
                doesNotContainPiece(startID + width * 4) &&
                doesNotContainPiece(startID + width * 3) &&
                doesNotContainPiece(startID + width * 2) &&
                doesNotContainPiece(startID + width)) ||
            (startID + width * 7 === targetID &&
                doesNotContainPiece(startID + width * 6) &&
                doesNotContainPiece(startID + width * 5) &&
                doesNotContainPiece(startID + width * 4) &&
                doesNotContainPiece(startID + width * 3) &&
                doesNotContainPiece(startID + width * 2) &&
                doesNotContainPiece(startID + width))
        ) {
            return true; // Valid move
        }

        // Moving Down
        
        if (
            startID - width === targetID ||
            (startID - width * 2 === targetID && doesNotContainPiece(startID - width)) ||
            (startID - width * 3 === targetID &&
                doesNotContainPiece(startID - width * 2) &&
                doesNotContainPiece(startID - width)) ||
            (startID - width * 4 === targetID &&
                doesNotContainPiece(startID - width * 3) &&
                doesNotContainPiece(startID - width * 2) &&
                doesNotContainPiece(startID - width)) ||
            (startID - width * 5 === targetID &&
                doesNotContainPiece(startID - width * 4) &&
                doesNotContainPiece(startID - width * 3) &&
                doesNotContainPiece(startID - width * 2) &&
                doesNotContainPiece(startID - width)) ||
            (startID - width * 6 === targetID &&
                doesNotContainPiece(startID - width * 5) &&
                doesNotContainPiece(startID - width * 4) &&
                doesNotContainPiece(startID - width * 3) &&
                doesNotContainPiece(startID - width * 2) &&
                doesNotContainPiece(startID - width)) ||
            (startID - width * 7 === targetID &&
                doesNotContainPiece(startID - width * 6) &&
                doesNotContainPiece(startID - width * 5) &&
                doesNotContainPiece(startID - width * 4) &&
                doesNotContainPiece(startID - width * 3) &&
                doesNotContainPiece(startID - width * 2) &&
                doesNotContainPiece(startID - width))
        ) {
            return true; // Valid move
        }

            // Moving Left
            if (
                startID + 1 === targetID ||
                (startID + 2 === targetID && doesNotContainPiece(startID + 1)) ||
                (startID + 3 === targetID &&
                    doesNotContainPiece(startID + 2) &&
                    doesNotContainPiece(startID + 1)) ||
                (startID + 4 === targetID &&
                    doesNotContainPiece(startID + 3) &&
                    doesNotContainPiece(startID + 2) &&
                    doesNotContainPiece(startID + 1)) ||
                (startID + 5 === targetID &&
                    doesNotContainPiece(startID + 4) &&
                    doesNotContainPiece(startID + 3) &&
                    doesNotContainPiece(startID + 2) &&
                    doesNotContainPiece(startID + 1)) ||
                (startID + 6 === targetID &&
                    doesNotContainPiece(startID + 5) &&
                    doesNotContainPiece(startID + 4) &&
                    doesNotContainPiece(startID + 3) &&
                    doesNotContainPiece(startID + 2) &&
                    doesNotContainPiece(startID + 1)) ||
                (startID + 7 === targetID &&
                    doesNotContainPiece(startID + 6) &&
                    doesNotContainPiece(startID + 5) &&
                    doesNotContainPiece(startID + 4) &&
                    doesNotContainPiece(startID + 3) &&
                    doesNotContainPiece(startID + 2) &&
                    doesNotContainPiece(startID + 1))
            ) {
                return true; // Valid move
            }

            // Moving Right 
            if (
                startID - 1 === targetID ||
                (startID - 2 === targetID && doesNotContainPiece(startID - 1)) ||
                (startID - 3 === targetID &&
                    doesNotContainPiece(startID - 2) &&
                    doesNotContainPiece(startID - 1)) ||
                (startID - 4 === targetID &&
                    doesNotContainPiece(startID - 3) &&
                    doesNotContainPiece(startID - 2) &&
                    doesNotContainPiece(startID - 1)) ||
                (startID - 5 === targetID &&
                    doesNotContainPiece(startID - 4) &&
                    doesNotContainPiece(startID - 3) &&
                    doesNotContainPiece(startID - 2) &&
                    doesNotContainPiece(startID - 1)) ||
                (startID - 6 === targetID &&
                    doesNotContainPiece(startID - 5) &&
                    doesNotContainPiece(startID - 4) &&
                    doesNotContainPiece(startID - 3) &&
                    doesNotContainPiece(startID - 2) &&
                    doesNotContainPiece(startID - 1)) ||
                (startID - 7 === targetID &&
                    doesNotContainPiece(startID - 6) &&
                    doesNotContainPiece(startID - 5) &&
                    doesNotContainPiece(startID - 4) &&
                    doesNotContainPiece(startID - 3) &&
                    doesNotContainPiece(startID - 2) &&
                    doesNotContainPiece(startID - 1))
            ) {
                return true; // Valid move
            }
            break;
        case "queen":
            
            if (
                startID + width + 1 === targetID ||
                (startID + width * 2 + 2 === targetID && !document.querySelector(`[square-id="${startID + width + 1}"]`).firstChild) ||
                (startID + width * 3 + 3 === targetID && 
                    !document.querySelector(`[square-id="${startID + width + 1}"]`).firstChild && 
                    !document.querySelector(`[square-id="${startID + width * 2 + 2}"]`).firstChild) ||
                (startID + width * 4 + 4 === targetID &&
                    !document.querySelector(`[square-id="${startID + width + 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 2 + 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 3 + 3}"]`).firstChild) ||
                (startID + width * 5 + 5 === targetID &&
                    !document.querySelector(`[square-id="${startID + width + 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 2 + 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 3 + 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 4 + 4}"]`).firstChild) ||
                (startID + width * 6 + 6 === targetID &&
                    !document.querySelector(`[square-id="${startID + width + 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 2 + 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 3 + 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 4 + 4}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 5 + 5}"]`).firstChild) ||
                (startID + width * 7 + 7 === targetID &&
                    !document.querySelector(`[square-id="${startID + width + 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 2 + 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 3 + 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 4 + 4}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 5 + 5}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 6 + 6}"]`).firstChild)
            ) {
                return true;
            }
            if (
                startID + width - 1 === targetID ||
                (startID + width * 2 - 2 === targetID && !document.querySelector(`[square-id="${startID + width - 1}"]`).firstChild) ||
                (startID + width * 3 - 3 === targetID && 
                    !document.querySelector(`[square-id="${startID + width - 1}"]`).firstChild && 
                    !document.querySelector(`[square-id="${startID + width * 2 - 2}"]`).firstChild) ||
                // Continue adding conditions...
                (startID + width * 4 - 4 === targetID &&
                    !document.querySelector(`[square-id="${startID + width - 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 2 - 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 3 - 3}"]`).firstChild) ||
                (startID + width * 5 - 5 === targetID &&
                    !document.querySelector(`[square-id="${startID + width - 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 2 - 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 3 - 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 4 - 4}"]`).firstChild) ||
                (startID + width * 6 - 6 === targetID &&
                    !document.querySelector(`[square-id="${startID + width - 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 2 - 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 3 - 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 4 - 4}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 5 - 5}"]`).firstChild) ||
                (startID + width * 7 - 7 === targetID &&
                    !document.querySelector(`[square-id="${startID + width - 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 2 - 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 3 - 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 4 - 4}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 5 - 5}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 6 - 6}"]`).firstChild)
            ) {
                return true;
            }
            if (
                startID - width - 1 === targetID ||
                (startID - width * 2 - 2 === targetID && !document.querySelector(`[square-id="${startID - width - 1}"]`).firstChild) ||
                (startID - width * 3 - 3 === targetID && 
                    !document.querySelector(`[square-id="${startID - width - 1}"]`).firstChild && 
                    !document.querySelector(`[square-id="${startID - width * 2 - 2}"]`).firstChild) ||
                // Continue adding conditions...
                (startID - width * 4 - 4 === targetID &&
                    !document.querySelector(`[square-id="${startID - width - 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 2 - 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 3 - 3}"]`).firstChild) ||
                (startID - width * 5 - 5 === targetID &&
                    !document.querySelector(`[square-id="${startID - width - 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 2 - 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 3 - 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 4 - 4}"]`).firstChild) ||
                (startID - width * 6 - 6 === targetID &&
                    !document.querySelector(`[square-id="${startID - width - 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 2 - 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 3 - 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 4 - 4}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 5 - 5}"]`).firstChild) ||
                (startID - width * 7 - 7 === targetID &&
                    !document.querySelector(`[square-id="${startID - width - 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 2 - 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 3 - 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 4 - 4}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 5 - 5}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 6 - 6}"]`).firstChild)
            ) {
                return true;
            }
            if (
                startID - width + 1 === targetID ||
                (startID - width * 2 + 2 === targetID && !document.querySelector(`[square-id="${startID - width - 1}"]`).firstChild) ||
                (startID - width * 3 + 3 === targetID && 
                    !document.querySelector(`[square-id="${startID - width + 1}"]`).firstChild && 
                    !document.querySelector(`[square-id="${startID - width * 2 + 2}"]`).firstChild) ||
                // Continue adding conditions...
                (startID - width * 4 - 4 === targetID &&
                    !document.querySelector(`[square-id="${startID - width + 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 2 + 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 3 + 3}"]`).firstChild) ||
                (startID - width * 5 - 5 === targetID &&
                    !document.querySelector(`[square-id="${startID - width - 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 2 + 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 3 + 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 4 + 4}"]`).firstChild) ||
                (startID - width * 6 - 6 === targetID &&
                    !document.querySelector(`[square-id="${startID - width + 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 2 + 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 3 + 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 4 + 4}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 5 + 5}"]`).firstChild) ||
                (startID - width * 7 - 7 === targetID &&
                    !document.querySelector(`[square-id="${startID - width + 1}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 2 + 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 3 + 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 4 + 4}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 5 + 5}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 6 + 6}"]`).firstChild)
            ) {
                return true;
            }

            
             // Moving Up
             if (
                startID + width === targetID ||
                (startID + width * 2 === targetID && !document.querySelector(`[square-id="${startID + width}"]`).firstChild) ||
                (startID + width * 3 === targetID && 
                    !document.querySelector(`[square-id="${startID + width * 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width}"]`).firstChild) ||
                (startID + width * 4 === targetID && 
                    !document.querySelector(`[square-id="${startID + width * 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width}"]`).firstChild) ||
                (startID + width * 5 === targetID && 
                    !document.querySelector(`[square-id="${startID + width * 4}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width}"]`).firstChild) ||
                (startID + width * 6 === targetID && 
                    !document.querySelector(`[square-id="${startID + width * 5}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 4}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width}"]`).firstChild) ||
                (startID + width * 7 === targetID && 
                    !document.querySelector(`[square-id="${startID + width * 6}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 5}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 4}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width * 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + width}"]`).firstChild)
            ) {
                return true; // Valid move
            } 

            // Moving Down
            if (
                startID - width === targetID ||
                (startID - width * 2 === targetID && !document.querySelector(`[square-id="${startID - width}"]`).firstChild) ||
                (startID - width * 3 === targetID && 
                    !document.querySelector(`[square-id="${startID - width * 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width}"]`).firstChild) ||
                (startID - width * 4 === targetID && 
                    !document.querySelector(`[square-id="${startID - width * 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width}"]`).firstChild) ||
                (startID - width * 5 === targetID && 
                    !document.querySelector(`[square-id="${startID - width * 4}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width}"]`).firstChild) ||
                (startID - width * 6 === targetID && 
                    !document.querySelector(`[square-id="${startID - width * 5}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 4}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width}"]`).firstChild) ||
                (startID - width * 7 === targetID && 
                    !document.querySelector(`[square-id="${startID - width * 6}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 5}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 4}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width * 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID - width}"]`).firstChild)
            ) 
            {
                return true; // Valid move
            } 

            // Moving Right 
            if (
                startID + 1 === targetID ||
                (startID + 2 === targetID && !document.querySelector(`[square-id="${startID + 1}"]`).firstChild) ||
                (startID + 3 === targetID && 
                    !document.querySelector(`[square-id="${startID + 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + 1}"]`).firstChild) ||
                (startID + 4 === targetID && 
                    !document.querySelector(`[square-id="${startID + 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + 1}"]`).firstChild) ||
                (startID + 5 === targetID && 
                    !document.querySelector(`[square-id="${startID + 4}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + 1}"]`).firstChild) ||
                (startID + 6 === targetID && 
                    !document.querySelector(`[square-id="${startID + 5}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + 4}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + 1}"]`).firstChild) ||
                (startID + 7 === targetID && 
                    !document.querySelector(`[square-id="${startID + 6}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + 5}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + 4}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + 3}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + 2}"]`).firstChild &&
                    !document.querySelector(`[square-id="${startID + 1}"]`).firstChild)
            ) {
                return true; // Valid move
            } 

                       // Moving Left 
                       if (
                        startID - 1 === targetID ||
                        (startID - 2 === targetID && !document.querySelector(`[square-id="${startID - 1}"]`).firstChild) ||
                        (startID - 3 === targetID && 
                            !document.querySelector(`[square-id="${startID - 2}"]`).firstChild &&
                            !document.querySelector(`[square-id="${startID - 1}"]`).firstChild) ||
                        (startID - 4 === targetID && 
                            !document.querySelector(`[square-id="${startID - 3}"]`).firstChild &&
                            !document.querySelector(`[square-id="${startID - 2}"]`).firstChild &&
                            !document.querySelector(`[square-id="${startID - 1}"]`).firstChild) ||
                        (startID - 5 === targetID && 
                            !document.querySelector(`[square-id="${startID - 4}"]`).firstChild &&
                            !document.querySelector(`[square-id="${startID - 3}"]`).firstChild &&
                            !document.querySelector(`[square-id="${startID - 2}"]`).firstChild &&
                            !document.querySelector(`[square-id="${startID - 1}"]`).firstChild) ||
                        (startID - 6 === targetID && 
                            !document.querySelector(`[square-id="${startID - 5}"]`).firstChild &&
                            !document.querySelector(`[square-id="${startID - 4}"]`).firstChild &&
                            !document.querySelector(`[square-id="${startID - 3}"]`).firstChild &&
                            !document.querySelector(`[square-id="${startID - 2}"]`).firstChild &&
                            !document.querySelector(`[square-id="${startID - 1}"]`).firstChild) ||
                        (startID - 7 === targetID && 
                            !document.querySelector(`[square-id="${startID - 6}"]`).firstChild &&
                            !document.querySelector(`[square-id="${startID - 5}"]`).firstChild &&
                            !document.querySelector(`[square-id="${startID - 4}"]`).firstChild &&
                            !document.querySelector(`[square-id="${startID - 3}"]`).firstChild &&
                            !document.querySelector(`[square-id="${startID - 2}"]`).firstChild &&
                            !document.querySelector(`[square-id="${startID - 1}"]`).firstChild)
                    ) {
                        return true; // Valid move
                    } 
                    break;
        case "king" :
                if (
                    startID + 1 === targetID ||
                    startID - 1 === targetID ||
                    startID + width === targetID ||
                    startID - width === targetID ||
                    startID + width + 1 === targetID ||
                    startID - width + 1 === targetID ||
                    startID + width - 1 === targetID ||
                    startID - width - 1 === targetID 
                )
                {
                    return true;
                }
    }
}

// Makes the squareIDs from white's perspective
function whiteIDs() {
    const allSquares = document.querySelectorAll(".square")
    allSquares.forEach((square, i) => 
    square.setAttribute("square-id", (width * width - 1) - i))
}

// Makes the squareIDS from black's perspective
function blackIDs() {
    const allSquares = document.querySelectorAll(".square")
    allSquares.forEach((square, i) => 
    square.setAttribute('square-id', i))
}

// Changes the playerTurn variable and boardIDs
 function changePlayer() {

    if (playerTurn === 'black') {
        playerTurn = 'white'
        playerDisplay.textContent = 'white'
        whiteIDs()
    }
    else {
        playerTurn = 'black'
        playerDisplay.textContent = 'black'
        blackIDs()
    // Generate a random delay between 2 and 5 seconds (in milliseconds)
    const randomDelay = Math.floor(Math.random() * (2500 - 1000 + 1)) + 1000;

    // Call generateBlackMove after the random delay
    setTimeout(() => {
        generateBlackMove();
    }, randomDelay);
    }

 }

// In Progress Function used to see if the king is in check
// Conceptual Idea: Create a list of all opponent pieces, for each piece generate a list of all the legal squares that piece can move o
// add all these lists together to make a list of all the legal squares the opponent can move to
// if the king's square is in that list of legal move squares, the king is in check
 function blackInCheck() {
    whiteIDs();
    let pieceSquares = []

    const whiteHitSquares = []
    const whitePieces = document.querySelectorAll('.white')

    const blackKingElement = document.querySelector('.piece.black#king');
    const blackKingPosition = Number(blackKingElement.parentNode.getAttribute("square-id"))
    
    whitePieces.forEach((piece) => {
        pieceSquares = checkAllLegalMovesForPiece(piece)
        pieceSquares.forEach((square) => {
            if (!whiteHitSquares.includes(square)){
            whiteHitSquares.push(square)
            }
        })
    })
    
    if (playerTurn == 'white') {
        whiteIDs();
    }
    else {
        blackIDs();
    }


    console.log("It is " + whiteHitSquares.includes(blackKingPosition) + " that the black king is in check")

    return whiteHitSquares.includes(blackKingPosition)

 }

 function whiteInCheck() {
    blackIDs();
    let pieceSquares = []


    const blackHitSquares = []
    const blackPieces = document.querySelectorAll('.black')

    const whiteKingElement = document.querySelector('.piece.white#king');
    const whiteKingPosition = Number(whiteKingElement.parentNode.getAttribute("square-id"))
    
    blackPieces.forEach((piece) => {
        pieceSquares = checkAllLegalMovesForPiece(piece)
        pieceSquares.forEach((square) => {
            if (!blackHitSquares.includes(square)){
            blackHitSquares.push(square)
            }
        })
    })

    if (playerTurn == 'white') {
        whiteIDs();
    }
    else {
        blackIDs();
    }



    console.log("It is " + blackHitSquares.includes(whiteKingPosition) + " that the white king is in check")

    return blackHitSquares.includes(whiteKingPosition)

 }

// Helper function for the inCheck function
// In Progress, currently iterates through all the positions 0-63 on the board and checks if a piece can legally move there
// Need to make checkIfValid into checkIfLegal function before this can work properly
 function checkAllLegalMovesForPiece(piece) {
    const legalMoveSquares = []
    const piecePosition = Number(piece.parentNode.getAttribute('square-id'))

    for (let i = 0; i < 64; i++) {
        if (checkIfValid(i, piecePosition, piece)) {
            legalMoveSquares.push(i)
        }
    }
    return legalMoveSquares
 }


 // Array of tuples that contains black pieces and legal move squares
 // Picks at random a piece then a move square
 function generateBlackMove() {
    blackIDs()
    // Get all black pieces
    const blackPieces = document.querySelectorAll('.black');

    // Select a random black piece
    const randomPieceIndex = Math.floor(Math.random() * blackPieces.length);
    const randomBlackPiece = blackPieces[randomPieceIndex];

    // Get legal move squares for the selected piece
    const legalMoveSquares = checkAllLegalMovesForPiece(randomBlackPiece);

    if (legalMoveSquares == 0) {
        generateBlackMove();
    }

    // If there are legal moves, select a random legal move square
    if (legalMoveSquares.length > 0) {
        const randomMoveIndex = Math.floor(Math.random() * legalMoveSquares.length);
        const randomMoveSquare = legalMoveSquares[randomMoveIndex];

        oldPos = randomBlackPiece.parentNode.getAttribute('square-id')
        revertPiece = randomBlackPiece

        if (doesNotContainPiece(randomMoveSquare)) {
        document.querySelector(`[square-id="${randomMoveSquare}"]`).append(randomBlackPiece)
        audio = new Audio("move-self.mp3")

        }
        else {
            audio = new Audio("capture.mp3")

            document.querySelector(`[square-id="${randomMoveSquare}"]`).append(randomBlackPiece)
            document.querySelector(`[square-id="${randomMoveSquare}"]`).firstChild.remove()
        }

        console.log(randomBlackPiece.id + " to " + randomMoveSquare)


        // console.log(randomMoveIndex + " randomMoveIndex")
        // console.log(randomMoveSquare + " randomMoveSquare")
        // console.log(legalMoveSquares + " legal move square")
        // console.log(randomBlackPiece.id + " piece")
    }

    if (checkChecker()) {
        revertMove()
        generateBlackMove();
    }
    else {
    playerTurn = 'black'
    audio.play()
    changePlayer()
    }

    // If no legal moves, return null
    return null;
}

function checkMateChecker() {
    
}

 
 // Sets IDs to white IDS when game begins
 whiteIDs();