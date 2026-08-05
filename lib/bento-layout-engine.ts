export interface TileCandidate {
  colSpan: number
  rowSpan: number
}

export interface TilePosition {
  colStart: number
  rowStart: number
  colSpan: number
  rowSpan: number
}

export interface LayoutOptions {
  count: number
  cols: number
  distribution?: 'mobile' | 'desktop'
  seed?: number
}

const DESKTOP_DISTRIBUTION: { colSpan: number; rowSpan: number; weight: number }[] = [
  { colSpan: 1, rowSpan: 1, weight: 20 },
  { colSpan: 2, rowSpan: 1, weight: 18 },
  { colSpan: 1, rowSpan: 2, weight: 15 },
  { colSpan: 2, rowSpan: 2, weight: 18 },
  { colSpan: 3, rowSpan: 1, weight: 10 },
  { colSpan: 3, rowSpan: 2, weight: 9 },
  { colSpan: 4, rowSpan: 2, weight: 6 },
  { colSpan: 4, rowSpan: 3, weight: 4 },
]

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function cloneTile(tile: { colSpan: number; rowSpan: number }) {
  return { colSpan: tile.colSpan, rowSpan: tile.rowSpan }
}

function fitsAt(
  tile: { colSpan: number; rowSpan: number },
  colStart: number,
  rowStart: number,
  cols: number,
  occupancy: boolean[][],
) {
  if (colStart + tile.colSpan > cols) return false
  const row = occupancy[rowStart]
  if (!row) return false
  for (let c = colStart; c < colStart + tile.colSpan; c++) {
    if (row[c]) return false
  }
  if (tile.rowSpan <= 1) return true
  for (let r = rowStart + 1; r < rowStart + tile.rowSpan; r++) {
    const next = occupancy[r]
    if (!next) return false
    for (let c = colStart; c < colStart + tile.colSpan; c++) {
      if (next[c]) return false
    }
  }
  return true
}

function markOccupied(
  tile: { colSpan: number; rowSpan: number },
  colStart: number,
  rowStart: number,
  occupancy: boolean[][],
) {
  for (let r = rowStart; r < rowStart + tile.rowSpan; r++) {
    const row = occupancy[r]
    if (!row) continue
    for (let c = colStart; c < colStart + tile.colSpan; c++) {
      row[c] = true
    }
  }
}

function firstEmptyCell(cols: number, occupancy: boolean[][]): { col: number; row: number } | null {
  for (let r = 0; r < occupancy.length; r++) {
    const row = occupancy[r]
    if (!row) continue
    for (let c = 0; c < cols; c++) {
      if (!row[c]) return { col: c, row: r }
    }
  }
  return null
}

function isLargeTile(tile: { colSpan: number; rowSpan: number }) {
  return tile.colSpan >= 3 || tile.rowSpan >= 3
}

function isThreeIdenticalConsecutive(history: { colSpan: number; rowSpan: number }[]) {
  if (history.length < 3) return false
  const last = history[history.length - 1]
  return history[history.length - 2] === last && history[history.length - 3] === last
}

function isAdjacentLarge(
  tile: { colSpan: number; rowSpan: number },
  colStart: number,
  rowStart: number,
  placed: { colStart: number; rowStart: number; colSpan: number; rowSpan: number }[],
) {
  for (const p of placed) {
    if (!isLargeTile(p)) continue
    const horizontalGap = Math.max(0, Math.max(colStart, p.colStart) - Math.min(colStart + tile.colSpan, p.colStart + p.colSpan))
    const verticalGap = Math.max(0, Math.max(rowStart, p.rowStart) - Math.min(rowStart + tile.rowSpan, p.rowStart + p.rowSpan))
    if (horizontalGap === 0 && verticalGap === 0) return true
  }
  return false
}

function remapTileForColumns(
  tile: { colSpan: number; rowSpan: number },
  cols: number,
  distribution: 'mobile' | 'desktop' = 'desktop',
): { colSpan: number; rowSpan: number } {
  if (cols <= 2) {
    if (tile.colSpan === 1) return { colSpan: 2, rowSpan: tile.rowSpan === 1 ? 2 : tile.rowSpan }
    if (tile.colSpan >= 3) return { colSpan: 2, rowSpan: tile.rowSpan }
    return cloneTile(tile)
  }
  if (cols === 4) {
    if (tile.colSpan === 3) return { colSpan: 4, rowSpan: tile.rowSpan }
    if (tile.colSpan === 4) return { colSpan: 4, rowSpan: tile.rowSpan }
    if (distribution === 'mobile' && tile.colSpan === 1) {
      return { colSpan: 2, rowSpan: tile.rowSpan === 1 ? 2 : tile.rowSpan }
    }
    return cloneTile(tile)
  }
  if (cols === 8) {
    if (tile.colSpan === 4) return { colSpan: 4, rowSpan: tile.rowSpan }
    return cloneTile(tile)
  }
  return cloneTile(tile)
}

function adjustWeights(
  distribution: { colSpan: number; rowSpan: number; weight: number }[],
  recentHistory: { colSpan: number; rowSpan: number }[],
) {
  return distribution.map((t) => {
    let w = t.weight
    if (recentHistory.length > 0) {
      const last = recentHistory[recentHistory.length - 1]
      if (last.colSpan === t.colSpan && last.rowSpan === t.rowSpan) {
        w *= 0.5
      }
      if (last.colSpan >= 2 && t.colSpan >= 2) w *= 0.7
      if (last.rowSpan >= 2 && t.rowSpan >= 2) w *= 0.7
      if (last.colSpan >= 2 && t.rowSpan >= 2) w *= 1.3
      if (last.rowSpan >= 2 && t.colSpan >= 2) w *= 1.3
    }
    const smallStreak = recentHistory.filter((h) => h.colSpan === 1 && h.rowSpan === 1).length
    if (smallStreak >= 3) {
      if (t.colSpan > 1 || t.rowSpan > 1) w *= 1.5
    }
    const largeStreak = recentHistory.filter((h) => isLargeTile(h)).length
    if (largeStreak >= 2) {
      if (t.colSpan === 1 && t.rowSpan === 1) w *= 1.4
    }
    return { ...t, weight: w }
  })
}

function findValidPosition(
  tile: { colSpan: number; rowSpan: number },
  cols: number,
  occupancy: boolean[][],
  anchor: { col: number; row: number } | null,
  tilesPerRow: number[],
): { col: number; row: number } | null {
  const maxTilesPerRow = Math.max(2, Math.floor(cols / 3))
  const startRow = anchor ? anchor.row : 0
  for (let r = startRow; r < occupancy.length; r++) {
    if (tilesPerRow[r] >= maxTilesPerRow) continue
    const startCol = r === startRow && anchor ? anchor.col : 0
    for (let c = startCol; c <= cols - tile.colSpan; c++) {
      if (fitsAt(tile, c, r, cols, occupancy)) {
        return { col: c, row: r }
      }
    }
  }
  return null
}

export function generateLayout(options: LayoutOptions): TilePosition[] {
  const { count, cols, distribution = 'desktop', seed = 42 } = options
  const random = mulberry32(seed)

  const baseDistribution = DESKTOP_DISTRIBUTION

  const maxRows = Math.ceil((count * 3) / cols) + 20
  const occupancy: boolean[][] = Array.from({ length: maxRows }, () => new Array(cols).fill(false))
  const positions: TilePosition[] = []
  const placedTiles: { colSpan: number; rowSpan: number }[] = []
  const tilesPerRow: number[] = []
  let heroCounter = 0

  for (let idx = 0; idx < count; idx++) {
    const isTop = idx === 0
    const anchor = firstEmptyCell(cols, occupancy)
    let chosen: { colSpan: number; rowSpan: number } | null = null
    let chosenCol = -1
    let chosenRow = -1

    if (isTop) {
      const heroShape = distribution === 'mobile'
        ? { colSpan: 4, rowSpan: 2 }
        : { colSpan: 2, rowSpan: 2 }
      const shape = remapTileForColumns(heroShape, cols, distribution)
      const pos = findValidPosition(shape, cols, occupancy, anchor, tilesPerRow)
      if (pos) {
        chosen = shape
        chosenCol = pos.col
        chosenRow = pos.row
      }
    } else {
      if ((idx === 1 || idx === 2) && distribution === 'mobile') {
        const shape = { colSpan: 2, rowSpan: 2 }
        const pos = findValidPosition(shape, cols, occupancy, anchor, tilesPerRow)
        if (pos) {
          chosen = shape
          chosenCol = pos.col
          chosenRow = pos.row
        }
      }
       if (!chosen) {
        heroCounter++
        const shouldTryHero = heroCounter >= 8 && heroCounter <= 12
        const heroCandidates =
          shouldTryHero && cols >= 8
            ? [
                { colSpan: 3, rowSpan: 2, weight: 50 },
                { colSpan: 4, rowSpan: 2, weight: 50 },
                { colSpan: 4, rowSpan: 3, weight: 50 },
              ]
            : []

        const adjustedBase = adjustWeights(baseDistribution, placedTiles)
        const candidates = heroCandidates.length > 0 ? [...heroCandidates, ...adjustedBase] : adjustedBase

        const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0)
        let threshold = random() * totalWeight

        for (const candidate of candidates) {
          const shape = remapTileForColumns(cloneTile(candidate), cols, distribution)
          if (shape.colSpan > cols) continue
          if (isThreeIdenticalConsecutive([...placedTiles, shape])) continue
          if (isAdjacentLarge(shape, anchor?.col ?? 0, anchor?.row ?? 0, placedTiles.map((t) => ({ ...t, colStart: 0, rowStart: 0 })))) continue

          const pos = findValidPosition(shape, cols, occupancy, anchor, tilesPerRow)
          if (!pos) continue

          threshold -= candidate.weight
          if (threshold <= 0) {
            chosen = shape
            chosenCol = pos.col
            chosenRow = pos.row
            break
          }
        }

        if (!chosen) {
          let fallback = remapTileForColumns({ colSpan: 1, rowSpan: 1 }, cols, distribution)
          if (cols <= 2) {
            fallback = { colSpan: 2, rowSpan: 2 }
          }
          const pos = findValidPosition(fallback, cols, occupancy, anchor, tilesPerRow)
          if (pos) {
            chosen = fallback
            chosenCol = pos.col
            chosenRow = pos.row
          }
        }
      }
    }

    if (!chosen || chosenCol < 0 || chosenRow < 0) {
      chosen = { colSpan: 1, rowSpan: 1 }
      chosenCol = 0
      chosenRow = positions.length
    }

    markOccupied(chosen, chosenCol, chosenRow, occupancy)
    positions.push({
      colStart: chosenCol + 1,
      rowStart: chosenRow + 1,
      colSpan: chosen.colSpan,
      rowSpan: chosen.rowSpan,
    })
    placedTiles.push(chosen)
    tilesPerRow[chosenRow] = (tilesPerRow[chosenRow] || 0) + 1

    if (!isTop && isLargeTile(chosen)) {
      heroCounter = 0
    }
  }

  return positions
}