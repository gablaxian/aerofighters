
'use strict';


let Game = {

    SCALE: 2,

    init() {

        //
        this.canvas             = document.querySelector('canvas');
        this.context            = this.canvas.getContext('2d');

        //
        this.width              = 304;
        this.height             = 224;

        //
        this.lastTime           = 0;
        this.elapsed            = 0;
        this.totalElapsed       = 0;

        //
        this.spritesheets       = {};

        //
        this.backgroundPos      = 0;
        this.level              = 0;
        this.spawnIndex         = 0;

        //
        this.enemies            = [];

        //
        this.projectiles        = [];
        this.explosions         = [];

        //
        // states - start, playing, game_ending, end, final_message, paused
        this.state              = STATE.PLAYING;


        // Initialise!
        this.loadAssets()
        .then( () => this.setupGame() )
        .then( () => {
            console.log('Game started');
            this.lastTime = window.performance.now();
            requestAnimationFrame(this.render.bind(this));
        });

    },

    loadAssets() {

        const promises = [];

        // Images
        for (let cfg of CONFIG.images) {
            let ss = Object.create(SpriteSheet);
            this.spritesheets[cfg.id] = ss;

            promises.push( ss.init(cfg) );
        }

        return Promise.all(promises);
    },

    setupGame() {

        //
        this.scaleCanvas(this.SCALE);

        //
        Input.init();

        //
        this.player = Player;
        this.player.init();

        this.player.setX( ( SCREEN_WIDTH/2 - this.player.width/2 )|0 );
        this.player.setY( ( SCREEN_HEIGHT - this.player.height - 20 )|0 );

        //
        this.hud = HUD;
        this.hud.init();

        //
        this.spline = Spline.init(paths[0]);

        //
        return Promise.resolve();
    },

    scaleCanvas(scale) {
        this.canvas.style.width     = this.width  * scale + 'px';
        this.canvas.style.height    = this.height * scale + 'px';
    },


    /*****************************************
     * Content generation
     ****************************************/

    drawBackground() {

        this.context.drawImage( Game.spritesheets['bg_tokyo'].img, 0, -Math.floor((1008-this.height) - this.backgroundPos) );

        if( Game.state === STATE.PLAYING ) {
            if( this.backgroundPos < (1008 - this.height) ) {
                this.backgroundPos += 0.3;
            }
        }
    },

    spawnEnemies() {

        // if there are spawn points and distance travelled is larger than the first item, then spawn enemies.
        if( this.spawnIndex < levels[this.level].length ) {

            if( this.totalElapsed >= levels[this.level][this.spawnIndex].triggerPoint ) {

                // revive old enemy
                for( let enemy of this.enemies ) {
                    if( enemy.isDead ) {
                        enemy.init();
                        this.spawnIndex++;
                        return;
                    }
                }

                // none to revive? create a new one.
                let enemy = Object.create(Enemy).init();
                enemy.path = levels[this.level][this.spawnIndex].path;
                this.enemies.push(enemy);
                this.spawnIndex++;
                
            }
        }
    },

    addProjectile(x, y, vel) {
         
        // check for any dead projectiles.
        for( let projectile of this.projectiles ) {
            if( !projectile.active ) {
                projectile.init(x, y, vel);
                return;
            }
        }

        // no dead projectiles found. add a new one.
        let projectile = Object.create(Bullet).init(x, y, vel);
        this.projectiles.push(projectile);

    },

    addExplosion(x, y) {
        //
    },

    /*****************************************
     * Handlers
     ****************************************/

    handleInput() {
        if( Key.LEFT ) {
            this.player.moveLeft();
        }
        if( Key.RIGHT ) {
            this.player.moveRight();
        }
        if( Key.UP ) {
            this.player.moveUp();
        }
        if( Key.DOWN ) {
            this.player.moveDown();
        }
        if( Key.SPACE ) {
            this.player.attack();
        }
        if( !Key.SPACE ) {
            this.player.resetAttack();
        }
    },

    handleCollisions() {

        for(let enemy of this.enemies ) {
            for( let projectile of this.projectiles ) {

                if( !enemy.isDead && projectile.active ) {

                    if( inRange( projectile, enemy ) ) {
                        enemy.hurt();
                        projectile.active = false;
                    }

                    // kill out of bounds projectiles.
                    if(
                        (projectile.x - projectile.width) < 0 ||
                        projectile.x > this.width ||
                        (projectile.y - projectile.height) < 0 ||
                        projectile.y > this.height
                    ) {
                        projectile.active = false;
                    }
                    
                }
            }
        }
    },


    /*****************************************
     * Renderers
     ****************************************/

    render() {

        var now = window.performance.now();
        this.elapsed = (now - this.lastTime);

        this.totalElapsed += this.elapsed;

        // clear
        this.context.clearRect(0, 0, this.width, this.height);

        if( this.state == STATE.PAUSED ) {

            this.drawBackground();

            // draw player
            this.player.update(this.elapsed);
            this.player.draw(this.context);

            // draw enemies
            for(var enemy of this.enemies) {
                if(!enemy.isDead) enemy.draw(this.context);
            }

        }
        else if( this.state == STATE.START ) {
            this.state = STATE.PLAYING;
        }
        else if( this.state == STATE.PLAYING ) {

            this.drawBackground();

            // handle input
            this.handleInput();

            // handle collision
            this.handleCollisions();

            // projectiles
            for( var projectile of this.projectiles ) {
                if( projectile.active ) {
                    projectile.update(this.elapsed);
                    projectile.draw(this.context);
                }
            }

            // spawn enemies
            this.spawnEnemies();

            // draw player
            this.player.update(this.elapsed);
            this.player.draw(this.context);

            // draw enemies
            for(var enemy of this.enemies) {
                if( !enemy.isDead ) {
                    enemy.update(this.elapsed);
                    
                    enemy.splinePos += 0.02;

                    if( enemy.splinePos < 0 )
                        enemy.splinePos = 0;
                    if( enemy.splinePos >= (this.spline.points.length - 3) )
                        enemy.splinePos = (this.spline.points.length - 3.01);

                    let p1 = this.spline.getSplinePoint(enemy.splinePos);
                    
                    enemy.setCenterPos(p1.tx, p1.ty);

                    enemy.draw(this.context);
                }
            }

            if (DEBUG) {
                this.spline.draw(this.context);
            }

            // draw HUD
            // this.hud.draw(this.context);
            
        }


        //
        this.lastTime = now;

        // repeat!
        requestAnimationFrame(this.render.bind(this));
    }

};

Game.init();
