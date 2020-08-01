import React from 'react';
import { getUserId, getUserName } from '../reducks/users/selectors';
import { useSelector } from 'react-redux';
import openSocket from 'socket.io-client';

const Home = () => {
  const selector = useSelector(state => state);
  const uid = getUserId(selector);
  const username = getUserName(selector);
  openSocket('http://localhost:8080');

  return (
    <div>
      <h2>Home</h2>
      <p>{uid}</p>
      <p>{username}</p>
    </div>
  );
};

export default Home;