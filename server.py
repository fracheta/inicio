from flask import Flask, send_from_directory, jsonify, request
import os

app = Flask(__name__, static_folder='.')

# Banco de dados em memória simples para o exemplo
high_scores = [{"name": "CPU", "score": 10000}]

@app.route('/')
def serve_ind():
    return send_from_directory('.', 'ind.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/api/score', methods=['GET', 'POST'])
def manage_scores():
    if request.method == 'POST':
        data = request.json
        high_scores.append({"name": data.get("name", "Player"), "score": data.get("score", 0)})
        high_scores.sort(key=lambda x: x['score'], reverse=True)
        return jsonify({"status": "success", "top_scores": high_scores[:5]})
    return jsonify(high_scores[:5])

if __name__ == '__main__':
    print("Servidor rodando em http://localhost:5000")
    app.run(port=5000, debug=True)
