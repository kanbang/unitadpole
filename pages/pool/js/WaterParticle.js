/*
 * @Descripttion: 
 * @version: 0.x
 * @Author: zhai
 * @Date: 2019-10-14 10:33:57
 * @LastEditors: zhai
 * @LastEditTime: 2020-09-11 16:57:28
 */
export class WaterParticle {
	constructor() {
		this.x = 0;
		this.y = 0;
		this.z = Math.random() * 1 + 0.3;
		this.size = 1.2;
		this.opacity = Math.random() * 0.8 + 0.1;
	}

	//修正BUG 2019年10月6日
	update(bounds) {
		if (this.x == 0 || this.y == 0 ||
			this.x < bounds[0].x || this.y < bounds[0].y ||
			this.x > bounds[1].x || this.y > bounds[1].y) {
			this.x = Math.random() * (bounds[1].x - bounds[0].x) + bounds[0].x;
			this.y = Math.random() * (bounds[1].y - bounds[0].y) + bounds[0].y;
		}
	}

	draw(context) {
		// Draw circle
		context.fillStyle = 'rgba(226,219,226,' + this.opacity + ')';
		//context.fillStyle = '#fff';
		context.beginPath();
		context.arc(this.x, this.y, this.z * this.size, 0, Math.PI * 2, true);
		context.closePath();
		context.fill();
	}
}