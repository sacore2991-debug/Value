/**
 * Average Stock Price Calculator - Cloudflare Worker
 * Website: thevaluestocks.com
 */

export default {
  async fetch(request) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Average Stock Price Calculator | thevaluestocks.com</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .input-focus:focus { outline: none; border-color: #10b981; ring: 2px; ring-color: #10b981; }
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
            -webkit-appearance: none; margin: 0; 
        }
    </style>
    <script>
        window.tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'primary': '#10b981',
                        'primary-dark': '#059669',
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50 min-h-screen">

    <header class="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10">
        <div class="max-w-4xl mx-auto flex justify-between items-center">
            <h1 class="text-xl font-bold text-gray-800">thevaluestocks<span class="text-primary">.com</span></h1>
            <span class="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Stock Average Calculator</span>
        </div>
    </header>

    <main class="max-w-4xl mx-auto p-4 md:p-8">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-0 border-b border-gray-100 bg-gray-50/50">
                <div class="p-6 text-center border-b md:border-b-0 md:border-r border-gray-100">
                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Average Price</p>
                    <p id="average-price" class="text-3xl font-bold text-primary">$0.00</p>
                </div>
                <div class="p-6 text-center border-b md:border-b-0 md:border-r border-gray-100">
                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Shares</p>
                    <p id="total-shares" class="text-3xl font-bold text-gray-800">0.0000</p>
                </div>
                <div class="p-6 text-center">
                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Cost</p>
                    <p id="total-cost" class="text-3xl font-bold text-gray-800">$0.00</p>
                </div>
            </div>

            <div class="p-6 md:p-8">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-lg font-semibold text-gray-700">Purchase History</h2>
                    <button onclick="addRow()" class="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
                        </svg>
                        Add Row
                    </button>
                </div>

                <div id="purchase-list" class="space-y-4"></div>

                <div class="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                    <button onclick="resetCalculator()" class="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-all">
                        Reset All
                    </button>
                    <button onclick="calculateAverage()" class="flex-1 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all">
                        Calculate Now
                    </button>
                </div>
            </div>
        </div>
        <p class="text-center text-gray-400 text-sm mt-8">&copy; 2025 thevaluestocks.com</p>
    </main>

    <script>
        let rowCount = 0;
        const purchaseList = document.getElementById('purchase-list');
        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

        function addRow() {
            rowCount++;
            const rowId = 'row-' + rowCount;
            const div = document.createElement('div');
            div.id = rowId;
            div.className = 'grid grid-cols-12 gap-3 items-end bg-gray-50 p-4 rounded-xl border border-gray-200 transition-all duration-300';
            div.innerHTML = \`
                <div class="col-span-5">
                    <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Shares</label>
                    <input type="number" step="any" id="shares-\${rowCount}" placeholder="0.00" oninput="calculateAverage()"
                        class="w-full px-4 py-2 rounded-lg border border-gray-200 input-focus transition-all text-gray-700">
                </div>
                <div class="col-span-5">
                    <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Price</label>
                    <div class="relative">
                        <span class="absolute left-3 top-2 text-gray-400">$</span>
                        <input type="number" step="any" id="price-\${rowCount}" placeholder="0.00" oninput="calculateAverage()"
                            class="w-full pl-7 pr-4 py-2 rounded-lg border border-gray-200 input-focus transition-all text-gray-700">
                    </div>
                </div>
                <div class="col-span-2 flex justify-end">
                    <button onclick="removeRow('\${rowId}')" class="p-2 text-gray-300 hover:text-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            \`;
            purchaseList.appendChild(div);
            calculateAverage();
        }

        function removeRow(id) {
            if (purchaseList.children.length > 1) {
                document.getElementById(id).remove();
                calculateAverage();
            }
        }

        function calculateAverage() {
            let totalCost = 0, totalShares = 0;
            const shares = purchaseList.querySelectorAll('[id^="shares-"]');
            const prices = purchaseList.querySelectorAll('[id^="price-"]');
            for (let i = 0; i < shares.length; i++) {
                const s = parseFloat(shares[i].value) || 0;
                const p = parseFloat(prices[i].value) || 0;
                if (s > 0 && p >= 0) { totalShares += s; totalCost += (s * p); }
            }
            const avg = totalShares > 0 ? totalCost / totalShares : 0;
            document.getElementById('total-shares').textContent = totalShares.toFixed(4);
            document.getElementById('total-cost').textContent = formatter.format(totalCost);
            document.getElementById('average-price').textContent = formatter.format(avg);
        }

        function resetCalculator() {
            purchaseList.innerHTML = '';
            addRow(); addRow();
            calculateAverage();
        }

        window.onload = () => { addRow(); addRow(); };
    </script>
</body>
</html>
    `;

    return new Response(html, {
      headers: { "content-type": "text/html;charset=UTF-8" },
    });
  },
};
