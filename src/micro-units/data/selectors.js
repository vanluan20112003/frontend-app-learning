export const getMicroUnitsState = (state) => state.microUnits;

export const getMicroUnits = (state) => state.microUnits.units;

export const getMicroUnitsStatus = (state) => state.microUnits.status;

export const getMicroUnitsTotalCount = (state) => state.microUnits.totalUnits;

export const getCurrentMicroUnit = (state) => state.microUnits.currentUnit;

export const getCurrentMicroUnitStatus = (state) => state.microUnits.currentUnitStatus;

export const getMicroUnitById = (state, unitId) => state.microUnits.units.find(
  (unit) => unit.id === unitId,
);

export const getMicroUnitDetail = (state) => state.microUnits.microUnitDetail;

export const getMicroUnitDetailStatus = (state) => state.microUnits.microUnitDetailStatus;
