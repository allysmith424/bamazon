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

	console.log("\n\n");

	chooseAction();

});

function chooseAction() {

	inquirer
		.prompt({

			type: "list",
			message: "Morning Mr Manager, what would you like to do?",
			choices: ["View Products for sale", "View low inventory", "Add to inventory", "Add new product(s)"], 
			name: "actionChoice"

		}).then(function(response) {

			if (response.actionChoice === "View Products for sale") {

				viewProducts();

			}

			else if (response.actionChoice === "View low inventory") {

				viewLowInventory();

			}

			else if (response.actionChoice === "Add to inventory") {

				addToInventory();

			}

			else if (response.actionChoice === "Add new product(s)") {

				addNewProduct();

			}

		})

}

function viewProducts() {

	connection.query("SELECT * FROM products", function(err, res) {

			if (err) throw err;

			console.log("\n----------\n\nCURRENT SELECTION OF PRODUCTS\n");

			for (var i = 0; i < res.length; i++) {

				console.log(res[i].item_id + " | " + res[i].product_name.toUpperCase() + " | " + res[i].department_name + " | $" + res[i].price.toFixed(2) + " | " + res[i].stock_quantity);

			};

			console.log("\n----------\n")

			chooseSomethingElse();

		});

};

function viewLowInventory() {

	connection.query("SELECT * FROM products WHERE stock_quantity < 50", function(err, res) {

			if (err) throw err;

			console.log("\n----------\n\nLOW INVENTORY\n");

			for (var i = 0; i < res.length; i++) {

				console.log(res[i].item_id + " | " + res[i].product_name.toUpperCase() + " | " + res[i].department_name + " | $" + res[i].price.toFixed(2) + " | " + res[i].stock_quantity);

			};

			console.log("\n----------\n");

			chooseSomethingElse();

	});

};

function addToInventory() {

	connection.query("SELECT * FROM products", function(err, res) {

	inquirer
		.prompt([

			{

				type: "list",
				message: "Which product would you like to add to?",
				choices: function() {
					var choicesArray = [];
					for (var i = 0; i < res.length; i++) {
						choicesArray.push(res[i].product_name);
					}
					return choicesArray;
				},
				name: "choice"

			}, {

				type: "input",
				message: "How much would you like to add?",
				name: "amountAdded"

			}

			]).then(function(response) {

				var	product = "";

				for (var i = 0; i < res.length; i++) {

						if (res[i].product_name.toLowerCase() === response.choice.toLowerCase()) {

							product = res[i];

						}

					}

				var stock = product.stock_quantity += response.amountAdded;

		        connection.query(
		        	"UPDATE products SET ? WHERE ?",
		        	[
		        		{
		        			stock_quantity: stock
		        		}, {
		        			product_name: response.choice
		        		}
		        	],
		        	function(err) {

		        		if (err) throw err;

		        		console.log("\n----------\n\nPRODUCT ADDITION\n");

		        		console.log(response.amountAdded + " " +  response.choice + "s added to the inventory.");

		        		console.log("\n----------\n");

		        		chooseSomethingElse();

		        	}
		        );				

			});

	});

};

function addNewProduct() {

	inquirer
		.prompt([

			{

				type: "input",
				message: "What would you like to add to the Bamazon inventory, Mr Manager?",
				name: "product"

			}, {

				type: "input",
				message: "Which department is this going into?",
				name: "department"

			}, {

				type: "input",
				message: "How many would you like to add?",
				name: "stock"

			}, {

				type: "input",
				message: "How much will we sell them for?",
				name: "price"

			}

			]).then(function(response) {

		        connection.query(
		        	"INSERT INTO products SET ?",
		        		{
		        			product_name: response.product,
		        			department_name: response.department,
		        			stock_quantity: response.stock,
		        			price: response.price

		        		}, function(err) {

		        		if (err) throw err;

		        		console.log("\n----------\n\nADDITION TO INVENTORY\n");

		        		console.log(response.stock + " " + response.product + "s added to the " + response.department + " department at $" + response.price + " each.");

		        		console.log("\n\n----------\n");

		        		chooseSomethingElse();

		        	}
		        );				

			});

};

function chooseSomethingElse() {

	inquirer
		.prompt({

			type: "confirm",
			message: "Is there anything else you'd like to do??",
			name: "somethingElse"

		}).then(function(response) {

			if (response.somethingElse === true) {

				chooseAction();

			}

			else {

				console.log("\n----------\n\nNo problemo...\n\nTake it easy Mr. Manager\n\n----------\n");

				connection.end();

			}

		});

};



