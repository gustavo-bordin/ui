package services

import (
	"fmt"

	"belvo-webhook-service/internal/clients"
	"belvo-webhook-service/internal/models"
	"belvo-webhook-service/internal/repositories"

	"go.uber.org/zap"
)

type WebhookService struct {
	belvoClient       *clients.BelvoClient
	webhookRepo       *repositories.WebhookRepository
	belvoRepo         *repositories.BelvoRepository
	logger            *zap.Logger
}

func NewWebhookService(
	belvoClient *clients.BelvoClient,
	webhookRepo *repositories.WebhookRepository,
	belvoRepo *repositories.BelvoRepository,
	logger *zap.Logger,
) *WebhookService {
	return &WebhookService{
		belvoClient: belvoClient,
		webhookRepo: webhookRepo,
		belvoRepo:   belvoRepo,
		logger:      logger,
	}
}

func (s *WebhookService) SaveWebhookEvent(event *models.WebhookEvent) error {
	err := s.webhookRepo.SaveWebhookEvent(event)
	if err != nil {
		s.logger.Error("Failed to save webhook event", zap.Error(err))
		return err
	}
	return nil
}

func (s *WebhookService) ProcessWebhook(event *models.WebhookEvent) error {
	switch event.WebhookType {
	case models.WebhookTypeOwners:
		return s.processOwners(event)
	default:
		s.logger.Warn("Unsupported webhook type", zap.String("type", event.WebhookType))
		return nil
	}
}

func (s *WebhookService) processOwners(event *models.WebhookEvent) error {
	s.logger.Info("Processing owners webhook",
		zap.String("link_id", event.LinkID),
		zap.String("process_type", event.ProcessType),
	)

	owners, err := s.belvoClient.FetchOwners(event.LinkID)
	if err != nil {
		return fmt.Errorf("failed to fetch owners: %w", err)
	}

	err = s.belvoRepo.SaveOwners(owners, event.LinkID)
	if err != nil {
		return fmt.Errorf("failed to save owners: %w", err)
	}

	s.logger.Info("Successfully processed owners",
		zap.String("link_id", event.LinkID),
		zap.Int("count", len(owners)),
	)

	return nil
}

