// --- 1. TradingView Widget Dinamis ---
window.addEventListener('DOMContentLoaded', () => {
  const pairSelect = document.getElementById('pairSelect');
  
  // Pastikan elemen dengan ID 'pairSelect' ada
  if (pairSelect) {
    pairSelect.addEventListener('change', function(e) {
      const rawSymbol = e.target.value;
      const shortSymbol = rawSymbol.replace("OANDA:", "");
      
      // Bersihkan widget lama
      const container = document.getElementById('tradingview_chart');
      container.innerHTML = '';

      // Tampilkan TradingView
      new TradingView.widget({
        "width": "100%",
        "height": 500,
        "symbol": rawSymbol,
        "interval": "1",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "container_id": "tradingview_chart"
      });

      // Tampilkan chart AI dan berita
      drawChart(shortSymbol);
      displayNews(shortSymbol.slice(0, 3)); // Ambil 3 huruf awal misal "XAU"
    });
  } else {
    console.error('Element with ID "pairSelect" not found');
  }

  // --- Inisialisasi awal ---
  drawChart("XAU/USD");
  displayNews("XAU");
});

// --- 2. Get Candlestick Data ---
async function getCandlestick(symbol = "XAU/USD", interval = "1min") {
  const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&apikey=bf68535d02454738a2b3514dd28ed55d&outputsize=100`;
  const response = await fetch(url);
  const data = await response.json();
  return data.values.map(c => ({
    time: new Date(c.datetime).getTime(),
    open: parseFloat(c.open),
    high: parseFloat(c.high),
    low: parseFloat(c.low),
    close: parseFloat(c.close)
  })).reverse(); // Urutkan dari lama ke baru
}

// --- 3. Gambar Candlestick Chart AI ---
async function drawChart(symbol = "XAU/USD") {
  const data = await getCandlestick(symbol);
  const ctx = document.getElementById('aiChart').getContext('2d');

  // Hapus chart lama jika ada
  if (window.aiChartInstance) {
    window.aiChartInstance.destroy();
  }

  window.aiChartInstance = new Chart(ctx, {
    type: 'candlestick',
    data: {
      datasets: [{
        label: symbol,
        data: data
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'minute'
          }
        }
      }
    }
  });

  // --- Analisa AI ---
  const fib = calculateFibonacci(data[data.length - 1].high, data[data.length - 1].low);
  const snr = detectSupportResistance(data);
  const zones = detectSupplyDemand(data);

  console.log("Fibonacci:", fib);
  console.log("SNR:", snr);
  console.log("Supply/Demand:", zones);
}

// --- 4. Fibonacci ---
function calculateFibonacci(high, low) {
  return [0, 0.236, 0.382, 0.5, 0.618, 1].map(level => ({
    level: level,
    price: high - (high - low) * level
  }));
}

// --- 5. Support & Resistance ---
function detectSupportResistance(data) {
  const levels = [];
  data.forEach((c, i) => {
    if (i > 2 && i < data.length - 2) {
      const isHigh = c.high > data[i - 1].high && c.high > data[i + 1].high;
      const isLow = c.low < data[i - 1].low && c.low < data[i + 1].low;
      if (isHigh || isLow) levels.push(isHigh ? c.high : c.low);
    }
  });
  return [...new Set(levels.map(p => p.toFixed(2)))];
}

// --- 6. Supply & Demand ---
function detectSupplyDemand(data) {
  const zones = [];
  data.forEach((c, i) => {
    const body = Math.abs(c.open - c.close);
    const range = c.high - c.low;
    if (body > range * 0.7) {
      zones.push({
        type: c.close > c.open ? "demand" : "supply",
        price: c.close,
        time: c.time
      });
    }
  });
  return zones;
}

// --- 7. Berita dari Finnhub ---
async function getNews(symbol = "XAU") {
  const url = `https://finnhub.io/api/v1/news?category=forex&token=d0bp6o9r01qs9fjig620d0bp6o9r01qs9fjig62g`;
  const response = await fetch(url);
  const news = await response.json();
  return news.filter(n => n.headline.includes(symbol));
}

async function displayNews(symbol = "XAU") {
  const news = await getNews(symbol);
  const newsContainer = document.getElementById('newsList');
  newsContainer.innerHTML = '';
  news.forEach(n => {
    const div = document.createElement('div');
    div.innerHTML = `<strong>${n.headline}</strong><br><small>${new Date(n.datetime).toLocaleString()}</small>`;
    newsContainer.appendChild(div);
  });
}