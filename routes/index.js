var express = require('express');
var router = express.Router();
const userModel = require('./users')
const groupModel = require('./group')
const messageModel = require('./message')

const localStrategy = require('passport-local');
const passport = require('passport');
passport.use(new localStrategy(userModel.authenticate()))

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/register', function(req, res, next) {
  const userData = new userModel({
    username:req.body.username,
    email:req.body.email
  })
  userModel.register(userData,req.body.password)
  .then(function(registeredUser){
    passport.authenticate('local')(req,res,function(){
      res.redirect('/home')
    });
  })
})

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Express' });
});

router.post('/login',passport.authenticate('local',{
  failureRedirect:'/login',
  successRedirect:'/home'
}), function(req,res,next){})

router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

router.get('/home',isLoggedIn, async function(req, res, next) {
  const loggedUser = await userModel.findOne({username:req.session.passport.user}).populate('friends')
  res.render('home', { loggedUser });
});
router.get('/searchusers/:user',isLoggedIn, async function(req, res, next) {
  const users = await userModel.find({
    username: {
      $regex: req.params.user,
      $options: 'i'
    }
  })
  res.status(200).json(users)
})
router.get('/searchgroups/:group',isLoggedIn, async function(req, res, next) {
  const loggedUser = await userModel.findOne({username:req.session.passport.user})
  const existingGroupIds = loggedUser.groups.map(group => group._id);
    const groups = await groupModel.find({
      groupname: {
        $regex: req.params.group,
        $options: 'i'
      },
      _id: { $nin: existingGroupIds }
    });
  res.status(200).json(groups)
})
router.post('/addfriend',isLoggedIn, async function(req, res, next) {
  const loggedUser = await userModel.findOne({username:req.session.passport.user})
  const friendUser = await userModel.findOne({_id:req.body.data})
  if(loggedUser._id.equals(friendUser._id)){
    loggedUser.friends.push(req.body.data)
    loggedUser.save()
  }else{
    if(loggedUser.friends.indexOf(friendUser._id)===-1){
      loggedUser.friends.push(friendUser._id)
      friendUser.friends.push(loggedUser._id)
      loggedUser.save()
      friendUser.save()
    }
  }
    res.status(200).json("Now friends.")

})
router.post('/allchats', isLoggedIn, async function (req, res, next) {
  const loggedUser = await userModel.findOne({ username: req.session.passport.user })
  if (req.body.chatType === 'group') {
    const allChats = await messageModel.find({
      receiver: req.body.receiver,
    })
    res.status(200).json(allChats)
  } else {
    const allChats = await messageModel.find({
      $or: [
        {
          sender: loggedUser.username,
          receiver: req.body.receiver
        },
        {
          receiver: loggedUser.username,
          sender: req.body.receiver
        },
      ]
    })
    res.status(200).json(allChats)
  }
})
router.post('/alljoined/:type',isLoggedIn,async function(req, res, next) {
  const loggedUser = await userModel.findOne({username:req.session.passport.user}).populate(`${req.params.type}`)
  if(req.params.type === 'groups'){
    res.status(200).json(loggedUser.groups)
  }else{
    res.status(200).json(loggedUser.friends)
  }
})
router.get('/allgroups', async function (req, res, next) {
  const loggedUser = await userModel.findOne({username:req.session.passport.user}).populate(req.params.type)
  const existingGroupIds = loggedUser.groups.map(group => group._id);
  const groups = await groupModel.find({ _id: { $nin: existingGroupIds } });
  
  res.status(200).json(groups)
})



function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')  
}



module.exports = router;
