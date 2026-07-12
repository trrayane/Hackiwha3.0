FROM python:3.11-slim

WORKDIR /app

# System deps: ffmpeg (pydub audio conversion), libsndfile1 (librosa/soundfile),
# build-essential (compiling native extensions like psola/numba deps).
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p uploads/reference_audio uploads/generated

EXPOSE 8100

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]
# Render (and most PaaS) inject $PORT and route traffic to it; default to
# 8100 for local `docker run` where no PORT is set.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8100}"]
