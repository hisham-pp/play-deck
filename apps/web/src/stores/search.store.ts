import { create } from 'zustand';
import type { GameCategory } from '@playdeck/game-types';

export interface SearchState {
  isOpen: boolean;
  query: string;
  selectedCategory: GameCategory | 'all';
  selectedIndex: number;

  openSearch: (initialQuery?: string) => void;
  closeSearch: () => void;
  toggleSearch: () => void;
  setQuery: (query: string) => void;
  setSelectedCategory: (category: GameCategory | 'all') => void;
  setSelectedIndex: (index: number) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  isOpen: false,
  query: '',
  selectedCategory: 'all',
  selectedIndex: 0,

  openSearch: (initialQuery = '') =>
    set({
      isOpen: true,
      query: initialQuery,
      selectedIndex: 0,
    }),

  closeSearch: () =>
    set({
      isOpen: false,
      query: '',
      selectedCategory: 'all',
      selectedIndex: 0,
    }),

  toggleSearch: () =>
    set((state) => ({
      isOpen: !state.isOpen,
      query: !state.isOpen ? '' : state.query,
      selectedIndex: 0,
    })),

  setQuery: (query: string) =>
    set({
      query,
      selectedIndex: 0,
    }),

  setSelectedCategory: (selectedCategory: GameCategory | 'all') =>
    set({
      selectedCategory,
      selectedIndex: 0,
    }),

  setSelectedIndex: (selectedIndex: number) =>
    set({
      selectedIndex,
    }),

  reset: () =>
    set({
      query: '',
      selectedCategory: 'all',
      selectedIndex: 0,
    }),
}));
