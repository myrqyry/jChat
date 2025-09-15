# jChat Backend

Backend API for the jChat application built with FastAPI.

## Features

- Real-time chat WebSocket support
- Theme management API
- CORS enabled for frontend integration
- FastAPI with automatic OpenAPI documentation

## Development

```bash
# Install dependencies
poetry install

# Run development server
poetry run uvicorn jchat_backend.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

When running, visit `http://localhost:8000/docs` for interactive API documentation.