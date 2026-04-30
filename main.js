import { CONFIG, COLORS, MAP_DATA } from './settings.js';
import { Pacman } from './entities.js';
import { Ghost } from './ghosts.js';

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.gameState = 'START';
        this.pellets = [];
        this.init();
    }

    init() {
        this.canvas.width = MAP_DATA[0].length * CONFIG.TILE_SIZE;
        this.canvas.height = MAP_DATA.length * CONFIG.TILE_SIZE;
        
        this.pacman = new Pacman(14, 23);
        this.ghosts = [
            new Ghost(13, 14, COLORS.GHOSTS.BLINKY, {x: 25, y: 1}),
            new Ghost(14, 14, COLORS.GHOSTS.PINKY, {x: 1, y: 1}),
            new Ghost(15, 14, COLORS.GHOSTS.INKY, {x: 25, y: 28})
        ];

        // Carregar Pellets
        MAP_DATA.forEach((row, y) => {
            row.split('').forEach((char, x) => {
                if (char === '0' || char === '3') this.pellets.push({x, y, type: char});
            });
        });

        this.bindEvents();
        this.gameLoop();
    }

    update() {
        if (this.gameState !== 'PLAYING') return;

        this.pacman.update();
        
        // Colisão com Pellets
        const pIdx = this.pellets.findIndex(p => p.x === this.pacman.gridPos.x && p.y === this.pacman.gridPos.y);
        if (pIdx !== -1) {
            this.score += this.pellets[pIdx].type === '3' ? 50 : 10;
            this.pellets.splice(pIdx, 1);
        }

        this.ghosts.forEach(ghost => {
            ghost.update(this.pacman.gridPos);
            // Colisão com Fantasma
            if (Math.hypot(this.pacman.position.x - ghost.position.x, this.pacman.position.y - ghost.position.y) < 20) {
                this.gameState = 'GAMEOVER';
                alert("FINAL SCORE: " + this.score);
                location.reload();
            }
        });
    }

    render() {
        this.ctx.fillStyle = COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Renderizar Mapa (Sistema de Layering Profissional)
        MAP_DATA.forEach((row, y) => {
            row.split('').forEach((char, x) => {
                if (char === '1') {
                    this.ctx.strokeStyle = COLORS.WALLS;
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(x * CONFIG.TILE_SIZE + 4, y * CONFIG.TILE_SIZE + 4, CONFIG.TILE_SIZE - 8, CONFIG.TILE_SIZE - 8);
                }
            });
        });

        this.pellets.forEach(p => {
            this.ctx.fillStyle = COLORS.PELLETS;
            const size = p.type === '3' ? 6 : 2;
            this.ctx.beginPath();
            this.ctx.arc(p.x * CONFIG.TILE_SIZE + 16, p.y * CONFIG.TILE_SIZE + 16, size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.pacman.draw(this.ctx);
        this.ghosts.forEach(g => g.draw(this.ctx));
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    bindEvents() {
        window.addEventListener('keydown', (e) => {
            if (this.gameState === 'START') this.gameState = 'PLAYING';
            const keys = {
                ArrowUp: {x:0, y:-1}, ArrowDown: {x:0, y:1},
                ArrowLeft: {x:-1, y:0}, ArrowRight: {x:1, y:0}
            };
            if (keys[e.key]) this.pacman.nextDirection = keys[e.key];
        });
    }
}

new GameEngine();
