import axios from 'axios';
import {fetchTraineesAction,fetchTrainersAction} from './actions';
const ENDPOINT = 'http://localhost:8080';

export const fetchTrainee = () => {
  return async(dispatch) => {
    try{
      const trainee = await axios.get(ENDPOINT + '/user/getTrainee'); 
      const TraineeList = [];
      const user = trainee.data.posts;
      user.forEach(user => { TraineeList.push(user); });  
      dispatch(fetchTraineesAction(TraineeList));
    } catch(err) {
      console.log(err);
    }
  }
}

export const fetchTrainer = () => {
  return async(dispatch) => { 
    try {
      const trainer = await axios.get(ENDPOINT + '/user/getTrainer') 
      const TrainerList = [];
      const user = trainer.data.posts;
      user.forEach(user => {TrainerList.push(user);});
      dispatch(fetchTrainersAction(TrainerList));
    }catch(err) {
      console.log(err);
    }
  }
}

// export const activeTrainee = () => {
//   return async(dispatch) => {
//     const trainee = await 
//   }
// }

// export const fetchUser = () => {
//   return async(dispatch) => {
//     try{
//       const data = await axios.get(ENDPOINT + '/user/getUser')
//       const user = data.data.posts;
//       dispatch(fetchUserAction(user));
//     }catch(err){
//       console.log(err);
//     }
//   }
// }
