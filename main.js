import { TILE_SIZE, COLORS, BOARD } from './settings.js';
import { Player } from './entities.js';
import { Ghost } from './ghosts.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = BOARD[0].length * TILE_SIZE;
canvas.height = BOARD.length * TILE_SIZE;

const player = new Player(1, 1);
const ghosts = [new Ghost(9, 7), new Ghost(1, 7)];

function loop() {
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenha Labirinto
    BOARD.forEach((row, y) => {
        row.split("").forEach((char, x) => {
            if (char === "1") {
                ctx.fillStyle = COLORS.wall;
                ctx.fillRect(x * TILE_SIZE + 1, y * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);
            } else if (char === "0") {
                ctx.fillStyle = COLORS.pellet;
                ctx.beginPath();
                ctx.arc(x * TILE_SIZE + TILE_SIZE/2, y * TILE_SIZE + TILE_SIZE/2, 2, 0, Math.PI*2);
                ctx.fill();
            }
        });
    });

    player.update();
    player.draw(ctx);

    ghosts.forEach(g => {
        g.update();
        g.draw(ctx);
        // Colisão Game Over
        if (Math.hypot(player.x - g.x, player.y - g.y) < TILE_SIZE * 0.8) {
            alert("Game Over!");
            location.reload();
        }
    });

    requestAnimationFrame(loop);
}

window.addEventListener('keydown', (e) => {
    const keys = {
        ArrowUp: {x:0, y:-1}, ArrowDown: {x:0, y:1},
        ArrowLeft: {x:-1, y:0}, ArrowRight: {x:1, y:0}
    };
    if (keys[e.key]) player.nextDir = keys[e.key];
});

loop();
