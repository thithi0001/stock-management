DROP DATABASE IF EXISTS quan_ly_kho_db;
CREATE DATABASE quan_ly_kho_db;
USE quan_ly_kho_db;

DROP TABLE IF EXISTS restock_import_links;
DROP TABLE IF EXISTS restock_requests;
DROP TABLE IF EXISTS monthly_reports;
DROP TABLE IF EXISTS error_reports;
DROP TABLE IF EXISTS approval_exports;
DROP TABLE IF EXISTS approval_imports;
DROP TABLE IF EXISTS export_details;
DROP TABLE IF EXISTS import_details;
DROP TABLE IF EXISTS export_receipts;
DROP TABLE IF EXISTS import_receipts;
DROP TABLE IF EXISTS stocks;
DROP TABLE IF EXISTS user_accounts;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS products;

CREATE TABLE products (
  product_id int PRIMARY KEY AUTO_INCREMENT,
  product_name varchar(100) NOT NULL,
  unit varchar(50) NOT NULL,
  import_price decimal(12,2) NOT NULL CHECK (import_price >= 0),
  export_price decimal(12,2) NOT NULL CHECK (export_price >= 0),
  minimum int NOT NULL DEFAULT 0,
  product_status enum('available','unavailable') NOT NULL DEFAULT 'available'
);

CREATE TABLE suppliers (
  supplier_id int PRIMARY KEY AUTO_INCREMENT,
  supplier_name varchar(100) UNIQUE NOT NULL,
  address varchar(200) NOT NULL,
  phone varchar(15) NOT NULL CHECK (phone REGEXP '^[0-9\\-\\+]{8,15}$'),
  email varchar(100) NOT NULL CHECK (email LIKE '%@%')
);

CREATE TABLE customers (
  customer_id int PRIMARY KEY AUTO_INCREMENT,
  customer_name varchar(100) UNIQUE NOT NULL,
  address varchar(200) NOT NULL,
  phone varchar(15) NOT NULL CHECK (phone REGEXP '^[0-9\\-\\+]{8,15}$'),
  email varchar(100) NOT NULL CHECK (email LIKE '%@%')
);

CREATE TABLE roles (
  role_id int PRIMARY KEY AUTO_INCREMENT,
  role_name varchar(50) UNIQUE NOT NULL
);

CREATE TABLE user_accounts (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  user_password VARCHAR(255) NOT NULL,
  full_name varchar(100) NOT NULL,
  phone VARCHAR(15) NOT NULL CHECK (phone REGEXP '^[0-9\\-\\+]{8,15}$'),
  email VARCHAR(100) NOT NULL CHECK (email LIKE '%@%'),
  role_id INT NOT NULL,
  account_status ENUM('active', 'inactive') DEFAULT 'active',
  FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

CREATE TABLE stocks (
  stock_id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  quantity INT NOT NULL CHECK (quantity >= 0) DEFAULT 0,
  last_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  warning BIT DEFAULT 1,
  stock_status enum('normal','damaged') NOT NULL DEFAULT 'normal',
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE import_receipts (
  receipt_id int PRIMARY KEY AUTO_INCREMENT,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  supplier_id int NOT NULL,
  created_by int NOT NULL,	-- nhân viên mua hàng
  receipt_status enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  total_amount decimal(20,2) NOT NULL CHECK (total_amount >= 0),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
  FOREIGN KEY (created_by) REFERENCES user_accounts(user_id)
);

CREATE TABLE import_details (
  receipt_id int NOT NULL,
  product_id int NOT NULL,
  quantity int NOT NULL CHECK (quantity > 0),
  unit_price decimal(12,2) NOT NULL CHECK (unit_price >= 0),
  total_amount decimal(20,2) NOT NULL CHECK (total_amount >= 0),
  PRIMARY KEY (receipt_id, product_id),
  FOREIGN KEY (receipt_id) REFERENCES import_receipts(receipt_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE export_receipts (
  receipt_id int PRIMARY KEY AUTO_INCREMENT,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  customer_id int NOT NULL,
  created_by int NOT NULL,	-- nhân viên bán hàng
  receipt_status enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  total_amount decimal(20,2) NOT NULL CHECK (total_amount >= 0),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  FOREIGN KEY (created_by) REFERENCES user_accounts(user_id)
);

CREATE TABLE export_details (
  receipt_id int NOT NULL,
  product_id int NOT NULL,
  quantity int NOT NULL CHECK (quantity > 0),
  unit_price decimal(12,2) NOT NULL CHECK (unit_price >= 0),
  total_amount decimal(20,2) NOT NULL CHECK (total_amount >= 0),
  PRIMARY KEY (receipt_id, product_id),
  FOREIGN KEY (receipt_id) REFERENCES export_receipts(receipt_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE approval_imports (
  approval_id int PRIMARY KEY AUTO_INCREMENT,
  import_receipt_id int NOT NULL,
  approved_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_by int NOT NULL,	-- thủ kho
  new_status enum('approved','rejected') NOT NULL,
  reason varchar(500) NOT NULL,
  FOREIGN KEY (import_receipt_id) REFERENCES import_receipts(receipt_id),
  FOREIGN KEY (approved_by) REFERENCES user_accounts(user_id)
);

CREATE TABLE approval_exports (
  approval_id int PRIMARY KEY AUTO_INCREMENT,
  export_receipt_id int NOT NULL,
  approved_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_by int NOT NULL,	-- thủ kho
  new_status enum('approved','rejected') NOT NULL,
  reason varchar(500) NOT NULL,
  FOREIGN KEY (export_receipt_id) REFERENCES export_receipts(receipt_id),
  FOREIGN KEY (approved_by) REFERENCES user_accounts(user_id)
);

CREATE TABLE error_reports (
  error_id int PRIMARY KEY AUTO_INCREMENT,
  error_type enum('system','inventory','import','export','user') DEFAULT 'system',
  message varchar(500) NOT NULL,
  created_by int NOT NULL,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_solved bit DEFAULT 0,
  FOREIGN KEY (created_by) REFERENCES user_accounts(user_id)
);

CREATE TABLE monthly_reports (
  report_id int PRIMARY KEY AUTO_INCREMENT,
  report_type enum('import','export','inventory') NOT NULL,
  from_date datetime NOT NULL,
  to_date datetime NOT NULL,
  file_url varchar(255) NOT NULL,
  created_at datetime DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE restock_requests (
  request_id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  requested_by INT NOT NULL,	-- thủ kho
  notified_to INT NOT NULL,		-- nhân viên mua hàng
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  requested_quantity INT NOT NULL CHECK (requested_quantity > 0),
  request_status ENUM('pending','fulfilled') DEFAULT 'pending',
  note varchar(255) NULL,
  FOREIGN KEY (product_id) REFERENCES products(product_id),
  FOREIGN KEY (requested_by) REFERENCES user_accounts(user_id),
  FOREIGN KEY (notified_to) REFERENCES user_accounts(user_id)
);

CREATE TABLE restock_import_links (
  link_id INT PRIMARY KEY AUTO_INCREMENT,
  restock_request_id INT NOT NULL,
  import_receipt_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  link_status ENUM('active','replaced','rejected','fulfilled') DEFAULT 'active',
  note varchar(255),
  UNIQUE INDEX (restock_request_id, import_receipt_id),
  FOREIGN KEY (restock_request_id) REFERENCES restock_requests(request_id),
  FOREIGN KEY (import_receipt_id) REFERENCES import_receipts(receipt_id)
);
