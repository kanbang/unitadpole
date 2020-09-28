import {
	WebSocketService
} from './WebSocketService.js'

import {
	Tadpole
} from './Tadpole.js'

import {
	Message
} from './Message.js'

import {
	Scene
} from './Scene.js'

import {
	keys
} from "./Keys.js"

import {
	Vector2
} from './Math2D.js'

import {
	TadpoleConfig
} from './TadpoleConfig.js'

import {
	Settings
} from './Settings.js';

export class TadpoleApp {
	constructor(canvas, context, vmlog) {

		this.config = new TadpoleConfig();

		//传递引用
		this.ctxHolder = {
			canvas: canvas,
			context: context
		}

		this.mouse = new Vector2();
		this.mouseWorld = new Vector2();
		this.messageQuota = 5;
		this.touching = false;
		this.ticksIdle = Date.now();
		this.keyNav = new Vector2();

		this.scene = new Scene(this.ctxHolder);
		this.scene.userTadpole.name = this.config.GetNameShow();
		this.scene.userTadpole.gender = this.config.GetGenderShow();

		this.websocket = new WebSocketService(new Settings().socketServer);




		uni.startAccelerometer();
		uni.onAccelerometerChange((res) => {
			if (!this.touching && Date.now() - this.ticksIdle > 5000) { //未触摸5s
				this.mouseWorld = this.scene.userTadpole.pos.add(new Vector2(-res.x * 100, res.y * 100));
				if (TadpoleConfig.accelerometerOn) {
					// console.log("accelerometerMove");
					this.scene.userTadpole.targetMomentum = this.scene.userTadpole.maxMomentum * (1 - Math.abs(res.z));
				}
			}
		});


		// wx.stopAccelerometer();

		this.websocket.on("welcome", (data) => {
			this.scene.initUserID(data.id);
			this.sendConfig();
			this.sendUpdate();
		});

		this.websocket.on("update", (data) => {
			this.onupdate(data);
		});

		this.websocket.on("message", (data) => {
			this.onmessage(data);
		});

		this.websocket.on("close", (data) => {
			this.onclose(data);
		});

		this.websocket.on("redirect", (data) => {
			if (data.url) {
				if (authWindow) {
					authWindow.document.location = data.url;
				} else {
					document.location = data.url;
				}
			}
		});

		this.vmLog = vmlog;
	}

	authorize(token, verifier) {
		var sendObj = {
			type: 'authorize',
			token: token,
			verifier: verifier
		};
		sendMessage(JSON.stringify(sendObj));
	};

	// 输入的消息，可能有指令
	parseSendMessage(msg) {
		//"name:jet"
		var regexp = /name: ?(.+)/i;
		if (regexp.test(msg)) {
			//暂时保留这个命令
			var name = msg.match(regexp)[1];
			this.setName(name);
			return;
		}

		//"gendr:1"
		var regexp = /gender: ?([0-9])/i;
		if (regexp.test(msg)) {
			//暂时保留这个命令
			var gender = Number(msg.match(regexp)[1]);
			if (gender < 0 || gender > 2) {
				gender = 0;
			}
			this.setGender(gender);
			return;
		}

		var sendObj = {
			type: 'message',
			message: msg,
			x: +this.scene.userTadpole.pos.x.toFixed(1),
			y: +this.scene.userTadpole.pos.y.toFixed(1)
		};

		// 提前..
		if (this.messageQuota > 0) {
			this.messageQuota--;
			this.sendMessage(JSON.stringify(sendObj));
		}
	};

	onmessage(data) {
		var tadpole = this.scene.tadpoles[data.id];
		if (!tadpole) {
			return;
		}

		tadpole.timeSinceLastServerUpdate = 0;
		tadpole.messages.push(new Message(data.message));

		// 消息日志
		if (this.vmLog) {
			this.vmLog.addLog({
				user: tadpole,
				message: {
					content: data.message,
					time: new Date(),
					x: parseInt(tadpole.pos.x),
					y: parseInt(tadpole.pos.y),
				},
				type: "message",
			});
		}
	}

	onupdate(data) {
		var newtp = false;
		if (!this.scene.tadpoles[data.id]) {
			newtp = true;
			this.scene.tadpoles[data.id] = new Tadpole();
		}

		var tadpole = this.scene.tadpoles[data.id];
		if (data.name) {
			tadpole.name = data.name;
		}
		if (data.gender) {
			tadpole.gender = data.gender;
		}
		if (tadpole.id == this.scene.userTadpole.id) {
			return;
		}

		if (newtp) {
			tadpole.pos.x = data.x;
			tadpole.pos.y = data.y;

			// 更新列表
			if (this.vmLog) {
				this.vmLog.updateUsers(this.scene.tadpoles);
				this.vmLog.addLog({
					type: "connect",
					user: tadpole,
				});
			}
		} else {
			tadpole.targetX = data.x;
			tadpole.targetY = data.y;
		}
		tadpole.terminal = data.terminal;
		tadpole.weiboID = data.weiboID;
		tadpole.angle = data.angle;
		tadpole.momentum = data.momentum;
		tadpole.timeSinceLastServerUpdate = 0;
	}

	onclose(data) {
		if (this.scene.tadpoles[data.id]) {

			if (this.vmLog) {
				this.vmLog.addLog({
					type: "disconnect",
					message: this.scene.tadpoles[data.id].name + "离开了池塘",
				});
			}

			delete this.scene.tadpoles[data.id];

			if (this.vmLog) {
				this.vmLog.updateUsers(this.scene.tadpoles);
			}
		}
	}

	setContex(ctx) {
		this.ctxHolder.context = ctx;
	}

	update() {
		if (this.messageQuota < 5 && this.scene.userTadpole.age % 50 == 0) {
			this.messageQuota++;
		}

		// Update usertadpole
		// wx
		// if (this.touching) {
		//   this.mouseWorld = this.getMouseWorldPosition();
		// }

		if (this.keyNav.x != 0 || this.keyNav.y != 0) {
			this.scene.userTadpole.userUpdate(this.scene.userTadpole.pos.x + this.keyNav.x, this.scene.userTadpole.pos.y + this
				.keyNav.y);
		} else {
			this.mouseWorld = this.getMouseWorldPosition();
			this.scene.userTadpole.userUpdate(this.mouseWorld.x, this.mouseWorld.y);
		}

		if (this.scene.userTadpole.age % 6 == 0 && this.scene.userTadpole.changed > 1 && this.websocket.hasConnection) {
			this.scene.userTadpole.changed = 0;
			this.sendUpdate();
		}

		// this.scene.userTadpole.name = this.config.GetNameShow();
		// this.scene.userTadpole.gender = this.config.GetGenderShow();

		this.scene.update(this.mouseWorld);
	};

	getName(name) {
		return this.scene.userTadpole.name;
	}

	getGender(gender) {
		return this.scene.userTadpole.gender;
	}

	setName(name) {
		this.config.setName(name);
		this.scene.userTadpole.name = name;
		this.sendConfig();
	}

	setGender(gender) {
		this.config.setGender(gender);
		this.scene.userTadpole.gender = gender;
		this.sendConfig();
	}

	draw() {
		this.scene.draw();
	}

	sendMessage(msg) {
		this.websocket.sendMessage(msg);
	}

	sendUpdate() {
		var sendObj = {
			type: 'update',
			x: +this.scene.userTadpole.pos.x.toFixed(1),
			y: +this.scene.userTadpole.pos.y.toFixed(1),
			angle: +this.scene.userTadpole.angle.toFixed(3),
			momentum: +this.scene.userTadpole.momentum.toFixed(3),
			name: this.scene.userTadpole.name,
			gender: this.scene.userTadpole.gender,
			terminal: this.scene.userTadpole.terminal,
			weiboID: this.scene.userTadpole.weiboID
		};

		this.sendMessage(JSON.stringify(sendObj));
	}

	// send config
	sendConfig() {
		var sendObj = {
			type: 'config',
			id: this.scene.userTadpole.id,
			name: this.scene.userTadpole.name,
			gender: this.scene.userTadpole.gender,
			terminal: this.scene.userTadpole.terminal,
			weiboID: this.scene.userTadpole.weiboID
		};

		this.sendMessage(JSON.stringify(sendObj));
	}

	mousedown(e) {
		// 键鼠输入，取消跟随
		this.freeTarget();

		this.mouse.clicking = true;

		if (this.mouse.tadpole && this.mouse.tadpole.hover && this.mouse.tadpole.onclick(e)) {
			return;
		}
		if (this.scene.userTadpole && e.which == 1) {
			this.scene.userTadpole.momentum = this.scene.userTadpole.targetMomentum = this.scene.userTadpole.maxMomentum;
		}
	};

	mouseup(e) {
		if (this.scene.userTadpole && e.which == 1) {
			this.scene.userTadpole.targetMomentum = 0;
		}
	}

	mousemove(e) {
		this.mouse.x = e.clientX;
		this.mouse.y = e.clientY;
	}

	keydown(e) {
		// 键鼠输入，取消跟随
		this.freeTarget();

		if (e.keyCode == keys.up) {
			this.keyNav.y = -1;
			this.scene.userTadpole.momentum = this.scene.userTadpole.targetMomentum = this.scene.userTadpole.maxMomentum;
			e.preventDefault();
		} else if (e.keyCode == keys.down) {
			this.keyNav.y = 1;
			this.scene.userTadpole.momentum = this.scene.userTadpole.targetMomentum = this.scene.userTadpole.maxMomentum;
			e.preventDefault();
		} else if (e.keyCode == keys.left) {
			this.keyNav.x = -1;
			this.scene.userTadpole.momentum = this.scene.userTadpole.targetMomentum = this.scene.userTadpole.maxMomentum;
			e.preventDefault();
		} else if (e.keyCode == keys.right) {
			this.keyNav.x = 1;
			this.scene.userTadpole.momentum = this.scene.userTadpole.targetMomentum = this.scene.userTadpole.maxMomentum;
			e.preventDefault();
		}
	}

	keyup(e) {
		if (e.keyCode == keys.up || e.keyCode == keys.down) {
			this.keyNav.y = 0;
			if (this.keyNav.x == 0 && this.keyNav.y == 0) {
				this.scene.userTadpole.targetMomentum = 0;
			}
			e.preventDefault();
		} else if (e.keyCode == keys.left || e.keyCode == keys.right) {
			this.keyNav.x = 0;
			if (this.keyNav.x == 0 && this.keyNav.y == 0) {
				this.scene.userTadpole.targetMomentum = 0;
			}
			e.preventDefault();
		}
	}

	touchstart(e) {
		this.touching = true;
		this.ticksIdle = Date.now();
		if (this.scene.userTadpole) {
			this.scene.userTadpole.momentum = this.scene.userTadpole.targetMomentum = this.scene.userTadpole.maxMomentum;
		}

		var touch = e.changedTouches[0];
		if (touch) {
			// canvas touch 没有 clientX clientY
			if (touch.clientX) {
				this.mouse.x = touch.clientX;
				this.mouse.y = touch.clientY;
			} else {
				this.mouse.x = touch.x;
				this.mouse.y = touch.y;
			}

			this.mouseWorld = this.getMouseWorldPosition();
			// console.log("touch start:" + JSON.stringify(mouse));
		}
	}

	touchend(e) {
		this.touching = false;
		this.ticksIdle = Date.now();
		if (this.scene.userTadpole) {
			this.scene.userTadpole.targetMomentum = 0;
		}
	}

	touchmove(e) {
		this.ticksIdle = Date.now();
		var touch = e.changedTouches[0];
		if (touch) {
			if (touch.clientX) {
				this.mouse.x = touch.clientX;
				this.mouse.y = touch.clientY;
			} else {
				this.mouse.x = touch.x;
				this.mouse.y = touch.y;
			}
		}
	}

	resize(wid, hei) {
		this.ctxHolder.canvas.width = wid;
		this.ctxHolder.canvas.height = hei;
	}

	setTarget(x, y) {
		this.scene.userTadpole.setTarget(x, y);
	}

	freeTarget() {
		this.scene.userTadpole.freeTarget();
	}

	getMouseWorldPosition() {
		return new Vector2((this.mouse.x + (this.scene.camera.x * this.scene.camera.zoom - this.ctxHolder.canvas.width / 2)) /
			this.scene.camera.zoom,
			(this.mouse.y + (this.scene.camera.y * this.scene.camera.zoom - this.ctxHolder.canvas.height / 2)) / this.scene.camera
			.zoom);
	}

}
