var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({

	host: "localhost",
	port: 3306,
	user: "root",
	password: "",
	database: "bamazon"

});

connection.connect(function(err) {

	if (err) throw err;

	console.log("Connected to DB!")

	displayAll();
	placeOrder();

});

function displayAll() {

	connection.query("SELECT * FROM products", function(err, res) {

			if (err) throw err;

			console.log("\n----------\n\nCURRENT SELECTION OF PRODUCTS\n");

			for (var i = 0; i < res.length; i++) {

				console.log(res[i].item_id + " | " + res[i].product_name.toUpperCase() + " | " + res[i].department_name + " | $" + res[i].price.toFixed(2));

			};

			console.log("\n----------\n")

		});

};

function placeOrder() {

	connection.query(

		"SELECT * FROM products", function(err, results) {

		inquirer
			.prompt([

				{
					type: "input",
					message: "What would you like to buy?",
					name: "product"
				}, {
					type: "input",
					message: "How many would you like to buy?",
					name: "quantity"
				}
				
				]).then(function(response) {

					var productReq = "";
					var realProduct = false;


					for (var i = 0; i < results.length; i++) {

						if (results[i].product_name.toLowerCase() === response.product.toLowerCase()) {

							productReq = results[i];
							realProduct = true;

						}

					}	

					if (realProduct === false) {

						console.log("\n----------\n\nI'm afraid we can't find what you're looking for... try again or try another product.\n----------\n")
						
						chooseSomethingElse();

					}

					if (isNaN(response.quantity)) {

						console.log("\n----------\n\nI'm afraid we dont't know how many you mean... try again or try another product.\n----------\n")
						
						chooseSomethingElse();

					}		

					if (productReq.stock_quantity >= parseInt(response.quantity) && realProduct === true && isNaN(response.quantity) === false) {

						console.log(realProduct);

						var stockLeft = productReq.stock_quantity - response.quantity;

						var totalPrice = productReq.price * response.quantity;

						connection.query(

							"UPDATE products SET ? WHERE ?", 

							[
								{
									stock_quantity: stockLeft 
								},
								{
									product_name: productReq
								}
							], function(err, res) {

								console.log("\n----------\n\nExcellent - we have plenty of " + response.product + "s in stock so we're able to send " + response.quantity + " to you.\n\nThat'll cost $" + totalPrice.toFixed(2) + "\n\n----------\n");

								chooseSomethingElse();

							}

							);

					}

					else {

						if (realProduct === true && isNaN(response.quantity) === false) {

							console.log("\n----------\n\nI'm afraid we don't have enough " + response.product + "s left!") 

								if (productReq.stock_quantity === 0) {

									console.log("In fact, we probably need to order some more " + response.product + "s as we don't have any left at all...\n\n----------\n");

								}

								else {

									console.log("We only have " + productReq.stock_quantity + " of them so order fewer than that and we'll sort you out.\n\n----------\n");

								}

							chooseSomethingElse();

						}

					}

				});

	});

};

function chooseSomethingElse() {

	inquirer
		.prompt({

			type: "confirm",
			message: "Would you like to order something else?",
			name: "somethingElse"

		}).then(function(response) {

			if (response.somethingElse === true) {

				placeOrder();

			}

			else {

				console.log("\n----------\n\nWell thanks for coming...\n\nHope to see you again soon!\n\n----------\n");

				connection.end();

			}

		});

};



