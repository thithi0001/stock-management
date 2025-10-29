DROP TRIGGER IF EXISTS tr_stock_last_updated;
DROP TRIGGER IF EXISTS tr_stock_warning_check;
DROP TRIGGER IF EXISTS tr_handle_import_receipt_update_status;
DROP TRIGGER IF EXISTS tr_handle_link_update_status;
DROP TRIGGER IF EXISTS tr_handle_insert_link;

DELIMITER //
CREATE TRIGGER tr_stock_last_updated
BEFORE UPDATE ON stocks
FOR EACH ROW
BEGIN
	SET new.last_updated_at = current_timestamp();
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

DELIMITER //
CREATE TRIGGER tr_handle_insert_link
AFTER INSERT ON restock_import_links
FOR EACH ROW
BEGIN
	UPDATE restock_import_links
    SET link_status = 'replaced'
    WHERE (restock_request_id = NEW.restock_request_id) AND NOT (import_receipt_id != NEW.import_receipt_id);
END//
DELIMITER ;

SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE, ACTION_STATEMENT 
FROM INFORMATION_SCHEMA.TRIGGERS 
WHERE TRIGGER_SCHEMA = 'quan_ly_kho_db';
