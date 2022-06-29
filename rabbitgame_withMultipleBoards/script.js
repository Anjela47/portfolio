const EMPTY_CELL = 0
const RABBIT_CELL = 1
const HOME_CELL = 2
const WOLF_CELL = 3
const FENCE_CELL = 4
const WOLF_PROCENT = 0.6
const FENCE_PROCENT = 0.4
let GAME_NUMBER = 0
const character = [
  {
    name: "rabbit",
    num: RABBIT_CELL
  },
  {
    name: "home",
    num: HOME_CELL
  },
  {
    name: "wolf",
    num: WOLF_CELL
  },
  {
    name: "fence",
    num: FENCE_CELL
  }
]

const GAME_STATES = {}

function newGame() {
  GAME_NUMBER++
  const container = document.getElementById("container")
  const GAME = createNewGameDiv(GAME_NUMBER)
  const btnDiv = createStartBtn(GAME_NUMBER)
  const select = createSelectDiv(GAME_NUMBER)
  const main = createMainBoard(GAME_NUMBER)
  const messageDiv = createMessageBox(GAME_NUMBER)
  container.appendChild(messageDiv)
  GAME.append(btnDiv, select, main)
  const hr = document.createElement("hr")
  container.append(GAME, hr)
  addListeners(GAME_NUMBER)
}

function createNewGameDiv(GAME_NUMBER) {
  const GAME = document.createElement("div")
  GAME.id = `game_${GAME_NUMBER}`
  GAME.style.textAlign = "center"
  return GAME
}

function startGame(GAME_NUMBER) {
  const array = createArray(GAME_NUMBER)
  if (GAME_STATES[GAME_NUMBER]) {
    clearInterval(GAME_STATES[GAME_NUMBER].intervalId)
  }

  const gameState = {
    array,
    isGameOver: false,
    gameMessage: "",
    gameNumber: GAME_NUMBER,
    intervalId: setInterval(function () {
      wolfStep(gameState)
      message(gameState)
      DrawBoard(gameState)
    }, 2500)
  }
  GAME_STATES[GAME_NUMBER] = gameState
  setPositions(array)
  DrawBoard(gameState)
  createButtons(GAME_NUMBER)
  document.getElementById(`game_${GAME_NUMBER}`).style.display = "block"
  const buttons = document.querySelectorAll(`#buttons_${GAME_NUMBER} > button`)
  for (let button of buttons) {
    button.addEventListener("click", function (event) {
      eventMove(gameState, event.target.id)
    })
  }
}
function eventMove(gameState, step) {
  rabbitStep(gameState, step)
  message(gameState)
  DrawBoard(gameState)
}

function createArray(GAME_NUMBER) {
  const arraySize = parseInt(
    document.getElementById(`selectNum_${GAME_NUMBER}`).value
  )
  const array = new Array(arraySize)
    .fill(EMPTY_CELL)
    .map(() => new Array(arraySize).fill(EMPTY_CELL))

  return array
}

function setPositions(array) {
  const wolfCount = Math.ceil(array.length * WOLF_PROCENT)
  const fenceCount = Math.ceil(array.length * FENCE_PROCENT)
  setIndexes("rabbit", array)
  setIndexes("home", array)
  for (let i = 0; i < wolfCount; i++) {
    setIndexes("wolf", array)
  }
  for (let i = 0; i < fenceCount; i++) {
    setIndexes("fence", array)
  }
}

function setIndexes(characterName, array) {
  const x = Math.floor(Math.random() * array.length)
  const y = Math.floor(Math.random() * array.length)

  if (array[x][y] === EMPTY_CELL) {
    const element = character.find((item) => item.name === characterName)
    array[x][y] = element.num
  } else {
    setIndexes(characterName, array)
  }
}

function wolfStep(gameState) {
  const array = gameState.array
  if (gameState.isGameOver === false) {
    const listOfWolfIndexes = getCurrentDir(array, WOLF_CELL)
    const listOfRabbitIndex = getCurrentDir(array, RABBIT_CELL)[0]
    listOfWolfIndexes.forEach((wolf) => {
      const requiredWolfAreaIndexes = getWolfValidMoves(array, wolf)
      const requiredIndex = []
      const distances = []
      requiredWolfAreaIndexes.forEach((coord) => {
        distances.push(findDistance(coord, listOfRabbitIndex))
        requiredIndex.push(coord)
      })
      const index = distances.indexOf(Math.min(...distances))
      wolfMove(gameState, requiredIndex[index], wolf)
    })
  }
}

function wolfMove(gameState, [newX, newY], [oldX, oldY]) {
  const array = gameState.array
  if (gameState.isGameOver === false) {
    iswin(gameState, [newX, newY])
    array[newX][newY] = WOLF_CELL
    array[oldX][oldY] = EMPTY_CELL
  }
}

function iswin(gameState, [x, y]) {
  const array = gameState.array
  const GAME_NUMBER = gameState.gameNumber
  if (array[x][y] === HOME_CELL) {
    gameState.gameMessage = "That's Great! You win^^"
    gameState.isGameOver = true
    removeListeners(GAME_NUMBER)
  } else if (array[x][y] === WOLF_CELL || array[x][y] === RABBIT_CELL) {
    gameState.gameMessage = ":(.. Game over"
    gameState.isGameOver = true
    removeListeners(GAME_NUMBER)
  }
}

function getNearCells(cell) {
  const [x, y] = cell
  return [
    [x - 1, y],
    [x, y + 1],
    [x + 1, y],
    [x, y - 1]
  ]
}

function findDistance([x1, y1], [x2, y2]) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}

function isInRange([x, y], array) {
  if (x != array.length && x >= 0 && y != array.length && y >= 0) {
    return true
  }
}

function getWolfValidMoves(array, wolf) {
  function _isinRange(cell) {
    return isInRange(cell, array)
  }

  function isValidCell(cell) {
    const validCells = [EMPTY_CELL, RABBIT_CELL]
    return validCells.includes(array[cell[0]][cell[1]])
  }
  return getNearCells(wolf).filter(_isinRange).filter(isValidCell)
}

function getRabbitNearCell(cell, step) {
  const [x, y] = cell
  let index = []
  if (step === "left") {
    index = [x, y - 1]
  } else if (step === "up") {
    index = [x - 1, y]
  } else if (step === "right") {
    index = [x, y + 1]
  } else if (step === "down") {
    index = [x + 1, y]
  }
  return index
}

function rabbitStep(gameState, step) {
  if (gameState.isGameOver === false) {
    const listOfIndexes = getCurrentDir(gameState.array, RABBIT_CELL)[0]
    const nearCell = getRabbitNearCell(listOfIndexes, step)
    moveRabbit(gameState, nearCell, listOfIndexes)
  }
}

function moveRabbit(gameState, [newX, newY], [oldX, oldY]) {
  const array = gameState.array
  let x = ""
  let y = ""
  if (isInRange([newX, newY], array)) {
    ;[x, y] = [newX, newY]
  } else {
    ;[x, y] = getRabbitJumpCoord(array, [newX, newY], [oldX, oldY])
  }
  moveRabbitToNewDirection(gameState, [x, y], [oldX, oldY])
}

function getRabbitJumpCoord(array, [newX, newY], [oldX, oldY]) {
  let coord = ""
  if (newX === -1) {
    coord = [array.length - 1, oldY]
  } else if (newY === -1) {
    coord = [oldX, array.length - 1]
  } else if (newX === array.length) {
    coord = [0, oldY]
  } else if (newY === array.length) {
    coord = [oldX, 0]
  }
  return coord
}

function moveRabbitToNewDirection(gameState, [newX, newY], [oldX, oldY]) {
  iswin(gameState, [newX, newY])
  if (
    gameState.isGameOver === false &&
    gameState.array[newX][newY] !== FENCE_CELL
  ) {
    gameState.array[newX][newY] = RABBIT_CELL
    gameState.array[oldX][oldY] = EMPTY_CELL
  }
}

function message(gameState) {
  const GAME_NUMBER = gameState.gameNumber
  if (gameState.isGameOver === true) {
    document.getElementById(`messageBox_${GAME_NUMBER}`).style.display = "block"
    document.getElementById(`game_${GAME_NUMBER}`).style.display = "none"
    document.getElementById(`message_${GAME_NUMBER}`).innerHTML =
      gameState.gameMessage
  }
}

function getCurrentDir(array, character) {
  const getFromArray = function (acc, row, i) {
    row.forEach((item, j) => {
      if (item === character) {
        acc.push([i, j])
      }
    })
    return acc
  }
  return array.reduce(getFromArray, [])
}

function DrawBoard(gameState) {
  const GAME_NUMBER = gameState.gameNumber
  const array = gameState.array
  const board = document.getElementById(`board_${GAME_NUMBER}`)
  board.innerHTML = ""
  const width = array.length * 60 + 2 * array.length
  board.style.width = `${width}px`
  board.style.height = `${width}px`
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array.length; j++) {
      div = generateDiv(array, i, j)

      board.append(div)
    }
  }
}

function generateDiv(array, i, j) {
  const div = document.createElement("div")
  div.id = `${i}${j}`
  div.className = "box"
  const img = generateImg(array[i][j])
  if (img.src != "") {
    div.appendChild(img)
  }
  return div
}

function generateImg(coord) {
  const img = document.createElement("img")
  if (coord === RABBIT_CELL) {
    img.src = "images/rabbit.png"
  }
  if (coord === FENCE_CELL) {
    img.src = "images/fence.png"
  }
  if (coord === HOME_CELL) {
    img.src = "images/home.png"
  }
  if (coord === WOLF_CELL) {
    img.src = "images/wolf.png"
  }
  return img
}

function createStartBtn(GAME_NUMBER) {
  const div = document.createElement("div")
  div.id = `start_${GAME_NUMBER}`
  const btn = document.createElement("button")
  btn.id = `startBtn_${GAME_NUMBER}`
  btn.innerText = "Start"
  div.appendChild(btn)
  div.style.display = "inline-block"
  return div
}

function createMessageBox(GAME_NUMBER) {
  const messageBox = document.createElement("div")
  messageBox.id = `messageBox_${GAME_NUMBER}`
  const message = document.createElement("div")
  message.id = `message_${GAME_NUMBER}`
  const btn = document.createElement("button")
  btn.id = `startAgain_${GAME_NUMBER}`
  btn.innerText = "Start Again"
  messageBox.append(message, btn)
  messageBox.style.textAlign = "center"
  messageBox.style.display = "none"
  messageBox.style.margin = "20px"
  return messageBox
}

function createMainBoard(GAME_NUMBER) {
  const div = document.createElement("div")
  div.id = `main_${GAME_NUMBER}`
  const BoardDiv = document.createElement("div")
  BoardDiv.id = `board_${GAME_NUMBER}`
  BoardDiv.style.margin = "0 auto"
  div.appendChild(BoardDiv)
  const ButtonsDiv = document.createElement("div")
  ButtonsDiv.id = `buttons_${GAME_NUMBER}`
  ButtonsDiv.style.marginTop = "5px"
  div.appendChild(ButtonsDiv)
  return div
}

function createButton(step) {
  const btn = document.createElement("button")
  btn.id = step
  btn.innerText = step
  return btn
}

function createButtons(GAME_NUMBER) {
  const ButtonsDiv = document.getElementById(`buttons_${GAME_NUMBER}`)
  while (ButtonsDiv.lastElementChild) {
    ButtonsDiv.removeChild(ButtonsDiv.lastElementChild)
  }
  const up = createButton("up")
  up.style.display = "block"
  up.style.margin = "0 auto"
  const down = createButton("down")
  const left = createButton("left")
  const right = createButton("right")
  ButtonsDiv.append(up, left, down, right)
}

function createOption(value) {
  const option = document.createElement("option")
  option.value = `${value}`
  option.innerText = `${value}x${value}`
  return option
}

function createSelectDiv(GAME_NUMBER) {
  const selectDiv = document.createElement("div")
  selectDiv.className = `select_${GAME_NUMBER}`
  const select = document.createElement("select")
  select.id = `selectNum_${GAME_NUMBER}`
  const selects = [5, 7, 10]
  selects.forEach((item) => {
    const option = createOption(item)
    select.appendChild(option)
  })
  selectDiv.appendChild(select)
  selectDiv.style.display = "inline-block"
  return selectDiv
}

function addListeners(GAME_NUMBER) {
  document
    .getElementById(`startBtn_${GAME_NUMBER}`)
    .addEventListener("click", function () {
      startGame(GAME_NUMBER)
    })
  document
    .getElementById(`startAgain_${GAME_NUMBER}`)
    .addEventListener("click", function () {
      document.getElementById(`messageBox_${GAME_NUMBER}`).style.display =
        "none"
      startGame(GAME_NUMBER)
    })
}

function removeListeners(GAME_NUMBER) {
  document
    .getElementById(`startBtn_${GAME_NUMBER}`)
    .removeEventListener("click", function () {
      startGame(GAME_NUMBER)
    })
  document
    .getElementById(`startAgain_${GAME_NUMBER}`)
    .removeEventListener("click", function () {
      document.getElementById(`messageBox_${GAME_NUMBER}`).style.display =
        "none"
      startGame(GAME_NUMBER)
    })
}
