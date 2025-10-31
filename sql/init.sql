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

-- trigger

DROP TRIGGER IF EXISTS tr_stock_last_updated;
DROP TRIGGER IF EXISTS tr_stock_warning_check;
DROP TRIGGER IF EXISTS tr_handle_import_receipt_update_status;
DROP TRIGGER IF EXISTS tr_handle_link_update_status;
-- DROP TRIGGER IF EXISTS tr_handle_insert_link;

DELIMITER //
CREATE TRIGGER tr_stock_last_updated
BEFORE UPDATE ON stocks
FOR EACH ROW
BEGIN
	SET NEW.last_updated_at = current_timestamp();
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER tr_stock_warning_check
BEFORE UPDATE ON stocks
FOR EACH ROW
BEGIN
	DECLARE p_min INT;
    SELECT minimum INTO p_min
    FROM products
    WHERE product_id = NEW.product_id;
    
    IF NEW.quantity <= p_min THEN
        SET NEW.warning = 1;
	ELSE
        SET NEW.warning = 0;
    END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER tr_handle_import_receipt_update_status
AFTER UPDATE ON import_receipts
FOR EACH ROW
BEGIN
	IF OLD.receipt_status = 'pending' AND NEW.receipt_status = 'approved' THEN
		UPDATE restock_import_links
        SET link_status = 'fulfilled'
        WHERE import_receipt_id = NEW.receipt_id AND link_status = 'active';
    END IF;
	
    IF OLD.receipt_status = 'pending' AND NEW.receipt_status = 'rejected' THEN
		UPDATE restock_import_links
        SET link_status = 'rejected'
        WHERE import_receipt_id = NEW.receipt_id AND link_status = 'active';
    END IF;
	
    IF OLD.receipt_status = 'rejected' AND NEW.receipt_status = 'pending' THEN
		UPDATE restock_import_links
        SET link_status = 'active'
        WHERE import_receipt_id = NEW.receipt_id AND link_status = 'rejected';
    END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER tr_handle_link_update_status
AFTER UPDATE ON restock_import_links
FOR EACH ROW
BEGIN
	IF NEW.link_status = 'fulfilled' THEN
		UPDATE restock_requests
        SET request_status = 'fulfilled'
        WHERE request_id = NEW.restock_request_id;
    END IF;
END//
DELIMITER ;

-- DELIMITER //
-- CREATE TRIGGER tr_handle_insert_link
-- BEFORE INSERT ON restock_import_links
-- FOR EACH ROW
-- BEGIN
-- 	UPDATE restock_import_links
--     SET link_status = 'replaced'
--     WHERE (restock_request_id = NEW.restock_request_id) AND NOT (import_receipt_id != NEW.import_receipt_id);
-- END//
-- DELIMITER ;

SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE, ACTION_STATEMENT 
FROM INFORMATION_SCHEMA.TRIGGERS 
WHERE TRIGGER_SCHEMA = 'quan_ly_kho_db';

-- stored procedure

DROP PROCEDURE IF EXISTS sp_increase_stock;
DROP PROCEDURE IF EXISTS sp_decrease_stock;

DELIMITER //
CREATE PROCEDURE sp_increase_stock(
	IN import_receipt_id INT
) 
BEGIN
	DECLARE done INT DEFAULT 0;
	DECLARE p_product_id INT;
	DECLARE p_quantity INT;

	DECLARE cur CURSOR FOR
	SELECT product_id, quantity
	FROM import_details
	WHERE receipt_id = import_receipt_id;

	DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

	OPEN cur;

	read_loop: LOOP
		FETCH cur INTO p_product_id, p_quantity;
		IF done THEN
			LEAVE read_loop;
		END IF;

		UPDATE stocks
		SET quantity = quantity + p_quantity
		WHERE product_id = p_product_id;
	END LOOP;

	CLOSE cur;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_decrease_stock(
	IN export_receipt_id INT
) 
BEGIN
	DECLARE done INT DEFAULT 0;
	DECLARE p_product_id INT;
	DECLARE p_quantity INT;

	DECLARE cur CURSOR FOR
	SELECT product_id, quantity
	FROM export_details
	WHERE receipt_id = export_receipt_id;

	DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

	OPEN cur;

	read_loop: LOOP
		FETCH cur INTO p_product_id, p_quantity;
		IF done THEN
			LEAVE read_loop;
		END IF;

		UPDATE stocks
		SET quantity = quantity - p_quantity
		WHERE product_id = p_product_id;
	END LOOP;

	CLOSE cur;
END//
DELIMITER ;

-- role and user data 

insert into roles (role_name) values ("manager");
insert into roles (role_name) values ("storekeeper");
insert into roles (role_name) values ("import staff");
insert into roles (role_name) values ("export staff");

insert into user_accounts (username, user_password, full_name, phone, email, role_id)
values ("quanlykho","$2b$10$geyKyU.yAy3gaRHqDfCIo.cbW8QoM.9P7KsoWsGYbRQFsO75GJKK.","Nguyễn Thị H","0911111111","quanlykho01@gmail.com",1);
insert into user_accounts (username, user_password, full_name, phone, email, role_id)
values ("thukho","$2b$10$1kacTDXENjTr50u.NrkV4ulKSgymOHqccHX4YzhqFaSnRq.xe3IoO","Lê Văn A","0123456789","thukho01@gmail.com",2);
insert into user_accounts (username, user_password, full_name, phone, email, role_id)
values ("nvmh","$10$NM.aeW/5YgqL4e6mMRybN.PMPL5Dx7krmghnr7/cxqhHBo5tUPw6S","Trần Văn B","0836668386","nvmh01@gmail.com",3);
insert into user_accounts (username, user_password, full_name, phone, email, role_id)
values ("nvbh","$2b$10$tqy7MzUdn5kK.V05vHBqn.lCzsZpRVk/adJOxIsXOwua3PAJWvpTG","Hoàng Văn C","0919555999","nvbh01@gmail.com",4);