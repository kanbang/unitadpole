/*
 * @Descripttion: 
 * @version: 0.x
 * @Author: zhai
 * @Date: 2019-08-05 12:33:17
 * @LastEditors: zhai
 * @LastEditTime: 2020-09-11 11:32:13
 */
import {
	Vector2
} from './Math2D.js'

export class TadpoleTail {
	constructor(tadpole) {

		this.tadpole = tadpole;
		this.jointSpacing = 1.4;
		this.animationRate = 0;
		this.joints = [];

		for (var i = 0; i < 15; i++) {
			this.joints.push({
				pos: Vector2.Zero(),
				angle: Math.PI * 2,
			})
		}
	}

	update() {
		this.animationRate += (.2 + this.tadpole.momentum / 10);

		for (var i = 0, len = this.joints.length; i < len; i++) {
			var tailJoint = this.joints[i];
			var parentJoint = this.joints[i - 1] || this.tadpole;
			var anglediff = (parentJoint.angle - tailJoint.angle);

			while (anglediff < -Math.PI) {
				anglediff += Math.PI * 2;
			}
			while (anglediff > Math.PI) {
				anglediff -= Math.PI * 2;
			}

			tailJoint.angle += anglediff * (this.jointSpacing * 3 + (Math.min(this.tadpole.momentum / 2, Math.PI * 1.8))) / 8;
			tailJoint.angle += Math.cos(this.animationRate - (i / 3)) * ((this.tadpole.momentum + .3) / 40);

			if (i == 0) {
				tailJoint.pos.x = parentJoint.pos.x + Math.cos(tailJoint.angle + Math.PI) * 5;
				tailJoint.pos.y = parentJoint.pos.y + Math.sin(tailJoint.angle + Math.PI) * 5;
			} else {
				tailJoint.pos.x = parentJoint.pos.x + Math.cos(tailJoint.angle + Math.PI) * this.jointSpacing;
				tailJoint.pos.y = parentJoint.pos.y + Math.sin(tailJoint.angle + Math.PI) * this.jointSpacing;
			}
		}
	}

	draw(context) {
		var path = [
			[],
			[]
		];

		for (var i = 0, len = this.joints.length; i < len; i++) {
			var tailJoint = this.joints[i];

			var falloff = (this.joints.length - i) / this.joints.length;
			var jointSize = (this.tadpole.size - 1.8) * falloff;

			var x1 = tailJoint.pos.x + Math.cos(tailJoint.angle + Math.PI * 1.5) * jointSize;
			var y1 = tailJoint.pos.y + Math.sin(tailJoint.angle + Math.PI * 1.5) * jointSize;

			var x2 = tailJoint.pos.x + Math.cos(tailJoint.angle + Math.PI / 2) * jointSize;
			var y2 = tailJoint.pos.y + Math.sin(tailJoint.angle + Math.PI / 2) * jointSize;

			path[0].push({
				x: x1,
				y: y1
			});
			path[1].push({
				x: x2,
				y: y2
			});
		}

		for (var i = 0; i < path[0].length; i++) {
			context.lineTo(path[0][i].x, path[0][i].y);
		}
		path[1].reverse();
		for (var i = 0; i < path[1].length; i++) {
			context.lineTo(path[1][i].x, path[1][i].y);
		}
	}
}