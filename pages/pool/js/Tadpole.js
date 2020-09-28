import {
    Arrow
} from "./Arrow.js";

import {
    Vector2
} from './Math2D.js'

import {
    TadpoleConfig
} from './TadpoleConfig.js'

import {
    TadpoleTail
} from './TadpoleTail.js'

export class Tadpole {
    constructor() {
        this.tail = new TadpoleTail(this);
        this.arrow = new Arrow(this);

        this.pos = new Vector2(Math.random() * 300 - 150, Math.random() * 300 - 150);

        this.size = 4;
        this.name = '';
        this.age = 0;
        this.gender = 0; // 0 未知  1 男性  2 女性

        this.terminal = 'web'; //"web" "wx" "vs" "wap"
        this.weiboID = null;

        this.hover = false;

        this.momentum = 0;
        this.maxMomentum = 3;
        this.angle = Math.PI * 2;

        this.targetX = 0;
        this.targetY = 0;
        this.targetMomentum = 0;

        this.messages = [];
        this.timeSinceLastActivity = 0;

        this.changed = 0;
        this.timeSinceLastServerUpdate = 0;
    }

    //跟随模式
    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
    }

    // 普通模式
    freeTarget() {
        this.targetX = 0;
        this.targetY = 0;
    }

    update(mouseWorld) {
        this.timeSinceLastServerUpdate++;

        this.pos.x += Math.cos(this.angle) * this.momentum;
        this.pos.y += Math.sin(this.angle) * this.momentum;

        // 移动到目标位置，一般用来更新其他蝌蚪
        if (this.targetX != 0 || this.targetY != 0) {
            this.pos.x += (this.targetX - this.pos.x) / 20;
            this.pos.y += (this.targetY - this.pos.y) / 20;
        }

        // Update messages
        for (var i = this.messages.length - 1; i >= 0; i--) {
            var msg = this.messages[i];
            msg.update();

            if (msg.age == msg.maxAge) {
                this.messages.splice(i, 1);
            }
        }

        // Update tadpole hover/mouse state
        if (Math.sqrt(Math.pow(this.pos.x - mouseWorld.x, 2) + Math.pow(this.pos.y - mouseWorld.y, 2)) < this.size + 2) {
            this.hover = true;
            mouseWorld.tadpole = this;
        } else {
            if (mouseWorld.tadpole && mouseWorld.tadpole.id == this.id) {
                //mouseWorld.tadpole = null;
            }
            this.hover = false;
        }

        this.tail.update();
    }

    onclick(e) {
        if (e.ctrlKey && e.which == 1) {
            if (this.weiboID && this.hover) {
                window.open("https://weibo.com/u/" + this.weiboID);
                return true;
            }
        } else if (e.which == 2) {
            //todo:open menu
            e.preventDefault();
            return true;
        }
        return false;
    }

    userUpdate(angleTargetX, angleTargetY) {
        // 跟随模式
        if (this.targetX != 0 || this.targetY != 0) {
            let mindis = 20;
            let maxdis = 80; //计算Momentum
            let dis = Math.sqrt((this.targetX - this.pos.x) * (this.targetX - this.pos.x) + (this.targetY - this.pos.y) * (this.targetY - this.pos.y));

            if (dis > mindis) {
                angleTargetX = this.targetX;
                angleTargetY = this.targetY;

                if (dis < maxdis) {
                    this.targetMomentum = this.maxMomentum * dis / maxdis;
                } else {
                    this.targetMomentum = this.maxMomentum;
                }
            }
        }

        this.age++;

        var prevState = {
            angle: this.angle,
            momentum: this.momentum,
        }

        // Angle to targetx and targety (mouse position)
        var anglediff = ((Math.atan2(angleTargetY - this.pos.y, angleTargetX - this.pos.x)) - this.angle);
        while (anglediff < -Math.PI) {
            anglediff += Math.PI * 2;
        }
        while (anglediff > Math.PI) {
            anglediff -= Math.PI * 2;
        }

        this.angle += anglediff / 5;

        // Momentum to targetmomentum
        if (this.targetMomentum != this.momentum) {
            this.momentum += (this.targetMomentum - this.momentum) / 20;
        }

        if (this.momentum < 0) {
            this.momentum = 0;
        }

        this.changed += Math.abs((prevState.angle - this.angle) * 3) + this.momentum;

        if (this.changed > 1) {
            this.timeSinceLastServerUpdate = 0;
        }
    }

    draw(context) {
        var opacity = Math.max(Math.min(20 / Math.max(this.timeSinceLastServerUpdate - 300, 1), 1), .2).toFixed(3);

        //性别
        context.fillStyle = TadpoleConfig.GetGenderRgba(this.gender, opacity);

        /*else if(mouse.this.id == this.id){
                      context.fillStyle = 'rgba(0,191,255,'+opacity+')';
        }*/

        // if(this.hover && this.weiboID) {
        // 	context.fillStyle = 'rgba(192, 253, 247,'+opacity+')';
        // 	// context.shadowColor   = 'rgba(249, 136, 119, '+opacity*0.7+')';
        // }
        // else {
        // 	context.fillStyle = 'rgba(226,219,226,'+opacity+')';
        // }

        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 6;
        context.shadowColor = 'rgba(255, 255, 255, ' + opacity * 0.7 + ')';

        // Draw circle
        context.beginPath();
        context.arc(this.pos.x, this.pos.y, this.size, this.angle + Math.PI * 2.7, this.angle + Math.PI * 1.3, true);

        this.tail.draw(context);

        context.closePath();
        context.fill();

        context.shadowBlur = 0;
        context.shadowColor = '';

        this.drawName(context);
        this.drawMessages(context);
    }

    drawArrow(canvas, context, bounds) {
        this.arrow.draw(canvas, context, bounds);
    }

    drawName(context) {
        var fontsize = 10;
        var opacity = Math.max(Math.min(20 / Math.max(this.timeSinceLastServerUpdate - 300, 1), 1), .2).toFixed(3);
        context.fillStyle = 'rgba(226,219,226,' + opacity + ')';
        context.font = fontsize + "px 'proxima-nova-1','proxima-nova-2', arial, sans-serif";
        context.textBaseline = 'top';
        var width = context.measureText(this.name).width;
        context.fillText(this.name, this.pos.x - width / 2, this.pos.y + 8);
    }

    drawMessages(context) {
        this.messages.reverse();
        for (var i = 0, len = this.messages.length; i < len; i++) {
            this.messages[i].draw(context, this.pos.x + 10, this.pos.y + 5, i);
        }
        this.messages.reverse();
    };
}