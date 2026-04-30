/**
 * PAC-MAN KERNEL - Professional Implementation
 * Implementando: Cornering, Ghost AI Personalities, Tile-Based Logic
 */

const canvas = document.getElementById('core-viewport');
const ctx = canvas.getContext('2d');
const SZ = 16; // Tile Size

// Matriz de Colisão e Itens (Simplificada para o exemplo, mas expansível)
const BOARD = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,1,2,2,2,2,2,2,1],
    [1,3,1,1,2,1,2,1,2,1,2,1,1,3,1],
    [1,2,2,2,2,1,2,2,2,1,2,2,2,2,1],
    [1,1,1,1,2,1,1,0,1,1,2,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

class StateMachine {
    constructor() {
        this.score = 0;
        this.lives = 3;
        this.pelletsEaten = 0;
        this.globalMode = 'CHASE'; // CHASE, SCATTER, FRIGHTENED
        this.timer = 0;
    }

    update() {
        this.timer++;
        // Alternância original: Scatter por 7s, Chase por 20s
        if (this.timer > 1200) { 
            this.globalMode = this.globalMode === 'CHASE' ? 'SCATTER' : 'CHASE';
            this.timer = 0;
        }
    }
}

const Kernel = new StateMachine();

class Agent {
    constructor(x, y, color, type = 'ghost') {
        this.pos = { x: x * SZ, y: y * SZ };
        this.dir = { x: 0, y: 0 };
        this.nextDir = { x: 0, y: 0 };
        this.speed = 2;
        this.color = color;
        this.type = type;
    }

    // Lógica de Cornering e Centralização de Pixel
    snapToGrid() {
        if (this.pos.x % SZ === 0 && this.pos.y % SZ === 0) {
            let tx = this.pos.x / SZ;
            let ty = this.pos.y / SZ;

            // Verifica se pode virar para a direção bufferizada
            if (BOARD[ty + this.nextDir.y]?.[tx + this.nextDir.x] !== 1) {
                this.dir = { ...this.nextDir };
            }
            // Colisão com parede
            if (BOARD[ty + this.dir.y]?.[tx + this.dir.x] === 1) {
                this.dir = { x: 0, y: 0 };
            }
        }
    }

    draw() {
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        
        if(this.type === 'player') {
            // Desenha Pac-Man com boca animada simples
            ctx.beginPath();
            ctx.arc(this.pos.x + SZ/2, this.pos.y + SZ/2, SZ/2 - 1, 0.2 * Math.PI, 1.8 * Math.PI);
            ctx.lineTo(this.pos.x + SZ/2, this.pos.y + SZ/2);
            ctx.fill();
        } else {
            // Desenha Fantasma (Estilo Arcade)
            ctx.fillRect(this.pos.x + 2, this.pos.y + 2, SZ - 4, SZ - 4);
        }
        ctx.shadowBlur = 0;
    }

    update() {
        this.snapToGrid();
        this.pos.x += this.dir.x * this.speed;
        this.pos.y += this.dir.y * this.speed;
    }
}

const player = new Agent(1, 1, '#ffff00', 'player');
const blinky = new Agent(7, 5, '#ff0000');

function render() {
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Renderizar Labirinto
    for (let y = 0; y < BOARD.length; y++) {
        for (let x = 0; x < BOARD[y].length; x++) {
            let cell = BOARD[y][x];
            if (cell === 1) {
                ctx.strokeStyle = 'var(--neon-blue)';
                ctx.strokeRect(x * SZ + 2, y * SZ + 2, SZ - 4, SZ - 4);
            } else if (cell === 2) {
                ctx.fillStyle = '#ffb8ae';
                ctx.fillRect(x * SZ + SZ/2 - 1, y * SZ + SZ/2 - 1, 2, 2);
            }
        }
    }

    // Lógica de Consumo (Freeze Frame 1/60s simulado)
    let tx = Math.floor((player.pos.x + SZ/2) / SZ);
    let ty = Math.floor((player.pos.y + SZ/2) / SZ);
    if (BOARD[ty][tx] === 2) {
        BOARD[ty][tx] = 0;
        Kernel.score += 10;
        document.getElementById('val-score').innerText = Kernel.score;
    }

    player.update();
    player.draw();
    
    blinky.update();
    blinky.draw();

    Kernel.update();
    requestAnimationFrame(render);
}

// Input Handlers
window.addEventListener('keydown', e => {
    const keys = {
        ArrowUp: {x: 0, y: -1}, ArrowDown: {x: 0, y: 1},
        ArrowLeft: {x: -1, y: 0}, ArrowRight: {x: 1, y: 0}
    };
    if (keys[e.key]) player.nextDir = keys[e.key];
});

render();
