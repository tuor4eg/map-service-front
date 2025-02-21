env:
	@cat .env.example > .env
env-production:
	@cat .env.example | sed s/NODE_ENV=development/NODE_ENV=production/ > .env

install: env-production
	@npm i -S

install-dev: env
	@npm i -S -D

dev:
	@npm run dev

docker-build:
	@docker-compose build

docker-up:
	@docker-compose up -d

docker-down:
	@docker-compose down

docker-rebuild: docker-down docker-build docker-up