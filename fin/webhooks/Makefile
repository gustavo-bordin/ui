.PHONY: help build run test clean deps fmt lint

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

deps: ## Download dependencies
	@echo "Downloading dependencies..."
	@go mod download
	@go mod tidy

build: ## Build the application
	@echo "Building application..."
	@go build -o bin/belvo-webhook-service cmd/server/main.go

run: ## Run the application
	@echo "Running application..."
	@go run cmd/server/main.go

test: ## Run tests
	@echo "Running tests..."
	@go test -v -race -coverprofile=coverage.out ./...

fmt: ## Format code
	@echo "Formatting code..."
	@go fmt ./...
	@gofmt -s -w .

lint: ## Run linter
	@echo "Running linter..."
	@if command -v golangci-lint > /dev/null; then \
		golangci-lint run ./...; \
	else \
		echo "golangci-lint not installed. Install it from https://golangci-lint.run/usage/install/"; \
	fi

clean: ## Clean build artifacts
	@echo "Cleaning..."
	@rm -rf bin/
	@rm -f coverage.out

docker-build: ## Build Docker image
	@echo "Building Docker image..."
	@docker build -t belvo-webhook-service:latest .

docker-run: ## Run Docker container
	@echo "Running Docker container..."
	@docker run --env-file .env -p 8080:8080 belvo-webhook-service:latest

dev: ## Run with hot reload (requires air: go install github.com/cosmtrek/air@latest)
	@if command -v air > /dev/null; then \
		air; \
	else \
		echo "air not installed. Install it with: go install github.com/cosmtrek/air@latest"; \
		$(MAKE) run; \
	fi

