import { signInAction } from './actions';
import { push } from 'connected-react-router';
import axios from 'axios';
const ENDPOINT = 'http://localhost:8080';

//SIGNIN処理ーーーーーーーーーーーーーーーーーーー
//role情報をSIGNINから取得
//Pathの処理
export const signIn = (email,password,role) => {
  return async (dispatch) => { 
    let Path;
    if(email === "" || password === ""){
      alert("必須項目が未入力です");
      return false
    }
    if (role === "トレーナー"){
      Path = 'trainer';
    } else{
      Path = 'trainee';
    } 
     await axios.post(ENDPOINT + `/auth/${Path}/signin`,{
        email: email,
        password: password
      }).then(result => {
        dispatch(signInAction({
          isSignedIn: true,
          username: result.data.username,
          uid: result.data.userId
        }));
        dispatch(push('/' + Path));
      })
      .catch(err => console.log(err));
  }
}

//SIGNUP処理ーーーーーーーーーーーーーーーーーーーーーーー
export const signUp = (username,email,password,confirmPassword,role) => {
  return async (dispatch, getState) => {
    let Path;
    if(username === "" || email === "" || password === ""){
      alert("必須項目が未入力です")
      return false
    } 
    if(password !== confirmPassword) {
      return alert("パスワードが一致しません")
    }
    if (role === "トレーナー"){
      Path = 'trainer';
    } else{
      Path = 'trainee';
    }
    await axios.post(ENDPOINT + `/auth/${Path}/signup`,{
      username: username,
      email: email,
      password: password
    })
    .then(() => {
      dispatch(push('/signin'));
    });
  }
}