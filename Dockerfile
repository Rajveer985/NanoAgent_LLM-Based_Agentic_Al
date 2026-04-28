FROM python:3.10-slim

WORKDIR /app

COPY . /app

RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip

RUN if [ -f requirements.txt ]; then pip install -r requirements.txt; fi

EXPOSE 8080

CMD ["python", "app.py"]
