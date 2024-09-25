from flask import Flask, jsonify
import os
import json
import numpy as np
from tensorflow.keras.models import load_model
import random
import pickle
import re

app = Flask(__name__)

# Rutas de archivos
base_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_dir, 'chatbot_model.h5')
intents_path = os.path.join(base_dir, 'intentos.json')
words_path = os.path.join(base_dir, 'words.pkl')
classes_path = os.path.join(base_dir, 'classes.pkl')

# Carga el modelo de Keras
try:
    model = load_model(model_path)
except Exception as e:
    print(f"Error al cargar el modelo: {e}")

# Carga los intents desde el archivo JSON
try:
    with open(intents_path, encoding='utf-8') as file:
        intents = json.load(file)
except Exception as e:
    print(f"Error al cargar intents.json: {e}")

# Carga las palabras y las clases
try:
    words = pickle.load(open(words_path, 'rb'))
    classes = pickle.load(open(classes_path, 'rb'))
except Exception as e:
    print(f"Error al cargar palabras o clases: {e}")

# Función para limpiar la entrada del usuario
def clean_up_sentence(sentence):
    sentence = sentence.lower()
    sentence = re.sub(r'[^\w\s]', '', sentence)  # Elimina caracteres especiales
    return sentence

# Función para crear la "bolsa de palabras" (Bag of Words) para la entrada
def bow(sentence, words):
    """
    Convierte la oración de entrada en una bolsa de palabras.
    """
    sentence_words = re.findall(r'\b\w+\b', sentence)  # Tokenización simple usando regex
    bag = [0] * len(words)
    for s in sentence_words:
        for i, w in enumerate(words):
            if w == s:
                bag[i] = 1
    return np.array(bag)

# Función principal para obtener la respuesta del chatbot
def get_response(user_input):
    try:
        # Preprocesa la entrada del usuario
        user_input = clean_up_sentence(user_input)
        bag = bow(user_input, words)
        # Realiza la predicción con el modelo cargado
        res = model.predict(np.array([bag]))[0]
        ERROR_THRESHOLD = 0.25
        results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]
        results.sort(key=lambda x: x[1], reverse=True)
        return_list = []
        for r in results:
            return_list.append({"intent": classes[r[0]], "probability": str(r[1])})
        if return_list:
            intent = return_list[0]['intent']
            for i in intents['intents']:
                if i['tag'] == intent:
                    return random.choice(i['responses'])
        return "No entiendo tu pregunta."
    except Exception as e:
        print(f"Error al obtener respuesta: {e}")
        return "Ocurrió un error al procesar tu solicitud."

