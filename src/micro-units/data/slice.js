import { createSlice } from '@reduxjs/toolkit';

export const LOADING = 'loading';
export const LOADED = 'loaded';
export const FAILED = 'failed';

const initialState = {
  courseId: null,
  units: [],
  totalUnits: 0,
  status: 'idle',
  error: null,
  currentUnit: null,
  currentUnitStatus: 'idle',
  currentUnitError: null,
  microUnitDetail: null,
  microUnitDetailStatus: 'idle',
  microUnitDetailError: null,
};

const microUnitsSlice = createSlice({
  name: 'microUnits',
  initialState,
  reducers: {
    fetchMicroUnitsRequest: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers using Immer
      // eslint-disable-next-line no-param-reassign
      state.status = LOADING;
      // eslint-disable-next-line no-param-reassign
      state.error = null;
    },
    fetchMicroUnitsSuccess: (state, action) => {
      const { courseId, units, totalUnits } = action.payload;
      // eslint-disable-next-line no-param-reassign
      state.status = LOADED;
      // eslint-disable-next-line no-param-reassign
      state.courseId = courseId;
      // eslint-disable-next-line no-param-reassign
      state.units = units;
      // eslint-disable-next-line no-param-reassign
      state.totalUnits = totalUnits;
      // eslint-disable-next-line no-param-reassign
      state.error = null;
    },
    fetchMicroUnitsFailure: (state, action) => {
      // eslint-disable-next-line no-param-reassign
      state.status = FAILED;
      // eslint-disable-next-line no-param-reassign
      state.error = action.payload;
    },
    fetchMicroUnitContentRequest: (state) => {
      // eslint-disable-next-line no-param-reassign
      state.currentUnitStatus = LOADING;
      // eslint-disable-next-line no-param-reassign
      state.currentUnitError = null;
    },
    fetchMicroUnitContentSuccess: (state, action) => {
      // eslint-disable-next-line no-param-reassign
      state.currentUnitStatus = LOADED;
      // eslint-disable-next-line no-param-reassign
      state.currentUnit = action.payload;
      // eslint-disable-next-line no-param-reassign
      state.currentUnitError = null;
    },
    fetchMicroUnitContentFailure: (state, action) => {
      // eslint-disable-next-line no-param-reassign
      state.currentUnitStatus = FAILED;
      // eslint-disable-next-line no-param-reassign
      state.currentUnitError = action.payload;
    },
    markUnitComplete: (state, action) => {
      const { unitId } = action.payload;
      // Find and update the unit's complete status
      const unitIndex = state.units.findIndex(u => u.id === unitId);
      if (unitIndex !== -1) {
        // eslint-disable-next-line no-param-reassign
        state.units[unitIndex].complete = true;
      }
    },
    fetchMicroUnitDetailRequest: (state) => {
      // eslint-disable-next-line no-param-reassign
      state.microUnitDetailStatus = LOADING;
      // eslint-disable-next-line no-param-reassign
      state.microUnitDetailError = null;
    },
    fetchMicroUnitDetailSuccess: (state, action) => {
      // eslint-disable-next-line no-param-reassign
      state.microUnitDetailStatus = LOADED;
      // eslint-disable-next-line no-param-reassign
      state.microUnitDetail = action.payload;
      // eslint-disable-next-line no-param-reassign
      state.microUnitDetailError = null;
    },
    fetchMicroUnitDetailFailure: (state, action) => {
      // eslint-disable-next-line no-param-reassign
      state.microUnitDetailStatus = FAILED;
      // eslint-disable-next-line no-param-reassign
      state.microUnitDetailError = action.payload;
    },
    resetMicroUnits: () => initialState,
  },
});

export const {
  fetchMicroUnitsRequest,
  fetchMicroUnitsSuccess,
  fetchMicroUnitsFailure,
  fetchMicroUnitContentRequest,
  fetchMicroUnitContentSuccess,
  fetchMicroUnitContentFailure,
  markUnitComplete,
  fetchMicroUnitDetailRequest,
  fetchMicroUnitDetailSuccess,
  fetchMicroUnitDetailFailure,
  resetMicroUnits,
} = microUnitsSlice.actions;

export const { reducer } = microUnitsSlice;
