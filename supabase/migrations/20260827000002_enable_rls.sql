-- 20260827000002_enable_rls.sql
-- Enable Row Level Security (RLS) on all tables

ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current auth user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM farmers WHERE id = auth.uid() AND is_admin = TRUE
    UNION
    SELECT 1 FROM buyers WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Farmers Table Policies
CREATE POLICY "Farmers can view own profile"
    ON farmers FOR SELECT
    USING (auth.uid() = id OR is_admin_user());

CREATE POLICY "Farmers can update own profile"
    ON farmers FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Farmers can insert own profile at signup"
    ON farmers FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 2. Buyers Table Policies
CREATE POLICY "Buyers can view own profile"
    ON buyers FOR SELECT
    USING (auth.uid() = id OR is_admin_user());

CREATE POLICY "Buyers can update own profile"
    ON buyers FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Buyers can insert own profile at signup"
    ON buyers FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 3. Crops / Lots Policies
-- Farmers read/write only their own crops_lots
CREATE POLICY "Farmers can manage own lots"
    ON crops_lots FOR ALL
    USING (auth.uid() = farmer_id)
    WITH CHECK (auth.uid() = farmer_id);

-- Buyers can view available crops_lots or lots involved in their transactions
CREATE POLICY "Buyers can view available lots"
    ON crops_lots FOR SELECT
    USING (
        status = 'available'
        OR EXISTS (
            SELECT 1 FROM transactions
            WHERE transactions.lot_id = crops_lots.lot_id
            AND transactions.buyer_id = auth.uid()
        )
        OR is_admin_user()
    );

-- 4. Transactions Policies
-- Farmers and Buyers read/write only their own transactions, Admin reads all
CREATE POLICY "Users can view own transactions"
    ON transactions FOR SELECT
    USING (
        auth.uid() = farmer_id 
        OR auth.uid() = buyer_id 
        OR is_admin_user()
    );

CREATE POLICY "Buyers can create transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Parties and Admin can update transactions"
    ON transactions FOR UPDATE
    USING (
        auth.uid() = farmer_id 
        OR auth.uid() = buyer_id 
        OR is_admin_user()
    );

-- 5. Disputes Policies
-- Disputes visible only to the transaction's two parties, plus admin
CREATE POLICY "Parties and Admin can view disputes"
    ON disputes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM transactions
            WHERE transactions.id = disputes.transaction_id
            AND (transactions.farmer_id = auth.uid() OR transactions.buyer_id = auth.uid())
        )
        OR is_admin_user()
    );

CREATE POLICY "Buyers can raise disputes on own transactions"
    ON disputes FOR INSERT
    WITH CHECK (
        raised_by = 'buyer' AND
        EXISTS (
            SELECT 1 FROM transactions
            WHERE transactions.id = disputes.transaction_id
            AND transactions.buyer_id = auth.uid()
        )
    );

CREATE POLICY "Admin can update disputes"
    ON disputes FOR UPDATE
    USING (is_admin_user());

-- 6. Market Prices Policies
-- market_prices is publicly readable, writable only by service role (ingestion job)
CREATE POLICY "Public can view market prices"
    ON market_prices FOR SELECT
    USING (true);
