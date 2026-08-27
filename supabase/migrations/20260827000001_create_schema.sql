-- 20260827000001_create_schema.sql
-- AgriConnect Core Schema for Supabase / PostgreSQL

-- 1. Enums
CREATE TYPE transaction_status AS ENUM (
    'offered',
    'accepted',
    'in_transit',
    'delivered',
    'disputed',
    'resolved_partial_refund',
    'resolved_full_refund',
    'resolved_buyer_accepts',
    'resolved_farmer_resale',
    'paid'
);

CREATE TYPE dispute_reason AS ENUM (
    'quality_mismatch',
    'quantity_mismatch',
    'spoilage',
    'wrong_item',
    'other'
);

CREATE TYPE dispute_status AS ENUM (
    'open',
    'under_review',
    'resolved'
);

CREATE TYPE dispute_resolution AS ENUM (
    'partial_refund',
    'full_refund',
    'buyer_accepts',
    'farmer_resale'
);

-- 2. Tables

-- Farmers table (linked to auth.users.id)
CREATE TABLE IF NOT EXISTS farmers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    phone TEXT NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'ta',
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buyers table (linked to auth.users.id)
CREATE TABLE IF NOT EXISTS buyers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    phone TEXT NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'ta',
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crops / Lots table
CREATE TABLE IF NOT EXISTS crops_lots (
    lot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    crop TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    quality TEXT NOT NULL,
    location TEXT NOT NULL,
    price_per_kg NUMERIC(10, 2) NOT NULL CHECK (price_per_kg > 0),
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'offered', 'sold', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Prices table (Agmarknet Live Ingestion)
CREATE TABLE IF NOT EXISTS market_prices (
    id BIGSERIAL PRIMARY KEY,
    market TEXT NOT NULL,
    crop TEXT NOT NULL,
    date DATE NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    arrival NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE RESTRICT,
    buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE RESTRICT,
    lot_id UUID REFERENCES crops_lots(lot_id) ON DELETE SET NULL,
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    status transaction_status NOT NULL DEFAULT 'offered',
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'held', 'refunded_partial', 'refunded_full', 'released')),
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_refund_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disputes table
CREATE TABLE IF NOT EXISTS disputes (
    dispute_id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    raised_by TEXT NOT NULL CHECK (raised_by IN ('buyer', 'farmer')),
    reason dispute_reason NOT NULL,
    description TEXT NOT NULL,
    rejected_quantity_kg NUMERIC(10, 2) NOT NULL CHECK (rejected_quantity_kg > 0),
    photo_urls TEXT[] DEFAULT '{}',
    status dispute_status NOT NULL DEFAULT 'open',
    resolution dispute_resolution,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_market_prices_crop_market_date ON market_prices(crop, market, date);
CREATE INDEX IF NOT EXISTS idx_crops_lots_farmer ON crops_lots(farmer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_farmer ON transactions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
