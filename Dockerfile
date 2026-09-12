FROM python:3.12-slim

WORKDIR /app

COPY pyproject.toml README.md ./
COPY main.py ./
COPY app ./app
COPY kb.json ./

RUN pip install --no-cache-dir .

# База данных живёт в примонтированном томе (см. docker-compose.yml),
# чтобы данные переживали пересборку образа.
ENV DATABASE_URL=sqlite:////data/app.db
RUN mkdir -p /data

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
