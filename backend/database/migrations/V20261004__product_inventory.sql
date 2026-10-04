-- Additive migration for the existing MySQL schema. Run before starting the new backend.
-- Existing stock is copied once; rerunning does not overwrite current quantity.
SET @quantity_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'product' AND COLUMN_NAME = 'quantity');
SET @migration_sql = IF(@quantity_exists = 0,
  'ALTER TABLE product ADD COLUMN quantity INT NULL', 'SELECT 1');
PREPARE inventory_migration FROM @migration_sql;
EXECUTE inventory_migration;
DEALLOCATE PREPARE inventory_migration;

UPDATE product p
LEFT JOIN (
  SELECT ProductID, SUM(GREATEST(COALESCE(StockQuantity, 0), 0)) AS stock
  FROM productdetail GROUP BY ProductID
) legacy ON legacy.ProductID = p.ProductID
SET p.quantity = COALESCE(legacy.stock, 0)
WHERE p.quantity IS NULL;

ALTER TABLE product MODIFY COLUMN quantity INT NOT NULL DEFAULT 0;
SET @check_exists = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'product'
    AND CONSTRAINT_NAME = 'chk_product_quantity_nonnegative');
SET @migration_sql = IF(@check_exists = 0,
  'ALTER TABLE product ADD CONSTRAINT chk_product_quantity_nonnegative CHECK (quantity >= 0)', 'SELECT 1');
PREPARE inventory_migration FROM @migration_sql;
EXECUTE inventory_migration;
DEALLOCATE PREPARE inventory_migration;

-- Old orders never deducted stock, so they must not return stock when canceled.
SET @reserved_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order' AND COLUMN_NAME = 'inventoryReserved');
SET @migration_sql = IF(@reserved_exists = 0,
  'ALTER TABLE `order` ADD COLUMN inventoryReserved BOOLEAN NOT NULL DEFAULT FALSE', 'SELECT 1');
PREPARE inventory_migration FROM @migration_sql;
EXECUTE inventory_migration;
DEALLOCATE PREPARE inventory_migration;
