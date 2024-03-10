const mongoose = require('mongoose');


const groupSchema = mongoose.Schema({
  groupname:String,
  profileImg:{
    type:String,
    default:'group.jpg'
  },
  members:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:'user'
    }
  ]
})

module.exports = mongoose.model('group',groupSchema)
