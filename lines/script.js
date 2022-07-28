const arraySize = 9
const EMPTY_CELL = 0
const EARTH_CELL = 1
const MERCURY_CELL = 2
const MARS_CELL = 3
const JUPITER_CELL = 4
const NEPTUN_CELL = 5
const DOT_CELL = 6
let clickedBallCoord = []
let nextThreeBalls = []
const  ball_color = [
    {
        id:DOT_CELL,
        src:'./Images/dot.png'
    },
    {
        id:EMPTY_CELL,
        src:''
    },
    {
        id:EARTH_CELL,
        src:'./Images/earth.png'
    },
    {
        id:MERCURY_CELL,
        src:'./Images/mercury.png'
    },
    {
        id:MARS_CELL,
        src:'./Images/mars.png'
    },
    {
        id:JUPITER_CELL,
        src:'./Images/jupiter.png'
    },
    {
        id:NEPTUN_CELL,
        src:'./Images/neptun.png'
    },
]

function startGame(){
    nextThreeBalls =[]
    const array = createArray()
    const gameState = {
        array,
        isGameEnd:false,
        score:0
    }
    setPositions(array,5)
    setNextBalls()
    DrawBoard(gameState)
}

function isGameEnd(gameState){
    if(gameState.isGameEnd===true){
        alert("Game is and...\nyour score is: " + gameState.score)
        startGame()
        return true
    }
}

function createArray(){
    const array = new Array(arraySize)
    .fill(EMPTY_CELL)
    .map(() => new Array(arraySize).fill(EMPTY_CELL))

  return array
}

function setPositions(array,Ballscount){
    for(let i=0;i<Ballscount;i++){
        setPosition(array)
    }
}

function setBall(array,[x,y]){
    const colorNumber = Math.floor(Math.random()*5)+1
    array[x][y] = colorNumber
}

function setPosition(array){
    const x = Math.floor(Math.random()*9)
    const y = Math.floor(Math.random()*9)

    if(isEmpty(array,[x,y])){
        setBall(array,[x,y])
    }else{
        setPosition(array)
    }
}

function isEmpty(array,[x,y]){
    if(array[x][y]===0){
        return true
    }
}


function setNextBalls(){
    const next = document.getElementById("nextThreeBalls")
    next.innerHTML = ""
    for(let i=0;i<3;i++){
        const div = setNextBall()
        next.appendChild(div)
    }
}

function setNextBall(){
    const ballNum = Math.floor(Math.random()*5)+1
    const ball = ball_color.find((ball) => ball.id === ballNum)
    const div = document.createElement("div")
    div.className = "nextBall"
    const img = document.createElement("img")
    nextThreeBalls.push(ball.src)
    img.src = ball.src
    div.appendChild(img)
    return div
}

function DrawBoard(gameState){
    const array = gameState.array
    const board = document.getElementById("board")
    board.innerHTML= ""
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array.length; j++) {
          const div = generateDiv(gameState, [i, j])
          board.appendChild(div)
        }
    }
}

const higlightDiv = (element) => {
    const divs = document.querySelectorAll("#board > div");
    divs.forEach((div) => div.classList.remove("higlight"));
    element.classList.add("higlight");
}

function generateDiv(gameState,[i,j]){
    const array = gameState.array
    const div = document.createElement("div")
    div.id = `${i}${j}`
    div.className = "box"
    const img = generateImg(array[i][j])
    if(img!=""){
        img.className="ball"
        div.appendChild(img)
        div.addEventListener('click', ()=>{
            higlightDiv(div)
        });
    }
    div.addEventListener('click',()=>{
        if(!isGameEnd(gameState)){
            if(clickedBallCoord.length>0 && array[i][j]===EMPTY_CELL){
                const wave = makeWave(array,event.target.id)  
                const path = setPath(wave,event.target.id)
                moveBall(gameState,path)
                clickedBallCoord = []
            }else if(array[i][j]!==EMPTY_CELL){
                changeClickedItemCoord([i,j])
            }   
        }
    })
    return div
}

function generateImg(cell) {
    let img = ""
    const item = ball_color.find((item) => item.id === cell)
    if(item.src!=""){
        img = document.createElement("img")
        img.src= item.src
    }
    return img
}

const NearCoords=(coord)=>{
    [i,j] = coord
    return [
        [i+1,j],
        [i-1,j],
        [i,j+1],
        [i,j-1]
    ]
}

function isInRange([x, y], array) {
    if (x != array.length && x >= 0 && y != array.length && y >= 0) {
      return true
    }
}

function getNearValidCoords(array,coord){
    function _isEmpty(coord){
        return isEmpty(array,coord)
    }

    function _isInRange(coord){
        return isInRange(coord,array)
    }
    return NearCoords(coord).filter(_isInRange).filter(_isEmpty)
}


function makeWave(array,newCoord){
    const wave = createArray()
    let k=1
    let flag = true
    const [oldX,oldY] = clickedBallCoord
    const newX = parseInt(newCoord[0])
    const newY = parseInt(newCoord[1])
    if(clickedBallCoord.length===0){
        return
    }else{
        for (let i = 0; i < array.length; i++) {
            for (let j = 0; j < array.length; j++) {
                if(array[i][j]>0){
                    wave[i][j] = -1
                }else{
                    wave[i][j] = 0
                }
            }
        }
        wave[oldX][oldY] = k
        while(flag){
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if(wave[i][j]==k){
                        getNearValidCoords(wave,[i,j]).forEach(coord=>{
                            wave[coord[0]][coord[1]]=k+1
                        })
                    }else{
                        if(k>25){
                            flag=false
                        }
                    }
                }
            }
            if(wave[newX][newY]>0){
                flag=false
            }else{
                k+=1
            }
            }     
        return wave
    }
}

function setPath(wave,newCoord){
    const newX = parseInt(newCoord[0])
    const newY = parseInt(newCoord[1])
    const path = [[newX,newY]]
    let d = wave[newX][newY]
    while(d>1){
        const x=path[path.length-1][0]
        const y=path[path.length-1][1]
        if(isInRange([x-1,y],wave) && wave[x-1][y]===d-1){
            path.push([x-1,y])
        }else if(isInRange([x+1,y],wave) && wave[x+1][y]===d-1){
            path.push([x+1,y])
        }else if(isInRange([x,y-1],wave) && wave[x][y-1]===d-1){
            path.push([x,y-1])
        }else if(isInRange([x,y+1],wave) && wave[x][y+1]===d-1){
            path.push([x,y+1])
        }
        d--
    }
    return path
}

function DelColectedBalls(gameState,count,x,y,dx,dy){
    const array=gameState.array
    if(count>=5){
        for(let i=0;i<count;i++){
            array[x][y] = EMPTY_CELL
            x+=dx
            y+=dy
        }
        gameState.score += count
    }
    DrawBoard(gameState)
}
 
function checkHorizontal([x,y],gameState){
    const array = gameState.array
    let count = 0
    let right = 0
    let left = 0
    let coord=0
    for(let i=y+1;i<array.length;i++){ 
        if(array[x][i]===array[x][y]){
            right++
            coord=y
        }else{
            i=array.length
            coord = y 
        }
    }
    for(let i=y-1;i>=0;i--){
        if(array[x][i]===array[x][y]){
            left++
            coord = i
        }else{
            i=-1
        }
    }
    count = left + right + 1 
    DelColectedBalls(gameState,count,x,coord,0,1)
    
}

function checkVertical([x,y],gameState){
    const array = gameState.array
    let count = 0
    let down = 0
    let up = 0
    let coord=0
    for(let i=x+1;i<array.length;i++){ 
        if(array[i][y]===array[x][y]){
            down++
            coord=x
        }else{
            i=array.length
            coord = x 
        }
    }
    for(let i=x-1;i>=0;i--){
        if(array[i][y]===array[x][y]){
            up++
            coord = i
        }else{
            i=-1
        }
    }
    count = up + down + 1 
    DelColectedBalls(gameState,count,coord,y,1,0)
}



function checkMainCorner([x,y],gameState){
    const array = gameState.array
    let count = 0
    let down = 0
    let up = 0
    let coordI = 0
    let coordJ = 0
    for(let j=y+1,i=x+1;j,i<array.length;j++,i++){ 
        if(array[i][j]===array[x][y]){
            down++
            coordI = x
            coordJ = y
        }else{
            i=array.length
            j=array.length
            coordI = x
            coordJ = y 
        }
    }
    for(let i=x-1,j=y-1;j>=0,i>=0;j--,i--){
        if(array[i][j]===array[x][y]){
            up++
            coordI = i
            coordJ = j
        }else{
            i=-1
            j=-1
        }
    }
    count = up + down + 1 
    DelColectedBalls(gameState,count,coordI,coordJ,1,1)
}

function checkSecondCorner([x,y],gameState){
    const array = gameState.array
    let count = 0
    let down = 0
    let up = 0
    let coordI = 0
    let coordJ = 0
    for(let j=y+1,i=x-1;j<array.length,i>=0;j++,i--){ 
        if(array[i][j]===array[x][y]){
            up++
            coordI = x
            coordJ = y
        }else{
            coordI = x
            coordJ = y
            i=-1
            j=array.length
        }
    }
    for(let j=y-1,i=x+1;j>=0,i<array.length;j--,i++){
        if(array[i][j]===array[x][y]){
            down++
            coordI = i
            coordJ = j
        }else{
            i=array.length
            j=-1
        }
    }
    count = up + down + 1 
    DelColectedBalls(gameState,count,coordI,coordJ,-1,1)
}

function isCollected([x,y],gameState){
    checkHorizontal([x,y],gameState)
    checkVertical([x,y],gameState)
    checkMainCorner([x,y],gameState)
    checkSecondCorner([x,y],gameState)
}

function moveBall(gameState,path){
    const array = gameState.array
    
    if(path.length===1){
       return
    }else{
        path.reverse()
        for(let i=0;i<path.length-1;i++){
            const x= path[i][0]
            const y= path[i][1]
            array[path[i+1][0]][path[i+1][1]]=array[x][y]
            array[x][y] = DOT_CELL
            setTimeout(()=>{
                array[x][y]=EMPTY_CELL
                DrawBoard(gameState)
            },400)
            
            DrawBoard(gameState)
        }
        setBallsInBoard(gameState)
        setNextBalls(path.length-1,array)
        DrawBoard(gameState)
        isCollected(path[path.length-1],gameState)
        const count = emptyCellsCount(array)
        if(count<=4){
            gameState.isGameEnd=true   
        }
    }
}

function emptyCellsCount(array){
    let count = 0
    array.forEach(row=>row.forEach((col)=>{
        if(col===EMPTY_CELL){
            count++
        }
    })
)
    return count
}

function setBallInBoard(gameState,item){
    const array = gameState.array
    const x = Math.floor(Math.random()*9)
    const y = Math.floor(Math.random()*9)

    if(array[x][y]===EMPTY_CELL){
        const ball = ball_color.find((ball) => ball.src === item)
        array[x][y] = ball.id
        generateDiv(gameState,[x,y])
    }else{
        setBallInBoard(gameState,item)
    }
}

function setBallsInBoard(gameState){
    nextThreeBalls.forEach((item)=>{
        setBallInBoard(gameState,item) 
    })
    nextThreeBalls = []
}

function changeClickedItemCoord([x,y]){
    clickedBallCoord = [x,y]
}