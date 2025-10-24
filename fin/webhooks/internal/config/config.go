package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Belvo    BelvoConfig
	Supabase SupabaseConfig
}

type BelvoConfig struct {
	SecretID       string
	SecretPassword string
	APIURL         string
}

type SupabaseConfig struct {
	URL            string
	PublishableKey string
}

func Load() (*Config, error) {
	err := godotenv.Load()
	if err != nil {
		return nil, err
	}

	belvoSecretId := os.Getenv("BELVO_SECRET_ID")
	belvoSecretPassword := os.Getenv("BELVO_SECRET_PASSWORD")
	belvoApiUrl := os.Getenv("BELVO_API_URL")

	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabasePublishableKey := os.Getenv("SUPABASE_PUBLISHABLE_KEY")

	config := &Config{
		Belvo: BelvoConfig{
			SecretID:       belvoSecretId,
			SecretPassword: belvoSecretPassword,
			APIURL:         belvoApiUrl,
		},
		Supabase: SupabaseConfig{
			URL:            supabaseUrl,
			PublishableKey: supabasePublishableKey,
		},
	}

	return config, nil
}
