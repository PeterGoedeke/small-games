// initialise game variables
const width = 15
const height = 10
// chance for any given tile to be a mine
const mineChance = 0.1

// initialise game box
const gameBox = document.querySelector('.game')
const gameWidth = 60

gameBox.style.width = gameWidth + '%'
document.documentElement.style.setProperty('--tileSize', gameWidth / width + "vw");

// factory function to generate tile object
function createTile(x, y) {
    const element = document.createElement('div')
    element.className = 'tile'
    element.addEventListener('click', clicked)
    element.addEventListener('contextmenu', rightClicked)

    // called when player has clicked a tile; determines whether to end or continue game based on whether tile is a mine
    function clicked(event) {
        timer.check()
        if(isMine) {
            element.style.backgroundColor = 'red'
            game.lose()
        }
        else {
            tile.reveal()
        }
        game.checkWin()
    }

    // called when player has right clicked a tile; changes the flag status of the tile
    function rightClicked(event) {
        timer.check()
        event.preventDefault()
        if(tile.flagged) {
            tile.flagged = false
            element.style.backgroundColor = 'grey'
            mineCounter.incrementCounter()
        }
        else {
            tile.flagged = true
            element.style.backgroundColor = 'lightblue'
            mineCounter.decrementCounter()
        }
        game.checkWin()
    }

    // determine whether tile should be a mine
    const isMine = Math.random() < mineChance
    const flagged = false

    const tile = {
        x, y, isMine, flagged, element, revealed: false,
        // called when tile is clicked or when adjacent "0" tile is revealed; reveals number of adjacent mines
        reveal() {
            this.revealed = true
            this.element.style.backgroundColor = 'lightgrey'
            
            const adjacentMines = game.analyse(this)
            if(adjacentMines > 0) {
                this.element.textContent = adjacentMines
                chooseTextColour(this.element, adjacentMines)
            }
            // reveal adjacent tiles if they are all mine free
            else {
                game.revealAdjacents(this)
            }
            this.removeListeners()
        },
        removeListeners() {
            this.element.removeEventListener('click', clicked)
            this.element.removeEventListener('contextmenu', rightClicked, false)
        }
    }
    return tile
}

// manages the mine counter
const mineCounterBox = document.querySelector('.minesCounter')
let mineCount
const mineCounter = {
    setCounter(mines) {
        mineCounterBox.textContent = mines
        mineCount = mines
    },
    incrementCounter() {
        mineCount ++
        mineCounterBox.textContent = mineCount
    },
    decrementCounter() {
        mineCount --
        mineCounterBox.textContent = mineCount
    }
}

// object responsible for storing board information and analysing how many adjacent mines there are for a given tile
const game = (function() {
    // initialise game board
    let tiles = []
    setupTiles()

    function setupTiles() {
        let mines = 0
        for(let i = 0; i < height; i++) {
            tiles[i] = []
            for(let j = 0; j < width; j++) {
                tiles[i][j] = createTile(i, j)
                gameBox.appendChild(tiles[i][j].element)
                // keep track of the number of mines to send to mine counter
                if(tiles[i][j].isMine) mines ++
            }
        }
        mineCounter.setCounter(mines)
    }
    // wipe game progress
    function wipeGame() {
        tiles = []
        while(gameBox.firstChild) gameBox.removeChild(gameBox.firstChild)
    }
    // freeze the game so that the player cannot click tiles anymore
    function freezeGame() {
        tiles.forEach(row => row.forEach(tile => tile.removeListeners()))
    }

    return {
        // checks whether the player has won the game
        checkWin() {
            let hasWon = true
            tiles.forEach(row => row.forEach(tile => {
                const tileWronglyFlagged = !tile.isMine && tile.flagged
                const mineNotFlagged = tile.isMine && !tile.flagged
                const tileNotRevealed = !tile.isMine && !tile.revealed 
                if(tileWronglyFlagged || mineNotFlagged | tileNotRevealed) hasWon = false
            }))
            // end the game if they have won
            if(hasWon) {
                freezeGame()
                timer.stop()
                resetButton.style.backgroundColor = 'green'
            }
        },
        // freeze the game so that the player cannot click more mines once they have lost the game
        lose() {
            freezeGame()
            resetButton.style.backgroundColor = 'red'
            timer.stop()
        },
        // reset the game
        reset() {
            resetButton.style.backgroundColor = 'lightgrey'
            wipeGame()
            setupTiles()
            timer.reset()
        },
        // analyse 8 adjacent tiles to given tile to figure out how many are mines
        analyse(tile) {
            let adjacentMines = 0
            for(let i = tile.x - 1; i <= tile.x + 1; i++) {
                for(let j = tile.y - 1; j <= tile.y + 1; j++) {
                    if(tiles[i] && tiles[i][j] && tiles[i][j].isMine && tiles[i][j] != tile)
                        adjacentMines ++
                }
            }
            return adjacentMines
        },
        // reveal all tiles adjacent to given tile; called automatically when a tile with zero adjacent mines is revealed
        revealAdjacents(tile) {
            for(let i = tile.x - 1; i <= tile.x + 1; i++) {
                for(let j = tile.y - 1; j <= tile.y + 1; j++) {
                    // avoid revealing tiles which have already been revealed
                    if(tiles[i] && tiles[i][j] && !tiles[i][j].revealed && tiles[i][j] != tile)
                        tiles[i][j].reveal()
                }
            }
        }
    }
})()

// setup reset button
const resetButton = document.querySelector('.resetButton')
resetButton.addEventListener('click', event => {
    game.reset()
})

// used to set the number on a tile to the right colour based on the number of adjacent mines
function chooseTextColour(element, number) {
    const colours = ['blue', 'green', 'red', 'purple', 'darkred', 'lightgreen', 'white', 'pink']
    element.style.color = colours[--number]
}

// manages the timer function
const timer = (function() {
    const timerBox = document.querySelector('.timer')
    let ticking = false
    let seconds = 0

    let interval

    // increment the timer
    function tick() {
        seconds ++
        // calculate the values which should be placed in each column of the timer
        const ones = seconds % 10
        const tens = Math.floor((seconds % 60) / 10)
        const sixties = Math.floor(seconds / 60)

        timerBox.textContent = `${sixties}:${tens}${ones}`
    }
    return {
        // start the timer running
        start() {
            interval = setInterval(tick, 1000)
            ticking = true
        },
        // stop the timer
        stop() {
            clearInterval(interval)
            ticking = false
        },
        // set the timer counter to zero and stop the counter
        reset() {
            seconds = 0
            this.stop()
            timerBox.textContent = '0:00'
        },
        // start the timer if the timer is not running
        check() {
            if(!ticking) this.start()
        }
    }
})()