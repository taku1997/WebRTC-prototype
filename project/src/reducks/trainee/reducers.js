import initalState from '../store/initialState';

export const TraineesReducer = (state = initalState.people, action) => { 
  switch(action.type){
    case "FETCH_TRAINEE":
      return {
        ...state,
        traineeList: [...action.payload]
      };
    case "FETCH_TRAINER":
      return {
        ...state,
        trainerList: [...action.payload]
      };
    default:
      return state
  }
}