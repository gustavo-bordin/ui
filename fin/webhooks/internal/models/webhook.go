package models

import "time"

// WebhookEvent represents the webhook payload from Belvo
type WebhookEvent struct {
	WebhookID   string                 `json:"webhook_id"`
	WebhookType string                 `json:"webhook_type"`
	ProcessType string                 `json:"process_type"`
	WebhookCode string                 `json:"webhook_code"`
	LinkID      string                 `json:"link_id"`
	RequestID   string                 `json:"request_id"`
	ExternalID  string                 `json:"external_id"`
	Data        map[string]interface{} `json:"data"`
}

// WebhookError represents error information in webhook data
type WebhookError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// HasErrors checks if the webhook event contains errors
func (w *WebhookEvent) HasErrors() bool {
	if w.Data == nil {
		return false
	}
	errors, ok := w.Data["errors"]
	if !ok {
		return false
	}
	errorList, ok := errors.([]interface{})
	return ok && len(errorList) > 0
}

// GetErrors extracts errors from the webhook data
func (w *WebhookEvent) GetErrors() []WebhookError {
	if !w.HasErrors() {
		return nil
	}

	var webhookErrors []WebhookError
	errors := w.Data["errors"].([]interface{})

	for _, err := range errors {
		if errMap, ok := err.(map[string]interface{}); ok {
			webhookError := WebhookError{
				Code:    getStringValue(errMap, "code"),
				Message: getStringValue(errMap, "message"),
			}
			webhookErrors = append(webhookErrors, webhookError)
		}
	}

	return webhookErrors
}

func getStringValue(m map[string]interface{}, key string) string {
	if val, ok := m[key]; ok {
		if str, ok := val.(string); ok {
			return str
		}
	}
	return ""
}

// WebhookType constants
const (
	WebhookTypeOwners       = "OWNERS"
	WebhookTypeAccounts     = "ACCOUNTS"
	WebhookTypeTransactions = "TRANSACTIONS"
)

// ProcessType constants
const (
	ProcessTypeHistoricalUpdate = "historical_update"
	ProcessTypeRecurrentUpdate  = "recurrent_update"
)

// GetAPIEndpoint returns the Belvo API endpoint for the webhook type
func (w *WebhookEvent) GetAPIEndpoint(baseURL string) string {
	endpoints := map[string]string{
		WebhookTypeOwners:       baseURL + "/owners/",
		WebhookTypeAccounts:     baseURL + "/accounts/",
		WebhookTypeTransactions: baseURL + "/transactions/",
	}

	if endpoint, ok := endpoints[w.WebhookType]; ok {
		return endpoint
	}
	return ""
}

// WebhookEventRecord represents the webhook event as stored in database
type WebhookEventRecord struct {
	ID           string                 `json:"id"`
	WebhookID    string                 `json:"webhook_id"`
	WebhookType  string                 `json:"webhook_type"`
	ProcessType  string                 `json:"process_type"`
	WebhookCode  string                 `json:"webhook_code"`
	LinkID       string                 `json:"link_id"`
	RequestID    string                 `json:"request_id"`
	ExternalID   string                 `json:"external_id"`
	HasErrors    bool                   `json:"has_errors"`
	ErrorDetails map[string]interface{} `json:"error_details,omitempty"`
	Data         map[string]interface{} `json:"data"`
	ProcessedAt  *time.Time             `json:"processed_at,omitempty"`
	CreatedAt    time.Time              `json:"created_at"`
}

