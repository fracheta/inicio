import { TILE_SIZE, COLORS, BOARD } from './settings.js';

export class Ghost {
    constructor(x, y) {
        this.x = x * TILE_SIZE;
        this.y = y * TILE_SIZE;
        this.dir = { x: 1, y: 0 };
        this.speed = 2;
    }

    update() {
        if (this.x % TILE_SIZE === 0 && this.y % TILE_SIZE === 0) {
            const dirs = [{x:0,y:1}, {x:0,y:-1}, {x:1,y:0}, {x:-1,y:0}];
            const valid = dirs.filter(d => {
                const gx = (this.x / TILE_SIZE) + d.x;
                const gy = (this.y / TILE_SIZE) + d.y;
                return BOARD[gy] && BOARD[gy][gx] !== "1" && (d.x !== -this.dir.x || d.y !== -this.dir.y);
            });
            if (valid.length > 0) {
                this.dir = valid[Math.floor(Math.random() * valid.length)];
            }
        }
        this.x += this.dir.x * this.speed;
        this.y += this.dir.y * this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = COLORS.ghost;
        ctx.beginPath();
        ctx.roundRect(this.x + 2, this.y + 2, TILE_SIZE - 4, TILE_SIZE - 4, [10, 10, 0, 0]);
        ctx.fill();
    }
}
