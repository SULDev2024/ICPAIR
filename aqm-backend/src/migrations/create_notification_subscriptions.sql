-- Migration: Create notification_subscriptions table
-- This table stores user preferences for push notifications

CREATE TABLE IF NOT EXISTS notification_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  fcm_token TEXT NOT NULL UNIQUE,
  district VARCHAR(50) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries by district
CREATE INDEX idx_subscriptions_district ON notification_subscriptions(district);

-- Index for faster queries by enabled status
CREATE INDEX idx_subscriptions_enabled ON notification_subscriptions(enabled);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_notification_subscriptions_updated_at
    BEFORE UPDATE ON notification_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional, for testing)
-- INSERT INTO notification_subscriptions (user_id, fcm_token, district) 
-- VALUES (1, 'sample_fcm_token_123', 'Alatau');
