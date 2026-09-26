import {
  CROSSWORD_PUZZLES,
  DIR_ACROSS,
  DIR_DOWN,
  type CrosswordDifficulty,
  type CrosswordDirection,
  type CrosswordPuzzleDefinition,
  type CrosswordTheme,
  type RawCrosswordClue,
} from './crossword-clash-puzzles';

export type {
  CrosswordDifficulty,
  CrosswordDirection,
  CrosswordPuzzleDefinition,
  CrosswordTheme,
  RawCrosswordClue,
};

export type CrosswordMode = 'solo' | 'race' | 'turn-based' | 'team';

export const MODE_TURN_BASED: CrosswordMode = 'turn-based';
export const MODE_TEAM: CrosswordMode = 'team';
const TEAM_RED = 'red' as const;
const TEAM_BLUE = 'blue' as const;

export type CrosswordStatus = 'lobby' | 'countdown' | 'playing' | 'completed';

export interface CrosswordCell {
  row: number;
  col: number;
  isBlack: boolean;
  solutionChar: string;
  number?: number;
  acrossClueId?: string;
  downClueId?: string;
  lockedChar?: string;
  lockedByPlayerId?: string;
  lockedColor?: string;
  userChar: string;
  isError?: boolean;
}

export interface CrosswordClue {
  id: string;
  number: number;
  direction: CrosswordDirection;
  row: number;
  col: number;
  length: number;
  answer: string;
  text: string;
  isCompleted: boolean;
  completedByPlayerId?: string;
}

export interface CrosswordPlayer {
  id: string;
  name: string;
  isBot: boolean;
  color: string;
  score: number;
  lettersSolved: number;
  wordsCompleted: number;
  team?: 'red' | 'blue';
}

export interface CrosswordNotification {
  id: string;
  text: string;
  type: 'success' | 'bonus' | 'info' | 'error';
  timestamp: number;
}

export interface CrosswordState {
  puzzleId: string;
  title: string;
  theme: CrosswordTheme;
  difficulty: CrosswordDifficulty;
  mode: CrosswordMode;
  status: CrosswordStatus;
  countdownTimer: number;
  rows: number;
  cols: number;
  cells: CrosswordCell[][];
  clues: CrosswordClue[];
  players: CrosswordPlayer[];
  activePlayerIndex: number;
  turnTimeRemaining: number;
  timeRemaining: number;
  totalLettersToSolve: number;
  solvedLettersCount: number;
  selectedRow: number;
  selectedCol: number;
  selectedDirection: CrosswordDirection;
  selectedClueId: string;
  notifications: CrosswordNotification[];
  highContrast: boolean;
  largeText: boolean;
  botCooldown: number;
}

export const PLAYER_COLORS = [
  '#f59e0b', // Amber / Gold (Player 1)
  '#06b6d4', // Cyan (Player 2)
  '#10b981', // Emerald (Player 3)
  '#f43f5e', // Rose (Player 4)
];

export const TEAM_COLORS = {
  red: '#ef4444',
  blue: '#3b82f6',
};

export const BOT_NAMES = ['LexiBot', 'Cruciverbalist', 'WordSmith', 'ClueSeeker'];

export function getPuzzleCatalog(): CrosswordPuzzleDefinition[] {
  return CROSSWORD_PUZZLES;
}

export function findPuzzle(
  theme: CrosswordTheme,
  difficulty: CrosswordDifficulty,
): CrosswordPuzzleDefinition {
  const match = CROSSWORD_PUZZLES.find((p) => p.theme === theme && p.difficulty === difficulty);
  if (match) return match;

  const fallbackTheme = CROSSWORD_PUZZLES.find((p) => p.theme === theme);
  if (fallbackTheme) return fallbackTheme;

  return CROSSWORD_PUZZLES[0];
}

export interface InitialCrosswordConfig {
  theme?: CrosswordTheme;
  difficulty?: CrosswordDifficulty;
  mode?: CrosswordMode;
  puzzleId?: string;
  players?: Array<{
    id: string;
    name: string;
    isBot?: boolean;
    team?: 'red' | 'blue';
  }>;
  highContrast?: boolean;
  largeText?: boolean;
}

export function createInitialCrosswordState(config?: InitialCrosswordConfig): CrosswordState {
  const theme = config?.theme ?? 'science';
  const difficulty = config?.difficulty ?? 'easy';
  const mode = config?.mode ?? 'solo';

  let puzzleDef: CrosswordPuzzleDefinition;
  if (config?.puzzleId) {
    const found = CROSSWORD_PUZZLES.find((p) => p.id === config.puzzleId);
    puzzleDef = found ?? findPuzzle(theme, difficulty);
  } else {
    puzzleDef = findPuzzle(theme, difficulty);
  }

  const { rows, cols, clues: rawClues, title, id: puzzleId } = puzzleDef;

  // 1. Build grid of cells
  const cells: CrosswordCell[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      row: r,
      col: c,
      isBlack: true,
      solutionChar: '',
      userChar: '',
    })),
  );

  // 2. Build clues and populate cells
  const clues: CrosswordClue[] = [];
  const cellNumberMap = new Map<string, number>();
  let totalLettersToSolve = 0;

  for (const raw of rawClues) {
    const key = `${raw.row},${raw.col}`;
    if (!cellNumberMap.has(key)) {
      cellNumberMap.set(key, raw.number);
    }

    const clue: CrosswordClue = {
      id: raw.id,
      number: raw.number,
      direction: raw.direction,
      row: raw.row,
      col: raw.col,
      length: raw.answer.length,
      answer: raw.answer.toUpperCase(),
      text: raw.text,
      isCompleted: false,
    };
    clues.push(clue);

    // Populate solution chars
    for (let i = 0; i < raw.answer.length; i++) {
      const r = raw.direction === DIR_ACROSS ? raw.row : raw.row + i;
      const c = raw.direction === DIR_ACROSS ? raw.col + i : raw.col;
      const cell = cells[r][c];

      if (cell.isBlack) {
        cell.isBlack = false;
        totalLettersToSolve++;
      }
      cell.solutionChar = raw.answer[i].toUpperCase();

      if (raw.direction === DIR_ACROSS) {
        cell.acrossClueId = raw.id;
      } else {
        cell.downClueId = raw.id;
      }
    }
  }

  // Assign numbers to cells
  for (const [key, num] of cellNumberMap.entries()) {
    const [r, c] = key.split(',').map(Number);
    if (cells[r] && cells[r][c]) {
      cells[r][c].number = num;
    }
  }

  // 3. Configure players
  const playerInputs =
    config?.players && config.players.length > 0
      ? config.players
      : [
          { id: 'player-1', name: 'Player 1', isBot: false },
          ...(mode === 'race' || mode === MODE_TURN_BASED
            ? [
                { id: 'bot-1', name: 'LexiBot', isBot: true },
                { id: 'bot-2', name: 'WordSmith', isBot: true },
              ]
            : mode === MODE_TEAM
              ? [
                  { id: 'bot-1', name: 'LexiBot (Red)', isBot: true, team: TEAM_RED },
                  { id: 'bot-2', name: 'ClueSeeker (Blue)', isBot: true, team: TEAM_BLUE },
                  {
                    id: 'bot-3',
                    name: 'Cruciverbalist (Blue)',
                    isBot: true,
                    team: TEAM_BLUE,
                  },
                ]
              : []),
        ];

  const players: CrosswordPlayer[] = playerInputs.map((p, idx) => {
    let color: string;
    if (mode === MODE_TEAM) {
      const team = p.team ?? (idx === 0 || idx === 1 ? TEAM_RED : TEAM_BLUE);
      color = team === TEAM_RED ? TEAM_COLORS.red : TEAM_COLORS.blue;
    } else {
      color = PLAYER_COLORS[idx % PLAYER_COLORS.length];
    }

    return {
      id: p.id,
      name: p.name,
      isBot: p.isBot ?? false,
      color,
      score: 0,
      lettersSolved: 0,
      wordsCompleted: 0,
      team: p.team ?? (mode === MODE_TEAM ? (idx % 2 === 0 ? TEAM_RED : TEAM_BLUE) : undefined),
    };
  });

  // Default selection to first clue's starting position
  const firstClue = clues[0];
  const initialRow = firstClue ? firstClue.row : 0;
  const initialCol = firstClue ? firstClue.col : 0;
  const initialDirection = firstClue ? firstClue.direction : DIR_ACROSS;
  const initialClueId = firstClue ? firstClue.id : '';

  const initialTime = difficulty === 'easy' ? 180 : difficulty === 'medium' ? 240 : 300;

  return {
    puzzleId,
    title,
    theme,
    difficulty,
    mode,
    status: 'lobby',
    countdownTimer: 3,
    rows,
    cols,
    cells,
    clues,
    players,
    activePlayerIndex: 0,
    turnTimeRemaining: 20,
    timeRemaining: initialTime,
    totalLettersToSolve,
    solvedLettersCount: 0,
    selectedRow: initialRow,
    selectedCol: initialCol,
    selectedDirection: initialDirection,
    selectedClueId: initialClueId,
    notifications: [],
    highContrast: config?.highContrast ?? false,
    largeText: config?.largeText ?? false,
    botCooldown: 2.5,
  };
}

export function startCrosswordGame(state: CrosswordState): CrosswordState {
  return {
    ...state,
    status: 'countdown',
    countdownTimer: 3,
  };
}

export function selectCrosswordCell(
  state: CrosswordState,
  row: number,
  col: number,
): CrosswordState {
  if (row < 0 || row >= state.rows || col < 0 || col >= state.cols) {
    return state;
  }

  const cell = state.cells[row][col];
  if (cell.isBlack) return state;

  let newDirection = state.selectedDirection;
  if (row === state.selectedRow && col === state.selectedCol) {
    // Toggling direction if clicking already focused cell
    if (newDirection === DIR_ACROSS && cell.downClueId) {
      newDirection = DIR_DOWN;
    } else if (newDirection === DIR_DOWN && cell.acrossClueId) {
      newDirection = DIR_ACROSS;
    }
  } else {
    // If current direction has no clue at target cell, adapt
    if (newDirection === DIR_ACROSS && !cell.acrossClueId && cell.downClueId) {
      newDirection = DIR_DOWN;
    } else if (newDirection === DIR_DOWN && !cell.downClueId && cell.acrossClueId) {
      newDirection = DIR_ACROSS;
    }
  }

  const clueId = newDirection === DIR_ACROSS ? (cell.acrossClueId ?? '') : (cell.downClueId ?? '');

  return {
    ...state,
    selectedRow: row,
    selectedCol: col,
    selectedDirection: newDirection,
    selectedClueId: clueId,
  };
}

export function selectCrosswordClue(state: CrosswordState, clueId: string): CrosswordState {
  const clue = state.clues.find((c) => c.id === clueId);
  if (!clue) return state;

  // Find first unsolved cell for this clue, or default to starting cell
  let targetRow = clue.row;
  let targetCol = clue.col;

  for (let i = 0; i < clue.length; i++) {
    const r = clue.direction === DIR_ACROSS ? clue.row : clue.row + i;
    const c = clue.direction === DIR_ACROSS ? clue.col + i : clue.col;
    const cell = state.cells[r][c];
    if (!cell.lockedChar) {
      targetRow = r;
      targetCol = c;
      break;
    }
  }

  return {
    ...state,
    selectedRow: targetRow,
    selectedCol: targetCol,
    selectedDirection: clue.direction,
    selectedClueId: clue.id,
  };
}

export function cycleCrosswordClue(state: CrosswordState, delta: 1 | -1): CrosswordState {
  if (state.clues.length === 0) return state;

  const currentIndex = state.clues.findIndex((c) => c.id === state.selectedClueId);
  let nextIndex: number;
  if (currentIndex === -1) {
    nextIndex = 0;
  } else {
    nextIndex = (currentIndex + delta + state.clues.length) % state.clues.length;
  }

  return selectCrosswordClue(state, state.clues[nextIndex].id);
}

export function navigateCrosswordCursor(
  state: CrosswordState,
  direction: 'up' | 'down' | 'left' | 'right',
): CrosswordState {
  const { selectedRow, selectedCol } = state;
  const dr = direction === 'up' ? -1 : direction === 'down' ? 1 : 0;
  const dc = direction === 'left' ? -1 : direction === 'right' ? 1 : 0;

  let r = selectedRow + dr;
  let c = selectedCol + dc;

  while (r >= 0 && r < state.rows && c >= 0 && c < state.cols) {
    if (!state.cells[r][c].isBlack) {
      return selectCrosswordCell(state, r, c);
    }
    r += dr;
    c += dc;
  }

  return state;
}

export function advanceCursorToNextUnfilled(state: CrosswordState): CrosswordState {
  const clue = state.clues.find((c) => c.id === state.selectedClueId);
  if (!clue) return state;

  const isAcross = state.selectedDirection === 'across';
  const startIdx = isAcross ? state.selectedCol - clue.col + 1 : state.selectedRow - clue.row + 1;

  for (let i = startIdx; i < clue.length; i++) {
    const r = isAcross ? clue.row : clue.row + i;
    const c = isAcross ? clue.col + i : clue.col;
    if (!state.cells[r][c].lockedChar) {
      return {
        ...state,
        selectedRow: r,
        selectedCol: c,
      };
    }
  }

  return state;
}

export function inputCrosswordLetter(
  state: CrosswordState,
  playerId: string,
  rawChar: string,
): CrosswordState {
  if (state.status !== 'playing') return state;

  const char = rawChar.trim().toUpperCase();
  if (!/^[A-Z]$/.test(char)) return state;

  const player = state.players.find((p) => p.id === playerId);
  if (!player) return state;

  const cell = state.cells[state.selectedRow]?.[state.selectedCol];
  if (!cell || cell.isBlack) return state;

  // If already locked, prevent overwriting and just advance
  if (cell.lockedChar) {
    return advanceCursorToNextUnfilled(state);
  }

  const isCorrect = char === cell.solutionChar;

  if (!isCorrect) {
    // Flash error, clear user draft
    const updatedCells = state.cells.map((row, r) =>
      row.map((c, col) => {
        if (r === state.selectedRow && col === state.selectedCol) {
          return { ...c, isError: true, userChar: char };
        }
        return c;
      }),
    );

    return {
      ...state,
      cells: updatedCells,
    };
  }

  // Correct letter placement: lock letter, award +10 pts
  const newSolvedCount = state.solvedLettersCount + 1;
  const updatedCells = state.cells.map((row, r) =>
    row.map((c, col) => {
      if (r === state.selectedRow && col === state.selectedCol) {
        return {
          ...c,
          lockedChar: char,
          lockedByPlayerId: playerId,
          lockedColor: player.color,
          userChar: '',
          isError: false,
        };
      }
      return c;
    }),
  );

  let additionalPoints = 10;
  let wordsJustCompleted = 0;
  const newNotifications: CrosswordNotification[] = [...state.notifications];

  // Check all clues intersecting this cell for completion
  const updatedClues = state.clues.map((clue) => {
    if (clue.isCompleted) return clue;

    // Check if every cell in this clue is now locked
    let isFullyLocked = true;
    for (let i = 0; i < clue.length; i++) {
      const cr = clue.direction === DIR_ACROSS ? clue.row : clue.row + i;
      const cc = clue.direction === DIR_ACROSS ? clue.col + i : clue.col;
      if (!updatedCells[cr][cc].lockedChar) {
        isFullyLocked = false;
        break;
      }
    }

    if (isFullyLocked) {
      additionalPoints += 100; // Word bounty bonus!
      wordsJustCompleted++;
      newNotifications.push({
        id: `notif-${Date.now()}-${clue.id}`,
        text: `${player.name} completed ${clue.id} (${clue.answer})! +100 bonus`,
        type: 'bonus',
        timestamp: Date.now(),
      });
      return {
        ...clue,
        isCompleted: true,
        completedByPlayerId: playerId,
      };
    }
    return clue;
  });

  // Update player score & stats
  const updatedPlayers = state.players.map((p) => {
    if (p.id === playerId) {
      return {
        ...p,
        score: p.score + additionalPoints,
        lettersSolved: p.lettersSolved + 1,
        wordsCompleted: p.wordsCompleted + wordsJustCompleted,
      };
    }
    // If in team mode, award team member points as well
    if (state.mode === MODE_TEAM && p.team && p.team === player.team) {
      return {
        ...p,
        score: p.score + additionalPoints,
      };
    }
    return p;
  });

  const isPuzzleComplete = newSolvedCount >= state.totalLettersToSolve;

  let nextState: CrosswordState = {
    ...state,
    cells: updatedCells,
    clues: updatedClues,
    players: updatedPlayers,
    solvedLettersCount: newSolvedCount,
    status: isPuzzleComplete ? 'completed' : state.status,
    notifications: newNotifications.slice(-4), // keep last 4
  };

  if (!isPuzzleComplete) {
    nextState = advanceCursorToNextUnfilled(nextState);
  } else {
    nextState.notifications.push({
      id: `complete-${Date.now()}`,
      text: 'Crossword Puzzle 100% Solved!',
      type: 'success',
      timestamp: Date.now(),
    });
  }

  return nextState;
}

export function deleteCrosswordLetter(state: CrosswordState): CrosswordState {
  const cell = state.cells[state.selectedRow]?.[state.selectedCol];
  if (!cell || cell.isBlack) return state;

  if (cell.userChar && !cell.lockedChar) {
    const updatedCells = state.cells.map((row, r) =>
      row.map((c, col) => {
        if (r === state.selectedRow && col === state.selectedCol) {
          return { ...c, userChar: '', isError: false };
        }
        return c;
      }),
    );
    return { ...state, cells: updatedCells };
  }

  // Move cursor backwards in current clue
  const clue = state.clues.find((c) => c.id === state.selectedClueId);
  if (!clue) return state;

  const isAcross = state.selectedDirection === DIR_ACROSS;
  const currentIdx = isAcross ? state.selectedCol - clue.col : state.selectedRow - clue.row;

  if (currentIdx > 0) {
    const prevRow = isAcross ? clue.row : clue.row + currentIdx - 1;
    const prevCol = isAcross ? clue.col + currentIdx - 1 : clue.col;
    return {
      ...state,
      selectedRow: prevRow,
      selectedCol: prevCol,
    };
  }

  return state;
}

export function stepCrosswordEngine(state: CrosswordState, dt: number): CrosswordState {
  if (state.status === 'lobby' || state.status === 'completed') {
    return state;
  }

  // Handle countdown
  if (state.status === 'countdown') {
    const nextTimer = state.countdownTimer - dt;
    if (nextTimer <= 0) {
      return {
        ...state,
        status: 'playing',
        countdownTimer: 0,
      };
    }
    return {
      ...state,
      countdownTimer: nextTimer,
    };
  }

  // Handle Playing mode
  const nextTimeRemaining = Math.max(0, state.timeRemaining - dt);
  if (nextTimeRemaining <= 0) {
    return {
      ...state,
      timeRemaining: 0,
      status: 'completed',
      notifications: [
        ...state.notifications,
        {
          id: `timeout-${Date.now()}`,
          text: "Time's up! Crossword round finished.",
          type: 'info',
          timestamp: Date.now(),
        },
      ],
    };
  }

  // Clean expired notifications
  const now = Date.now();
  const cleanedNotifications = state.notifications.filter((n) => now - n.timestamp < 3500);

  let nextState: CrosswordState = {
    ...state,
    timeRemaining: nextTimeRemaining,
    notifications: cleanedNotifications,
  };

  // Turn-based mode turn timer
  if (state.mode === MODE_TURN_BASED) {
    const nextTurnTimer = state.turnTimeRemaining - dt;
    if (nextTurnTimer <= 0) {
      const nextPlayerIdx = (state.activePlayerIndex + 1) % state.players.length;
      nextState = {
        ...nextState,
        activePlayerIndex: nextPlayerIdx,
        turnTimeRemaining: 20,
        notifications: [
          ...nextState.notifications,
          {
            id: `turn-${Date.now()}`,
            text: `${state.players[nextPlayerIdx].name}'s Turn!`,
            type: 'info',
            timestamp: Date.now(),
          },
        ],
      };
    } else {
      nextState.turnTimeRemaining = nextTurnTimer;
    }
  }

  // AI Bot Solver Logic
  nextState.botCooldown -= dt;
  if (nextState.botCooldown <= 0) {
    // Reset bot cooldown: easy: 3.5s, med: 2.8s, hard: 2.2s
    const baseCd = state.difficulty === 'easy' ? 3.5 : state.difficulty === 'medium' ? 2.8 : 2.2;
    nextState.botCooldown = baseCd + Math.random() * 1.5;

    // Identify active bot player
    let botToAct: CrosswordPlayer | undefined;
    if (state.mode === MODE_TURN_BASED) {
      const current = state.players[state.activePlayerIndex];
      if (current && current.isBot) {
        botToAct = current;
      }
    } else if (state.mode === 'race' || state.mode === MODE_TEAM) {
      const bots = state.players.filter((p) => p.isBot);
      if (bots.length > 0) {
        botToAct = bots[Math.floor(Math.random() * bots.length)];
      }
    }

    if (botToAct) {
      // Bot finds an unsolved cell in an unsolved clue
      const unsolvedClues = nextState.clues.filter((c) => !c.isCompleted);
      if (unsolvedClues.length > 0) {
        const chosenClue = unsolvedClues[Math.floor(Math.random() * unsolvedClues.length)];
        // Find empty cell in clue
        const emptyCells: Array<{ row: number; col: number; char: string }> = [];
        for (let i = 0; i < chosenClue.length; i++) {
          const r = chosenClue.direction === DIR_ACROSS ? chosenClue.row : chosenClue.row + i;
          const c = chosenClue.direction === DIR_ACROSS ? chosenClue.col + i : chosenClue.col;
          const cell = nextState.cells[r][c];
          if (!cell.lockedChar) {
            emptyCells.push({ row: r, col: c, char: cell.solutionChar });
          }
        }

        if (emptyCells.length > 0) {
          const target = emptyCells[Math.floor(Math.random() * emptyCells.length)];
          // Temporarily set active cursor for placement
          const botState = {
            ...nextState,
            selectedRow: target.row,
            selectedCol: target.col,
            selectedDirection: chosenClue.direction,
            selectedClueId: chosenClue.id,
          };
          nextState = inputCrosswordLetter(botState, botToAct.id, target.char);

          if (state.mode === MODE_TURN_BASED) {
            // End turn for bot
            nextState.activePlayerIndex =
              (nextState.activePlayerIndex + 1) % nextState.players.length;
            nextState.turnTimeRemaining = 20;
          }
        }
      }
    }
  }

  return nextState;
}
