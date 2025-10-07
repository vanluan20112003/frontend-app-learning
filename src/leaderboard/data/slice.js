/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'leaderboard',
  initialState: {
    topGrades: {
      status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
      data: null,
      error: null,
    },
    topProgress: {
      status: 'idle',
      data: null,
      error: null,
      period: 'all',
    },
  },
  reducers: {
    // Top Grades actions
    fetchTopGradesRequest: (state) => {
      state.topGrades.status = 'loading';
      state.topGrades.error = null;
    },
    fetchTopGradesSuccess: (state, { payload }) => {
      state.topGrades.status = 'succeeded';
      state.topGrades.data = payload;
      state.topGrades.error = null;
    },
    fetchTopGradesFailure: (state, { payload }) => {
      state.topGrades.status = 'failed';
      state.topGrades.error = payload;
    },

    // Top Progress actions
    fetchTopProgressRequest: (state) => {
      state.topProgress.status = 'loading';
      state.topProgress.error = null;
    },
    fetchTopProgressSuccess: (state, { payload }) => {
      state.topProgress.status = 'succeeded';
      state.topProgress.data = payload.data;
      state.topProgress.period = payload.period;
      state.topProgress.error = null;
    },
    fetchTopProgressFailure: (state, { payload }) => {
      state.topProgress.status = 'failed';
      state.topProgress.error = payload;
    },

    // Reset actions
    resetLeaderboard: (state) => {
      state.topGrades = {
        status: 'idle',
        data: null,
        error: null,
      };
      state.topProgress = {
        status: 'idle',
        data: null,
        error: null,
        period: 'all',
      };
    },
  },
});

export const {
  fetchTopGradesRequest,
  fetchTopGradesSuccess,
  fetchTopGradesFailure,
  fetchTopProgressRequest,
  fetchTopProgressSuccess,
  fetchTopProgressFailure,
  resetLeaderboard,
} = slice.actions;

export const leaderboardReducer = slice.reducer;
