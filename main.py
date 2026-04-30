import pygame
import sys
from settings import *
from entities import Player
from ghosts import Ghost

class PacmanGame:
    def __init__(self):
        pygame.init()
        self.screen = pygame.display.set_mode((WIDTH, HEIGHT))
        pygame.display.set_caption("Pac-Man | Portfolio Edition")
        self.clock = pygame.time.Clock()
        self.score = 0
        self.pellets = []
        self._setup_world()

    def _setup_world(self):
        """Inicializa o mapa e as entidades com base na matriz BOARD."""
        self.ghosts = []
        for y, row in enumerate(BOARD):
            for x, char in enumerate(row):
                if char == "0":
                    self.pellets.append(pygame.math.Vector2(x, y))
                elif char == "P":
                    self.player = Player(x, y)
                elif char == "G" or (x == 9 and y == 9): # Spawn de fantasmas
                    self.ghosts.append(Ghost(x, y, "ghost_red"))

    def check_collisions(self):
        # Colisão com pastilhas
        if self.player.grid_pos in self.pellets:
            self.pellets.remove(self.player.grid_pos)
            self.score += 10

        # Colisão com fantasmas
        for ghost in self.ghosts:
            if ghost.grid_pos == self.player.grid_pos:
                self._game_over()

    def _game_over(self):
        print(f"Fim de Jogo! Pontuação Final: {self.score}")
        pygame.quit()
        sys.exit()

    def draw(self):
        self.screen.fill(COLORS["bg"])
        
        # Renderização do Labirinto
        for y, row in enumerate(BOARD):
            for x, char in enumerate(row):
                if char == "1":
                    pygame.draw.rect(self.screen, COLORS["wall"], 
                                   (x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE), 1)
        
        # Renderização das Pastilhas
        for pellet in self.pellets:
            pygame.draw.circle(self.screen, COLORS["pellet"], 
                             (int(pellet.x*TILE_SIZE + TILE_SIZE//2), 
                              int(pellet.y*TILE_SIZE + TILE_SIZE//2)), 3)

        self.player.draw(self.screen)
        for ghost in self.ghosts:
            ghost.draw(self.screen)

        pygame.display.flip()

    def run(self):
        while True:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                if event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_UP: self.player.next_dir = pygame.math.Vector2(0, -1)
                    if event.key == pygame.K_DOWN: self.player.next_dir = pygame.math.Vector2(0, 1)
                    if event.key == pygame.K_LEFT: self.player.next_dir = pygame.math.Vector2(-1, 0)
                    if event.key == pygame.K_RIGHT: self.player.next_dir = pygame.math.Vector2(1, 0)

            self.player.update()
            for ghost in self.ghosts:
                ghost.update()
            
            self.check_collisions()
            self.draw()
            self.clock.tick(FPS)

if __name__ == "__main__":
    game = PacmanGame()
    game.run()
