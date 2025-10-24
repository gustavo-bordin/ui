package repositories

import (
	"fmt"

	"belvo-webhook-service/internal/models"

	"github.com/supabase-community/supabase-go"
	"go.uber.org/zap"
)

// BelvoRepository handles persistence of Belvo financial data
type BelvoRepository struct {
	client *supabase.Client
	logger *zap.Logger
}

// NewBelvoRepository creates a new Belvo repository instance
func NewBelvoRepository(client *supabase.Client, logger *zap.Logger) *BelvoRepository {
	return &BelvoRepository{
		client: client,
		logger: logger,
	}
}

// SaveOwners stores Belvo owners in the database
func (r *BelvoRepository) SaveOwners(owners []models.BelvoOwner, linkID string) error {
	r.logger.Info("Saving owners", zap.Int("count", len(owners)), zap.String("link_id", linkID))

	for _, owner := range owners {
		record, err := owner.ToOwnerRecord(linkID)
		if err != nil {
			r.logger.Error("Failed to convert owner to record", zap.Error(err))
			continue
		}

		_, _, err = r.client.From("belvo_owners").Upsert(record, "belvo_id", "", "").Execute()
		if err != nil {
			r.logger.Error("Failed to save owner", zap.String("owner_id", owner.ID), zap.Error(err))
			return fmt.Errorf("failed to save owner %s: %w", owner.ID, err)
		}
	}

	r.logger.Info("Successfully saved owners", zap.Int("count", len(owners)))
	return nil
}


