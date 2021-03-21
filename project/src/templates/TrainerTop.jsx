import React,{ useEffect } from 'react';
import {useDispatch,useSelector} from 'react-redux';

import { getUserId, getUserName } from '../reducks/users/selectors';
import {　ParimaryButton } from '../components/UIkit';
import { getTrainee } from '../reducks/trainee/selectors';
import { push } from 'connected-react-router';
import '../assets/style.css';

const TrainerTop = () => {
  const dispatch = useDispatch();
  const selector = useSelector((state) => state);
  const uid = getUserId(selector);
  const username = getUserName(selector);


  return (
    <section>
      <h1>{uid}</h1>
      <h1>{username}</h1>
      <div className="inner">
      <ParimaryButton 
          onClick={() => dispatch(push(`/trainer/${uid}`))}
          label={"トレーナー"}
      />
      </div>
    </section>
  )
};

export default TrainerTop;

