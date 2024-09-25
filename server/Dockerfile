# Usa una imagen base oficial de Python
FROM python:3.11

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia los archivos del proyecto al contenedor
COPY . .
RUN pip install --upgrade pip
# Instala las dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Expone el puerto en el que correrá la app
EXPOSE 5000

# Comando para ejecutar tu aplicación
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000"]
