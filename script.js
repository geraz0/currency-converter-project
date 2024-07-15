document.addEventListener('DOMContentLoaded', async () => {
    const baseCurrencySelect = document.getElementById('base-currency');
    const targetCurrencySelect = document.getElementById('target-currency');
    const amountInput = document.getElementById('amount');
    const convertedAmountDisplay = document.getElementById('converted-amount');
    const historicalRatesContainer = document.getElementById('historical-rates-container');
    const saveFavoriteButton = document.getElementById('save-favorite');
    const favoriteCurrencyPairsContainer = document.getElementById('favorite-currency-pairs');
    const historicalRatesButton = document.getElementById('historical-rates');
    const dateInput = document.getElementById('date');

    const apiKey = 'fca_live_FkOHguHFogGmWLWA48pn6q2K8ihxVm64yNuLzRyb';
    const apiUrl = `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}`;

    // Fetch available currencies and populate dropdowns
    async function fetchCurrencies() {
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            const currencies = Object.keys(data.data);
            currencies.forEach(currency => {
                const option = document.createElement('option');
                option.value = currency;
                option.textContent = currency;
                baseCurrencySelect.appendChild(option.cloneNode(true));
                targetCurrencySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching currencies:', error);
        }
    }

    // Fetch exchange rate data
    async function fetchExchangeRate(baseCurrency, targetCurrency) {
        try {
            const response = await fetch(`${apiUrl}&base_currency=${baseCurrency}`);
            const data = await response.json();
            return data.data[targetCurrency];
        } catch (error) {
            console.error('Error fetching exchange rate:', error);
            return null;
        }
    }

    // Perform currency conversion
    async function convertCurrency() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const amount = parseFloat(amountInput.value);
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount.');
            return;
        }
        const rate = await fetchExchangeRate(baseCurrency, targetCurrency);
        if (rate) {
            const convertedAmount = amount * rate;
            convertedAmountDisplay.textContent = `${convertedAmount.toFixed(2)} ${targetCurrency}`;
        } else {
            alert('Error fetching exchange rate.');
        }
    }

    // Fetch and display historical exchange rates
    async function fetchHistoricalRates() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const date = dateInput.value;
        if (!date) {
            alert('Please select a date.');
            return;
        }
        const historicalApiUrl = `https://api.freecurrencyapi.com/v1/historical?apikey=${apiKey}&date_from=${date}&base_currency=${baseCurrency}`;
        try {
            const response = await fetch(historicalApiUrl);
            const data = await response.json();
            const rate = data.data[targetCurrency];
            historicalRatesContainer.textContent = `Historical exchange rate on ${date}: 1 ${baseCurrency} = ${rate} ${targetCurrency}`;
        } catch (error) {
            console.error('Error fetching historical rates:', error);
            alert('Error fetching historical rates.');
        }
    }

    // Save favorite currency pair
    async function saveFavoritePair() {
        const baseCurrency = baseCurrencySelect.value;
        const targetCurrency = targetCurrencySelect.value;
        const favoritePair = `${baseCurrency}/${targetCurrency}`;
        // Save favoritePair to the server (Express API call)
        try {
            const response = await fetch('/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pair: favoritePair })
            });
            if (response.ok) {
                alert('Favorite pair saved.');
                loadFavoritePairs();
            } else {
                alert('Error saving favorite pair.');
            }
        } catch (error) {
            console.error('Error saving favorite pair:', error);
            alert('Error saving favorite pair.');
        }
    }

    // Load favorite currency pairs
    async function loadFavoritePairs() {
        try {
            const response = await fetch('/favorites');
            const favoritePairs = await response.json();
            favoriteCurrencyPairsContainer.innerHTML = '';
            favoritePairs.forEach(pair => {
                const button = document.createElement('button');
                button.textContent = pair.pair;
                button.addEventListener('click', () => {
                    const [base, target] = pair.pair.split('/');
                    baseCurrencySelect.value = base;
                    targetCurrencySelect.value = target;
                    convertCurrency();
                });
                favoriteCurrencyPairsContainer.appendChild(button);
            });
        } catch (error) {
            console.error('Error loading favorite pairs:', error);
        }
    }

    // Event Listeners
    baseCurrencySelect.addEventListener('change', convertCurrency);
    targetCurrencySelect.addEventListener('change', convertCurrency);
    amountInput.addEventListener('input', convertCurrency);
    historicalRatesButton.addEventListener('click', fetchHistoricalRates);
    saveFavoriteButton.addEventListener('click', saveFavoritePair);

    // Initial Load
    await fetchCurrencies();
    loadFavoritePairs();
});
