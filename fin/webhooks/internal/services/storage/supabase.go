package storage

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"belvo-webhook-service/internal/models"

	"github.com/supabase-community/supabase-go"
	"go.uber.org/zap"
)

// SupabaseStorage handles data persistence in Supabase
type SupabaseStorage struct {
	client *supabase.Client
	logger *zap.Logger
}

// NewSupabaseStorage creates a new Supabase storage instance
func NewSupabaseStorage(url, key string, logger *zap.Logger) (*SupabaseStorage, error) {
	client, err := supabase.NewClient(url, key, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create supabase client: %w", err)
	}

	return &SupabaseStorage{
		client: client,
		logger: logger,
	}, nil
}

// SaveWebhookEvent stores the webhook event in the database
func (s *SupabaseStorage) SaveWebhookEvent(ctx context.Context, event *models.WebhookEvent) error {
	s.logger.Info("Saving webhook event", zap.String("webhook_id", event.WebhookID))

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

	_, _, err := s.client.From("belvo_webhook_events").Insert(record, false, "", "", "").Execute()
	if err != nil {
		return fmt.Errorf("failed to save webhook event: %w", err)
	}

	s.logger.Info("Successfully saved webhook event", zap.String("webhook_id", event.WebhookID))
	return nil
}

// GetUserIDByLinkID retrieves the user_id associated with a Belvo link_id
func (s *SupabaseStorage) GetUserIDByLinkID(ctx context.Context, linkID string) (string, error) {
	s.logger.Info("Looking up user_id for link_id", zap.String("link_id", linkID))

	var result []map[string]interface{}
	_, err := s.client.From("user_onboarding").
		Select("user_id", "", false).
		Eq("belvo_link_id", linkID).
		Single().
		ExecuteTo(&result)

	if err != nil {
		return "", fmt.Errorf("failed to get user_id: %w", err)
	}

	if len(result) == 0 {
		return "", fmt.Errorf("no user found for link_id: %s", linkID)
	}

	userID, ok := result[0]["user_id"].(string)
	if !ok {
		return "", fmt.Errorf("invalid user_id format")
	}

	s.logger.Info("Found user_id", zap.String("user_id", userID), zap.String("link_id", linkID))
	return userID, nil
}

// SaveOwners stores Belvo owners in the database
func (s *SupabaseStorage) SaveOwners(ctx context.Context, owners []models.BelvoOwner, linkID, userID string) error {
	s.logger.Info("Saving owners", zap.Int("count", len(owners)), zap.String("link_id", linkID))

	for _, owner := range owners {
		rawDataJSON, err := json.Marshal(owner.RawData)
		if err != nil {
			s.logger.Error("Failed to marshal owner raw data", zap.Error(err))
			continue
		}

		record := map[string]interface{}{
			"belvo_id":                owner.ID,
			"link_id":                 linkID,
			"user_id":                 userID,
			"email":                   owner.Email,
			"phone_number":            owner.PhoneNumber,
			"display_name":            owner.DisplayName,
			"first_name":              owner.FirstName,
			"last_name":               owner.LastName,
			"second_last_name":        owner.SecondLastName,
			"address":                 owner.Address,
			"internal_identification": owner.InternalIdentification,
			"collected_at":            owner.CollectedAt,
			"raw_data":                string(rawDataJSON),
		}

		_, _, err = s.client.From("belvo_owners").Upsert(record, "belvo_id", "", "").Execute()
		if err != nil {
			s.logger.Error("Failed to save owner", zap.String("owner_id", owner.ID), zap.Error(err))
			return fmt.Errorf("failed to save owner %s: %w", owner.ID, err)
		}
	}

	s.logger.Info("Successfully saved owners", zap.Int("count", len(owners)))
	return nil
}

// SaveAccounts stores Belvo accounts in the database
func (s *SupabaseStorage) SaveAccounts(ctx context.Context, accounts []models.BelvoAccount, linkID, userID string) error {
	s.logger.Info("Saving accounts", zap.Int("count", len(accounts)), zap.String("link_id", linkID))

	for _, account := range accounts {
		rawDataJSON, err := json.Marshal(account.RawData)
		if err != nil {
			s.logger.Error("Failed to marshal account raw data", zap.Error(err))
			continue
		}

		record := map[string]interface{}{
			"belvo_id":                   account.ID,
			"link_id":                    linkID,
			"user_id":                    userID,
			"name":                       account.Name,
			"number":                     account.Number,
			"type":                       account.Type,
			"balance_type":               account.BalanceType,
			"currency":                   account.Currency,
			"internal_identification":    account.InternalIdentification,
			"public_identification_name": account.PublicIdentificationName,
			"public_identification_value": account.PublicIdentificationValue,
			"collected_at":               account.CollectedAt,
			"raw_data":                   string(rawDataJSON),
		}

		if account.Institution != nil {
			record["institution"] = account.Institution.Name
		}

		if account.Balance != nil {
			record["balance_current"] = account.Balance.Current
			record["balance_available"] = account.Balance.Available
		}

		if account.LastAccessedAt != nil {
			record["last_accessed_at"] = account.LastAccessedAt
		}

		if account.CreditData != nil {
			creditDataJSON, _ := json.Marshal(account.CreditData)
			record["credit_data"] = string(creditDataJSON)
		}

		if account.LoanData != nil {
			loanDataJSON, _ := json.Marshal(account.LoanData)
			record["loan_data"] = string(loanDataJSON)
		}

		if account.FundsData != nil {
			fundsDataJSON, _ := json.Marshal(account.FundsData)
			record["funds_data"] = string(fundsDataJSON)
		}

		_, _, err = s.client.From("belvo_accounts").Upsert(record, "belvo_id", "", "").Execute()
		if err != nil {
			s.logger.Error("Failed to save account", zap.String("account_id", account.ID), zap.Error(err))
			return fmt.Errorf("failed to save account %s: %w", account.ID, err)
		}
	}

	s.logger.Info("Successfully saved accounts", zap.Int("count", len(accounts)))
	return nil
}

// SaveTransactions stores Belvo transactions in the database
func (s *SupabaseStorage) SaveTransactions(ctx context.Context, transactions []models.BelvoTransaction, linkID, userID string) error {
	s.logger.Info("Saving transactions", zap.Int("count", len(transactions)), zap.String("link_id", linkID))

	// Get account mappings (belvo_id to internal id)
	accountMap, err := s.getAccountMapping(ctx, linkID)
	if err != nil {
		s.logger.Error("Failed to get account mapping", zap.Error(err))
		// Continue anyway - transactions will be saved without account_id link
	}

	for _, tx := range transactions {
		rawDataJSON, err := json.Marshal(tx.RawData)
		if err != nil {
			s.logger.Error("Failed to marshal transaction raw data", zap.Error(err))
			continue
		}

		record := map[string]interface{}{
			"belvo_id":          tx.ID,
			"link_id":           linkID,
			"user_id":           userID,
			"account_belvo_id":  tx.Account,
			"value_date":        tx.ValueDate,
			"accounting_date":   tx.AccountingDate,
			"amount":            tx.Amount,
			"balance":           tx.Balance,
			"currency":          tx.Currency,
			"description":       tx.Description,
			"observations":      tx.Observations,
			"category":          tx.Category,
			"subcategory":       tx.Subcategory,
			"reference":         tx.Reference,
			"type":              tx.Type,
			"status":            tx.Status,
			"collected_at":      tx.CollectedAt,
			"raw_data":          string(rawDataJSON),
		}

		// Link to internal account_id if we have the mapping
		if accountID, ok := accountMap[tx.Account]; ok {
			record["account_id"] = accountID
		}

		if tx.Merchant != nil {
			record["merchant_name"] = tx.Merchant.Name
			record["merchant_website"] = tx.Merchant.Website
		}

		if tx.CreditCardData != nil {
			creditCardJSON, _ := json.Marshal(tx.CreditCardData)
			record["credit_card_data"] = string(creditCardJSON)
		}

		_, _, err = s.client.From("belvo_transactions").Upsert(record, "belvo_id", "", "").Execute()
		if err != nil {
			s.logger.Error("Failed to save transaction", zap.String("transaction_id", tx.ID), zap.Error(err))
			// Continue with other transactions
			continue
		}
	}

	s.logger.Info("Successfully saved transactions", zap.Int("count", len(transactions)))
	return nil
}

// getAccountMapping retrieves the mapping between Belvo account IDs and internal account IDs
func (s *SupabaseStorage) getAccountMapping(ctx context.Context, linkID string) (map[string]string, error) {
	var result []map[string]interface{}
	_, err := s.client.From("belvo_accounts").
		Select("id,belvo_id", "", false).
		Eq("link_id", linkID).
		ExecuteTo(&result)

	if err != nil {
		return nil, err
	}

	mapping := make(map[string]string)
	for _, row := range result {
		if belvoID, ok := row["belvo_id"].(string); ok {
			if id, ok := row["id"].(string); ok {
				mapping[belvoID] = id
			}
		}
	}

	return mapping, nil
}

