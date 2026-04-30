# executor.py
import http.server
import socketserver

PORT = 8080

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Adiciona headers de cache para o jogo rodar liso
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
    print(f"Arcade Server rodando em http://localhost:{PORT}")
    httpd.serve_forever()
