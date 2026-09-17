import type {
  CastlingRights,
  ChessBoard,
  ChessPiece,
  ChessPosition,
  PieceColor,
  PieceType,
} from '../types/chess.types';
import { createEmptyBoard, fromAlgebraic, isInBounds, squareOf, toAlgebraic } from './chess-board';
import { BOARD_SIZE, NO_CASTLING, START_FEN, WHITE } from './chess-constants';

const PIECE_LETTERS = 'pnbrqk';

function letterToPiece(letter: string): ChessPiece | null {
  const type = letter.toLowerCase() as PieceType;
  if (!PIECE_LETTERS.includes(type)) return null;
  return { color: letter === letter.toUpperCase() ? 'w' : 'b', type };
}

function pieceToLetter(piece: ChessPiece): string {
  return piece.color === WHITE ? piece.type.toUpperCase() : piece.type;
}

function parseRanks(placement: string): ChessBoard {
  const ranks = placement.split('/');
  if (ranks.length !== BOARD_SIZE) {
    throw new Error(`Invalid FEN: expected ${BOARD_SIZE} ranks, received ${ranks.length}`);
  }

  const board = createEmptyBoard();
  ranks.forEach((rank, row) => {
    let col = 0;
    for (const char of rank) {
      const skip = Number(char);
      if (Number.isInteger(skip) && skip >= 1 && skip <= BOARD_SIZE) {
        col += skip;
        continue;
      }
      const piece = letterToPiece(char);
      if (!piece || !isInBounds(row, col)) {
        throw new Error(`Invalid FEN: unreadable rank "${rank}"`);
      }
      board[squareOf(row, col)] = piece;
      col += 1;
    }
    if (col !== BOARD_SIZE) {
      throw new Error(`Invalid FEN: rank "${rank}" does not cover ${BOARD_SIZE} files`);
    }
  });
  return board;
}

function parseCastling(field: string): CastlingRights {
  if (field === '-') return { ...NO_CASTLING };
  return {
    wk: field.includes('K'),
    wq: field.includes('Q'),
    bk: field.includes('k'),
    bq: field.includes('q'),
  };
}

function serializeCastling(rights: CastlingRights): string {
  const text = `${rights.wk ? 'K' : ''}${rights.wq ? 'Q' : ''}${rights.bk ? 'k' : ''}${
    rights.bq ? 'q' : ''
  }`;
  return text === '' ? '-' : text;
}

/** Reads a FEN string into a position. Throws on malformed input. */
export function parseFen(fen: string): ChessPosition {
  const fields = fen.trim().split(/\s+/);
  if (fields.length < 4) {
    throw new Error('Invalid FEN: at least four fields are required');
  }

  const [placement, turn, castling, enPassant, halfmove = '0', fullmove = '1'] = fields;
  if (turn !== 'w' && turn !== 'b') {
    throw new Error(`Invalid FEN: side to move must be "w" or "b", received "${turn}"`);
  }

  return {
    board: parseRanks(placement),
    turn: turn as PieceColor,
    castling: parseCastling(castling),
    enPassant: enPassant === '-' ? null : fromAlgebraic(enPassant),
    halfmoveClock: Number(halfmove) || 0,
    fullmoveNumber: Number(fullmove) || 1,
  };
}

function serializePlacement(board: ChessBoard): string {
  const ranks: string[] = [];
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    let rank = '';
    let empty = 0;
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const piece = board[squareOf(row, col)];
      if (!piece) {
        empty += 1;
        continue;
      }
      if (empty > 0) {
        rank += String(empty);
        empty = 0;
      }
      rank += pieceToLetter(piece);
    }
    if (empty > 0) rank += String(empty);
    ranks.push(rank);
  }
  return ranks.join('/');
}

/** Writes a position as a full six-field FEN string. */
export function toFen(position: ChessPosition): string {
  const enPassant = position.enPassant === null ? '-' : toAlgebraic(position.enPassant);
  return [
    serializePlacement(position.board),
    position.turn,
    serializeCastling(position.castling),
    enPassant,
    String(position.halfmoveClock),
    String(position.fullmoveNumber),
  ].join(' ');
}

/**
 * The first four FEN fields: what threefold repetition compares. The clocks are
 * excluded because a repeated position is repeated however long it took to
 * reach.
 */
export function repetitionKey(position: ChessPosition): string {
  return toFen(position).split(' ').slice(0, 4).join(' ');
}

export function createStartPosition(): ChessPosition {
  return parseFen(START_FEN);
}
