import {
	EventHelper
} from "./EventHelper.js"

export class WebSocketService extends EventHelper {
	constructor(url) {
		super();
		this.socketio = null;
		this.hasConnection = false;

		this.socketStart(url);
	}

	onSocketOpen() {
		this.fire("open");
	}

	onConnectionClosed() {
		this.hasConnection = false;
		this.fire("disconnection");
	}

	welcomeHandler(data) {
		this.hasConnection = true;
		this.fire("welcome", data);
	}

	updateHandler(data) {
		this.fire("update", data);
	};

	messageHandler(data) {
		this.fire("message", data);
	};

	closedHandler(data) {
		this.fire("close", data);
	};

	redirectHandler(data) {
		this.fire("redirect", data);
	}


	/**
	 * 启动socket
	 */
	socketStart(url) {
		var socketOpen = false;
		var socketMsgQueue = [];

		uni.connectSocket({
			url: url
		});

		uni.onSocketOpen((res) => {
			console.log('WebSocket连接已打开！');
		});

		uni.onSocketError((res) => {
			console.log('WebSocket连接打开失败，请检查！');
		});

		uni.onSocketMessage((res) => {
			console.log('收到服务器内容：' + res.data);
			var data = res.data;
			this.onMessage(data)
		});








		// this.socketio = new WebSocket(url);
		// this.socketio.onopen = () => {
		//     this.onSocketOpen();
		// };

		// this.socketio.onclose = () => {
		//     this.onConnectionClosed();
		// };

		// this.socketio.onmessage = (res) => {
		//     var data = res.data;
		//     this.onMessage(data)
		// };
	}


	/**
	 * 启动socket
	 */
	socketStartWx(url) {
		//    var url = 'wss://127.0.0.1:8999';
		// var url = 'wss://www.usdraw.com';

		this.socketio = wx.connectSocket({
			url: url,
			method: "GET"
		});
		this.socketio.onOpen(res => {
			console.log('SOCKET连接成功 → \n\n');

			// var uri = parseUri(document.location)
			// if (uri.queryKey.oauth_token) {
			//   this.authorize(uri.queryKey.oauth_token, uri.queryKey.oauth_verifier);
			// }
		});
		this.socketio.onError(res => {
			console.info('SOCKET连接失败');
			console.error(res);
		});
		this.socketio.onMessage(res => {
			var data = res.data;
			this.onMessage(data)
			// console.info(data);
		});
		this.socketio.onClose(() => {
			console.log('SOCKET连接断开 → \n\n');
			this.onConnectionClosed();
		});
	}

	/**
	 * 断开socket
	 */
	socketStop() {
		if (socketio) {
			socketio.close();
			socketio = null;
		}
	}

	/**
	 * 发送消息
	 */
	sendMessage(sendStr) {
		// if (this.socketio) {
		// 	// console.log('向服务器发送数据 → ' + sendStr + '\n\n');
		// 	this.socketio.send(sendStr);
		// } else {
		// 	console.error('连接已经关闭');
		// }

		uni.sendSocketMessage({
			data: sendStr
		});

		// if (socketOpen) {
		// 	uni.sendSocketMessage({
		// 		data: msg
		// 	});
		// } else {
		// 	socketMsgQueue.push(msg);
		// }
	}

	/**
	 * 接收消息
	 */
	onMessage(receivedStr) {
		// console.log('服务器返回数据 → ' + receivedStr + '\n\n');
		try {
			var data = JSON.parse(receivedStr);

			if (this[data.type + 'Handler']) {
				this[data.type + 'Handler'](data);
			}

		} catch (e) {
			console.error(e);
		}
	}
}
