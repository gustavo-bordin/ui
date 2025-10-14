package handlers

import (
	"context"
	"fmt"

	"belvo-webhook-service/internal/models"
	"belvo-webhook-service/internal/services/belvo"
	"belvo-webhook-service/internal/services/storage"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

// WebhookHandler handles Belvo webhook requests
type WebhookHandler struct {
	belvoClient *belvo.Client
	storage     *storage.SupabaseStorage
	logger      *zap.Logger
}

// NewWebhookHandler creates a new webhook handler
func NewWebhookHandler(belvoClient *belvo.Client, storage *storage.SupabaseStorage, logger *zap.Logger) *WebhookHandler {
	return &WebhookHandler{
		belvoClient: belvoClient,
		storage:     storage,
		logger:      logger,
	}
}

// HandleBelvoWebhook processes incoming Belvo webhooks
func (h *WebhookHandler) HandleBelvoWebhook(c *fiber.Ctx) error {
	ctx := context.Background()

	// Parse webhook event
	var event models.WebhookEvent
	if err := c.BodyParser(&event); err != nil {
		h.logger.Error("Failed to parse webhook body", zap.Error(err))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid webhook payload",
		})
	}

	h.logger.Info("Received webhook",
		zap.String("webhook_id", event.WebhookID),
		zap.String("webhook_type", event.WebhookType),
		zap.String("process_type", event.ProcessType),
		zap.String("link_id", event.LinkID),
	)

	// Save webhook event
	if err := h.storage.SaveWebhookEvent(ctx, &event); err != nil {
		h.logger.Error("Failed to save webhook event", zap.Error(err))
		// Continue processing even if saving the event fails
	}

	// Check for errors in webhook
	if event.HasErrors() {
		h.logger.Warn("Webhook contains errors",
			zap.String("webhook_id", event.WebhookID),
			zap.Any("errors", event.GetErrors()),
		)
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "error",
			"message": "Webhook contains errors",
			"errors":  event.GetErrors(),
		})
	}

	// Get user_id from link_id
	userID, err := h.storage.GetUserIDByLinkID(ctx, event.LinkID)
	if err != nil {
		h.logger.Error("Failed to get user_id for link_id",
			zap.String("link_id", event.LinkID),
			zap.Error(err),
		)
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "error",
			"message": "User not found for link_id",
		})
	}

	// Process webhook based on type
	if err := h.processWebhook(ctx, &event, userID); err != nil {
		h.logger.Error("Failed to process webhook",
			zap.String("webhook_id", event.WebhookID),
			zap.Error(err),
		)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Webhook processed successfully",
	})
}

// processWebhook handles the webhook based on its type
func (h *WebhookHandler) processWebhook(ctx context.Context, event *models.WebhookEvent, userID string) error {
	switch event.WebhookType {
	case models.WebhookTypeOwners:
		return h.processOwners(ctx, event, userID)
	case models.WebhookTypeAccounts:
		return h.processAccounts(ctx, event, userID)
	case models.WebhookTypeTransactions:
		return h.processTransactions(ctx, event, userID)
	default:
		h.logger.Warn("Unsupported webhook type", zap.String("type", event.WebhookType))
		return nil // Not an error, just unsupported
	}
}

// processOwners fetches and stores owners data
func (h *WebhookHandler) processOwners(ctx context.Context, event *models.WebhookEvent, userID string) error {
	h.logger.Info("Processing owners webhook",
		zap.String("link_id", event.LinkID),
		zap.String("process_type", event.ProcessType),
	)

	// Fetch owners from Belvo
	owners, err := h.belvoClient.FetchOwners(event.LinkID)
	if err != nil {
		return fmt.Errorf("failed to fetch owners: %w", err)
	}

	if len(owners) == 0 {
		h.logger.Warn("No owners found", zap.String("link_id", event.LinkID))
		return nil
	}

	// Save owners to Supabase
	if err := h.storage.SaveOwners(ctx, owners, event.LinkID, userID); err != nil {
		return fmt.Errorf("failed to save owners: %w", err)
	}

	h.logger.Info("Successfully processed owners",
		zap.String("link_id", event.LinkID),
		zap.Int("count", len(owners)),
	)

	return nil
}

// processAccounts fetches and stores accounts data
func (h *WebhookHandler) processAccounts(ctx context.Context, event *models.WebhookEvent, userID string) error {
	h.logger.Info("Processing accounts webhook",
		zap.String("link_id", event.LinkID),
		zap.String("process_type", event.ProcessType),
	)

	// Fetch accounts from Belvo
	accounts, err := h.belvoClient.FetchAccounts(event.LinkID)
	if err != nil {
		return fmt.Errorf("failed to fetch accounts: %w", err)
	}

	if len(accounts) == 0 {
		h.logger.Warn("No accounts found", zap.String("link_id", event.LinkID))
		return nil
	}

	// Save accounts to Supabase
	if err := h.storage.SaveAccounts(ctx, accounts, event.LinkID, userID); err != nil {
		return fmt.Errorf("failed to save accounts: %w", err)
	}

	h.logger.Info("Successfully processed accounts",
		zap.String("link_id", event.LinkID),
		zap.Int("count", len(accounts)),
	)

	return nil
}

// processTransactions fetches and stores transactions data
func (h *WebhookHandler) processTransactions(ctx context.Context, event *models.WebhookEvent, userID string) error {
	h.logger.Info("Processing transactions webhook",
		zap.String("link_id", event.LinkID),
		zap.String("process_type", event.ProcessType),
	)

	// Fetch transactions from Belvo
	transactions, err := h.belvoClient.FetchTransactions(event.LinkID)
	if err != nil {
		return fmt.Errorf("failed to fetch transactions: %w", err)
	}

	if len(transactions) == 0 {
		h.logger.Warn("No transactions found", zap.String("link_id", event.LinkID))
		return nil
	}

	// Save transactions to Supabase
	if err := h.storage.SaveTransactions(ctx, transactions, event.LinkID, userID); err != nil {
		return fmt.Errorf("failed to save transactions: %w", err)
	}

	h.logger.Info("Successfully processed transactions",
		zap.String("link_id", event.LinkID),
		zap.Int("count", len(transactions)),
	)

	return nil
}

// HealthCheck handles health check requests
func (h *WebhookHandler) HealthCheck(c *fiber.Ctx) error {
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "healthy",
		"service": "belvo-webhook-service",
	})
}

