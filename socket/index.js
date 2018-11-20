const authorization = require("./authorization");

const { connection, login, disconnect, operation } = require("./event");
const IO = require("./single/io");

module.exports = http => {
  IO.initIO(http);

  // IO.io.set('authorization', authorization);
  IO.io.on("connection", function(socket) {
    console.log("a user connected");

    //监听新用户加入
    connection(socket)();
    //监听用户登录
    socket.on("login", login(socket));
    socket.on("danmaku", comment => {
      console.log("danmaku", comment);
      socket.emit("danmaku", comment);
    });
    //监听用户退出
    socket.on("disconnect", disconnect(socket));
    //监听用户发出操作
    socket.on("operation", operation(socket));
  });
};
