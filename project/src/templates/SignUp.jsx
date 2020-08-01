import React, { useState, useCallback} from 'react';
import { TextInput, ParimaryButton, RadioInput } from '../components/UIkit';
import { useDispatch } from 'react-redux';
import { signUp } from '../reducks/users/operations';
import '../assets/style.css'; 

const SignUp = () => {
  const dispatch = useDispatch();
  const [username,setUsername] = useState(""),
        [email,setEmail] = useState(""),
        [password,setPassword] = useState(""),
        [confirmPassword,setConfirmPassword] = useState(""),
        [role, setRole] = useState("");

  const inputUsername = useCallback(event => {
    setUsername(event.target.value);
  },[setUsername]);

  const inputEmail = useCallback(event => {
    setEmail(event.target.value);
  },[setEmail]);

  const inputPassword = useCallback(event => {
    setPassword(event.target.value);
  },[setPassword]);

  const inputConfirmPassword = useCallback(event => {
    setConfirmPassword(event.target.value);
  },[setConfirmPassword]);

  const handleChange = (event) => {
    setRole(event.target.value);
  };


  return (
    <div className="login-form">
      <h2>アカウント登録</h2>
      <TextInput 
        fullWidth={true} label={"ユーザ名"} multiline={false} required={true} 
        rows={1} value={username} type={"text"} onChange={inputUsername}
      /> 
      <TextInput 
        fullWidth={true} label={"メールアドレス"} multiline={false} required={true} 
        rows={1} value={email} type={"email"} onChange={inputEmail}
      />
      <TextInput 
        fullWidth={true} label={"パスワード"} multiline={false} required={true} 
        rows={1} value={password} type={"password"} onChange={inputPassword}
      />
      <TextInput 
        fullWidth={true} label={"確認用パスワード"} multiline={false} required={true} 
        rows={1} value={confirmPassword} type={"password"} onChange={inputConfirmPassword}
      />
      <RadioInput 
        value= {role} onChange={handleChange}
      />
      <ParimaryButton 
        onClick={() => dispatch(signUp(username,email,password,confirmPassword,role))}
        label={ "登録"}
      />
    </div>
  )
};


export default SignUp