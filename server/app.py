import os
from flask import Flask, request, jsonify
import chatbot_gui  # Importa tu archivo chatbot_gui.py
from flask_cors import CORS

app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": "*"}})
# Ruta para manejar los mensajes de chat
@app.route('/api/chat', methods=['OPTIONS', 'POST'])
def chat():
    if request.method == 'OPTIONS':
        # Respuesta para las solicitudes OPTIONS
        response = jsonify({'message': 'CORS preflight response'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response

    if request.method == 'POST':
        try:
            user_message = request.json.get('message')
            if not user_message:
                return jsonify({'error': 'No message provided.'}), 400
            
            # Llamada a la función que maneja la respuesta del chatbot
            response = chatbot_gui.get_response(user_message)  
            return jsonify({'response': response})
        except Exception as e:
            return jsonify({'error': str(e)}), 500




if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

