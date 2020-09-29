import React from 'react';
import {Route, Switch} from 'react-router';
import {Home,SignUp,SignIn,TraineeTop,TrainerTop, WebRTC_Trainer, WebRTC_Trainee,WebRTC_Trainee_head} from './templates';




const Router = () => {
  return (
    <Switch>
      <Route exact path={"/signin"} component={SignIn}/>
      <Route exact path={"/signup"} component={SignUp}/>
      <Route exact path={"/trainer"} component={TrainerTop}/>
      <Route exact path={"/trainee"} component={TraineeTop}/>
      {/* 通信部分 */}
      <Route exact path={"/trainer/:id"} component={WebRTC_Trainer}/>
      <Route exact path={"/trainee/head/:id"} component={WebRTC_Trainee_head}/>
      <Route exact path={"/trainee/body/:id"} component={WebRTC_Trainee}/>
      {/* <Route exact path={"(/)?"} component={Home}/> */}
      <Route exact path={"(/)?"} component={Home}/>
    </Switch>
  );
};

export default Router;