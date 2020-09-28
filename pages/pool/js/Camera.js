/**
 *  2019年10月11日
 *  执行translate scale 之后，再setTransform(1, 0, 0, 1, 0, 0)，真机绘制有BUG
 *  ctxHolder.context.translate(translateX, translateY);
 *  ctxHolder.context.scale(this.zoom, this.zoom);
 *  ctxHolder.context.setTransform(1, 0, 0, 1, 0, 0);
 *  解决方法，在初始矩阵下绘制完所有需要绘制的，再变换矩阵
 */


export class Camera {
	constructor(ctxHolder, x, y) {
		this.ctxHolder = ctxHolder;
		this.x = x;
		this.y = y;
		this.minZoom = 1.3;
		this.maxZoom = 1.8;
		this.zoom = this.minZoom;
	}

	// Reset transform matrix
	resetTransform() {
		this.ctxHolder.context.setTransform(1, 0, 0, 1, 0, 0);
	}

	// set world matrix
	setWorldTransfrom() {
		var translateX = this.ctxHolder.canvas.width / 2 - this.x * this.zoom;
		var translateY = this.ctxHolder.canvas.height / 2 - this.y * this.zoom;

		this.ctxHolder.context.translate(translateX, translateY);
		this.ctxHolder.context.scale(this.zoom, this.zoom);

		//	drawDebug();
	}

	update(scene) {
		var targetZoom = (this.maxZoom + (this.minZoom - this.maxZoom) * Math.min(scene.userTadpole.momentum, scene.userTadpole.maxMomentum) / scene.userTadpole.maxMomentum);
		this.zoom += (targetZoom - this.zoom) / 60;

		var delta = {
			x: (scene.userTadpole.pos.x - this.x) / 30,
			y: (scene.userTadpole.pos.y - this.y) / 30
		}

		if (Math.abs(delta.x) + Math.abs(delta.y) > 0.1) {
			this.x += delta.x;
			this.y += delta.y;

			for (var i = 0, len = scene.waterParticles.length; i < len; i++) {
				var wp = scene.waterParticles[i];
				wp.x -= (wp.z - 1) * delta.x;
				wp.y -= (wp.z - 1) * delta.y;
			}
		}
	};

	// Gets bounds of current zoom level of current position
	getBounds() {
		return [{
				x: this.x - this.ctxHolder.canvas.width / 2 / this.zoom,
				y: this.y - this.ctxHolder.canvas.height / 2 / this.zoom
			},
			{
				x: this.x + this.ctxHolder.canvas.width / 2 / this.zoom,
				y: this.y + this.ctxHolder.canvas.height / 2 / this.zoom
			}
		];
	}

	// Gets bounds of minimum zoom level of current position
	getOuterBounds() {
		return [{
				x: this.x - this.ctxHolder.canvas.width / 2 / this.minZoom,
				y: this.y - this.ctxHolder.canvas.height / 2 / this.minZoom
			},
			{
				x: this.x + this.ctxHolder.canvas.width / 2 / this.minZoom,
				y: this.y + this.ctxHolder.canvas.height / 2 / this.minZoom
			}
		];
	}

	// Gets bounds of maximum zoom level of current position
	getInnerBounds() {
		return [{
				x: this.x - this.ctxHolder.canvas.width / 2 / this.maxZoom,
				y: this.y - this.ctxHolder.canvas.height / 2 / this.maxZoom
			},
			{
				x: this.x + this.ctxHolder.canvas.width / 2 / this.maxZoom,
				y: this.y + this.ctxHolder.canvas.height / 2 / this.maxZoom
			}
		];
	}

	debugBounds(bounds, text) {
		this.ctxHolder.context.strokeStyle = '#fff';
		this.ctxHolder.context.beginPath();
		this.ctxHolder.context.moveTo(bounds[0].x, bounds[0].y);
		this.ctxHolder.context.lineTo(bounds[0].x, bounds[1].y);
		this.ctxHolder.context.lineTo(bounds[1].x, bounds[1].y);
		this.ctxHolder.context.lineTo(bounds[1].x, bounds[0].y);
		this.ctxHolder.context.closePath();
		this.ctxHolder.context.stroke();
		this.ctxHolder.context.fillText(text, bounds[0].x + 10, bounds[0].y + 10);
	}

	drawDebug() {
		this.debugBounds(this.getInnerBounds(), 'Maximum zoom camera bounds');
		this.debugBounds(this.getOuterBounds(), 'Minimum zoom camera bounds');
		this.debugBounds(this.getBounds(), 'Current zoom camera bounds');
	};
};