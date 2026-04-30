import { GAME_CONFIG, THEME, MAP } from './settings.js';

class Vector2 {
    constructor(x, y) { this.x = x; this.y = y; }
}

export class Entity {
    constructor(gridX, gridY) {
        this.gridPos = new Vector2(gridX, gridY);
        this.pixPos = new Vector2(gridX * GAME_CONFIG.TILE_SIZE, gridY * GAME_CONFIG.TILE_SIZE);
        this.dir = new Vector2(0, 0);
        this.nextDir = new Vector2(0, 0);
        this.radius = GAME_CONFIG.TILE_SIZE / 2;
    }

    // Verifica se a entidade está exatamente no centro do Tile (Momento da decisão)
    isCentered() {
        const centerThreshold = 1.5;
        return (
            Math.abs(this.pixPos.x % GAME_CONFIG.TILE_SIZE) < centerThreshold &&
            Math.abs(this.pixPos.y % GAME_CONFIG.TILE_SIZE) < centerThreshold
        );
    }

    canMove(direction) {
        const nextX = Math.round(this.pixPos.x / GAME_CONFIG.TILE_SIZE) + direction.x;
        const nextY = Math.round(this.pixPos.y / GAME_CONFIG.TILE_SIZE) + direction.y;
        
        if (MAP[nextY] && MAP[nextY][nextX]) {
            const tile = MAP[nextY][nextX];
            return tile !== '1' && tile !== '4'; // Não atravessa paredes
        }
        return false;
    }

    alignToGrid() {
        this.pixPos.x = Math.round(this.pixPos.x / GAME_CONFIG.TILE_SIZE) * GAME_CONFIG.TILE_SIZE;
        this.pixPos.y = Math.round(this.pixPos.y / GAME_CONFIG.TILE_SIZE) * GAME_CONFIG.TILE_SIZE;
    }
}

export class Pacman extends Entity {
    constructor(x, y) {
        super(x, y);
        this.mouthOpen = 0;
        this.mouthDir = 0.1;
    }

    update() {
        if (this.isCentered()) {
            if (this.canMove(this.nextDir)) {
                this.dir = this.nextDir;
                this.alignToGrid();
            } else if (!this.canMove(this.dir)) {
                this.dir = { x: 0, y: 0 };
                this.alignToGrid();
            }
        }

        this.pixPos.x += this.dir.x * GAME_CONFIG.PACMAN_SPEED;
        this.pixPos.y += this.dir.y * GAME_CONFIG.PACMAN_SPEED;
        
        this.gridPos.x = Math.round(this.pixPos.x / GAME_CONFIG.TILE_SIZE);
        this.gridPos.y = Math.round(this.pixPos.y / GAME_CONFIG.TILE_SIZE);
    }

    draw(ctx) {
        this.mouthOpen += this.mouthDir;
        if (this.mouthOpen > 0.2 || this.mouthOpen < 0) this.mouthDir *= -1;

        const cx = this.pixPos.x + this.radius;
        const cy = this.pixPos.y + this.radius;

        ctx.fillStyle = THEME.COLORS.PACMAN;
        ctx.beginPath();
        let angle = 0;
        if (this.dir.x === 1) angle = 0;
        else if (this.dir.x === -1) angle = Math.PI;
        else if (this.dir.y === -1) angle = Math.PI * 1.5;
        else if (this.dir.y === 1) angle = Math.PI * 0.5;

        ctx.arc(cx, cy, this.radius - 2, angle + this.mouthOpen * Math.PI, angle + (2 - this.mouthOpen) * Math.PI);
        ctx.lineTo(cx, cy);
        ctx.fill();
    }
}
