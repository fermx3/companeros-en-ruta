-- Add distributor_id to orders table
-- Tracks which distributor fulfills each order

ALTER TABLE orders
ADD COLUMN distributor_id UUID REFERENCES distributors(id) ON DELETE SET NULL;

CREATE INDEX idx_orders_distributor_id ON orders(distributor_id) WHERE distributor_id IS NOT NULL;

COMMENT ON COLUMN orders.distributor_id IS 'Distribuidor que surte esta orden';
