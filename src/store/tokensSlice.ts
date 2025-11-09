// src/store/tokensSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SortDirection = 'asc' | 'desc' | null;
export type SortKey = 'price' | 'change24h' | 'volume24h' | 'liquidity' | null;

export interface TokensUIState {
  sortKey: SortKey;
  sortDirection: SortDirection;
  selectedTokenId: string | null;
  isDetailsModalOpen: boolean;
}

const initialState: TokensUIState = {
  sortKey: null,
  sortDirection: null,
  selectedTokenId: null,
  isDetailsModalOpen: false,
};

const tokensSlice = createSlice({
  name: 'tokensUI',
  initialState,
  reducers: {
    setSort(state, action: PayloadAction<{ key: SortKey; direction: SortDirection }>) {
      state.sortKey = action.payload.key;
      state.sortDirection = action.payload.direction;
    },
    selectToken(state, action: PayloadAction<string | null>) {
      state.selectedTokenId = action.payload;
    },
    openDetailsModal(state) {
      state.isDetailsModalOpen = true;
    },
    closeDetailsModal(state) {
      state.isDetailsModalOpen = false;
    },
    toggleDetailsModal(state) {
      state.isDetailsModalOpen = !state.isDetailsModalOpen;
    },
  },
});

export const { setSort, selectToken, openDetailsModal, closeDetailsModal, toggleDetailsModal } =
  tokensSlice.actions;

export default tokensSlice.reducer;
