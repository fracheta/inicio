import { CONFIG, COLORS, MAP_DATA } from './settings.js';
import { Entity } from './entities.js';

export class Ghost extends Entity {
    constructor(x, y, color, targetCanto) {
        super(x, y);
        this.color = color;
        this.mode = 'CHASE'; // SCATTER, CHASE, FRIGHTENED
        this.timer = 0;
        this.targetCanto = targetCanto;
        this.velocity = 1.8;
    }

    update(pacmanPos) {
        this.timer++;
        
        // Máquina de Estado Simples (Troca a cada 20 segundos)
        if (this.timer > 1200) {
            this.mode = this.mode === 'CHASE' ? 'SCATTER' : 'CHASE';
            this.timer = 0;
        }

        if (this.isAtCenter()) {
            this.gridPos = { x: this.position.x / CONFIG.TILE_SIZE, y: this.position.y / CONFIG.TILE_SIZE };
            const target = this.mode === 'CHASE' ? pacmanPos : this.targetCanto;
            this.direction = this.getBestMove(target);
        }

        this.position.x += this.direction.x * this.velocity;
        this.position.y += this.direction.y * this.velocity;
    }

    getBestMove(target) {
        const moves = this.getPossibleMoves();
        // IA não pode voltar para trás
        const filtered = moves.filter(m => m.x !== -this.direction.x || m.y !== -this.direction.y);
        
        let bestMove = filtered[0] || moves[0];
        let minDist = Infinity;

        for (const move of filtered) {
            const nextX = this.gridPos.x + move.x;
            const nextY = this.gridPos.y + move.y;
            const dist = Math.hypot(nextX - target.x, nextY - target.y);
            if (dist < minDist) {
                minDist = dist;
                bestMove = move;
            }
        }
        return bestMove;
    }

    draw(ctx) {
        const x = this.position.x;
        const y = this.position.y;
        
        ctx.fillStyle = this.color;
        // Cabeça
        ctx.beginPath();
        ctx.arc(x + 16, y + 16, 14, Math.PI, 0);
        ctx.lineTo(x + 30, y + 30);
        ctx.lineTo(x + 2, y + 30);
        ctx.fill();
        
        // Olhos
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(x + 10, y + 12, 4, 0, Math.PI * 2);
        ctx.arc(x + 22, y + 12, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}
// ... (Aqui entrariam mais 350 linhas detalhando 4 classes 
// diferentes: Blinky, Pinky, Inky e Clyde, cada um com sua estratégia única)
