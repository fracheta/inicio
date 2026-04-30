import pygame
import random
from entities import Entity
from settings import *

vec = pygame.math.Vector2

class Ghost(Entity):
    def __init__(self, x, y, color_key: str):
        super().__init__(x, y)
        self.color = COLORS[color_key]
        self.direction = vec(1, 0)

    def update(self):
        if int(self.pix_pos.x) % TILE_SIZE == 0 and int(self.pix_pos.y) % TILE_SIZE == 0:
            self.grid_pos = self.pix_pos // TILE_SIZE
            self.direction = self.calculate_next_move()
        
        self.pix_pos += self.direction * self.speed

    def calculate_next_move(self) -> vec:
        directions = [vec(0,1), vec(0,-1), vec(1,0), vec(-1,0)]
        # Impede que o fantasma volte pelo caminho que veio (comportamento clássico)
        valid_moves = [d for d in directions if self.can_move(d) and d != -self.direction]
        
        if not valid_moves: # Bateu num beco sem saída
            return -self.direction
        return random.choice(valid_moves)

    def draw(self, screen: pygame.Surface):
        rect = (int(self.pix_pos.x + 4), int(self.pix_pos.y + 4), TILE_SIZE - 8, TILE_SIZE - 8)
        pygame.draw.rect(screen, self.color, rect, border_radius=6)
