<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="styles.css">
    <title>Калькулятор</title>
    <link rel="icon" type="image/svg+xml" href="https://cdn-icons-png.flaticon.com/128/6322/6322544.png">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>

  <div class="currency-block">
    <p>
      <img class="currency-icon" src="https://www.cbr.ru/common/images/icons/dollar.svg" alt="USD" onclick="openModal('usdTip')">
      <span id="usdRate">Загрузка...</span>
    </p>

    <p>
      <img class="currency-icon" src="https://www.cbr.ru/common/images/icons/yuan.svg" alt="CNY" onclick="openModal('cnyTip')">
      <span id="cnyRate">Загрузка...</span>
    </p>
  </div>

  <div id="usdTip" class="modal">
    <div class="modal-content">
      <span class="close" onclick="closeModal('usdTip')">&times;</span>
      <p>Источник: ЦБ РФ</p>
    </div>
  </div>

  <div id="cnyTip" class="modal">
    <div class="modal-content">
      <span class="close" onclick="closeModal('cnyTip')">&times;</span>
      <p id="cnySource">Источник: MOEX</p>
    </div>
  </div>

  <!-- Калькулятор цены продажи масла -->
  <div class="container">
    <h1>Калькулятор цены продажи масла</h1>
    
    <form id="calcFormSell">
      <label for="purchasePrice">Цена закупки (₽):</label>
      <input type="number" id="purchasePrice" name="purchasePrice" placeholder="Цена за тонну с НДС" required>

      <label for="logisticsCostUSD">Стоимость логистики ($):</label>
      <input type="number" id="logisticsCostUSD" name="logisticsCostUSD" placeholder="Цена за тонну" required>

      <label for="customDuty">Пошлина (%):</label>
      <input type="number" id="customDuty" value="0" name="customDuty" required>

      <label for="advance">Размер аванса покупателя (%):</label>
      <input type="number" id="advance" value="0" name="advance" required>

      <label for="moneyTerm">Срок денег (в днях):</label>
      <input type="number" id="moneyTerm" value="120" name="moneyTerm" required>

      <label for="markup">Маржа (%):</label>
      <input type="number" id="markup" value="3" name="markup" required>

      <button type="button" onclick="calculatePrice()">
        <i class="fas fa-calculator"></i> Рассчитать
      </button>
      
    </form>

    <div class="result-box">
      <p>Цена продажи:</p>
      <p id="result">0 ¥/тн</p>
    </div>

    <button class="telegram-button" onclick="openTelegramModal('sell')">
      <i class="fab fa-telegram-plane"></i> Отправить в Telegram
    </button>
  </div>

  <!-- Калькулятор цены закупки масла -->
  <div class="container">
    <h1>Калькулятор цены закупки масла</h1>
    
    <form id="calcFormBuy">
      <label for="marketPrice2">Цена продажи (¥):</label>
      <input type="number" id="marketPrice2" placeholder="Цена за тонну" required>

      <label for="logisticsCostUSD2">Стоимость логистики ($):</label>
      <input type="number" id="logisticsCostUSD2" name="logisticsCostUSD2" placeholder="Цена за тонну" required>

      <label for="customDuty2">Пошлина (%):</label>
      <input type="number" id="customDuty2" value="0" name="customDuty2" required>

      <label for="advance2">Размер аванса покупателя (%):</label>
      <input type="number" id="advance2" value="0" name="advance2" required>

      <label for="moneyTerm2">Срок денег (в днях):</label>
      <input type="number" id="moneyTerm2" value="120" name="moneyTerm2" required>

      <label for="markup2">Маржа (%):</label>
      <input type="number" id="markup2" value="3" name="markup2" required>

      <button type="button" onclick="calculatePurchasePrice()">
        <i class="fas fa-calculator"></i> Рассчитать
      </button>
    </form>

    <div class="result-box">
      <p>Цена закупки с НДС:</p>
      <p id="purchasePriceResult">0 ₽/тн</p>
    </div>

    <button class="telegram-button" onclick="openTelegramModal('buy')">
      <i class="fab fa-telegram-plane"></i> Отправить в Telegram
    </button>
  </div>

  <!-- Модальное окно для выбора чата Telegram -->
  <div id="telegramModal" class="modal">
    <div class="modal-content">
      <span class="close" onclick="closeTelegramModal()">&times;</span>
      <h2>Выберите чат для отправки</h2>
      <select id="telegramChatSelect">
        <option value="">-- Выберите чат --</option>
        <option value="buyer">Покупатели</option>
        <option value="supplier">Поставщики</option>
      </select>
      <button type="button" onclick="sendTelegram()">Отправить</button>
    </div>
  </div>

  <script src="script.js"></script>
</body>

<footer class="footer">
  <p>© 2024 Сила Сибири. Все права защищены.</p>
</footer>

</html>
