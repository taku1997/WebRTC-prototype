import * as Actions from './actions';

export const FETCH_TRAINEE = "FETCH_TRAINEE";
export const fetchTraineesAction = (trainee) => {
  return {
    type: Actions.FETCH_TRAINEE,
    payload: trainee
  }
};

export const FETCH_TRAINER = "FETCH_TRAINER";
export const fetchTrainersAction = (trainer) => {
  return {
    type: Actions.FETCH_TRAINER,
    payload: trainer
  }
};

// export const FETCH_USER = "FETCH_USER";
// export const fetchUserAction = (user) => { 
//   return {
//     type: Actions.FETCH_USER,
//     payload: user
//   }
// }