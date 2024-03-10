const io = require("socket.io")();
const userModel = require("./routes/users");
const groupModel = require("./routes/group");
const messageModel = require("./routes/message");
const socketapi = {
    io: io
};

// Add your socket.io logic here!
io.on("connection", function (socket) {
    console.log("A user connected");
    socket.on('join-server', async username => {
        const user = await userModel.findOneAndUpdate(
            { username },
            { socketId: socket.id }
        );


    })
    socket.on('send-private-message',async messageObject => {

        const msg = await messageModel.create(messageObject)
        const receiver = await userModel.findOne(
            { username: messageObject.receiver }
        );
        
        socket.to(receiver.socketId).emit('receive-private-message',messageObject)
    })


    // group chat channels

    socket.on('create-group', async object => {
        const user = await userModel.findOne({ username: object.username })
        const group = await groupModel.create({
            groupname: object.groupname,
            members: [user._id]
        })
        user.groups.push(group._id)
        await user.save()
    })
    socket.on('add-group', async object => {
        const user = await userModel.findOne({ username: object.username })
        const group = await groupModel.findOne({ groupname: object.groupname })
        user.groups.push(group._id)
        group.members.push(user._id)
        await user.save()
        await group.save()

    })
    socket.on('send-group-message', async messageObject => {
        const group = await groupModel.findOne({ groupname: messageObject.receiver })
        const msg = await messageModel.create(messageObject)
        socket.broadcast.to(group._id.toString()).emit('receive-group-message', messageObject)

    })
    socket.on('join-group', async groupname => {
        const group = await groupModel.findOne({ groupname })
        socket.join(group._id.toString())
        console.log("joined")
    })


});


// end of socket.io logic

module.exports = socketapi;