import { GAME_CONFIG, THEME, MAP } from './settings.js';
import { Entity } from './entities.js';

export class Ghost extends Entity {
    constructor(x, y, color) {
        super(x, y);
        this.color = color;
        this.dir = { x: 1, y: 0 };
        this.speed = GAME_CONFIG.GHOST_SPEED;
        this.state = 'CHASE'; // CHASE, SCATTER, FRIGHTENED
    }

    update(targetPos) {
        if (this.isCentered()) {
            this.alignToGrid();
            this.dir = this.calculateBestMove(targetPos);
        }

        this.pixPos.x += this.dir.x * this.speed;
        this.pixPos.y += this.dir.y * this.speed;
        
        this.gridPos.x = Math.round(this.pixPos.x / GAME_CONFIG.TILE_SIZE);
        this.gridPos.y = Math.round(this.pixPos.y / GAME_CONFIG.TILE_SIZE);
    }

    calculateBestMove(target) {
        const possibleMoves = [
            { x: 0, y: -1 }, { x: 0, y: 1 }, 
            { x: -1, y: 0 }, { x: 1, y: 0 }
        ];

        let bestDir = this.dir;
        let minDist = Infinity;

        for (const move of possibleMoves) {
            // Regra Clássica: Fantasma não pode dar meia volta
            if (move.x === -this.dir.x && move.y === -this.dir.y) continue;

            if (this.canMove(move)) {
                const nextX = this.gridPos.x + move.x;
                const nextY = this.gridPos.y + move.y;
                const dist = Math.hypot(nextX - target.x, nextY - target.y);
                
                if (dist < minDist) {
                    minDist = dist;
                    bestDir = move;
                }
            }
        }
        return bestDir;
    }

    draw(ctx) {
        const x = this.pixPos.x + 2;
        const y = this.pixPos.y + 2;
        const size = GAME_CONFIG.TILE_SIZE - 4;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2, Math.PI, 0);
        ctx.lineTo(x + size, y + size);
        ctx.lineTo(x, y + size);
        ctx.fill();
        
        // Olhos
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(x + size/3, y + size/3, 4, 0, Math.PI*2);
        ctx.arc(x + size*0.6, y + size/3, 4, 0, Math.PI*2);
        ctx.fill();
    }
}
