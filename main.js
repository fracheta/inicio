import { GAME_CONFIG, THEME, MAP } from './settings.js';
import { Pacman } from './entities.js';
import { Ghost } from './ghosts.js';

class GameKernel {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.pellets = [];
        this.init();
    }

    init() {
        this.canvas.width = MAP[0].length * GAME_CONFIG.TILE_SIZE;
        this.canvas.height = MAP.length * GAME_CONFIG.TILE_SIZE;

        this.pacman = new Pacman(13, 17);
        this.ghosts = [
            new Ghost(13, 11, THEME.COLORS.GHOSTS[0]),
            new Ghost(14, 11, THEME.COLORS.GHOSTS[1])
        ];

        // Mapear Pellets
        for (let y = 0; y < MAP.length; y++) {
            for (let x = 0; x < MAP[y].length; x++) {
                if (MAP[y][x] === '0' || MAP[y][x] === '3') {
                    this.pellets.push({ x, y, type: MAP[y][x], eaten: false });
                }
            }
        }

        window.addEventListener('keydown', (e) => {
            const inputs = {
                ArrowUp: {x:0, y:-1}, ArrowDown: {x:0, y:1},
                ArrowLeft: {x:-1, y:0}, ArrowRight: {x:1, y:0}
            };
            if (inputs[e.key]) this.pacman.nextDir = inputs[e.key];
        });

        this.render();
    }

    update() {
        this.pacman.update();
        
        // Coletar Pellets
        this.pellets.forEach(p => {
            if (!p.eaten && p.x === this.pacman.gridPos.x && p.y === this.pacman.gridPos.y) {
                p.eaten = true;
                this.score += (p.type === '3' ? 50 : 10);
            }
        });

        this.ghosts.forEach(g => {
            g.update(this.pacman.gridPos);
            // Hitbox de colisão
            const dist = Math.hypot(this.pacman.pixPos.x - g.pixPos.x, this.pacman.pixPos.y - g.pixPos.y);
            if (dist < GAME_CONFIG.TILE_SIZE * 0.6) {
                alert("GAME OVER! SCORE: " + this.score);
                location.reload();
            }
        });
    }

    draw() {
        this.ctx.fillStyle = THEME.COLORS.BG;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Desenhar Labirinto
        MAP.forEach((row, y) => {
            for (let x = 0; x < row.length; x++) {
                if (row[x] === '1') {
                    this.ctx.fillStyle = THEME.COLORS.WALL;
                    this.ctx.fillRect(x * GAME_CONFIG.TILE_SIZE, y * GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
                }
            }
        });

        // Desenhar Pellets
        this.pellets.forEach(p => {
            if (!p.eaten) {
                this.ctx.fillStyle = THEME.COLORS.PELLET;
                const r = p.type === '3' ? 6 : 2;
                this.ctx.beginPath();
                this.ctx.arc(p.x * GAME_CONFIG.TILE_SIZE + 16, p.y * GAME_CONFIG.TILE_SIZE + 16, r, 0, Math.PI*2);
                this.ctx.fill();
            }
        });

        this.pacman.draw(this.ctx);
        this.ghosts.forEach(g => g.draw(this.ctx));
        
        this.ctx.fillStyle = "white";
        this.ctx.font = "20px Arial";
        this.ctx.fillText(`SCORE: ${this.score}`, 20, 25);
    }

    render() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.render());
    }
}

new GameKernel();
