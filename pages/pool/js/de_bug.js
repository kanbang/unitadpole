import { Tadpole } from "./Tadpole.js";


Tadpole.prototype.drawName = function(context) {
    var fontsize = 10;
    var opacity = Math.max(Math.min(20 / Math.max(this.timeSinceLastServerUpdate - 300, 1), 1), .2).toFixed(3);
    context.fillStyle = 'rgba(226,219,226,' + opacity +
        ')';
    context.font = fontsize + "px 'proxima-nova-1','proxima-nova-2', arial, sans-serif";
    context.textBaseline = 'top';

    var strArray = ["name:  " + this.name,
        // this.age,
        "gender: " + this.gender,
        "term:  " + this.terminal,
        "weibo: " + this.weiboID
    ];

    var lineH = 10;
    var posY = this.pos.y + lineH;
    for (var value of strArray) {
        context.fillText(value, this.pos.x, posY);
        posY += lineH;
    }
}