package clients

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"belvo-webhook-service/internal/models"

	"go.uber.org/zap"
)

type BelvoClient struct {
	secretID       string
	secretPassword string
	baseURL        string
	httpClient     *http.Client
	logger         *zap.Logger
}

func NewBelvoClient(secretID, secretPassword, baseURL string, logger *zap.Logger) *BelvoClient {
	return &BelvoClient{
		secretID:       secretID,
		secretPassword: secretPassword,
		baseURL:        baseURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
		logger: logger,
	}
}

func (c *BelvoClient) FetchOwners(linkID string) ([]models.BelvoOwner, error) {
	endpoint := fmt.Sprintf("%s/owners/?link=%s", c.baseURL, linkID)
	c.logger.Info("Fetching owners from Belvo", zap.String("link_id", linkID), zap.String("endpoint", endpoint))

	body, err := c.doRequest("GET", endpoint)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch owners: %w", err)
	}

	var response models.BelvoOwnerListResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return nil, fmt.Errorf("failed to unmarshal owners response: %w", err)
	}

	c.logger.Info("Successfully fetched owners", zap.Int("count", len(response.Results)))
	return response.Results, nil
}

// doRequest performs an HTTP request and returns the raw response body
func (c *BelvoClient) doRequest(method, url string) ([]byte, error) {
	req, err := http.NewRequest(method, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.SetBasicAuth(c.secretID, c.secretPassword)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		var belvoError models.BelvoErrorResponse
		if err := json.Unmarshal(body, &belvoError); err == nil {
			return nil, fmt.Errorf("belvo API error: %s - %s", belvoError.Code, belvoError.Message)
		}
		return nil, fmt.Errorf("belvo API returned status %d: %s", resp.StatusCode, string(body))
	}

	return body, nil
}

