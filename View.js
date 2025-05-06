// Script untuk mengganti simbol chart berdasarkan pilihan
function loadChart(symbol) {
  new TradingView.widget({
    "width": "100%",
    "height": 500,
    "symbol": symbol,
    "interval": "1",             // Timeframe
    "timezone": "Etc/UTC",
    "theme": "dark",
    "style": "1",
    "locale": "en",
    "toolbar_bg": "#f1f3f6",
    "enable_publishing": false,
    "allow_symbol_change": true,
    "container_id": "tradingview_chart"
  });
}

// Memuat chart pertama kali
loadChart("OANDA:XAUUSD");

// Event listener untuk perubahan simbol
document.getElementById('pairSelect').addEventListener('change', function(e) {
  loadChart(e.target.value);
});