
'use strict';

let SpriteSheet = {

    init(cfg) {
        this.name       = cfg.name;
        this.img        = new Image();
        this.img.src    = cfg.url;

        this.width      = 0;
        this.height     = 0;

        return new Promise( (resolve, reject) => {

            this.img.onload = () => {

                this.width      = this.img.width;
                this.height     = this.img.height;

                resolve(this);

            };

        });

    }
}
