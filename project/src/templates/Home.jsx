import React,{ useEffect } from 'react';
import { getUserId, getUserName } from '../reducks/users/selectors';
import { useSelector } from 'react-redux';
import openSocket from 'socket.io-client';

const Home = () => {
  return (
    <div>
      <h2>Home</h2>
    </div>
  );
};

export default Home;