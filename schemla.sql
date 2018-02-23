CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (

	item_id INT AUTO_INCREMENT PRIMARY KEY,

	product_name VARCHAR(60) NOT NULL,

	department_name VARCHAR(60),

	price DECIMAL(10,2),

	stock_quantity INT(10)

);