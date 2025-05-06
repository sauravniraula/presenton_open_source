-- Create updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    new.updated_at = timezone('utc'::text, now());
    RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Drop existing tables and types
DROP TABLE IF EXISTS usage_stats CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS subscription_tier CASCADE;

-- Create types
CREATE TYPE subscription_tier AS ENUM ('free', 'standard', 'premium');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'trialing', 'inactive');

-- Create subscriptions table
CREATE TABLE subscriptions (
    id text PRIMARY KEY,
    user_id uuid REFERENCES auth.users NOT NULL,
    status subscription_status DEFAULT 'active',
    tier subscription_tier DEFAULT 'free',
    current_period_start timestamptz,
    current_period_end timestamptz,
    cancel_at_period_end boolean DEFAULT false,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create usage_stats table with new structure
CREATE TABLE usage_stats (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
    exports_count integer DEFAULT 0,
    ai_presentations_count integer DEFAULT 0,
    avatar_video_duration integer DEFAULT 0,
    period_start timestamptz,
    period_end timestamptz,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Service role can manage subscriptions" ON subscriptions FOR ALL USING (true);
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage_stats" ON usage_stats FOR ALL USING (true);
CREATE POLICY "Users can view own usage stats" ON usage_stats FOR SELECT USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_id ON subscriptions(id);
CREATE INDEX idx_usage_stats_user_id ON usage_stats(user_id);

-- Add triggers
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON usage_stats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();