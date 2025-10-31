USE quan_ly_kho_db;
DROP PROCEDURE IF EXISTS sp_increase_stock;
DROP PROCEDURE IF EXISTS sp_decrease_stock;
DROP PROCEDURE IF EXISTS sp_report_import_by_month;
DROP PROCEDURE IF EXISTS sp_report_export_by_month;
DROP PROCEDURE IF EXISTS sp_report_inventory_snapshot;

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

DELIMITER //

-- Báo cáo 1: Tổng hợp Nhập kho (Theo tháng ĐÃ DUYỆT)
CREATE PROCEDURE sp_report_import_by_month(
    IN report_month INT,
    IN report_year INT
)
BEGIN
    SELECT 
        p.product_id,
        p.product_name,
        p.unit,
        SUM(id.quantity) AS total_quantity_imported,
        SUM(id.total_amount) AS total_value_imported
    FROM import_details id
    JOIN products p ON id.product_id = p.product_id
    JOIN approval_imports ai ON id.receipt_id = ai.import_receipt_id
    WHERE 
        ai.new_status = 'approved'
        AND MONTH(ai.approved_at) = report_month
        AND YEAR(ai.approved_at) = report_year
    GROUP BY 
        p.product_id, p.product_name, p.unit
    ORDER BY 
        total_value_imported DESC;
END//

-- Báo cáo 2: Tổng hợp Xuất kho (Theo tháng ĐÃ DUYỆT)
CREATE PROCEDURE sp_report_export_by_month(
    IN report_month INT,
    IN report_year INT
)
BEGIN
    SELECT 
        p.product_id,
        p.product_name,
        p.unit,
        SUM(ed.quantity) AS total_quantity_exported,
        SUM(ed.total_amount) AS total_value_exported
    FROM export_details ed
    JOIN products p ON ed.product_id = p.product_id
    JOIN approval_exports ae ON ed.receipt_id = ae.export_receipt_id
    WHERE 
        ae.new_status = 'approved'
        AND MONTH(ae.approved_at) = report_month
        AND YEAR(ae.approved_at) = report_year
    GROUP BY 
        p.product_id, p.product_name, p.unit
    ORDER BY 
        total_quantity_exported DESC;
END//

-- Báo cáo 3: Tình hình Tồn kho Hiện tại
CREATE PROCEDURE sp_report_inventory_snapshot()
BEGIN
    SELECT 
        p.product_id,
        p.product_name,
        p.unit,
        s.quantity AS current_stock,
        p.minimum AS minimum_level,
        s.warning,
        s.stock_status,
        s.last_updated_at
    FROM stocks s
    JOIN products p ON s.product_id = p.product_id
    ORDER BY 
        p.product_name ASC;
END//

DELIMITER ;