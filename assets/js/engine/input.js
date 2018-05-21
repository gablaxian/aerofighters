
'use strict';

let Key = {
    UP:     0,
    DOWN:   0,
    LEFT:   0,
    RIGHT:  0,
    SPACE:  0,
    ENTER:  0,
    X:      0
}

let Input = {

    init() {

        // Set up the keyboard events
        document.addEventListener('keydown', e => { this.changeKey(e.keyCode, 1) });
        document.addEventListener('keyup',   e => { this.changeKey(e.keyCode, 0) });

        document.addEventListener('keypress', e => {
            console.log(e.keyCode);
            if( e.keyCode == 13 ) {
                Game.state = Game.state === STATE.PAUSED ? STATE.PLAYING : STATE.PAUSED;
            }
        });

    },

    changeKey(key, value) {
        // console.log(key);

        switch( key ) {
            case 37: Key.LEFT  = value; break; // left
            case 39: Key.RIGHT = value; break; // right
            case 38: Key.UP    = value; break; // up
            case 40: Key.DOWN  = value; break; // down
            case 32: Key.SPACE = value; break; // attack (space bar)
            case 88: Key.X     = value; break; // jump (x)
        }

    }
};
