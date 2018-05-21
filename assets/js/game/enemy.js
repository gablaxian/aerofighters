
'use strict';

let Enemy = {

    init(type='', x=0, y=0) {
        this.type           = type;
        this.img            = Game.spritesheets['enemies'].img;

        //
        this.posX           = x;
        this.posY           = y;
        this.width          = 32;
        this.height         = 32; // mostly used for entity collision

        //
        this.spriteX        = 0;
        this.spriteY        = 320;
        this.spriteWidth    = 32;
        this.spriteHeight   = 32;

        this.bladesX        = 0; // relative to the enemy position
        this.bladesY        = 0;
        this.bladesWidth    = 32;
        this.bladesHeight   = 32;
        this.bladesSpriteX  = 688;
        this.bladesSpriteY  = 480;

        //
        this.speed          = 1;
        this.health         = 1;
        this.damage         = 1;
        this.splinePos      = 0;

        this.isDead         = 0;

        // physics
        this.angle          = Math.PI; // points towards the player where possible (helicopters) - radians
        this.segmentSize    = ((Math.PI*2) / 15);
        this.segment        = Math.round(this.angle / this.segmentSize);

        // blades
        this.sequenceIdx    = 0;
        this.sequences      = {
            'default': [0,1,2]
        };
        this.seq            = 'default';
        this.seqCount       = 0;

        this.fps                    = 12;
        this.animationUpdateTime    = (1000 / this.fps);
        this.timeSinceLastFrameSwap = 0;

        return this;

    },

    spawn(x=0, y=0) {
        //
    },


    /***********************************
     *
     **********************************/

    getCenterPoint() {
        return {
            x: this.posX + (this.width/2),
            y: this.posY + (this.height/2)
        }
    },

    getX() {
        return this.getCenterPoint().x;
    },

    getY() {
        return this.getCenterPoint().y;
    },

    setX(x) {
        this.posX = x;
    },

    setY(y) {
        this.posY = y;
    },

    setCenterPos(x, y) {
        this.setX( x - (this.width/2) );
        this.setY( y - (this.height/2) );
    },

    getCollisionRect() {
        return {
            x1: this.posX,
            y1: this.posY,
            x2: this.posX + this.width,
            y2: this.posY + this.height
        }
    },


    /***********************************
     *
     **********************************/

    attack() {
        //
    },

    hurt() {
        if( (this.health -= Game.player.damage) <= 0 ) {
            this.kill();
            return;
        }
    },

    kill() {
        // Game.addExplosion((finalX + this.width/2), this.getCenterPoint().y);
        this.die();
    },

    die() {
        this.isDead = 1;
    },

    animate(elapsed) {
        this.timeSinceLastFrameSwap += elapsed;

        // sprite animation
        if( this.timeSinceLastFrameSwap > this.animationUpdateTime ) {

            var currentSequence = this.sequences[this.seq];

            if( this.sequenceIdx < currentSequence.length - 1 )
                this.sequenceIdx += 1;
            else
                this.sequenceIdx = 0;

            var col = currentSequence[this.sequenceIdx] % this.bladesWidth;

            this.offsetX = (col * this.bladesWidth) + this.bladesSpriteX;
            this.offsetY = this.bladesSpriteY;

            this.timeSinceLastFrameSwap = 0;
        }

    },

    update(elapsed) {

        let { x: eX, y: eY }  = this.getCenterPoint();
        let { x: pX, y: pY }  = Game.player.getCenterPoint();

        let dX = eX - pX;
        let dY = eY - pY;

        this.angle = Math.abs( Math.atan2( dX, dY ) );

        if( dX > 0 )
            this.angle = Math.PI + (Math.PI - this.angle);

        this.segment = Math.round(this.angle / this.segmentSize);

        this.animate(elapsed);

    },

    draw(context) {

        if( DEBUG ) {
            // draw floorspace rectangle
            context.fillStyle = 'rgba(128,0,0,0.5)';
            context.fillRect( this.posX|0, this.posY|0, this.width, this.height );
        }

        // main sprite
        context.drawImage(this.img, ((this.segment * this.spriteWidth) + this.spriteX), this.spriteY, this.spriteWidth, this.spriteHeight, this.posX|0, this.posY|0, this.spriteWidth, this.spriteHeight);

        // blades
        context.drawImage(this.img, this.offsetX, this.bladesSpriteY, this.bladesWidth, this.bladesHeight, (this.posX + this.bladesX), (this.posY + this.bladesY), this.bladesWidth, this.bladesHeight);
    }

};
