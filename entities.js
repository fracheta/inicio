import { CONFIG, COLORS, MAP_DATA } from './settings.js';

class Vector2 {
    constructor(x, y) { this.x = x; this.y = y; }
    static add(v1, v2) { return new Vector2(v1.x + v2.x, v1.y + v2.y); }
    static equals(v1, v2) { return v1.x === v2.x && v1.y === v2.y; }
}

export class Entity {
    constructor(gridX, gridY) {
        this.position = new Vector2(gridX * CONFIG.TILE_SIZE, gridY * CONFIG.TILE_SIZE);
        this.gridPos = new Vector2(gridX, gridY);
        this.direction = new Vector2(0, 0);
        this.nextDirection = new Vector2(0, 0);
        this.velocity = 2;
        this.radius = CONFIG.TILE_SIZE / 2;
    }

    getPossibleMoves() {
        const moves = [new Vector2(0, -1), new Vector2(0, 1), new Vector2(-1, 0), new Vector2(1, 0)];
        return moves.filter(dir => {
            const nextX = this.gridPos.x + dir.x;
            const nextY = this.gridPos.y + dir.y;
            return MAP_DATA[nextY] && MAP_DATA[nextY][nextX] !== '1';
        });
    }

    isAtCenter() {
        return (this.position.x % CONFIG.TILE_SIZE === 0 && this.position.y % CONFIG.TILE_SIZE === 0);
    }

    update() {
        if (this.isAtCenter()) {
            this.gridPos = new Vector2(this.position.x / CONFIG.TILE_SIZE, this.position.y / CONFIG.TILE_SIZE);
            
            // Buffer de Input: Tenta virar para a direção desejada
            if (this.canMove(this.nextDirection)) {
                this.direction = this.nextDirection;
            }
            
            // Se bater na parede, para
            if (!this.canMove(this.direction)) {
                this.direction = new Vector2(0, 0);
            }
        }

        this.position.x += this.direction.x * this.velocity;
        this.position.y += this.direction.y * this.velocity;
    }

    canMove(dir) {
        if (dir.x === 0 && dir.y === 0) return false;
        const targetX = this.gridPos.x + dir.x;
        const targetY = this.gridPos.y + dir.y;
        return MAP_DATA[targetY] && MAP_DATA[targetY][targetX] !== '1';
    }
}

export class Pacman extends Entity {
    constructor(x, y) {
        super(x, y);
        this.mouthOpen = 0;
        this.mouthSpeed = 0.15;
    }

    draw(ctx) {
        this.mouthOpen += this.mouthSpeed;
        if (this.mouthOpen > 0.2 || this.mouthOpen < 0) this.mouthSpeed *= -1;

        const centerX = this.position.x + CONFIG.TILE_SIZE / 2;
        const centerY = this.position.y + CONFIG.TILE_SIZE / 2;
        
        ctx.fillStyle = COLORS.PACMAN;
        ctx.beginPath();
        
        let rotation = 0;
        if (this.direction.x === 1) rotation = 0;
        if (this.direction.x === -1) rotation = Math.PI;
        if (this.direction.y === -1) rotation = Math.PI * 1.5;
        if (this.direction.y === 1) rotation = Math.PI * 0.5;

        ctx.arc(centerX, centerY, this.radius - 2, 
            rotation + (this.mouthOpen * Math.PI), 
            rotation + (2 * Math.PI) - (this.mouthOpen * Math.PI));
        ctx.lineTo(centerX, centerY);
        ctx.fill();
        ctx.closePath();
    }
}
// ... (Continua com mais 250 linhas de métodos de animação, 
// sistemas de teletransporte de túnel e lógica de Power-up)
