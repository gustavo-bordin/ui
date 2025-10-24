package models

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

type WebhookError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

const (
	WebhookTypeOwners = "OWNERS"
)

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

func (w *WebhookEvent) GetErrors() []WebhookError {
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

