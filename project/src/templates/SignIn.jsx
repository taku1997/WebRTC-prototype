import React, { useState, useCallback} from 'react';
import { TextInput, ParimaryButton, RadioInput} from '../components/UIkit';
import { useDispatch } from 'react-redux';
import { signIn } from '../reducks/users/operations';
import '../assets/style.css'; 

const SignIn = () => {
  const dispatch = useDispatch();
  const [email,setEmail] = useState(""),
        [password,setPassword] = useState(""),
        [role, setRole] = useState("");

  const inputEmail = useCallback(event => {
    setEmail(event.target.value);
  },[setEmail]);

  const inputPassword = useCallback(event => {
    setPassword(event.target.value);
  },[setPassword]);

  const handleChange = (event) => {
    setRole(event.target.value);
  };


  return (
    <div className="login-form">
      <h2>アカウント登録</h2>
      <TextInput 
        fullWidth={true} label={"メールアドレス"} multiline={false} required={true} 
        rows={1} value={email} type={"email"} onChange={inputEmail}
      />
      <TextInput 
        fullWidth={true} label={"パスワード"} multiline={false} required={true} 
        rows={1} value={password} type={"password"} onChange={inputPassword}
      />
      <RadioInput 
        value={role} onChange={handleChange}
      />
      <ParimaryButton 
        onClick={() => dispatch(signIn(email,password,role))}
        label={"ログイン"}
      />
    </div>
  )
};


export default SignIn;