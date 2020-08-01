import React,{ useEffect } from 'react';
import {useDispatch,useSelector} from 'react-redux';
import { UserCard } from '../components/User';
import {fetchTrainee} from '../reducks/trainee/operations';
import { getTrainee } from '../reducks/trainee/selectors';
import '../assets/style.css';

const TrainerTop = () => {
  const dispatch = useDispatch();
  const selector = useSelector((state) => state);
  const trainees = getTrainee(selector);

  useEffect(() => {
    dispatch(fetchTrainee());
  },[]);

  return (
    <section>
      <div className="inner">
        {trainees.length > 0 && (
          trainees.map(trainee => (
            <UserCard key={trainee._id} name={trainee.username} uid={trainee._id}/>
          ))
        )}
      </div>
    </section>
  )
};

export default TrainerTop;

