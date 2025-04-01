.PHONY: up down build migrate makemigrations shell createsuperuser test help servers

# Default help command
help:
	@echo "VirtuLearn Docker Commands"
	@echo "--------------------------"
	@echo "make up               - Start all containers (backend, frontend, db)"
	@echo "make addr			 - Show backend and frontend server addresses"
	@echo "make up-backend       - Start only backend and db"
	@echo "make up-frontend      - Start only frontend"
	@echo "make down             - Stop all containers"
	@echo "make build            - Build all containers"
	@echo "make migrate          - Run Django migrations"
	@echo "make makemigrations   - Create new Django migrations"
	@echo "make shell            - Open Django shell"
	@echo "make createsuperuser  - Create Django superuser"
	@echo "make test             - Run Django tests"
	@echo "make logs             - View all container logs"
	@echo "make init-data        - Initialize data (add admins, courses, etc.)"
	@echo "make prod-up          - Start production containers"
	@echo "make prod-build       - Build production containers"

addr:
	@echo "Backend server: http://localhost:8000"
	@echo "Frontend server: http://localhost:3000"

# Development commands
up:
	docker-compose up

up-detach:
	docker-compose up -d

up-backend:
	docker-compose up db backend

up-frontend:
	docker-compose up frontend

down:
	docker-compose down

build:
	docker-compose build

logs:
	docker-compose logs -f

migrate:
	docker-compose run --rm backend python manage.py migrate

makemigrations:
	docker-compose run --rm backend python manage.py makemigrations

shell:
	docker-compose run --rm backend python manage.py shell

createsuperuser:
	docker-compose run --rm backend python manage.py createsuperuser

test:
	docker-compose run --rm backend python manage.py test

init-data:
	docker-compose run --rm backend python manage.py add_admins
	docker-compose run --rm backend python manage.py add_courses
	docker-compose run --rm backend python manage.py add_lessons
	docker-compose run --rm backend python manage.py add_events

# Production commands
prod-up:
	docker-compose -f docker-compose.prod.yml up -d

prod-down:
	docker-compose -f docker-compose.prod.yml down

prod-build:
	docker-compose -f docker-compose.prod.yml build

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f