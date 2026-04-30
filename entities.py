import pygame
from settings import *

vec = pygame.math.Vector2

class Entity(pygame.sprite.Sprite):
    """Classe base para todos os objetos móveis do jogo."""
    def __init__(self, x: int, y: int):
        super().__init__()
        self.grid_pos = vec(x, y)
        self.pix_pos = vec(x * TILE_SIZE, y * TILE_SIZE)
        self.direction = vec(0, 0)
        self.speed = 2

    def can_move(self, direction: vec) -> bool:
        target = self.grid_pos + direction
        if 0 <= target.x < MAP_WIDTH and 0 <= target.y < MAP_HEIGHT:
            return BOARD[int(target.y)][int(target.x)] != "1"
        return False

class Player(Entity):
    def __init__(self, x, y):
        super().__init__(x, y)
        self.next_dir = vec(0, 0)

    def update(self):
        # Verifica se está centralizado no tile para decidir nova direção
        if int(self.pix_pos.x) % TILE_SIZE == 0 and int(self.pix_pos.y) % TILE_SIZE == 0:
            self.grid_pos = self.pix_pos // TILE_SIZE
            if self.can_move(self.next_dir):
                self.direction = self.next_dir
            if not self.can_move(self.direction):
                self.direction = vec(0, 0)

        self.pix_pos += self.direction * self.speed

    def draw(self, screen: pygame.Surface):
        pos = (int(self.pix_pos.x + TILE_SIZE//2), int(self.pix_pos.y + TILE_SIZE//2))
        pygame.draw.circle(screen, COLORS["pacman"], pos, TILE_SIZE//2 - 3)
