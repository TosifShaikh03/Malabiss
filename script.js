 // Initialize data from local storage
        let purchases = JSON.parse(localStorage.getItem('purchases')) || [];
        let sales = JSON.parse(localStorage.getItem('sales')) || [];

        // Theme Toggle
        function toggleTheme() {
            const body = document.body;
            const themeToggle = document.getElementById('themeToggle');
            body.classList.toggle('dark-mode');
            const isDarkMode = body.classList.contains('dark-mode');
            themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        }

        // Load theme from localStorage
        function loadTheme() {
            const theme = localStorage.getItem('theme');
            const themeToggle = document.getElementById('themeToggle');
            if (theme === 'dark') {
                document.body.classList.add('dark-mode');
                themeToggle.textContent = '☀️';
            } else {
                themeToggle.textContent = '🌙';
            }
        }

        // Toggle Sidebar
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.toggle('active');
        }

        // Show specific page
        function showPage(pageId) {
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));

            document.getElementById(pageId).classList.add('active');
            document.getElementById(`link-${pageId}`).classList.add('active');

            if (pageId === 'page1') loadPurchases();
            if (pageId === 'page2') loadSales();
            if (pageId === 'page3') {
                document.getElementById('reportSummary').innerHTML = '';
            }

            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('active');
            }
        }

        // Calculate remaining quantity for a product
        function getRemainingQuantity(productName) {
            const totalPurchased = purchases
                .filter(p => p.productName === productName)
                .reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
            const totalSold = sales
                .filter(s => s.soldProduct === productName)
                .reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
            return totalPurchased - totalSold;
        }

        // Page 1: Add Purchase
        function addPurchase() {
            const productName = document.getElementById('productName').value;
            const purchaseAmount = parseFloat(document.getElementById('purchaseAmount').value);
            const sellingPrice = parseFloat(document.getElementById('sellingPrice').value);
            const quantity = parseInt(document.getElementById('purchaseQuantity').value);
            const purchaseDate = document.getElementById('purchaseDate').value;

            if (!productName || !purchaseAmount || !sellingPrice || !quantity || quantity < 1 || !purchaseDate) {
                alert('Please fill all fields with valid values');
                return;
            }

            const purchase = { productName, purchaseAmount, sellingPrice, quantity, purchaseDate };
            purchases.push(purchase);
            localStorage.setItem('purchases', JSON.stringify(purchases));
            loadPurchases();
            document.getElementById('productName').value = '';
            document.getElementById('purchaseAmount').value = '';
            document.getElementById('sellingPrice').value = '';
            document.getElementById('purchaseQuantity').value = '';
            document.getElementById('purchaseDate').value = '';
        }

        function deletePurchase(index) {
            if (confirm('Are you sure you want to delete this purchase?')) {
                purchases.splice(index, 1);
                localStorage.setItem('purchases', JSON.stringify(purchases));
                loadPurchases();
                updateProductDropdown();
            }
        }

        function loadPurchases() {
            const tbody = document.getElementById('purchaseTableBody');
            tbody.innerHTML = '';
            purchases.forEach((purchase, index) => {
                const remainingQuantity = getRemainingQuantity(purchase.productName);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td data-label="Product">${purchase.productName}</td>
                    <td data-label="Purchase Amount">$${purchase.purchaseAmount.toFixed(2)}</td>
                    <td data-label="Selling Price">$${purchase.sellingPrice.toFixed(2)}</td>
                    <td data-label="Quantity">${purchase.quantity}</td>
                    <td data-label="Remaining Quantity">${remainingQuantity >= 0 ? remainingQuantity : 'N/A'}</td>
                    <td data-label="Date">${purchase.purchaseDate}</td>
                    <td data-label="Action"><button class="delete-btn" onclick="deletePurchase(${index})">Delete</button></td>
                `;
                tbody.appendChild(row);
            });
            updateProductDropdown();
        }
        // Page 2: Add Sale
        function updateProductDropdown() {
            const select = document.getElementById('soldProduct');
            select.innerHTML = '<option value="">Select Product</option>';
            const uniqueProducts = [...new Set(purchases.map(p => p.productName))];
            uniqueProducts.forEach(product => {
                const remainingQuantity = getRemainingQuantity(product);
                if (remainingQuantity > 0) {
                    const option = document.createElement('option');
                    option.value = product;
                    option.textContent = `${product} (${remainingQuantity} available)`;
                    select.appendChild(option);
                }
            });
        }

        function addSale() {
            const customerName = document.getElementById('customerName').value;
            const customerContact = document.getElementById('customerContact').value;
            const soldProduct = document.getElementById('soldProduct').value;
            const sellingAmount = parseFloat(document.getElementById('sellingAmount').value);
            const quantity = parseInt(document.getElementById('saleQuantity').value);
            const saleDate = document.getElementById('saleDate').value;

            if (!customerName || !customerContact || !soldProduct || !sellingAmount || !quantity || quantity < 1 || !saleDate) {
                alert('Please fill all fields with valid values');
                return;
            }

            const remainingQuantity = getRemainingQuantity(soldProduct);
            if (quantity > remainingQuantity) {
                alert(`Cannot sell ${quantity} units. Only ${remainingQuantity} units available for ${soldProduct}.`);
                return;
            }

            const sale = { customerName, customerContact, soldProduct, sellingAmount, quantity, saleDate };
            sales.push(sale);
            localStorage.setItem('sales', JSON.stringify(sales));
            loadSales();
            loadPurchases(); // Update remaining quantities in Page 1
            document.getElementById('customerName').value = '';
            document.getElementById('customerContact').value = '';
            document.getElementById('soldProduct').value = '';
            document.getElementById('sellingAmount').value = '';
            document.getElementById('saleQuantity').value = '';
            document.getElementById('saleDate').value = '';
        }

        function deleteSale(index) {
            if (confirm('Are you sure you want to delete this sale?')) {
                sales.splice(index, 1);
                localStorage.setItem('sales', JSON.stringify(sales));
                loadSales();
                loadPurchases(); // Update remaining quantities in Page 1
                updateProductDropdown();
            }
        }
function loadSales() {
    const tbody = document.getElementById('salesTableBody');
    tbody.innerHTML = '';
    sales.forEach((sale, index) => {
        const purchase = purchases.find(p => p.productName === sale.soldProduct);
        const earnedAmount = purchase ? ((sale.sellingAmount - purchase.purchaseAmount) * sale.quantity).toFixed(2) : 'N/A';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Customer">${sale.customerName}</td>
            <td data-label="Contact">${sale.customerContact}</td>
            <td data-label="Product">${sale.soldProduct}</td>
            <td data-label="Amount">$${sale.sellingAmount.toFixed(2)}</td>
            <td data-label="Quantity">${sale.quantity}</td>
            <td data-label="Earned Amount">${earnedAmount !== 'N/A' ? (earnedAmount >= 0 ? '$' + earnedAmount : '-$' + Math.abs(earnedAmount)) : 'N/A'}</td>
            <td data-label="Date">${sale.saleDate}</td>
            <td data-label="Action"><button class="delete-btn" onclick="deleteSale(${index})">Delete</button></td>
        `;
        tbody.appendChild(row);
    });
}

        // Page 3: Generate Monthly Report
function generateReport() {
    console.log('generateReport() called');
    const reportMonth = document.getElementById('reportMonth').value;
    if (!reportMonth) {
        alert('Please select a month');
        console.log('No month selected');
        return;
    }

    try {
        const [year, month] = reportMonth.split('-');
        console.log(`Filtering for ${year}-${month}`);
        const filteredSales = sales.filter(sale => sale.saleDate && sale.saleDate.startsWith(`${year}-${month}`));
        const filteredPurchases = purchases.filter(purchase => purchase.purchaseDate && purchase.purchaseDate.startsWith(`${year}-${month}`));

        const totalSales = filteredSales.reduce((sum, sale) => sum + (Number(sale.sellingAmount) * sale.quantity || 0), 0);
        const totalInvestment = filteredPurchases.reduce((sum, purchase) => sum + (Number(purchase.purchaseAmount) * purchase.quantity  || 0), 0);
        const profit = filteredSales.reduce((sum, sale) => {
            const purchase = purchases.find(p => p.productName === sale.soldProduct);
            return sum + (purchase ? (sale.sellingAmount - purchase.purchaseAmount) * sale.quantity : 0);
        }, 0);
        console.log(`Total Sales: ${totalSales}, Total Investment: ${totalInvestment}, Profit: ${profit}`);

        const reportSummary = document.getElementById('reportSummary');
        if (!reportSummary) {
            console.error('reportSummary element not found');
            alert('Error: Report container not found');
            return;
        }

        if (filteredSales.length === 0 && filteredPurchases.length === 0) {
            console.log('No data for selected month');
            reportSummary.innerHTML = '<p class="no-data">No data available for the selected month.</p>';
            return;
        }

        reportSummary.innerHTML = `
            <div class="report-text">
                <h3>Financial Overview for ${year}-${month}</h3>
                <p>Total Sales: $${totalSales.toFixed(2)}</p>
                <p>Total Investment: $${totalInvestment.toFixed(2)}</p>
                <p>Profit: $${profit.toFixed(2)}</p>
            </div>
        `;
        console.log('Report text displayed');
    } catch (error) {
        console.error('Error in generateReport:', error);
        alert('An error occurred while generating the report. Please check the console for details.');
    }
}

        // Initial load
        loadTheme();
        loadPurchases();
