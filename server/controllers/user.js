
const Trainee = require('../models/trainee');

exports.getTrainee = (req,res,next) => {
  //Traineeに変更する
  Trainee.find()
    .then(posts => {
      res.status(201).json({
        message: 'create Trainer',
        posts: posts
      });
    })
    .catch(err => console.log(err));
}