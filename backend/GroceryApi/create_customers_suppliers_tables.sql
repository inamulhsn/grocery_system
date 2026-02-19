-- Create Customers and Suppliers tables for the grocery system.
-- Run this in pgAdmin (or psql) if your database was created before these entities existed.

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
