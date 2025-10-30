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