
'use strict';

let Player = {

    init(x, y) {
        this.img            = Game.spritesheets['fighters'].img;

        this.posX           = x;
        this.posY           = y;
        this.width          = 32;
        this.height         = 34; // mostly used for entity collision

        this.spriteX        = 168; // these will be set once we start drawing the sprites
        this.spriteY        = 112;
        this.spriteWidth    = 32;
        this.spriteHeight   = 34;

        //
        this.lives          = 3;
        this.speed          = 2;
        this.health         = 16;
        this.damage         = 2;

        this.shotDelay      = 100; // ms
        this.timeSinceLastShot = 0;

        // states (this is a truly horrible way to handle states)
        this.isAttacking    = 0;
        this.isHurt         = 0;
        this.isDying        = 0;
        this.isDead         = 0;

        this.allowAttack    = true;
        this.moving         = {};

        this.attackNumber   = 1;

        this.sequenceIdx    = 0;
        this.sequences      = {
            'default':          [2],

            'move-left':        [2,1,0],
            'move-right':       [2,3,4],
        };
        this.seq            = 'default';
        this.oldSeq         = 'default';
        this.numOfSeqs      = 0; // 0 == infinite
        this.seqCount       = 0;

        this.fps                    = 7;
        this.animationUpdateTime    = (1000 / this.fps);
        this.timeSinceLastFrameSwap = 0;
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

        if( this.timeSinceLastShot > this.shotDelay ) {
            Game.addProjectile((this.posX + (this.width/2)), this.posY, [0, -1]);
            this.timeSinceLastShot = 0;
        }
    },

    resetAttack() {
        this.allowAttack = true;
    },

    heal() {},

    hurt(amount) {
        // can only be hurt again after the first sequence has ended.
        if( this.isHurt ) return;

        if( (this.health -= amount) <= 0 ) {
            this.kill();
            return;
        }

        console.log('hurt');
    },

    kill() {
        this.lives--;
        this.health = 16;
    },


    moveUp(on)      { this.moving.up    = true; this.setDir(); },
    moveDown(on)    { this.moving.down  = true; this.setDir(); },
    moveLeft(on)    { this.moving.left  = true; this.setDir(); },
    moveRight(on)   { this.moving.right = true; this.setDir(); },

    setDir() {

        this.facing = '';

        if (this.moving.up && this.moving.left) {
            this.facing = 'left';
            this.moving.dir = DIR.UPLEFT;
        }
        else if (this.moving.up && this.moving.right) {
            this.facing = 'right';
            this.moving.dir = DIR.UPRIGHT;
        }
        else if (this.moving.down && this.moving.left) {
            this.facing = 'left';
            this.moving.dir = DIR.DOWNLEFT;
        }
        else if (this.moving.down && this.moving.right) {
            this.facing = 'right';
            this.moving.dir = DIR.DOWNRIGHT;
        }
        else if (this.moving.up) {
            this.moving.dir = DIR.UP;
        }
        else if (this.moving.down) {
            this.moving.dir = DIR.DOWN;
        }
        else if (this.moving.left) {
            this.facing = 'left';
            this.moving.dir = DIR.LEFT;
        }
        else if (this.moving.right) {
            this.facing = 'right';
            this.moving.dir = DIR.RIGHT;
        }
        else {
            this.moving.dir = null; // no moving.dir, but still facing this.dir
        }
    },

    update(elapsed) {
        this.timeSinceLastFrameSwap += elapsed;
        this.timeSinceLastShot += elapsed;

        // this.seq = this.moving.dir != null ? 'move' : '';

        if( this.moving.dir == DIR.UPLEFT ) {
            this.posX -= (Math.cos(Math.PI / 8) * this.speed);
            this.posY -= (Math.sin(Math.PI / 8) * this.speed);
        }
        if( this.moving.dir == DIR.UPRIGHT ) {
            this.posX += (Math.cos(Math.PI / 8) * this.speed);
            this.posY -= (Math.sin(Math.PI / 8) * this.speed);
        }
        if( this.moving.dir == DIR.DOWNLEFT ) {
            this.posX -= (Math.cos(Math.PI / 8) * this.speed);
            this.posY += (Math.sin(Math.PI / 8) * this.speed);
        }
        if( this.moving.dir == DIR.DOWNRIGHT ) {
            this.posX += (Math.cos(Math.PI / 8) * this.speed);
            this.posY += (Math.sin(Math.PI / 8) * this.speed);
        }

        if( this.moving.dir == DIR.LEFT ) {
            this.posX -= this.speed;
        }
        if( this.moving.dir == DIR.RIGHT ) {
            this.posX += this.speed;
        }
        if( this.moving.dir == DIR.UP ) {
            this.posY -= this.speed;
        }
        if( this.moving.dir == DIR.DOWN ) {
            this.posY += this.speed;
        }

        //
        if( this.posX < 0 ) {
            this.posX = 0;
        }
        if( (this.posX + this.width) > Game.width ) {
            this.posX = (Game.width - this.width);
        }
        if( this.posY < 0 ) {
            this.posY = 0;
        }
        if( (this.posY + this.height) > Game.height ) {
            this.posY = (Game.height - this.height);
        }

        // sprite animation
        if( this.timeSinceLastFrameSwap > this.animationUpdateTime ) {

            // var seq = this.facing != '' ? this.seq+'-'+this.facing : 'default';
            var seq = 'default';

            if( seq != this.oldSeq ) {
                // reset the sequence
                this.sequenceIdx = 0;
            }
            this.oldSeq = seq;

            var currentSequence = this.sequences[seq];

            if( this.sequenceIdx < currentSequence.length - 1 )
                this.sequenceIdx += 1;
            else
                this.sequenceIdx = 0;

            var col = currentSequence[this.sequenceIdx] % this.spriteWidth;

            this.offsetX        = (col * this.spriteWidth) + this.spriteX;
            this.offsetY        = this.spriteY;

            if( this.numOfSeqs > 0 ) {
                this.seqCount--;

                if( this.seqCount == 0 ) {
                    this.isAttacking    = 0;
                    this.spriteY        = 0;
                    this.numOfSeqs      = 0;
                }
            }

            this.timeSinceLastFrameSwap = 0;
        }

        // reset
        this.moving = {};
        this.setDir();
    },

    draw(context) {

        if( DEBUG ) {
            // draw floorspace rectangle
            let { x1, y1, x2, y2 } = this.getCollisionRect();

            context.fillStyle = 'rgba(128,0,0,0.5)';
            context.fillRect( x1|0, y1|0, this.width, this.height );
        }

        // draw
        context.drawImage(this.img, this.offsetX, this.offsetY, this.spriteWidth, this.spriteHeight, this.posX|0, this.posY|0, this.spriteWidth, this.spriteHeight);
    }
};
