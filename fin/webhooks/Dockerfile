# Build stage
FROM golang:1.25-alpine AS builder

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o fin-webhooks cmd/server/main.go

# Runtime stage
FROM alpine:latest

# Set working directory
WORKDIR /home/app

# Copy binary from builder
COPY --from=builder /app/fin-webhooks .

# Run the application
CMD ["./fin-webhooks"]

