const mongoose = require('mongoose');
const plm = require('passport-local-mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/whatsappclone')

const userSchema = mongoose.Schema({
  username: String,
  password: String,
  email:String,
  socketId:String,
  profileImg:{
    type:String,
    default:'def.jpg'
  },
  friends:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:'user'
    }
  ],
  groups:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:'group'
    }
  ]
})
userSchema.plugin(plm)

module.exports = mongoose.model('user',userSchema)
