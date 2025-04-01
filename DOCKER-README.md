# VirtuLearn Docker Setup

This document explains how to use Docker to run the VirtuLearn Learning Management System. The setup includes containers for the Django backend, React frontend, and MySQL database.

## Prerequisites

1. Install [Docker](https://docs.docker.com/get-docker/)
2. Install [Docker Compose](https://docs.docker.com/compose/install/)

## Environment Setup

1. Copy the example environment file:
   ```
   cp envexample.txt .env
   ```

2. Edit the `.env` file and update the values as needed for your environment.

## Development Environment

### Getting Started

The easiest way to start development is using the provided Makefile commands:

```bash
# Start all services (backend, frontend, database)
make up

# Or start in detached mode
make up-detach

# View logs
make logs

# Stop all services
make down

```

Or if you need help:

```bash
# Show commands
make help

```


### Individual Services

You can also start only specific services:

```bash
# Start only the backend and database
make up-backend

# Start only the frontend
make up-frontend
```

### Database Management

```bash
# Run migrations
make migrate

# Create new migrations
make makemigrations

# Initialize sample data
make init-data
```

### Other Development Commands

```bash
# Open Django shell
make shell

# Create a superuser
make createsuperuser

# Run tests
make test
```

## Production Environment

For production deployment, use the production-specific commands:

```bash
# Build production containers
make prod-build

# Start production environment
make prod-up

# View production logs
make prod-logs

# Stop production environment
make prod-down
```

## Manual Docker Commands

If you prefer not to use the Makefile, you can run the Docker Compose commands directly:

### Development

```bash
# Start all services
docker-compose up

# Build containers
docker-compose build

# Run migrations
docker-compose run --rm backend python manage.py migrate
```

### Production

```bash
# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Build production containers
docker-compose -f docker-compose.prod.yml build
```

## Directory Structure

```
virtulearn/
├── backend/                # Django application
│   ├── Dockerfile          # Backend Dockerfile
│   └── ...
├── frontend/               # React application
│   ├── Dockerfile.dev      # Frontend development Dockerfile
│   ├── Dockerfile.prod     # Frontend production Dockerfile
│   └── ...
├── docker-compose.yml      # Development Docker Compose config
├── docker-compose.prod.yml # Production Docker Compose config
├── Makefile                # Helpful commands
└── .env                    # Environment variables
```

## Troubleshooting

1. **Database connection issues**:
   - Ensure the MySQL container is running: `docker-compose ps`
   - Check the database logs: `docker-compose logs db`

2. **Frontend can't connect to backend**:
   - Verify that the `REACT_APP_API_URL` is set correctly in your `.env` file
   - Ensure CORS is properly configured in Django settings

3. **File permission issues**:
   - If you encounter permission issues with mounted volumes, you may need to adjust permissions:
     ```
     sudo chown -R $USER:$USER backend/media
     ```