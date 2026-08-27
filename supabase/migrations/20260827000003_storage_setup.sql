-- 20260827000003_storage_setup.sql
-- Create non-public Supabase Storage bucket: dispute-evidence and policies

-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('dispute-evidence', 'dispute-evidence', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: allow authenticated users to upload dispute evidence
CREATE POLICY "Authenticated users can upload dispute evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'dispute-evidence');

-- Storage RLS: read access for transaction parties & admin
CREATE POLICY "Transaction parties and admin can view dispute evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'dispute-evidence' AND (
        -- User is admin
        is_admin_user()
        -- Or user is the owner/uploader of the object
        OR auth.uid() = owner
        -- Or user is farmer/buyer in a transaction with disputes referencing this path
        OR EXISTS (
            SELECT 1 FROM disputes d
            JOIN transactions t ON t.id = d.transaction_id
            WHERE (t.farmer_id = auth.uid() OR t.buyer_id = auth.uid())
            AND name = ANY(d.photo_urls)
        )
    )
);
