const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- CONSTANTES E CONFIGURAÇÕES ---
const TILE_SIZE = 16;
const FPS = 60;
const MAP_COLS = 28;
const MAP_ROWS = 36;

// Tabela de dificuldade (Speed, Frightened Time em frames)
const DIFFICULTY_CURVE = {
    1: { pacSpeed: 0.8, ghostSpeed: 0.75, frightTime: 360, tunnelSpeed: 0.4 },
    2: { pacSpeed: 0.9, ghostSpeed: 0.85, frightTime: 300, tunnelSpeed: 0.45 },
    5: { pacSpeed: 1.0, ghostSpeed: 0.95, frightTime: 120, tunnelSpeed: 0.5 },
};

// Mapa simplificado (0: Caminho, 1: Parede, 2: Pellet, 3: Power Pellet)
const levelMap = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,0,0,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0], // Túnel
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1],
    [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
    [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// --- CLASSES E ENTIDADES ---

class Entidade {
    constructor(x, y, speed) {
        this.x = x * TILE_SIZE;
        this.y = y * TILE_SIZE;
        this.speed = speed;
        this.dirX = 0;
        this.dirY = 0;
        this.nextDirX = 0;
        this.nextDirY = 0;
    }

    checkIntersection() {
        // Retorna true se a entidade estiver exatamente alinhada no grid
        return (this.x % TILE_SIZE === 0 && this.y % TILE_SIZE === 0);
    }

    getGridPos() {
        return {
            x: Math.floor(this.x / TILE_SIZE),
            y: Math.floor(this.y / TILE_SIZE)
        };
    }

    handleTunnelWarp() {
        if (this.x < 0) this.x = canvas.width - TILE_SIZE;
        if (this.x >= canvas.width) this.x = 0;
    }
}

class PacMan extends Entidade {
    constructor(x, y) {
        super(x, y, 2);
        this.radius = TILE_SIZE / 2 - 2;
        this.freezeFrames = 0;
    }

    processInputBuffer() {
        // Cornering e mudança de direção no pixel central
        if (this.checkIntersection()) {
            let gridPos = this.getGridPos();
            let nextGridX = gridPos.x + this.nextDirX;
            let nextGridY = gridPos.y + this.nextDirY;

            // Evita erro de index no túnel
            if (nextGridX >= 0 && nextGridX < MAP_COLS && nextGridY >= 0 && nextGridY < MAP_ROWS) {
                if (levelMap[nextGridY][nextGridX] !== 1) {
                    this.dirX = this.nextDirX;
                    this.dirY = this.nextDirY;
                }
            }
        }
    }

    update() {
        if (this.freezeFrames > 0) {
            this.freezeFrames--;
            return;
        }

        this.processInputBuffer();

        // Verifica colisão frontal para parar
        if (this.checkIntersection()) {
            let gridPos = this.getGridPos();
            let nextX = gridPos.x + this.dirX;
            let nextY = gridPos.y + this.dirY;

            if (nextX >= 0 && nextX < MAP_COLS && levelMap[nextY][nextX] === 1) {
                this.dirX = 0;
                this.dirY = 0;
            }
        }

        this.x += this.dirX * this.speed;
        this.y += this.dirY * this.speed;
        
        this.handleTunnelWarp();
        this.eatPellets();
    }

    eatPellets() {
        if (this.checkIntersection()) {
            let pos = this.getGridPos();
            if (levelMap[pos.y][pos.x] === 2) {
                levelMap[pos.y][pos.x] = 0;
                game.score += 10;
                this.freezeFrames = 1; // Freeze frame de 1/60 (1 frame)
                game.checkPellets();
            } else if (levelMap[pos.y][pos.x] === 3) {
                levelMap[pos.y][pos.x] = 0;
                game.score += 50;
                game.triggerFrightenedMode();
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x + TILE_SIZE/2, this.y + TILE_SIZE/2, this.radius, 0.2 * Math.PI, 1.8 * Math.PI);
        ctx.lineTo(this.x + TILE_SIZE/2, this.y + TILE_SIZE/2);
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.closePath();
    }
}

class Ghost extends Entidade {
    constructor(x, y, color, type) {
        super(x, y, 1.5);
        this.color = color;
        this.type = type; // 'blinky', 'pinky', 'inky', 'clyde'
        this.state = 'scatter'; // 'chase', 'scatter', 'frightened', 'eaten'
        this.scatterTarget = this.getScatterTarget();
    }

    getScatterTarget() {
        switch(this.type) {
            case 'blinky': return {x: MAP_COLS - 2, y: 1};
            case 'pinky': return {x: 1, y: 1};
            case 'inky': return {x: MAP_COLS - 2, y: MAP_ROWS - 2};
            case 'clyde': return {x: 1, y: MAP_ROWS - 2};
        }
    }

    calculateGhostTarget(pacman, blinky) {
        if (this.state === 'scatter') return this.scatterTarget;
        if (this.state === 'frightened') {
            // Pseudo-aleatório: escolhe tile adjacente aleatório
            return {
                x: this.getGridPos().x + (Math.random() > 0.5 ? 1 : -1),
                y: this.getGridPos().y + (Math.random() > 0.5 ? 1 : -1)
            };
        }

        let pacPos = pacman.getGridPos();

        // Lógica de Chase Específica
        switch(this.type) {
            case 'blinky':
                return pacPos;
            
            case 'pinky':
                return {
                    x: pacPos.x + (pacman.dirX * 4),
                    y: pacPos.y + (pacman.dirY * 4)
                };
            
            case 'inky':
                // Vetor do Blinky até 2 tiles à frente do Pac-Man, dobrado
                let pivot = { x: pacPos.x + (pacman.dirX * 2), y: pacPos.y + (pacman.dirY * 2) };
                let bPos = blinky.getGridPos();
                let vecX = pivot.x - bPos.x;
                let vecY = pivot.y - bPos.y;
                return { x: pivot.x + vecX, y: pivot.y + vecY };
            
            case 'clyde':
                // Calcula distância Euclidiana
                let dist = Math.sqrt(Math.pow(pacPos.x - this.getGridPos().x, 2) + Math.pow(pacPos.y - this.getGridPos().y, 2));
                return dist > 8 ? pacPos : this.scatterTarget;
        }
    }

    update(pacman, blinky) {
        if (this.checkIntersection()) {
            let target = this.calculateGhostTarget(pacman, blinky);
            this.chooseDirection(target);
        }
        
        // Verifica velocidade reduzida no túnel
        let pos = this.getGridPos();
        if (pos.y === 10 && (pos.x < 5 || pos.x > 22)) {
            this.speed = DIFFICULTY_CURVE[game.level]?.tunnelSpeed || 1;
        } else if (this.state === 'frightened') {
            this.speed = 1;
        } else {
            this.speed = 1.5;
        }

        this.x += this.dirX * this.speed;
        this.y += this.dirY * this.speed;
        this.handleTunnelWarp();
    }

    chooseDirection(target) {
        let pos = this.getGridPos();
        let possibleMoves = [
            { dx: 0, dy: -1 }, // Cima
            { dx: -1, dy: 0 }, // Esquerda
            { dx: 0, dy: 1 },  // Baixo
            { dx: 1, dy: 0 }   // Direita
        ];

        let shortestDist = Infinity;
        let bestMove = { dx: this.dirX, dy: this.dirY }; // Mantém se não tiver opção

        for (let move of possibleMoves) {
            // Fantasmas não podem reverter a direção (180 graus) imediatamente
            if (move.dx === -this.dirX && move.dy === -this.dirY && (this.dirX !== 0 || this.dirY !== 0)) continue;

            let nextX = pos.x + move.dx;
            let nextY = pos.y + move.dy;

            if (nextX >= 0 && nextX < MAP_COLS && levelMap[nextY][nextX] !== 1) {
                let dist = Math.sqrt(Math.pow(target.x - nextX, 2) + Math.pow(target.y - nextY, 2));
                if (dist < shortestDist) {
                    shortestDist = dist;
                    bestMove = move;
                }
            }
        }

        this.dirX = bestMove.dx;
        this.dirY = bestMove.dy;
    }

    draw() {
        ctx.fillStyle = this.state === 'frightened' ? 'blue' : this.color;
        ctx.fillRect(this.x, this.y, TILE_SIZE, TILE_SIZE);
    }
}

// --- ENGINE E LOOP GLOBAL ---

class GameEngine {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.globalStateTimer = 0;
        this.frightenedTimer = 0;
        this.ghostComboMultiplier = 200;
        
        this.pacman = new PacMan(13, 16);
        this.ghosts = [
            new Ghost(13, 8, 'red', 'blinky'),
            new Ghost(14, 8, 'pink', 'pinky'),
            new Ghost(12, 8, 'cyan', 'inky'),
            new Ghost(15, 8, 'orange', 'clyde')
        ];

        this.setupInputs();
    }

    setupInputs() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'w') { this.pacman.nextDirX = 0; this.pacman.nextDirY = -1; }
            if (e.key === 'ArrowDown' || e.key === 's') { this.pacman.nextDirX = 0; this.pacman.nextDirY = 1; }
            if (e.key === 'ArrowLeft' || e.key === 'a') { this.pacman.nextDirX = -1; this.pacman.nextDirY = 0; }
            if (e.key === 'ArrowRight' || e.key === 'd') { this.pacman.nextDirX = 1; this.pacman.nextDirY = 0; }
        });
    }

    updateStateTimer() {
        if (this.frightenedTimer > 0) {
            this.frightenedTimer--;
            if (this.frightenedTimer === 0) {
                this.ghosts.forEach(g => {
                    if (g.state === 'frightened') g.state = 'chase';
                });
                this.ghostComboMultiplier = 200;
            }
            return; // Pausa o timer global de estado durante Frightened
        }

        this.globalStateTimer++;
        
        // Lógica simplificada de alternância (Scatter 7s, Chase 20s) a 60 FPS
        let phaseTime = this.globalStateTimer;
        let newState = 'chase';
        
        if (phaseTime < 420) newState = 'scatter'; // 7 seg
        else if (phaseTime < 1620) newState = 'chase'; // 20 seg
        else if (phaseTime < 2040) newState = 'scatter'; // 7 seg
        else newState = 'chase'; // Resto perseguição

        this.ghosts.forEach(g => {
            if (g.state !== 'eaten') g.state = newState;
        });
    }

    triggerFrightenedMode() {
        let duration = DIFFICULTY_CURVE[this.level]?.frightTime || 60;
        this.frightenedTimer = duration;
        this.ghostComboMultiplier = 200;
        
        this.ghosts.forEach(g => {
            if (g.state !== 'eaten') {
                g.state = 'frightened';
                // Força os fantasmas a reverterem a direção imediatamente
                g.dirX *= -1;
                g.dirY *= -1;
            }
        });
    }

    checkPellets() {
        // Lógica para spawnar frutas (70 e 170 pellets) seria acionada aqui
    }

    checkCollisions() {
        let pPos = this.pacman.getGridPos();
        this.ghosts.forEach(ghost => {
            let gPos = ghost.getGridPos();
            if (pPos.x === gPos.x && pPos.y === gPos.y) {
                if (ghost.state === 'frightened') {
                    ghost.state = 'eaten';
                    this.score += this.ghostComboMultiplier;
                    this.ghostComboMultiplier *= 2; // 200, 400, 800, 1600
                    ghost.x = 13 * TILE_SIZE; // Retorna para casa
                    ghost.y = 8 * TILE_SIZE;
                    ghost.state = 'chase';
                } else if (ghost.state === 'chase' || ghost.state === 'scatter') {
                    // Morte do Pac-Man
                    alert("Game Over! Score: " + this.score);
                    document.location.reload();
                }
            }
        });
    }

    drawMap() {
        for (let r = 0; r < MAP_ROWS; r++) {
            for (let c = 0; c < MAP_COLS; c++) {
                let tile = levelMap[r][c];
                if (tile === 1) {
                    ctx.fillStyle = '#1919A6'; // Azul Arcade
                    ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                } else if (tile === 2) {
                    ctx.fillStyle = '#ffb8ae';
                    ctx.fillRect(c * TILE_SIZE + 6, r * TILE_SIZE + 6, 4, 4);
                } else if (tile === 3) {
                    ctx.fillStyle = '#ffb8ae';
                    ctx.beginPath();
                    ctx.arc(c * TILE_SIZE + 8, r * TILE_SIZE + 8, 6, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }

    update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        this.updateStateTimer();
        this.pacman.update();
        
        let blinky = this.ghosts.find(g => g.type === 'blinky');
        this.ghosts.forEach(ghost => ghost.update(this.pacman, blinky));
        
        this.checkCollisions();

        this.drawMap();
        this.pacman.draw();
        this.ghosts.forEach(ghost => ghost.draw());

        document.getElementById('score').innerText = `Score: ${this.score}`;
        
        requestAnimationFrame(() => this.update());
    }
}

const game = new GameEngine();
game.update();
