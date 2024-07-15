
document.addEventListener('DOMContentLoaded', () => {
  const baseCurrencySelect = document.getElementById('base-currency');
  const targetCurrencySelect = document.getElementById('target-currency');
  const amountInput = document.getElementById('amount');
  const convertedAmountSpan = document.getElementById('converted-amount');
  const historicalRatesButton = document.getElementById('historical-rates');
  const saveFavoriteButton = document.getElementById('save-favorite');
  const favoriteCurrencyPairsContainer = document.getElementById('favorite-currency-pairs');

  const apiKey = 'fca_live_FkOHguHFogGmWLWA48pn6q2K8ihxVm64yNuLzRyb';
  const apiUrl = `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&currencies=EUR,USD,CAD`;

  let exchangeRates = {};

  // Fetch initial exchange rate data and populate dropdowns
  fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
          exchangeRates = data.data;
          const currencies = Object.keys(exchangeRates);
          currencies.forEach(currency => {
              const option1 = document.createElement('option');
              option1.value = currency;
              option1.textContent = currency;
              baseCurrencySelect.appendChild(option1);

              const option2 = document.createElement('option');
              option2.value = currency;
              option2.textContent = currency;
              targetCurrencySelect.appendChild(option2);
          });
          calculateConversion();
      });

  // Event listeners
  baseCurrencySelect.addEventListener('change', calculateConversion);
  targetCurrencySelect.addEventListener('change', calculateConversion);
  amountInput.addEventListener('input', calculateConversion);
  historicalRatesButton.addEventListener('click', viewHistoricalRates);
  saveFavoriteButton.addEventListener('click', saveFavoritePair);

  function calculateConversion() {
      const baseCurrency = baseCurrencySelect.value;
      const targetCurrency = targetCurrencySelect.value;
      const amount = parseFloat(amountInput.value);

      if (!amount || amount < 0) {
          convertedAmountSpan.textContent = 'Invalid amount';
          return;
      }

      if (baseCurrency === targetCurrency) {
          convertedAmountSpan.textContent = amount;
          return;
      }

      const rate = exchangeRates[targetCurrency] / exchangeRates[baseCurrency];
      const convertedAmount = (amount * rate).toFixed(2);
      convertedAmountSpan.textContent = `${convertedAmount} ${targetCurrency}`;
  }

  function viewHistoricalRates() {
      // Replace with actual historical rates API call
      const baseCurrency = baseCurrencySelect.value;
      const targetCurrency = targetCurrencySelect.value;
      const date = '2021-01-01'; // Hardcoded date for the example
      const historicalApiUrl = `https://api.freecurrencyapi.com/v1/historical?apikey=${apiKey}&base_currency=${baseCurrency}&date_from=${date}&currencies=${targetCurrency}`;

      fetch(historicalApiUrl)
          .then(response => response.json())
          .then(data => {
              const rate = data.data[date][targetCurrency];
              const historicalRateContainer = document.getElementById('historical-rates-container');
              historicalRateContainer.textContent = `Historical exchange rate on ${date}: 1 ${baseCurrency} = ${rate} ${targetCurrency}`;
          });
  }

  function saveFavoritePair() {
      const baseCurrency = baseCurrencySelect.value;
      const targetCurrency = targetCurrencySelect.value;
      const pair = `${baseCurrency}/${targetCurrency}`;

      // Save the pair in local storage (replace with actual database saving)
      let favoritePairs = JSON.parse(localStorage.getItem('favoritePairs')) || [];
      if (!favoritePairs.includes(pair)) {
          favoritePairs.push(pair);
          localStorage.setItem('favoritePairs', JSON.stringify(favoritePairs));
          displayFavoritePairs();
      }
  }

  function displayFavoritePairs() {
      const favoritePairs = JSON.parse(localStorage.getItem('favoritePairs')) || [];
      favoriteCurrencyPairsContainer.innerHTML = '';
      favoritePairs.forEach(pair => {
          const button = document.createElement('button');
          button.textContent = pair;
          button.addEventListener('click', () => {
              const [base, target] = pair.split('/');
              baseCurrencySelect.value = base;
              targetCurrencySelect.value = target;
              calculateConversion();
          });
          favoriteCurrencyPairsContainer.appendChild(button);
      });
  }

  displayFavoritePairs();
});
