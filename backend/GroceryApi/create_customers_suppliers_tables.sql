-- Create Customers and Suppliers tables for the grocery system.
-- Run this in pgAdmin (or psql) if your database was created before these entities existed.

-- if you're re‑running this script during development, drop the old tables first
DROP TABLE IF EXISTS "Suppliers";
DROP TABLE IF EXISTS "Customers";

-- Customers: name, email, address, mobile, whatsapp
CREATE TABLE IF NOT EXISTS "Customers" (
    "Id" TEXT NOT NULL,
    "Name" TEXT NOT NULL DEFAULT '',
    "Email" TEXT NOT NULL DEFAULT '',
    "Address" TEXT NOT NULL DEFAULT '',
    "MobileNumber" TEXT NOT NULL DEFAULT '',
    "WhatsAppNumber" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "PK_Customers" PRIMARY KEY ("Id")
);

-- Suppliers: name, email, address, mobile, whatsapp
CREATE TABLE IF NOT EXISTS "Suppliers" (
    "Id" TEXT NOT NULL,
    "Name" TEXT NOT NULL DEFAULT '',
    "Email" TEXT NOT NULL DEFAULT '',
    "Address" TEXT NOT NULL DEFAULT '',
    "MobileNumber" TEXT NOT NULL DEFAULT '',
    "WhatsAppNumber" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "PK_Suppliers" PRIMARY KEY ("Id")
);

COMMENT ON TABLE "Customers" IS 'Customer records with contact details.';
COMMENT ON TABLE "Suppliers" IS 'Supplier records with contact details.';

-- if you already have products table, add a SupplierId column so inventory items can link to suppliers
ALTER TABLE "Products" ADD COLUMN IF NOT EXISTS "SupplierId" TEXT;
-- store encoded barcode value containing product details
ALTER TABLE "Products" ADD COLUMN IF NOT EXISTS "BarcodeValue" TEXT NOT NULL DEFAULT '';
-- optionally create foreign key relationship
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'Products' AND tc.constraint_type='FOREIGN KEY' AND kcu.column_name='SupplierId'
    ) THEN
        ALTER TABLE "Products"
            ADD CONSTRAINT "FK_Products_Suppliers_SupplierId" FOREIGN KEY ("SupplierId") REFERENCES "Suppliers"("Id") ON DELETE RESTRICT;
    END IF;
END$$;
