import React from 'react';
import '../../assets/style.css';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { ParimaryButton } from '../UIkit';

const ProductCard = ({name,uid}) => {
  const dispatch = useDispatch();
  return(
    <div className="user-profile"> 
      <span>{name}</span>
      <ParimaryButton
        onClick={() => dispatch(push(`/trainer/${uid}`))}
        label={"テレビ電話"}
      />
    </div>
  );
};

export default ProductCard;