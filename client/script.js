

// Function to check whether a string is a valid date
function isValidDate(date) {
    return !isNaN(new Date(date).getTime());
}

// This function validates the inputs 
function dataValidation(orderDescription, cost, purchaseDate, customerName) {
    if (!orderDescription || orderDescription.trim() === "") {
        alert("The order description is required");
        return false;
    }
    if (isNaN(cost) || cost <= 0) {
        alert("The cost for this item should be a positive number");
        return false;
    }
    if (!isValidDate(purchaseDate)) {
        alert("You did not enter a valid date");
        return false;
    }
    if (!customerName || customerName.trim() === "") {
        alert("The Customer Name is required");
        return false;
    }
    return true;
}


// The AddData takes user input, validates the input and then POST to the database as a JSON object
async function addData() {
    const orderDescription = document.getElementById("Order-Description").value;
    const cost = parseFloat(document.getElementById("Item-Price").value);
    const customerName = document.getElementById("customer-details").value;
    const purchaseDate = new Date(document.getElementById("purchaseDate").value).toISOString(); // Converted to ISO-8601 DateTime format

    if (dataValidation(orderDescription, cost, purchaseDate, customerName)) {
        const newExpense = {
            orderDescription: orderDescription.trim(),
            cost: cost,
            purchaseDate: purchaseDate,
            customerName: customerName.trim(),
        };
        try {
            const response = await fetch("http://localhost:8000/createorders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newExpense), 
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Refresh the data after successful creation
            showData();
        } catch (error) {
            console.error("Could not fetch orders:", error);
        }

        // Clear the input fields
        document.getElementById("Order-Description").value = "";
        document.getElementById("Item-Price").value = "";
        document.getElementById("customer-details").value = "";
        document.getElementById("purchaseDate").value = "";
    }
}


// Fetch all orders from the server, returning a list of JSON objects 
async function fetchOrders() {
    try {
        const response = await fetch("http://localhost:8000/readorders");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const orders = await response.json();
        return orders;
    } catch (error) {
        console.error("Could not fetch orders:", error);
        return []; // Return an empty array if there's an error
    }
}

//Fetch an Order, returning a list of json object 
async function fetchOneOrder(id) {
    try {
        const response = await fetch(`http://localhost:8000/readorders/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const order = await response.json();
        return order;
    } catch (error) {
        console.error("Could not fetch orders:", error);
        return []; // Return an empty array if there's an error
    }
}


// Gets the data from the server and presents it in the table in the front end
async function showData() {
    const expenses = await fetchOrders(); // Fetch the list of expenses from the server
    let html = "";
    expenses.forEach((item) => {
        html += `<tr>
                    <td>${item.orderDescription}</td>
                    <td>${item.cost}</td>
                    <td>${item.purchaseDate}</td>
                    <td>${item.customerName}</td>
                    <td>
                        <button onclick="deleteData(${item.orderID})" class="btn-delete">Delete</button>
                        <button onclick="updateData(${item.orderID})" class="btn-update">Edit</button>
                    </td>
                </tr>`;
    });
    document.getElementById('expense-table-body').innerHTML = html;
}

// Function to Delete a data from the table 
async function deleteData(index) {
    try {
        const response = await fetch(`http://localhost:8000/deleteorders/${index}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Refresh the data after successful deletion
        showData();
    } catch (error) {
        console.error("Could not delete order:", error);
    }
}


// Function to Update an order 
async function updateData(index) {
    try {
        const expenses = await fetchOneOrder(index); // Wait for fetchOneOrder to complete
        if (!expenses || expenses.length === 0) {
            console.error("Invalid index or no expenses found.");
            return;
        }

        // Populates the values to be edited 
        const item = expenses[0];
        document.getElementById('Order-Description').value = item.orderDescription;
        document.getElementById('Item-Price').value = item.cost;
        document.getElementById('purchaseDate').value = new Date(item.purchaseDate).toISOString().substring(0,10);
        document.getElementById('customer-details').value = item.customerName;

        // Show the "Update Expense" button and hide the "Add Expense" button
        document.getElementById('submit-expense').style.display = "none";
        document.getElementById('update-expense').style.display = "block";

        // Attach event listener to the "Update Expense" button
        document.getElementById('update-expense').addEventListener('click', async function updateExpenseHandler(event) {
            event.stopPropagation();
            const orderDescription = document.getElementById("Order-Description").value;
            const cost = parseFloat(document.getElementById("Item-Price").value);
            const customerName = document.getElementById("customer-details").value;
            const date = document.getElementById("purchaseDate").value;

            //if the new inputs meet the data validation rules, a JSON object is created
            if (dataValidation(orderDescription, cost, date, customerName)) {
                const updatedExpense = {
                    orderDescription: orderDescription.trim(),
                    cost: cost,
                    purchaseDate: new Date(date).toISOString(),
                    customerName: customerName.trim(),
                };

                try {
                    const response = await fetch(`http://localhost:8000/updateorders/${index}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(updatedExpense), // Use JSON.stringify to serialize the data
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    // Refresh the data after successful update
                    showData();
                } catch (error) {
                    console.error("Could not update order:", error);
                }

                // Clear the input fields
                document.getElementById('Order-Description').value = "";
                document.getElementById('Item-Price').value = "";
                document.getElementById('purchaseDate').value = "";
                document.getElementById('customer-details').value = "";

                // Show the "Add Expense" button after making updates
                document.getElementById('submit-expense').style.display = "block";
                document.getElementById('update-expense').style.display = "none";

                // Remove the event listener after updating the expense
                document.getElementById('update-expense').removeEventListener('click', updateExpenseHandler);
            }
        });
    } catch (error) {
        console.error("Could not fetch expenses:", error);
    }
}

// Event Listener for "Add Expense" button
document.getElementById('submit-expense').addEventListener('click', addData);

// Display data on page load
showData();
