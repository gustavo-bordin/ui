package models

import (
	"encoding/json"
	"fmt"
	"time"
)

// ========================================
// External API Models (from Belvo)
// ========================================

// BelvoOwner represents an account owner from Belvo API
type BelvoOwner struct {
	ID                       string    `json:"id"`
	CollectedAt              time.Time `json:"collected_at"`
	DisplayName              string    `json:"display_name"`
	Email                    string    `json:"email"`
	PhoneNumber              string    `json:"phone_number"`
	Address                  string    `json:"address"`
	InternalIdentification   string    `json:"internal_identification"`
	FirstName                string    `json:"first_name"`
	LastName                 string    `json:"last_name"`
	SecondLastName           string    `json:"second_last_name"`
}

// BelvoOwnerListResponse represents a paginated list of owners from Belvo API
type BelvoOwnerListResponse struct {
	Results []BelvoOwner `json:"results"`
}

// BelvoErrorResponse represents an error response from Belvo API
type BelvoErrorResponse struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// ========================================
// Internal Database Models
// ========================================

// OwnerRecord represents an owner record as stored in our database
type OwnerRecord struct {
	BelvoID                string    `json:"belvo_id"`
	LinkID                 string    `json:"link_id"`
	Email                  string    `json:"email"`
	PhoneNumber            string    `json:"phone_number"`
	DisplayName            string    `json:"display_name"`
	FirstName              string    `json:"first_name"`
	LastName               string    `json:"last_name"`
	SecondLastName         string    `json:"second_last_name"`
	Address                string    `json:"address"`
	InternalIdentification string    `json:"internal_identification"`
	CollectedAt            time.Time `json:"collected_at"`
	RawData                string    `json:"raw_data"`
}

// ========================================
// Conversion Methods
// ========================================

// ToOwnerRecord converts the BelvoOwner to an OwnerRecord for database storage
func (o *BelvoOwner) ToOwnerRecord(linkID string) (OwnerRecord, error) {
	ownerJSON, err := json.Marshal(o)
	if err != nil {
		return OwnerRecord{}, fmt.Errorf("failed to marshal owner: %w", err)
	}

	var record OwnerRecord
	if err := json.Unmarshal(ownerJSON, &record); err != nil {
		return OwnerRecord{}, fmt.Errorf("failed to unmarshal to record: %w", err)
	}

	record.BelvoID = o.ID
	record.LinkID = linkID
	record.RawData = string(ownerJSON)

	return record, nil
}
