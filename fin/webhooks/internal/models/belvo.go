package models

import "time"

// BelvoOwner represents an account owner from Belvo
type BelvoOwner struct {
	ID                       string                 `json:"id"`
	Link                     string                 `json:"link"`
	CollectedAt              time.Time              `json:"collected_at"`
	CreatedAt                time.Time              `json:"created_at"`
	DisplayName              string                 `json:"display_name"`
	Email                    string                 `json:"email"`
	PhoneNumber              string                 `json:"phone_number"`
	Address                  string                 `json:"address"`
	InternalIdentification   string                 `json:"internal_identification"`
	FirstName                string                 `json:"first_name"`
	LastName                 string                 `json:"last_name"`
	SecondLastName           string                 `json:"second_last_name"`
	RawData                  map[string]interface{} `json:"-"`
}

// BelvoAccount represents a bank account from Belvo
type BelvoAccount struct {
	ID                        string                 `json:"id"`
	Link                      string                 `json:"link"`
	Institution               *BelvoInstitution      `json:"institution"`
	CollectedAt               time.Time              `json:"collected_at"`
	CreatedAt                 time.Time             `json:"created_at"`
	Category                  string                 `json:"category"`
	BalanceType               string                 `json:"balance_type"`
	Type                      string                 `json:"type"`
	Name                      string                 `json:"name"`
	Number                    string                 `json:"number"`
	Balance                   *BelvoBalance          `json:"balance"`
	Currency                  string                 `json:"currency"`
	BankProductID             string                 `json:"bank_product_id"`
	InternalIdentification    string                 `json:"internal_identification"`
	PublicIdentificationName  string                 `json:"public_identification_name"`
	PublicIdentificationValue string                 `json:"public_identification_value"`
	LastAccessedAt            *time.Time             `json:"last_accessed_at"`
	CreditData                map[string]interface{} `json:"credit_data,omitempty"`
	LoanData                  map[string]interface{} `json:"loan_data,omitempty"`
	FundsData                 map[string]interface{} `json:"funds_data,omitempty"`
	RawData                   map[string]interface{} `json:"-"`
}

// BelvoInstitution represents bank institution information
type BelvoInstitution struct {
	Name string `json:"name"`
	Type string `json:"type"`
}

// BelvoBalance represents account balance information
type BelvoBalance struct {
	Current   float64 `json:"current"`
	Available float64 `json:"available"`
}

// BelvoTransaction represents a bank transaction from Belvo
type BelvoTransaction struct {
	ID               string                 `json:"id"`
	Account          string                 `json:"account"`
	CollectedAt      time.Time              `json:"collected_at"`
	CreatedAt        time.Time              `json:"created_at"`
	ValueDate        string                 `json:"value_date"`
	AccountingDate   string                 `json:"accounting_date"`
	Amount           float64                `json:"amount"`
	Balance          float64                `json:"balance"`
	Currency         string                 `json:"currency"`
	Description      string                 `json:"description"`
	Observations     string                 `json:"observations"`
	Merchant         *BelvoMerchant         `json:"merchant,omitempty"`
	Category         string                 `json:"category"`
	Subcategory      string                 `json:"subcategory"`
	Reference        string                 `json:"reference"`
	Type             string                 `json:"type"`
	Status           string                 `json:"status"`
	CreditCardData   map[string]interface{} `json:"credit_card_data,omitempty"`
	RawData          map[string]interface{} `json:"-"`
}

// BelvoMerchant represents merchant information for a transaction
type BelvoMerchant struct {
	Name    string `json:"name"`
	Website string `json:"website"`
}

// BelvoListResponse represents a paginated list response from Belvo
type BelvoListResponse struct {
	Count    int                      `json:"count"`
	Next     *string                  `json:"next"`
	Previous *string                  `json:"previous"`
	Results  []map[string]interface{} `json:"results"`
}

// BelvoErrorResponse represents an error response from Belvo
type BelvoErrorResponse struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details string `json:"detail,omitempty"`
}

