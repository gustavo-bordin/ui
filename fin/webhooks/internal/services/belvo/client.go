package belvo

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"belvo-webhook-service/internal/models"

	"go.uber.org/zap"
)

type Client struct {
	secretID       string
	secretPassword string
	baseURL        string
	httpClient     *http.Client
	logger         *zap.Logger
}

func NewClient(secretID, secretPassword, baseURL string, logger *zap.Logger) *Client {
	return &Client{
		secretID:       secretID,
		secretPassword: secretPassword,
		baseURL:        baseURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		logger: logger,
	}
}

func (c *Client) FetchOwners(linkID string) ([]models.BelvoOwner, error) {
	endpoint := fmt.Sprintf("%s/owners/?link=%s", c.baseURL, linkID)
	c.logger.Info("Fetching owners from Belvo", zap.String("link_id", linkID), zap.String("endpoint", endpoint))

	var response models.BelvoListResponse
	if err := c.makeRequest("GET", endpoint, &response); err != nil {
		return nil, fmt.Errorf("failed to fetch owners: %w", err)
	}

	var owners []models.BelvoOwner
	for _, result := range response.Results {
		owner := models.BelvoOwner{
			RawData: result,
		}

		if id, ok := result["id"].(string); ok {
			owner.ID = id
		}
		if link, ok := result["link"].(string); ok {
			owner.Link = link
		}
		if displayName, ok := result["display_name"].(string); ok {
			owner.DisplayName = displayName
		}
		if email, ok := result["email"].(string); ok {
			owner.Email = email
		}
		if phoneNumber, ok := result["phone_number"].(string); ok {
			owner.PhoneNumber = phoneNumber
		}
		if address, ok := result["address"].(string); ok {
			owner.Address = address
		}
		if internalID, ok := result["internal_identification"].(string); ok {
			owner.InternalIdentification = internalID
		}
		if firstName, ok := result["first_name"].(string); ok {
			owner.FirstName = firstName
		}
		if lastName, ok := result["last_name"].(string); ok {
			owner.LastName = lastName
		}
		if secondLastName, ok := result["second_last_name"].(string); ok {
			owner.SecondLastName = secondLastName
		}

		if collectedAt, ok := result["collected_at"].(string); ok {
			if t, err := time.Parse(time.RFC3339, collectedAt); err == nil {
				owner.CollectedAt = t
			}
		}
		if createdAt, ok := result["created_at"].(string); ok {
			if t, err := time.Parse(time.RFC3339, createdAt); err == nil {
				owner.CreatedAt = t
			}
		}

		owners = append(owners, owner)
	}

	c.logger.Info("Successfully fetched owners", zap.Int("count", len(owners)))
	return owners, nil
}

func (c *Client) FetchAccounts(linkID string) ([]models.BelvoAccount, error) {
	endpoint := fmt.Sprintf("%s/accounts/?link=%s", c.baseURL, linkID)
	c.logger.Info("Fetching accounts from Belvo", zap.String("link_id", linkID), zap.String("endpoint", endpoint))

	var response models.BelvoListResponse
	if err := c.makeRequest("GET", endpoint, &response); err != nil {
		return nil, fmt.Errorf("failed to fetch accounts: %w", err)
	}

	var accounts []models.BelvoAccount
	for _, result := range response.Results {
		account := models.BelvoAccount{
			RawData: result,
		}

		// Parse common fields
		if id, ok := result["id"].(string); ok {
			account.ID = id
		}
		if link, ok := result["link"].(string); ok {
			account.Link = link
		}
		if name, ok := result["name"].(string); ok {
			account.Name = name
		}
		if number, ok := result["number"].(string); ok {
			account.Number = number
		}
		if accountType, ok := result["type"].(string); ok {
			account.Type = accountType
		}
		if balanceType, ok := result["balance_type"].(string); ok {
			account.BalanceType = balanceType
		}
		if currency, ok := result["currency"].(string); ok {
			account.Currency = currency
		}
		if category, ok := result["category"].(string); ok {
			account.Category = category
		}

		// Parse institution
		if inst, ok := result["institution"].(map[string]interface{}); ok {
			account.Institution = &models.BelvoInstitution{}
			if name, ok := inst["name"].(string); ok {
				account.Institution.Name = name
			}
			if instType, ok := inst["type"].(string); ok {
				account.Institution.Type = instType
			}
		}

		// Parse balance
		if bal, ok := result["balance"].(map[string]interface{}); ok {
			account.Balance = &models.BelvoBalance{}
			if current, ok := bal["current"].(float64); ok {
				account.Balance.Current = current
			}
			if available, ok := bal["available"].(float64); ok {
				account.Balance.Available = available
			}
		}

		// Parse timestamps
		if collectedAt, ok := result["collected_at"].(string); ok {
			if t, err := time.Parse(time.RFC3339, collectedAt); err == nil {
				account.CollectedAt = t
			}
		}
		if createdAt, ok := result["created_at"].(string); ok {
			if t, err := time.Parse(time.RFC3339, createdAt); err == nil {
				account.CreatedAt = t
			}
		}

		accounts = append(accounts, account)
	}

	c.logger.Info("Successfully fetched accounts", zap.Int("count", len(accounts)))
	return accounts, nil
}

// FetchTransactions retrieves transactions data for a specific link
func (c *Client) FetchTransactions(linkID string) ([]models.BelvoTransaction, error) {
	endpoint := fmt.Sprintf("%s/transactions/?link=%s", c.baseURL, linkID)
	c.logger.Info("Fetching transactions from Belvo", zap.String("link_id", linkID), zap.String("endpoint", endpoint))

	var allTransactions []models.BelvoTransaction
	nextURL := &endpoint

	// Handle pagination
	for nextURL != nil {
		var response models.BelvoListResponse
		if err := c.makeRequest("GET", *nextURL, &response); err != nil {
			return nil, fmt.Errorf("failed to fetch transactions: %w", err)
		}

		for _, result := range response.Results {
			transaction := models.BelvoTransaction{
				RawData: result,
			}

			// Parse common fields
			if id, ok := result["id"].(string); ok {
				transaction.ID = id
			}
			if account, ok := result["account"].(string); ok {
				transaction.Account = account
			}
			if valueDate, ok := result["value_date"].(string); ok {
				transaction.ValueDate = valueDate
			}
			if accountingDate, ok := result["accounting_date"].(string); ok {
				transaction.AccountingDate = accountingDate
			}
			if amount, ok := result["amount"].(float64); ok {
				transaction.Amount = amount
			}
			if balance, ok := result["balance"].(float64); ok {
				transaction.Balance = balance
			}
			if currency, ok := result["currency"].(string); ok {
				transaction.Currency = currency
			}
			if description, ok := result["description"].(string); ok {
				transaction.Description = description
			}
			if observations, ok := result["observations"].(string); ok {
				transaction.Observations = observations
			}
			if category, ok := result["category"].(string); ok {
				transaction.Category = category
			}
			if subcategory, ok := result["subcategory"].(string); ok {
				transaction.Subcategory = subcategory
			}
			if reference, ok := result["reference"].(string); ok {
				transaction.Reference = reference
			}
			if txType, ok := result["type"].(string); ok {
				transaction.Type = txType
			}
			if status, ok := result["status"].(string); ok {
				transaction.Status = status
			}

			// Parse merchant
			if merchant, ok := result["merchant"].(map[string]interface{}); ok {
				transaction.Merchant = &models.BelvoMerchant{}
				if name, ok := merchant["name"].(string); ok {
					transaction.Merchant.Name = name
				}
				if website, ok := merchant["website"].(string); ok {
					transaction.Merchant.Website = website
				}
			}

			// Parse timestamps
			if collectedAt, ok := result["collected_at"].(string); ok {
				if t, err := time.Parse(time.RFC3339, collectedAt); err == nil {
					transaction.CollectedAt = t
				}
			}
			if createdAt, ok := result["created_at"].(string); ok {
				if t, err := time.Parse(time.RFC3339, createdAt); err == nil {
					transaction.CreatedAt = t
				}
			}

			allTransactions = append(allTransactions, transaction)
		}

		nextURL = response.Next
	}

	c.logger.Info("Successfully fetched transactions", zap.Int("count", len(allTransactions)))
	return allTransactions, nil
}

// makeRequest performs an HTTP request to the Belvo API
func (c *Client) makeRequest(method, url string, result interface{}) error {
	req, err := http.NewRequest(method, url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	// Add basic auth
	req.SetBasicAuth(c.secretID, c.secretPassword)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		var belvoError models.BelvoErrorResponse
		if err := json.Unmarshal(body, &belvoError); err == nil {
			return fmt.Errorf("belvo API error: %s - %s", belvoError.Code, belvoError.Message)
		}
		return fmt.Errorf("belvo API returned status %d: %s", resp.StatusCode, string(body))
	}

	if err := json.Unmarshal(body, result); err != nil {
		return fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return nil
}

