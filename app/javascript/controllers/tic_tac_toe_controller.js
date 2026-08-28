import { Controller } from "@hotwired/stimulus"

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

export default class extends Controller {
  static targets = ["cell", "status", "scoreX", "scoreO", "scoreDraw"]

  connect() {
    this.scores = { X: 0, O: 0, draw: 0 }
    this.startRound()
  }

  startRound() {
    this.board = Array(9).fill(null)
    this.currentPlayer = "X"
    this.gameOver = false

    this.cellTargets.forEach((cell) => {
      cell.textContent = ""
      cell.className = "cell"
      cell.disabled = false
    })

    this.updateStatus(`Player ${this.currentPlayer}'s turn`, this.currentPlayer)
  }

  play(event) {
    if (this.gameOver) return

    const cell = event.currentTarget
    const index = Number(cell.dataset.index)
    if (this.board[index]) return

    this.board[index] = this.currentPlayer
    cell.textContent = this.currentPlayer
    cell.classList.add("cell--filled", `cell--${this.currentPlayer.toLowerCase()}`)

    const winLine = this.findWinLine()
    if (winLine) {
      this.endRound(winLine)
      return
    }

    if (this.board.every((mark) => mark)) {
      this.endRound(null, true)
      return
    }

    this.currentPlayer = this.currentPlayer === "X" ? "O" : "X"
    this.updateStatus(`Player ${this.currentPlayer}'s turn`, this.currentPlayer)
  }

  findWinLine() {
    return WIN_LINES.find(([a, b, c]) =>
      this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]
    )
  }

  endRound(winLine, draw = false) {
    this.gameOver = true
    this.cellTargets.forEach((cell) => (cell.disabled = true))

    if (draw) {
      this.scores.draw += 1
      this.scoreDrawTarget.textContent = this.scores.draw
      this.updateStatus("It's a draw!", "draw")
    } else {
      winLine.forEach((i) => this.cellTargets[i].classList.add("cell--win"))
      this.scores[this.currentPlayer] += 1
      const target = this.currentPlayer === "X" ? this.scoreXTarget : this.scoreOTarget
      target.textContent = this.scores[this.currentPlayer]
      this.updateStatus(`Player ${this.currentPlayer} wins!`, this.currentPlayer)
    }
  }

  reset() {
    this.startRound()
  }

  updateStatus(message, tone) {
    this.statusTarget.textContent = message
    this.statusTarget.classList.remove("game__status--x", "game__status--o", "game__status--draw")
    if (tone) {
      this.statusTarget.classList.add(`game__status--${tone.toLowerCase()}`)
    }
  }
}
