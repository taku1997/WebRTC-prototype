
const Trainee = require('../models/trainee');
const Trainer = require('../models/trainer');

exports.getTrainee = (req,res,next) => {
  //Traineeに変更する
  Trainee.find()
    .then(posts => {
      res.status(201).json({
        message: 'get Trainee',
        posts: posts
      });
    })
    .catch(err => console.log(err));
}

exports.getTrainer = (req,res,next) => {
  Trainer.find()
    .then(posts => {
      res.status(201).json({
        message: 'get Trainer',
        posts: posts
      });
    })
    .catch(err => console.log(err));
}