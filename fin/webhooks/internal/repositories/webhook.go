package repositories

import (
	"fmt"
	"time"

	"belvo-webhook-service/internal/models"

	"github.com/supabase-community/supabase-go"
	"go.uber.org/zap"
)

// WebhookRepository handles persistence of webhook events
type WebhookRepository struct {
	client *supabase.Client
	logger *zap.Logger
}

// NewWebhookRepository creates a new Webhook repository instance
func NewWebhookRepository(client *supabase.Client, logger *zap.Logger) *WebhookRepository {
	return &WebhookRepository{
		client: client,
		logger: logger,
	}
}

// SaveWebhookEvent stores the webhook event in the database
func (r *WebhookRepository) SaveWebhookEvent(event *models.WebhookEvent) error {
	r.logger.Info("Saving webhook event", zap.String("webhook_id", event.WebhookID))

	record := map[string]interface{}{
		"webhook_id":   event.WebhookID,
		"webhook_type": event.WebhookType,
		"process_type": event.ProcessType,
		"webhook_code": event.WebhookCode,
		"link_id":      event.LinkID,
		"request_id":   event.RequestID,
		"external_id":  event.ExternalID,
		"has_errors":   event.HasErrors(),
		"data":         event.Data,
		"processed_at": time.Now(),
	}

	if event.HasErrors() {
		errorDetails := map[string]interface{}{
			"errors": event.GetErrors(),
		}
		record["error_details"] = errorDetails
	}

	_, _, err := r.client.From("belvo_webhook_events").Insert(record, false, "", "", "").Execute()
	if err != nil {
		return fmt.Errorf("failed to save webhook event: %w", err)
	}

	r.logger.Info("Successfully saved webhook event", zap.String("webhook_id", event.WebhookID))
	return nil
}

