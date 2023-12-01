// Init the gameBoard and other UI elements
const gameBoard = document.querySelector("#gameboard")
const playerDisplay = document.querySelector("#player")
const infoDisplay = document.querySelector("#info-display")
const width = 8

// Global Variable for who's turn it is 
// Set the text on screen accordingly
let playerTurn = 'white'
playerDisplay.textContent = 'white'


// Array of starting positions of the pieces
// Each piece is defined in the pieces.js file as an SVG
// Which is essentially a scalable JPG
const startPieces = [
    rook, knight, bishop, queen, king, bishop, knight, rook,
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn, 
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', 
    '', '', '', '', '', '', '', '', 
    '', '', '', '', '', '', '', '', 
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
            square.classList.add(i % 2 === 0 ? "beige" : "brown")
        }
        else {
            square.classList.add(i % 2 === 0 ? "brown" : "beige")
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

    let squareID;

    if (e.target.getAttribute('square-id') === null) {
        squareID = e.target.parentNode.getAttribute('square-id');
    } else {
        squareID = e.target.getAttribute('square-id');
    }
    
    const valid = checkIfValid(squareID, startPositionID, draggedElement.id, takingAlly);
    
    const kingInCheck = inCheck()

    console.log("valid " + valid)

    // Checks first to see if the piece can move in a valid manner and if the piece is being moved on the correct turn
    // If it is the correct turn and the move is valid then it moves on
    // If the piece is trying to take one if its own pieces then the function returns nothing and does nothing, the piece is not dropped
    // If the piece is trying to take an opponent piece then the piece is dropped and the opponent piece is removed from the game
    // If the piece is moving to an empty square the piece is dropped there
    // If a piece is succesfully dropped the changePlayer function is called

    if (correctTurn && valid){
        if (taken && takingAlly) {
            return
        }
        if (taken && !takingAlly) {
            e.target.parentNode.append(draggedElement);
            e.target.remove()   
        }
    
        else if (!taken) {
            e.target.append(draggedElement);
        }
        changePlayer()
    }

 }

// Checks if a move is valid but does not currently check if the move is legal
// Contains all the logic for how pieces should move

// TODO: turn this into a general isLegalMove function
// Thought: pass in color of the piece and the color of the opponent
// If targetID has a piece of same color on it then return false

function checkIfValid(targetSquare, startPos, pieceType, takingAlly) {
    const targetID = Number(targetSquare)
    const startID = Number(startPos)
    const piece = pieceType

    // console.log(targetSquare + " TiD")
    // console.log(startID + " sID")
    // console.log(pieceType + " piecetype")

    if (takingAlly) {
        return false
    }
     
    switch(piece) {
        case 'pawn' :
            const starterRow = [8, 9, 10, 11, 12, 13, 14, 15]
            if (starterRow.includes(startID) && startID + width * 2 === targetID) {
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
        case 'bishop':
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
            break;
        case "rook" :
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
        case "queen":
            if (
                startID + width + 1 === targetID ||
                (startID + width * 2 + 2 === targetID && !document.querySelector(`[square-id="${startID + width + 1}"]`).firstChild) ||
                (startID + width * 3 + 3 === targetID && 
                    !document.querySelector(`[square-id="${startID + width + 1}"]`).firstChild && 
                    !document.querySelector(`[square-id="${startID + width * 2 + 2}"]`).firstChild) ||
                // Continue adding conditions...
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
function reverseIDs() {
    const allSquares = document.querySelectorAll(".square")
    allSquares.forEach((square, i) => 
    square.setAttribute("square-id", (width * width - 1) - i))
}

// Makes the squareIDS from black's perspective
function revertIDs() {
    const allSquares = document.querySelectorAll(".square")
    allSquares.forEach((square, i) => 
    square.setAttribute('square-id', i))
}

// Changes the playerTurn variable
 function changePlayer() {
    if (playerTurn === 'black') {
        playerTurn = 'white'
        playerDisplay.textContent = 'white'
        reverseIDs()
    }
    else {
        playerTurn = 'black'
        playerDisplay.textContent = 'black'
        revertIDs()

    }
 }

// In Progress Function used to see if the king is in check
// Conceptual Idea: Create a list of all opponent pieces, for each piece generate a list of all the legal squares that piece can move o
// add all these lists together to make a list of all the legal squares the opponent can move to
// if the king's square is in that list of legal move squares, the king is in check
 function inCheck() {
    const hitSquares = []
    const kingPosition = Number(startPositionID)

    if (playerTurn === 'white') {
        const color = 'black'
        let blackPostitions = []

        const blackPieces = document.querySelectorAll('.black')
        blackPieces.forEach((piece) => {
            blackPostitions.push(piece.parentNode.getAttribute('square-id'))
        })

        let pieceSquares = []

        blackPieces.forEach((piece) => {
            pieceSquares = checkAllLegalMovesForPiece(piece, blackPostitions)
            pieceSquares.forEach((square) => {
                hitSquares.push(square)
            })
            console.log(pieceSquares)
        })
    }
    // console.log(hitSquares)
    // console.log(hitSquares.includes(kingPosition))
 }

// Helper function for the inCheck function
// In Progress, currently iterates through all the positions 0-63 on the board and checks if a piece can legally move there
// Need to make checkIfValid into checkIfLegal function before this can work properly
 function checkAllLegalMovesForPiece(piece, piecePositions) {
    const legalMoveSquares = []
    const piecePosition = Number(piece.parentNode.getAttribute('square-id'))
    const pieceType = piece.getAttribute('id')
    const takingAlly = piece.classList.contains('black')
    
    for (let i = 0; i < 64; i++) {
        if (checkIfValid(i, piecePosition, pieceType, takingAlly)) {
            legalMoveSquares.push(i)
        }
    }
    return legalMoveSquares
 }
 
 // Sets IDs  to white IDS when game begins
 reverseIDs()

 