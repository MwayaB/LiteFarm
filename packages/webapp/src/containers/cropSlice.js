import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { loginSelector, onLoadingFail, onLoadingStart } from './userFarmSlice';
import { createSelector } from 'reselect';
import { pick } from '../util';
const averagesList = [
  'max_rooting_depth',
  'depletion_fraction',
  'is_avg_depth',
  'initial_kc',
  'mid_kc',
  'end_kc',
  'max_height',
  'is_avg_kc',
  'nutrient_notes',
  'percentrefuse',
  'refuse',
  'protein',
  'lipid',
  'energy',
  'ca',
  'fe',
  'mg',
  'ph',
  'k',
  'na',
  'zn',
  'cu',
  'fl',
  'mn',
  'se',
  'vita_rae',
  'vite',
  'vitc',
  'thiamin',
  'riboflavin',
  'niacin',
  'pantothenic',
  'vitb6',
  'folate',
  'vitb12',
  'vitk',
  'nutrient_credits',
];
const getCrop = (obj) => {
  return pick(obj, [
    'crop_id',
    'crop_common_name',
    'crop_variety',
    'crop_genus',
    'crop_specie',
    'crop_group',
    'crop_subgroup',
    'max_rooting_depth',
    'depletion_fraction',
    'is_avg_depth',
    'initial_kc',
    'mid_kc',
    'end_kc',
    'max_height',
    'is_avg_kc',
    'nutrient_notes',
    'percentrefuse',
    'refuse',
    'protein',
    'lipid',
    'energy',
    'ca',
    'fe',
    'mg',
    'ph',
    'k',
    'na',
    'zn',
    'cu',
    'fl',
    'mn',
    'se',
    'vita_rae',
    'vite',
    'vitc',
    'thiamin',
    'riboflavin',
    'niacin',
    'pantothenic',
    'vitb6',
    'folate',
    'vitb12',
    'vitk',
    'is_avg_nutrient',
    'farm_id',
    'user_added',
    'deleted',
    'nutrient_credits',
    'crop_translation_key',
  ]);
};
const addOneCrop = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  cropAdapter.upsertOne(state, getCrop(payload));
};

const updateOneCrop = (state, { payload }) => {
  state.loading = false;
  state.error = null;
  cropAdapter.updateOne(state, getCrop(payload));
};

const addManyCrop = (state, { payload: crops }) => {
  state.loading = false;
  state.error = null;
  cropAdapter.upsertMany(
    state,
    crops.map((crop) => getCrop(crop)),
  );
};

const cropAdapter = createEntityAdapter({
  selectId: (crop) => crop.crop_id,
});

const cropSlice = createSlice({
  name: 'cropReducer',
  initialState: cropAdapter.getInitialState({ loading: false, error: undefined, loaded: false }),
  reducers: {
    onLoadingCropStart: onLoadingStart,
    onLoadingCropFail: onLoadingFail,
    getCropsSuccess: addManyCrop,
    getAllCropsSuccess: (state, { payload: crops }) => {
      addManyCrop(state, { payload: crops });
      state.loaded = true;
    },
    postCropSuccess: addOneCrop,
    selectCropSuccess(state, { payload: crop_id }) {
      state.crop_id = crop_id;
    },
  },
});
export const {
  getCropsSuccess,
  postCropSuccess,
  onLoadingCropStart,
  onLoadingCropFail,
  getAllCropsSuccess,
} = cropSlice.actions;
export default cropSlice.reducer;

export const cropReducerSelector = (state) => state.entitiesReducer[cropSlice.name];

const cropSelectors = cropAdapter.getSelectors((state) => state.entitiesReducer[cropSlice.name]);

export const cropsSelector = createSelector(
  [cropSelectors.selectAll, loginSelector],
  (crops, { farm_id }) => {
    return crops.filter((crop) => crop.farm_id === farm_id || !crop.farm_id);
  },
);

export const cropSelector = (crop_id) => (state) => cropSelectors.selectById(state, crop_id);

export const cropStatusSelector = createSelector([cropReducerSelector], ({ loading, error }) => {
  return { loading, error };
});

export const cropEntitiesSelector = cropSelectors.selectEntities;

export const cropGroupAverages = createSelector([cropReducerSelector], ({ entities }) => {
  return Object.keys(entities)
    .map((k) => entities[k])
    .reduce((averagesObject, crop) => {
      const { crop_group } = crop;
      if (!!averagesObject[crop_group]) {
        return { ...averagesObject, [crop_group]: cropsAverage(crop, averagesObject[crop_group]) };
      } else {
        return {
          ...averagesObject,
          [crop_group]: { ...getAverageProperties(crop), numberInGroup: 1 },
        };
      }
    }, {});
});

function cropsAverage(crop, cropAverage) {
  const { numberInGroup } = cropAverage;
  const newAverage = averagesList.reduce((obj, k) => {
    return { ...obj, [k]: calculateRunningAverage(numberInGroup, cropAverage[k], crop[k]) };
  }, {});
  return { ...newAverage, numberInGroup: numberInGroup + 1 };
}

function calculateRunningAverage(n, average, newNumber) {
  return (average * n + newNumber) / (n + 1);
}

function getAverageProperties(crop) {
  return averagesList.reduce((obj, k) => ({ ...obj, [k]: crop[k] }), {});
}
