import {
  Tadpole
} from './Tadpole.js'

import {
  Arrow
} from './Arrow.js'

import {
  Message
} from './Message.js'

import {
  Vector2
} from './Math2D.js'

export function WebSocketService(scene) {
  var webSocketService = this;
  var socketio = null;
  this.hasConnection = false;

  this.welcomeHandler = function(data) {
    webSocketService.hasConnection = true;
    scene.initUserID(data.id);

    this.sendConfig();
  };

  this.updateHandler = function(data) {
    var newtp = false;

    if (!scene.tadpoles[data.id]) {
      newtp = true;
      scene.tadpoles[data.id] = new Tadpole();
    }

    var tadpole = scene.tadpoles[data.id];
    if (data.name) {
      tadpole.name = data.name;
    }

    if (data.gender) {
      tadpole.gender = data.gender;
    }

    if (tadpole.id == scene.userTadpole.id) {
      return;
    }

    var pos = new Vector2(data.x, data.y);
    if (newtp) {
      tadpole.pos = pos;
    } else {
      tadpole.target = pos;
    }

    tadpole.terminal = data.terminal;
    tadpole.angle = data.angle;
    tadpole.momentum = data.momentum;

    tadpole.timeSinceLastServerUpdate = 0;
  }

  this.messageHandler = function(data) {
    var tadpole = scene.tadpoles[data.id];
    if (!tadpole) {
      return;
    }
    tadpole.timeSinceLastServerUpdate = 0;
    tadpole.messages.push(new Message(data.message));
  }

  this.closedHandler = function(data) {
    if (scene.tadpoles[data.id]) {
      delete scene.tadpoles[data.id];
      delete scene.arrows[data.id];
    }
  }

  this.redirectHandler = function(data) {
    if (data.url) {
      if (authWindow) {
        authWindow.document.location = data.url;
      } else {
        document.location = data.url;
      }
    }
  }

  this.processMessage = function(data) {
    var fn = webSocketService[data.type + 'Handler'];
    if (fn) {
      fn(data);
    }
  }

  this.connectionClosed = function() {
    webSocketService.hasConnection = false;
  };

  // send update
  this.sendUpdate = function(tadpole) {
    var sendObj = {
      type: 'update',
      x: tadpole.pos.x.toFixed(1),
      y: tadpole.pos.y.toFixed(1),
      angle: tadpole.angle.toFixed(3),
      momentum: tadpole.momentum.toFixed(3),
      ////////////////////////////////////
      //可优化，不必传输
      name: tadpole.name,
      gender: tadpole.gender,
      terminal: tadpole.terminal
      ////////////////////////////////////
    };

    socketSendMessage(JSON.stringify(sendObj));
  }

  // send config
  this.sendConfig = function() {

    var sendObj = {
      type: 'config',
      id: scene.userTadpole.id,
      name: scene.userTadpole.name,
      gender: scene.userTadpole.gender,
      terminal: scene.userTadpole.terminal
    };

    socketSendMessage(JSON.stringify(sendObj));
  }

  // send message
  this.sendMessage = function(msg) {
    var regexp = /name: ?(.+)/i;
    if (regexp.test(msg)) {
      scene.userTadpole.name = msg.match(regexp)[1];
      this.sendConfig();
      return;
    }

    var regexp = /gender: ?([0-9])/i;
    if (regexp.test(msg)) {
      var ii = msg.match(regexp);
      var gender = Number(msg.match(regexp)[1]);
      if (gender < 0 || gender > 2) {
        gender = 0;
      }
      scene.userTadpole.gender = gender;
      this.sendConfig();
      return;
    }


    var sendObj = {
      type: 'message',
      message: msg
    };

    socketSendMessage(JSON.stringify(sendObj));
  }

  this.authorize = function(token, verifier) {
    var sendObj = {
      type: 'authorize',
      token: token,
      verifier: verifier
    };

    socketSendMessage(JSON.stringify(sendObj));
  }


  /**
   * 启动socket
   */
  var socketStart = function() {
    //    var url = 'wss://127.0.0.1:8999';
    var url = 'wss://www.usdraw.com';

    socketio = wx.connectSocket({
      url: url,
      method: "GET"
    });
    socketio.onOpen(res => {
      console.log('SOCKET连接成功 → \n\n');

      // var uri = parseUri(document.location)
      // if (uri.queryKey.oauth_token) {
      //   webSocketService.authorize(uri.queryKey.oauth_token, uri.queryKey.oauth_verifier);
      // }
    });
    socketio.onError(res => {
      console.info('SOCKET连接失败');
      console.error(res);
    });
    socketio.onMessage(res => {
      var data = res.data;
      webSocketService.socketReceiveMessage(data)
      // console.info(data);
    });
    socketio.onClose(() => {
      console.log('SOCKET连接断开 → \n\n');
      webSocketService.connectionClosed();
    });
  }


  /**
   * 断开socket
   */
  var socketStop = function() {
    if (socketio) {
      socketio.close();
      socketio = null;
    }
  }

  /**
   * 发送消息
   */
  var socketSendMessage = function(sendStr) {
    if (socketio) {
      // console.log('向服务器发送数据 → ' + sendStr + '\n\n');
      if (socketio.readyState == socketio.OPEN) {
        socketio.send({
          data: sendStr,
          success: () => {
            // console.info('客户端发送成功');
          }
        });
      } else {
        console.error('连接已经关闭');
      }
    }
  }

  /**
   * 接收消息
   */
  this.socketReceiveMessage = function(receivedStr) {
    // console.log('服务器返回数据 → ' + receivedStr + '\n\n');
    try {
      var data = JSON.parse(receivedStr);
      webSocketService.processMessage(data);
    } catch (e) {}
  };

  (function() {
    socketStart();
  })();
}