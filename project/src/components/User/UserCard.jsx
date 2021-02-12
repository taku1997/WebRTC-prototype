import React from 'react';
import './user.css';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { ParimaryButton } from '../UIkit';

const ProductCard = ({name,uid}) => {
  const dispatch = useDispatch();
  return(
    <div className="user-profile"> 

      <div className="user_child">
        <img src="https://source.unsplash.com/50x50" />
      </div>
      <div className="user_child">
        <span>{name}</span>
      </div>
      <div className="user_child"><ParimaryButton
        onClick={() => dispatch(push(`/trainee/${uid}`))}
        label={"テレビ電話"}
      />
        </div>
    </div>
  );
};

export default ProductCard;