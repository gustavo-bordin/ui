package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"belvo-webhook-service/internal/config"
	"belvo-webhook-service/internal/handlers"
	"belvo-webhook-service/internal/services/belvo"
	"belvo-webhook-service/internal/services/storage"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"go.uber.org/zap"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize logger
	zapLogger, err := initLogger(cfg.Logging.Level)
	if err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	defer zapLogger.Sync()

	zapLogger.Info("Starting Belvo Webhook Service",
		zap.String("port", cfg.Server.Port),
		zap.String("belvo_api_url", cfg.Belvo.APIURL),
	)

	// Initialize Belvo client
	belvoClient := belvo.NewClient(
		cfg.Belvo.SecretID,
		cfg.Belvo.SecretPassword,
		cfg.Belvo.APIURL,
		zapLogger,
	)

	// Initialize Supabase storage
	supabaseStorage, err := storage.NewSupabaseStorage(
		cfg.Supabase.URL,
		cfg.Supabase.Key,
		zapLogger,
	)
	if err != nil {
		zapLogger.Fatal("Failed to initialize Supabase storage", zap.Error(err))
	}

	// Initialize webhook handler
	webhookHandler := handlers.NewWebhookHandler(belvoClient, supabaseStorage, zapLogger)

	// Create Fiber app
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			zapLogger.Error("Request error",
				zap.String("path", c.Path()),
				zap.String("method", c.Method()),
				zap.Error(err),
			)
			return c.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
	})

	// Middleware
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "${time} | ${status} | ${latency} | ${method} | ${path}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	// Routes
	app.Get("/health", webhookHandler.HealthCheck)
	app.Post("/webhooks/belvo", webhookHandler.HandleBelvoWebhook)

	// Start server in goroutine
	go func() {
		addr := fmt.Sprintf(":%s", cfg.Server.Port)
		zapLogger.Info("Server listening", zap.String("address", addr))
		if err := app.Listen(addr); err != nil {
			zapLogger.Fatal("Failed to start server", zap.Error(err))
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	zapLogger.Info("Shutting down server...")

	if err := app.Shutdown(); err != nil {
		zapLogger.Error("Error during shutdown", zap.Error(err))
	}

	zapLogger.Info("Server stopped gracefully")
}

// initLogger creates a new zap logger based on the log level
func initLogger(level string) (*zap.Logger, error) {
	var zapLevel zap.AtomicLevel
	switch level {
	case "debug":
		zapLevel = zap.NewAtomicLevelAt(zap.DebugLevel)
	case "info":
		zapLevel = zap.NewAtomicLevelAt(zap.InfoLevel)
	case "warn":
		zapLevel = zap.NewAtomicLevelAt(zap.WarnLevel)
	case "error":
		zapLevel = zap.NewAtomicLevelAt(zap.ErrorLevel)
	default:
		zapLevel = zap.NewAtomicLevelAt(zap.InfoLevel)
	}

	config := zap.NewProductionConfig()
	config.Level = zapLevel
	config.Encoding = "json"
	config.OutputPaths = []string{"stdout"}
	config.ErrorOutputPaths = []string{"stderr"}

	return config.Build()
}

