package main

import (
	"context"
	"encoding/json"
	"log"

	"belvo-webhook-service/internal/clients"
	"belvo-webhook-service/internal/config"
	"belvo-webhook-service/internal/logger"
	"belvo-webhook-service/internal/models"
	"belvo-webhook-service/internal/repositories"
	"belvo-webhook-service/internal/services"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"go.uber.org/zap"
)

var (
	webhookService *services.WebhookService
	zapLogger      *zap.Logger
)

func init() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	zapLogger, err = logger.InitLogger()
	if err != nil {
		log.Fatalf("Failed to init logger: %v", err)
	}

	zapLogger.Info("Initializing Lambda",
		zap.String("belvo_api_url", cfg.Belvo.APIURL),
		zap.String("supabase_url", cfg.Supabase.URL),
	)

	belvoClient := clients.NewBelvoClient(
		cfg.Belvo.SecretID,
		cfg.Belvo.SecretPassword,
		cfg.Belvo.APIURL,
		zapLogger,
	)

	supabaseClient, err := clients.NewSupabaseClient(
		cfg.Supabase.URL,
		cfg.Supabase.PublishableKey,
	)
	if err != nil {
		log.Fatalf("Failed to init Supabase: %v", err)
	}

	webhookRepo := repositories.NewWebhookRepository(supabaseClient, zapLogger)
	belvoRepo := repositories.NewBelvoRepository(supabaseClient, zapLogger)

	webhookService = services.NewWebhookService(belvoClient, webhookRepo, belvoRepo, zapLogger)
}

func handler(ctx context.Context, request events.LambdaFunctionURLRequest) (events.LambdaFunctionURLResponse, error) {
	zapLogger.Info("Received request",
		zap.String("method", request.RequestContext.HTTP.Method),
		zap.String("path", request.RequestContext.HTTP.Path),
	)

	var event models.WebhookEvent
	bodyBytes := []byte(request.Body)
	err := json.Unmarshal(bodyBytes, &event)
	if err != nil {
		zapLogger.Error("Invalid JSON", zap.Error(err))
		errResponse := map[string]string{
			"error": "Invalid webhook payload",
		}
		return jsonResponse(400, errResponse), nil
	}

	zapLogger.Info("Processing webhook",
		zap.String("webhook_id", event.WebhookID),
		zap.String("webhook_type", event.WebhookType),
		zap.String("link_id", event.LinkID),
	)

	err = webhookService.SaveWebhookEvent(&event)
	if err != nil {
		zapLogger.Error("Failed to save webhook", zap.Error(err))
	}

	if event.HasErrors() {
		zapLogger.Warn("Webhook contains errors",
			zap.String("webhook_id", event.WebhookID),
			zap.Any("errors", event.GetErrors()),
		)
		errResponse := map[string]interface{}{
			"status":  "error",
			"message": "Webhook contains errors",
			"errors":  event.GetErrors(),
		}
		return jsonResponse(400, errResponse), nil
	}

	err = webhookService.ProcessWebhook(&event)
	if err != nil {
		zapLogger.Error("Failed to process webhook",
			zap.String("webhook_id", event.WebhookID),
			zap.Error(err),
		)
		errResponse := map[string]string{
			"status":  "error",
			"message": err.Error(),
		}
		return jsonResponse(500, errResponse), nil
	}

	zapLogger.Info("Webhook processed successfully",
		zap.String("webhook_id", event.WebhookID),
	)

	return jsonResponse(200, map[string]string{
		"status":  "success",
		"message": "Webhook processed successfully",
	}), nil
}

func jsonResponse(statusCode int, body interface{}) events.LambdaFunctionURLResponse {
	jsonBody, _ := json.Marshal(body)
	return events.LambdaFunctionURLResponse{
		StatusCode: statusCode,
		Headers: map[string]string{
			"Content-Type": "application/json",
		},
		Body: string(jsonBody),
	}
}

func main() {
	lambda.Start(handler)
}
