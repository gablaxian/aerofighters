
'use strict';

let Spline = {

    init(points=[]) {
        this.points = points;

        return this;
    },

    getSplinePoint(t) {

        let p1 = Math.floor(t) + 1;
        let p2 = p1 + 1;
        let p3 = p2 + 1;
        let p0 = p1 - 1;

        t = t - Math.floor(t);

        let tt = t * t;
        let ttt = tt * t;

        let q1 = -ttt + 2*tt - t;
        let q2 = 3*ttt - 5*tt + 2;
        let q3 = -3*ttt + 4*tt + t;
        let q4 = ttt - tt;

        let tx = 0.5 * (this.points[p0].x * q1 + this.points[p1].x * q2 + this.points[p2].x * q3 + this.points[p3].x * q4);
        let ty = 0.5 * (this.points[p0].y * q1 + this.points[p1].y * q2 + this.points[p2].y * q3 + this.points[p3].y * q4);

        return {
            tx: tx,
            ty: ty
        }
    },

    getSplineGradient(t) {
                
        let p1 = (t + 1)|0;
        let p2 = p1 + 1;
        let p3 = p2 + 1;
        let p0 = p1 - 1;
        
        t = t - Math.floor(t);

        let tt = t * t;
        let ttt = tt * t;

        let q1 = -3 * tt + 4*t - 1;
        let q2 = 9*tt - 10*t;
        let q3 = -9*tt + 8*t + 1;
        let q4 = 3*tt - 2*t;

        let tx = 0.5 * (this.points[p0].x * q1 + this.points[p1].x * q2 + this.points[p2].x * q3 + this.points[p3].x * q4);
        let ty = 0.5 * (this.points[p0].y * q1 + this.points[p1].y * q2 + this.points[p2].y * q3 + this.points[p3].y * q4);

        return {
            tx: tx,
            ty: ty
        }
    },

    draw(context) {

        if( DEBUG ) {

            // draw spline
            for (var t = 0; t < (this.points.length - 3); t += 0.02) {
                let pos = this.getSplinePoint(t);
                context.fillStyle = '#0f0';
                context.fillRect(pos.tx, pos.ty, 2, 2);
            }

            // draw control points
            for( var point of this.points ) {
                context.fillStyle = '#f00';
                context.fillRect(point.x, point.y, 5, 5);
            }
        }
    }
}
