import {createSelector} from 'reselect';

const peopleSelector = (state) => state.people;

export const getTrainee = createSelector(
  [peopleSelector],
  state => state.traineeList
);

export const getTrainer = createSelector(
  [peopleSelector],
  state => state.trainerList
);