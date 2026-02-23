-- Enable RLS on Prisma's internal migration tracking table
ALTER TABLE _prisma_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE _prisma_migrations FORCE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON _prisma_migrations FOR ALL TO service_role USING (true) WITH CHECK (true);
