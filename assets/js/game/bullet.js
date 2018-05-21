
'use strict';

let Bullet = {

    init(x=0, y=0, vel=[0,0]) {

        this.x          = x;
        this.y          = y;

        this.width      = 2;
        this.height     = 2;

        this.speed      = 3;
        this.active     = true;

        this.velocity   = vel;

        return this;
    },

    getCollisionRect() {
        return {
            x1: this.x,
            y1: this.y,
            x2: this.x + this.width,
            y2: this.y + this.height
        }
    },

    update(elapsed) {
        this.x += this.velocity[0] * this.speed;
        this.y += this.velocity[1] * this.speed;
    },

    draw(context) {

        context.fillStyle = '#fff';

        // context.fillRect(this.x, this.y, 10, 10);
        context.beginPath();
        context.arc(this.x, this.y, this.width, 0, (Math.PI*2));
        
        context.fill();
    }
}