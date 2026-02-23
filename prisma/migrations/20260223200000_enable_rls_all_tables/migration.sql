-- ============================================================
-- Migration: Enable Row Level Security on all tables
-- Strategy: Block anon/public access entirely.
--           Only service_role (used by Next.js/Prisma server-side) is allowed.
-- ============================================================

-- users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON users FOR ALL TO service_role USING (true) WITH CHECK (true);

-- accounts
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts FORCE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON accounts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions FORCE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON sessions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- verification_tokens
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens FORCE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON verification_tokens FOR ALL TO service_role USING (true) WITH CHECK (true);

-- addresses
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses FORCE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON addresses FOR ALL TO service_role USING (true) WITH CHECK (true);

-- vendors
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors FORCE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON vendors FOR ALL TO service_role USING (true) WITH CHECK (true);

-- vendor_settings
ALTER TABLE vendor_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_settings FORCE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON vendor_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- markets
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets FORCE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON markets FOR ALL TO service_role USING (true) WITH CHECK (true);

-- market_openings
ALTER TABLE market_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_openings FORCE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON market_openings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- market_vendors
ALTER TABLE market_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_vendors FORCE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON market_vendors FOR ALL TO service_role USING (true) WITH CHECK (true);

-- favorite_markets
ALTER TABLE favorite_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_markets FORCE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON favorite_markets FOR ALL TO service_role USING (true) WITH CHECK (true);

-- categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories FORCE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON categories FOR ALL TO service_role USING (true) WITH CHECK (true);

-- products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE products FORCE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON products FOR ALL TO service_role USING (true) WITH CHECK (true);

-- product_prices
ALTER TABLE product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_prices FORCE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON product_prices FOR ALL TO service_role USING (true) WITH CHECK (true);

-- product_stocks
ALTER TABLE product_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_stocks FORCE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON product_stocks FOR ALL TO service_role USING (true) WITH CHECK (true);

-- carts
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts FORCE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON carts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- cart_items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items FORCE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON cart_items FOR ALL TO service_role USING (true) WITH CHECK (true);

-- orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON orders FOR ALL TO service_role USING (true) WITH CHECK (true);

-- order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items FORCE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON order_items FOR ALL TO service_role USING (true) WITH CHECK (true);

-- payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments FORCE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON payments FOR ALL TO service_role USING (true) WITH CHECK (true);

-- conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations FORCE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON conversations FOR ALL TO service_role USING (true) WITH CHECK (true);

-- messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages FORCE ROW LEVEL SECURITY;
CREATE POLICY "service_role_full_access" ON messages FOR ALL TO service_role USING (true) WITH CHECK (true);
