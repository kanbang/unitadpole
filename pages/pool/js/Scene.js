// CanvasContext.setFontSize(number fontSize)
// wx从基础库 1.9.90 开始，本接口停止维护，请使用 CanvasContext.font 代替



import {
  Tadpole
} from './Tadpole.js'

import {
  WaterParticle
} from './WaterParticle.js'

import {
  Camera
} from './Camera.js'

import {
  TadpoleConfig
} from './TadpoleConfig.js'


/**
 * 小程序不支持颜色格式：hsl(170,50%,10%)
 * 
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */

function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

export class Scene {
  constructor(ctxHolder) {
    this.ctxHolder = ctxHolder;

    //计算帧率
    this.fps = 0;
    this.frames = 0;
    this.lastTicks = Date.now();

    //场景对象
    this.tadpoles = {};

    this.userTadpole = new Tadpole();
    this.userTadpole.id = -1;
    this.tadpoles[this.userTadpole.id] = this.userTadpole;

    this.camera = new Camera(ctxHolder, this.userTadpole.pos.x, this.userTadpole.pos.y);

    this.waterParticles = [];
    for (var i = 0; i < 50; i++) {
      this.waterParticles.push(new WaterParticle());
    }

    this.backgroundColor = Math.random() * 360;

    //测试
    // for(var i=0; i<20; i++)
    // {
    //   var tad = new Tadpole();
    //   this.tadpoles[i+1] = tad;
    // }
  }

  update(mouseWorld) {
    this.backgroundColor += 0.08;
    if (this.backgroundColor > 360) {
      this.backgroundColor = 0;
    }

    this.camera.update(this);

    // Update tadpoles
    for (var id in this.tadpoles) {
      this.tadpoles[id].update(mouseWorld);
    }

    // Update waterParticles
    var bounds = this.camera.getOuterBounds();
    for (var i in this.waterParticles) {
      this.waterParticles[i].update(bounds);
    }
  }


  draw() {
    // Start UI layer (reset transform matrix)
    this.camera.resetTransform();

    this._drawBackground();

    this._drawArrows();

    this._drawFPS();

    this.camera.setWorldTransfrom();

    // Draw waterParticles
    for (var i in this.waterParticles) {
      this.waterParticles[i].draw(this.ctxHolder.context);
    }

    // Draw tadpoles
    for (var id in this.tadpoles) {
      this.tadpoles[id].draw(this.ctxHolder.context);
    }

    //wx kk must do
    this.ctxHolder.context.draw();
  }

  initUserID(id) {
    this.userTadpole.id = id;
    this.tadpoles[this.userTadpole.id] = this.userTadpole;
    delete this.tadpoles[-1];
  }
  
  _drawBackground() {
    // 错误 不支持颜色格式：hsl(170,50%,10%) 
    // ctxHolder.context.fillStyle = 'hsl(' + this.backgroundColor+',50%,10%)';
    this.ctxHolder.context.fillStyle = 'rgb(' + hslToRgb(this.backgroundColor, 0.5, 0.1).join(',') + ')';
    this.ctxHolder.context.fillRect(0, 0, this.ctxHolder.canvas.width, this.ctxHolder.canvas.height);

    ////////////////////////////////////////////////////////////////////////
    //测试 debug
    /*
    this.ctxHolder.context.fillStyle = 'rgb(255,0,255)';
    this.ctxHolder.context.fillRect(0, 0, this.ctxHolder.canvas.width, this.ctxHolder.canvas.height);
    this.ctxHolder.context.fillStyle = 'rgb(0,0,0)';
    this.ctxHolder.context.fillRect(10, 10, this.ctxHolder.canvas.width - 20, this.ctxHolder.canvas.height - 20);

    this.ctxHolder.context.fillStyle = "rgb(255,255,255)"; //文字颜色
    this.ctxHolder.context.font = TadpoleConfig.FontDef;
    this.ctxHolder.context.setTextBaseline('top');
    this.ctxHolder.context.fillText("DEBUG测试", 50, 50); //绘制文本
    /** **/
    ////////////////////////////////////////////////////////////////////////
  }

  // Draw arrows
  _drawArrows() {
    var cameraBounds = this.camera.getBounds();
    var bounds = {
      min: {
        x: cameraBounds[0].x,
        y: cameraBounds[0].y
      },
      max: {
        x: cameraBounds[1].x,
        y: cameraBounds[1].y
      },
      cen: {
        x: this.camera.x,
        y: this.camera.y
      }
    };

    for (var id in this.tadpoles) {
      this.tadpoles[id].drawArrow(this.ctxHolder.canvas, this.ctxHolder.context, bounds);
    }
  }

  //draw FPS
  _drawFPS() {
    this.frames++;
    var ticks = Date.now();
    if (ticks - this.lastTicks > 2000) {
      this.fps = Math.round(this.frames * 1000 / (ticks - this.lastTicks));
      this.lastTicks = ticks;
      this.frames = 0;
    }

    this.ctxHolder.context.fillStyle = "rgb(" + TadpoleConfig.FontColorRGB + ")"; //文字颜色
    this.ctxHolder.context.font = TadpoleConfig.FontDef;
    // this.ctxHolder.context.setTextBaseline('top'); //wx
    this.ctxHolder.context.textBaseline = 'top';

    this.ctxHolder.context.fillText("FPS: " + this.fps, 20, 20) //绘制文本
  }

}