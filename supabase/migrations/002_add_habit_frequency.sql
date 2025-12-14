-- Add frequency column to habits table
ALTER TABLE habits 
ADD COLUMN IF NOT EXISTS frequency TEXT DEFAULT 'monthly'; 
-- 'daily' (future), 'weekly', 'monthly'

-- Optional: Rename target column to be more generic, or just live with the name
-- ALTER TABLE habits RENAME COLUMN target_days_per_month TO target_value;
-- For now we will respect the existing column name but treat it as the target value for the frequency.
