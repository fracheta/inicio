import { TILE_SIZE, COLORS, BOARD } from './settings.js';

export class Player {
    constructor(x, y) {
        this.x = x * TILE_SIZE;
        this.y = y * TILE_SIZE;
        this.dir = { x: 0, y: 0 };
        this.nextDir = { x: 0, y: 0 };
        this.speed = 2;
    }

    canMove(dir) {
        // Calcula a próxima posição baseada na grade
        const nextGridX = Math.floor((this.x + dir.x * this.speed + (dir.x === 1 ? TILE_SIZE - 1 : 0)) / TILE_SIZE);
        const nextGridY = Math.floor((this.y + dir.y * this.speed + (dir.y === 1 ? TILE_SIZE - 1 : 0)) / TILE_SIZE);
        
        if (BOARD[nextGridY] && BOARD[nextGridY][nextGridX]) {
            return BOARD[nextGridY][nextGridX] !== "1";
        }
        return false;
    }

    update() {
        // Só muda de direção se estiver alinhado à grade (essencial para Pacman)
        if (this.x % TILE_SIZE === 0 && this.y % TILE_SIZE === 0) {
            if (this.canMove(this.nextDir)) {
                this.dir = this.nextDir;
            }
            if (!this.canMove(this.dir)) {
                this.dir = { x: 0, y: 0 };
            }
        }
        this.x += this.dir.x * this.speed;
        this.y += this.dir.y * this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = COLORS.pacman;
        ctx.beginPath();
        ctx.arc(this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2, TILE_SIZE / 2 - 2, 0.2 * Math.PI, 1.8 * Math.PI); // Boca aberta
        ctx.lineTo(this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2);
        ctx.fill();
    }
}
