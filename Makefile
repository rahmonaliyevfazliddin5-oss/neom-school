.PHONY: help install build dev up down restart migrate seed test lint typecheck clean

# Default target
help:
	@echo "========================================================================"
	@echo "                   NEOM School Platform - Commands                      "
	@echo "========================================================================"
	@echo "  make install     - Install all dependencies across monorepo"
	@echo "  make build       - Build shared package, API, and Next.js web"
	@echo "  make dev         - Run API and Web in development mode locally"
	@echo "  make up          - Start all docker containers (Postgres, Redis, API, Web, Nginx)"
	@echo "  make down        - Stop and remove all docker containers"
	@echo "  make migrate     - Run Prisma database migrations"
	@echo "  make seed        - Seed initial database data (Director, Zavuch, Teachers, Classes)"
	@echo "  make test        - Run API unit and integration tests"
	@echo "  make lint        - Run ESLint checks"
	@echo "  make typecheck   - Run TypeScript type checks across all workspaces"
	@echo "  make clean       - Remove dist, build artifacts, and node_modules"
	@echo "========================================================================"

install:
	pnpm install

build:
	pnpm build

dev:
	pnpm dev

up:
	docker compose up -d --build

down:
	docker compose down -v

restart:
	docker compose restart

migrate:
	pnpm --filter "@neom/api" prisma:migrate

seed:
	pnpm --filter "@neom/api" prisma:seed

test:
	pnpm test

lint:
	pnpm lint

typecheck:
	pnpm typecheck

clean:
	pnpm clean
