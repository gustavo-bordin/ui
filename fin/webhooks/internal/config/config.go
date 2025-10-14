package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Belvo    BelvoConfig
	Supabase SupabaseConfig
	Logging  LoggingConfig
}

type ServerConfig struct {
	Port string
}

type BelvoConfig struct {
	SecretID       string
	SecretPassword string
	APIURL         string
}

type SupabaseConfig struct {
	URL string
	Key string
}

type LoggingConfig struct {
	Level string
}

// Load reads configuration from environment variables
func Load() (*Config, error) {
	// Try to load .env file (optional in production)
	_ = godotenv.Load()

	config := &Config{
		Server: ServerConfig{
			Port: getEnv("PORT", "8080"),
		},
		Belvo: BelvoConfig{
			SecretID:       getEnv("BELVO_SECRET_ID", ""),
			SecretPassword: getEnv("BELVO_SECRET_PASSWORD", ""),
			APIURL:         getEnv("BELVO_API_URL", "https://sandbox.belvo.com/api"),
		},
		Supabase: SupabaseConfig{
			URL: getEnv("SUPABASE_URL", ""),
			Key: getEnv("SUPABASE_KEY", ""),
		},
		Logging: LoggingConfig{
			Level: getEnv("LOG_LEVEL", "info"),
		},
	}

	if err := config.Validate(); err != nil {
		return nil, err
	}

	return config, nil
}

// Validate ensures all required configuration is present
func (c *Config) Validate() error {
	if c.Belvo.SecretID == "" {
		return fmt.Errorf("BELVO_SECRET_ID is required")
	}
	if c.Belvo.SecretPassword == "" {
		return fmt.Errorf("BELVO_SECRET_PASSWORD is required")
	}
	if c.Supabase.URL == "" {
		return fmt.Errorf("SUPABASE_URL is required")
	}
	if c.Supabase.Key == "" {
		return fmt.Errorf("SUPABASE_KEY is required")
	}
	return nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := getEnv(key, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}

