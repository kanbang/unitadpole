/*
 * @Descripttion: 
 * @version: 0.x
 * @Author: zhai
 * @Date: 2020-09-10 11:04:17
 * @LastEditors: zhai
 * @LastEditTime: 2020-09-11 16:27:27
 */
import {
	Vector2
} from './Math2D.js'

import {
	TadpoleConfig
} from './TadpoleConfig.js'


export class Arrow {
	constructor(tadpole) {
		this.tadpole = tadpole;
		this.opacity = 1;
	}

	draw(canvas, context, bounds) {
		//在可视范围内不显示三角符号
		if (this.tadpole.pos.x > bounds.min.x &&
			this.tadpole.pos.y > bounds.min.y &&
			this.tadpole.pos.x < bounds.max.x &&
			this.tadpole.pos.y < bounds.max.y)
			return;

		var dir = this.tadpole.pos.subtract(bounds.cen);

		var padding = 5;
		var w = (canvas.width / 2) - padding;
		var h = (canvas.height / 2) - padding;

		var point;
		// dir.x / dir.y (?) w / h
		if (Math.abs(dir.x * h) > Math.abs(dir.y * w)) {
			//与水平边相交
			point = dir.multiply(w / Math.abs(dir.x));
		} else {
			//与水平边相交
			point = dir.multiply(h / Math.abs(dir.y));
		}

		//顶点位置
		point = point.add(new Vector2(canvas.width / 2, canvas.height / 2));

		//实际距离
		var dis1 = dir.length();
		//可显示距离
		var dis2 = point.length();
		//透明度和距离成反比
		this.opacity = dis2 / dis1;

		var size = 6;
		dir.normalize();
		//顶点为直角的三角形
		var dirL = dir.left().multiply(size);
		var side1 = point.subtract(dir.multiply(size)).add(dirL);
		var side2 = side1.subtract(dirL.multiply(2));

		// Draw arrow
		context.fillStyle = TadpoleConfig.GetGenderRgba(this.tadpole.gender, this.opacity);
		context.beginPath();
		context.moveTo(point.x, point.y);
		context.lineTo(side1.x, side1.y);
		context.lineTo(side2.x, side2.y)
		context.closePath();
		context.fill();
	}
}