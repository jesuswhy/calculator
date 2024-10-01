function fetchUSDRate() {
    // URL для получения данных с MOEX
    const url = 'https://iss.moex.com/iss/engines/futures/markets/forts/boards/RFUD/securities/CRZ4.jsonp?callback=iss_jsonp_65065e9d7fbde1f062c87dd92dcf6c7d59d9d369&iss.meta=off&iss.only=securities%2Cmarketdata%2Cmarketdata_yields&lang=ru';

    // Создаем скрипт с JSONP запросом
    const script = document.createElement('script');
    script.src = url;

    // Функция обратного вызова для обработки полученных данных
    window.iss_jsonp_65065e9d7fbde1f062c87dd92dcf6c7d59d9d369 = function(data) {
        try {
            // Получаем цену последней сделки (LAST)
            const lastPrice = data.marketdata.data[0][8]; // В колонке LAST на позиции 8

            // Проверяем, что элемент существует
            const usdRateElement = document.getElementById('usdRate');
            if (usdRateElement) {
                usdRateElement.textContent = `Курс USD: ${lastPrice} ₽`;
            }

            console.log('Последняя цена фьючерса: ' + lastPrice);
        } catch (error) {
            console.error('Ошибка обработки данных:', error);
        }
    };

    // Добавляем скрипт на страницу
    document.body.appendChild(script);
}

// Вызываем функцию при загрузке страницы
window.onload = function() {
    fetchUSDRate();
};

  
  
  // Функция для получения курса CNY с другого API
  async function fetchCNYRate() {
    const url = 'https://iss.moex.com/iss/engines/futures/markets/forts/boards/RFUD/securities/CRZ4.jsonp?callback=iss_jsonp_65065e9d7fbde1f062c87dd92dcf6c7d59d9d369&iss.meta=off&iss.only=securities%2Cmarketdata%2Cmarketdata_yields&lang=ru&_=1727260238547';
    const response = await fetch(url);
    const text = await response.text();
    
    const jsonpStart = text.indexOf('(');
    const jsonpEnd = text.lastIndexOf(')');
    const jsonString = text.substring(jsonpStart + 1, jsonpEnd);
    
    const json = JSON.parse(jsonString);
    const cnyRate = json.marketdata.data[0][8]; // Получаем цену
    return parseFloat(cnyRate);
  }
  
// Функция для расчета цены продажи
async function calculatePrice() {
    const usdRate = await fetchUSDRate(); // Получаем курс доллара
  
    if (usdRate === null) return; // Проверка на случай ошибки
  
    const purchasePrice = parseFloat(document.getElementById('purchasePrice').value);
    const logisticsCostUSD = parseFloat(document.getElementById('logisticsCostUSD').value);
    const advance = parseFloat(document.getElementById('advance').value) / 100;
    const moneyTerm = parseInt(document.getElementById('moneyTerm').value);
    const customDuty = parseFloat(document.getElementById('customDuty').value);
    const markup = parseFloat(document.getElementById('markup').value);
  
    // Переводим стоимость логистики из долларов в рубли
    const logisticsCostRUB = logisticsCostUSD * usdRate;
  
    // Общая стоимость закупки с логистикой и пошлиной
    const totalCost = purchasePrice + logisticsCostRUB + customDuty;
  
    // Дополнительный расчет на основе аванса и срока возврата денег
    const interestRate = 0.05; // Процентная ставка за день (примерная)
    const advanceCost = totalCost * (1 - advance); // Учитываем аванс
    const interestCost = advanceCost * interestRate * moneyTerm;
  
    // Итоговая цена продажи с учетом наценки, аванса и процентов за срок возврата
    const salePrice = totalCost + (totalCost * markup / 100) + interestCost;
  
    // Отображаем результат
    document.getElementById('result').textContent = salePrice.toFixed(2);
  }
  
  
  // Автоматически обновляем курсы валют при загрузке страницы
  window.onload = async function() {
    const usdRate = await fetchUSDRate();
    const cnyRate = await fetchCNYRate();
    document.getElementById('usdRate').value = usdRate;
    document.getElementById('cnyRate').value = cnyRate;
  };
  
