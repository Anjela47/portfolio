import React, { useState } from "react"
const XoGame = () => {
  const [turn, setTurn] = useState("x")
  const [cells, setCell] = useState(Array(9).fill(""))
  const [winner, setWinner] = useState("")
  const hwoIsWin = (array) => {
    const cases = {
      x: [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8]
      ],
      y: [
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8]
      ],
      d: [
        [0, 4, 8],
        [2, 4, 6]
      ]
    }
    for (let case_ in cases) {
      cases[case_].forEach((index) => {
        if (
          ((array[index[0]] === "" || array[index[1]]) === "" ||
            array[index[2]]) === ""
        ) {
        } else if (
          array[index[0]] === array[index[1]] &&
          array[index[1]] === array[index[2]]
        ) {
          setWinner(array[index[0]])
          setCell(Array(9).fill(""))
        }
      })
    }
  }
  const ClickHandle = (num) => {
    if (cells[num] !== "") {
      return
    }
    let array = [...cells]

    if (turn === "x") {
      array[num] = "x"
      setTurn("o")
    } else {
      array[num] = "o"
      setTurn("x")
    }
    setCell(array)
    hwoIsWin(array)
  }

  const Cell = ({ num }) => {
    return <td onClick={() => ClickHandle(num)}>{cells[num]}</td>
  }

  return (
    <div className="container">
      <div>{turn}'s turn</div>
      <table>
        <tr>
          <Cell num={0} />
          <Cell num={1} />
          <Cell num={2} />
        </tr>
        <tr>
          <Cell num={3} />
          <Cell num={4} />
          <Cell num={5} />
        </tr>
        <tr>
          <Cell num={6} />
          <Cell num={7} />
          <Cell num={8} />
        </tr>
      </table>
      <p>The winner is {winner}</p>
    </div>
  )
}

export default XoGame
