import React,{ useEffect } from 'react';
import {useDispatch,useSelector} from 'react-redux';
import { getUserId, getUserName } from '../reducks/users/selectors';
import { getTrainer } from '../reducks/trainee/selectors';
import { UserCard } from '../components/User';
import { fetchTrainer } from '../reducks/trainee/operations';
import '../assets/style.css';

const TraineeTop = () => {
  //Selectorの設定
  const dispatch = useDispatch();
  const selector = useSelector((state) => state);

  //取得するデータの設定
  const uid = getUserId(selector);
  const username = getUserName(selector);
  const trainers = getTrainer(selector);

  //アクセス時にTrainerのユーザデータ取得
  useEffect(() => {
    dispatch(fetchTrainer());
  },[]);


  return (
    <section>
      <div className="inner">
        <h1>Profile</h1>
        <h1>{uid}</h1>
        <h1>{username}</h1>
        <h2>トレーナー部屋</h2>
        {trainers.length > 0 && (
          trainers.map(trainer => (
            <UserCard key={trainer._id} name={trainer.username} uid={trainer._id}/>
          ))
        )}
        {/* <ParimaryButton 
          onClick={() => dispatch(push(`/trainee/head/${uid}`))}
          label={"Webカメラ(表情)"}
        />
        <ParimaryButton 
          onClick={() => dispatch(push(`/trainee/body/${uid}`))}
          label={"Webカメラ(姿勢)"}
        /> */}
      </div>
    </section>
  )
};

export default TraineeTop;