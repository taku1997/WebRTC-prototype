const bcrypt = require('bcryptjs');
const Trainer = require('../models/trainer');
const Trainee = require('../models/trainee');

exports.postSignup = (req,res,next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  bcrypt.hash(password,12)
    .then(hashPw => {
      const trainer = new Trainer({
        username: username,
        email: email,
        password: hashPw
      });
      return trainer.save()
    })
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'create Trainer',
      });
    })
    .catch(err => console.log(err));
};


exports.postSignin = (req,res,next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  Trainer.findOne({email: email})
    .then(user => {
      console.log(user);
      if(!user){
        return false;
      }
      console.log(user.password);
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    }).then(isEqual => {
      if(!isEqual){
        //ログインエラー処理
        return false;
      }
      //JWTもあとで
      res.status(200).json({
        userId: loadedUser._id.toString(),
        username: loadedUser.username
      })
    })
    .catch(err => console.log(err));
};



//トレーナー側---------------------------------------------------------------------------



exports.traineeSignup = (req,res,next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  bcrypt.hash(password,12)
    .then(hashPw => {
      const trainee = new Trainee({
        username: username,
        email: email,
        password: hashPw
      });
      return trainee.save()
    })
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: 'create Trainer',
      });
    })
    .catch(err => console.log(err));
};


exports.traineeSignin = (req,res,next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  Trainee.findOne({email: email})
    .then(user => {
      console.log(user);
      if(!user){
        return false;
      }
      console.log(user.password);
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    }).then(isEqual => {
      if(!isEqual){
        return false;
      }
      res.status(200).json({
        userId: loadedUser._id.toString(),
        username: loadedUser.username
      })
    })
    .catch(err => console.log(err));
};