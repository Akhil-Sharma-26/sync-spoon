# using the slim version, light weight
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

# I don't want pip to store teh dowloaded packages and build artificated in its local cahce
# so less space is used
RUN pip install --no-cache-dir -r requirements.txt

ENV PYTHONPATH="/app:/app/scripts"

COPY . .

EXPOSE 5000

ENV FLASK_APP=scripts/server.py

# Green unicorn: WSGI HTTP server
# Using gunicorn for a production ready server
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--chdir", "/app/scripts", "server:app"]
# scripts.server:app" is the import path Gunicorn uses: import scripts.server, then use the variable/app callable named app (for Flask)