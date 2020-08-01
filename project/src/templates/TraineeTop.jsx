import React,{ useEffect } from 'react';
import {useDispatch,useSelector} from 'react-redux';
import {　ParimaryButton } from '../components/UIkit';
import { getUserId, getUserName } from '../reducks/users/selectors';
import { push } from 'connected-react-router';
import '../assets/style.css';

const TraineeTop = () => {
  const dispatch = useDispatch();
  const selector = useSelector((state) => state);
  const uid = getUserId(selector);
  const username = getUserName(selector);


  return (
    <section>
      <div className="inner">
        <h1>Profile</h1>
        <h1>{uid}</h1>
        <h1>{username}</h1>
        <ParimaryButton 
          onClick={() => dispatch(push(`/trainee/${uid}`))}
          label={"ログイン"}
        />
      </div>
    </section>
  )
};

export default TraineeTop;