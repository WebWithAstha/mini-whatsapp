const mongoose = require('mongoose');


const messageSchema = mongoose.Schema({
  sender: String,
  receiver: String,
  message:String,
  
})

module.exports = mongoose.model('message',messageSchema)
