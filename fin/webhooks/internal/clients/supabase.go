package clients

import (
	"fmt"

	"github.com/supabase-community/supabase-go"
)

// NewSupabaseClient creates a new Supabase client instance
func NewSupabaseClient(url, key string) (*supabase.Client, error) {
	client, err := supabase.NewClient(url, key, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create supabase client: %w", err)
	}
	return client, nil
}

