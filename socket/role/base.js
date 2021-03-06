const onlineUser = require("../single/onlineUser");
const IO = require("../single/io");

class Base {
  constructor(params) {
    this.init(params);
  }

  init(params) {
    this.socketId = params.id;
    this.id = params.id;
    this.userId = params.userId;
    this.roomId = params.roomId;
    this.userName = params.userName;
    this.role = params.role;
  }

  // 常用的辅助实例方法
  getInfo() {
    const { userId, roomId, userName, role } = this;
    return {
      userId,
      roomId,
      userName,
      role
    };
  }

  getIO() {
    return IO.io;
  }

  forEachUserInRoom(func) {
    const roomId = this.roomId;
    onlineUser.getRoomUser(roomId).forEach(func);
  }

  forEachOtherInRoom(func) {
    const roomId = this.roomId;
    onlineUser
      .getRoomUser(roomId)
      .filter(u => u.id !== this.id)
      .forEach(func);
  }

  emit(...params) {
    return this.getIO()
      .to(this.socketId)
      .emit(...params);
  }

  // 通用的事件响应
  login() {
    //向所有房间内用户广播加入
    this.forEachUserInRoom(user =>
      user.emit("login", {
        onlineUser: onlineUser.getList(),
        user: this.getInfo()
      })
    );

    const roomId = this.roomId;

    const history = onlineUser.getRoomHistory(roomId);
    history && this.emit("operation", history);

    console.log(
      "作为" + this.role + "的" + this.userName + "加入了聊天室" + this.roomId,
      "同步了历史数据",
      history && history.actionPayload && history.actionPayload.length
    );
  }

  // 通用的事件响应
  broadcast(ctx) {
    //向所有房间内用户广播
    this.forEachUserInRoom(user => user.emit("broadcast", ctx));
    console.log(this.roomId + "房间的" + this.userName + "广播了", ctx);
  }

  disconnect() {
    const id = this.id;
    if (onlineUser.has(id)) {
      //将退出的用户从在线列表中删除
      onlineUser.del(id);
      //向房间中用户广播用户退出
      this.forEachUserInRoom(user =>
        user.emit("logout", {
          onlineUser: onlineUser.getList(),
          user: this.getInfo()
        })
      );
      console.log(this.userName + "退出了聊天室" + this.roomId);
    }
  }
}

module.exports = Base;
