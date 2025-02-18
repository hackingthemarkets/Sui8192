const { tileNames } = require("./constants");
const { eById, eByClass, addClass, removeClass, isReverse, isVertical } = require("./utils");

let active;

module.exports = {
  active: () => active,

  display: (board) => {
    const spaces = board.spaces
    const allColors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(i => `color${i}`);
    const tiles = eByClass('tile');
    let topTile = 0;
    for (let i=0; i<spaces.length; ++i) {
      for (let j=0; j<spaces[i].length; ++j) {
        const tile = spaces[i][j];
        if (tile != 99 && tile + 1 > topTile) {
          topTile = tile + 1;
        }
        const tileElement = tiles[(i * spaces[i].length) + j];
        removeClass(tileElement, allColors);
        if (tile === 99) {
          tileElement.innerHTML = ""
        } else {
          tileElement.innerHTML = `<div><div class='value'>${Math.pow(2, tile + 1)}</div><div>${tileNames[tile + 1]}</div></div>`;
          addClass(tileElement, `color${tile + 1}`)
        }
      }
    }

    const scoreElement = eById('score');
    scoreElement.innerHTML = board.score;
    eById('score-result').innerHTML = board.score;
    
    const topTileElement = eById('top-tile');
    removeClass(topTileElement, allColors);
    addClass(topTileElement, `color${topTile}`);
    eById('top-tile-value').innerHTML = Math.pow(2, topTile);
    eById('top-tile-name').innerHTML = tileNames[topTile];

    if (board.gameOver) {
      removeClass(eById('error-game-over'), 'hidden');
    }

    active = board;
  },
  
  clear: () => {
    const tiles = eByClass('tile');
    for (const tile of tiles) {
      tile.innerHTML = "";
    }
  },

  diff: (spaces1, spaces2, direction) => {
    const reverse = isReverse(direction);
    const vertical = isVertical(direction);

    const tiles = {}
    const columns = spaces1[0].length;

    const start = reverse ? columns - 1 : 0;
    const end = reverse ? 0 : columns - 1;
    const increment = reverse ? -1 : 1;

    for (let i=start; reverse ? i>=end : i<=end; i+=increment) {
      const row1 = spaces1[i];
      for (let j=start; reverse ? j>=end : j<=end; j+=increment) {
        let tile1 = spaces1[i][j];
        const tile2 = spaces2[i][j];
        const index = (i * columns) + j;

        if (tile2 !== 99) {
          if (tile1 === tile2) continue;

          const searchStart = (vertical ? i : j) + increment;
          for (let x=searchStart; reverse ? x>=end : x<=end; x+=increment) {
            const distance = Math.abs(vertical ? x - i : x - j);
            const nextTile = vertical ? spaces1[x][j] : spaces1[i][x]
            
            if (nextTile === 99) continue;
            
            if (vertical) {
              spaces1[x][j] = 99;
            } else {
              spaces1[i][x] = 99;
            }
            
            const tile1Index = vertical ? (x * columns) + j : (i * columns) + x;
            tiles[tile1Index] = {
              [direction]: distance
            }

            if (nextTile === tile2 - 1) {
              tiles[index] = {
                merge: true
              }

              if (tile1 === 99) {
                x = (vertical ? i : j) + increment;
                tile1 = tile2 - 1;
                continue;
              } 
            } 
            break;
          }
        }
      }
    }
    return tiles;
  },

  convertInfo: (board) => {
    const { 
      spaces: rawSpaces, 
      board_spaces: rawBoardSpaces, 
      last_tile: lastTile, 
      top_tile: topTile,
      score, 
      game_over: gameOver,
      url
    } = board.fields || board;
    const spaces = (rawSpaces || rawBoardSpaces).map(
      (rawRow) => rawRow.map(
        (rawSpace) => {
          switch (rawSpace.fields.vec) {
            case "AA==": return 0
            case "AQ==": return 1
            case "Ag==": return 2
            case "Aw==": return 3
            case "BA==": return 4
            case "BQ==": return 5
            case "Bg==": return 6
            case "Bw==": return 7
            case "CA==": return 8
            case "CQ==": return 9
            case "Cg==": return 10
            case "Cw==": return 11
            case "DA==": return 12
            case "DQ==": return 13
            default: return 99
          }
        }
      )
    )
    return { spaces, lastTile, topTile, score, gameOver, url }
  }
}