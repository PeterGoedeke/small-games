// in this file: code for 2048 game
// there is a 4x4 grid of tiles. the game starts with two random tiles and one more is added for each keypress which results in tile movement.
// tiles move in the direction of the user's keypress unless blocked by the edge or another tile.
// if blocked by another tile of the same magnitude, the tiles may merge into a singular tile. this only happens if neither of these two tiles have already merged within the same movement.

const gameBox = document.querySelector('.game')
// setup tiles array containing an object which handles the display of each tile
const tiles = [[], [], [], []]
for(let i = 0; i < 4; i++) {
    for(let j = 0; j < 4; j++) {
        tiles[i][j] = createTile()
        gameBox.appendChild(tiles[i][j].element)
    }
}
// factory function for creating tiles; used 16 times in setup
function createTile() {
    const element = document.createElement('div')
    element.className = 'tile'

    const tile = {
        element, justMerged: false,
        // changes the display of a tile based on the corresponding number
        setNumber(number) {
            if(number) this.element.textContent = number
            else this.element.textContent = ''
            chooseColour(this.element, number)
        }
    }
    return tile
}

// 4x4 array containing the numbers at each grid location
let gameState = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]

// selects a random empty tile on the board and spawns a 2 or a 4
function spawnTile() {
    let emptySquares = 0
    gameState.forEach(row => row.forEach(square => {
        if(square == 0) emptySquares ++
    }))

    if(emptySquares > 0) {
        let failed = true
        // select a random tile until one is found which is empty
        while(failed) {
            const x = Math.floor(Math.random() * 4)
            const y = Math.floor(Math.random() * 4)
            
            if(gameState[x][y] == 0) {
                gameState[x][y] = Math.random() < 0.25 ? 4 : 2
                failed = false
            }
        }
    }
}
// start the game with two tiles 
spawnTile()
spawnTile()
refreshBoard()

// shifts a tile in the desired direction until it hits the edge or merges into another tile
// returns true if the tile was moved and false if it was not
function shift(x, y, dx, dy, hasMerged = false) {
    const tileValue = gameState[x][y]

    // make sure that nothing happens if the tile has reached the edge or is an empty tile
    const hasReachedBorder = x + dx == -1 || x + dx == 4 || y + dy == -1 || y + dy == 4
    if(hasReachedBorder || tileValue == 0) return false
    // make sure that false is returned if the tile is blocked from movement
    const isBlocked = gameState[x + dx][y + dy] != tileValue && gameState[x + dx][y + dy] != 0
    if(isBlocked) return false

    // move the tile only if it is unblocked or merging is allowed
    const isNotBlocked = gameState[x + dx][y + dy] == 0
    const isBlockedByEqualTile = gameState[x + dx][y + dy] == tileValue
    const mergingAllowed = !hasMerged && !tiles[x + dx][y + dy].justMerged
    if(isNotBlocked || isBlockedByEqualTile && mergingAllowed) {
        // set merging status to ensure that duplicate merges cannot happen
        const justMerged = gameState[x + dx][y + dy] == tileValue
        tiles[x + dx][y + dy].justMerged = justMerged

        gameState[x][y] = 0
        gameState[x + dx][y + dy] += tileValue
        shift(x + dx, y + dy, dx, dy, justMerged)
    }
    return true
}
// refresh the board display to match the game state
function refreshBoard() {
    for(let i = 0; i < 4; i++) {
        for(let j = 0; j < 4; j++) {
            tiles[i][j].setNumber(gameState[i][j])
            tiles[i][j].justMerged = false
        }
    }
}

const [LEFT, UP, RIGHT, DOWN] = [37, 38, 39, 40]
// listen for user key presses. run the shift method on every tile and keep track of whether movement occured. if it did, then a new tile may be added and the board is refreshed
addEventListener('keyup', event => {
    let merged = false
    for(let i = 1; i < 4; i++) {
        for(let j = 0; j < 4; j++) {
            if(event.which == LEFT) {
                if(shift(j, i, 0, -1)) merged = true
            } else if(event.which == UP) {
                if(shift(i, j, -1, 0)) merged = true
            } else if(event.which == RIGHT) {
                if(shift(j, 3 - i, 0, 1)) merged = true
            } else if(event.which == DOWN) {
                if(shift(3 - i, j, 1, 0)) merged = true
            }
        }
    }
    if(merged) {
        spawnTile()
        refreshBoard()
    }
})

// used to set the colour of a tile based on the number on the tile
function chooseColour(element, number) {
    const colours = ['white', '#F1E7DD', '#EADEC4', '#FA925B', '#FA925B', '#F57D5D', '#FE5A36', '#E6CF72', '#E6CF72', '#E6CF72', '#EDC400', '#EDC400', '#AF85AB', '#AF85AB', '#AF85AB']
    // use the power of 2 of the number as an index into colours array
    element.style.backgroundColor = colours[Math.log2(number)] || colours[0]
}