// Функция для получения курса USD с сайта ЦБ РФ
async function fetchUSDRate() {
    try {
      const url = 'https://cors-anywhere.herokuapp.com/https://www.cbr.ru/scripts/XML_daily.asp';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Сеть не отвечает');
  
      const xml = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, "text/xml");
      const valutes = xmlDoc.getElementsByTagName('Valute');
  
      let usdRate = null;
  
      for (let valute of valutes) {
        const charCode = valute.getElementsByTagName('CharCode')[0].textContent;
        if (charCode === 'USD') {
          usdRate = valute.getElementsByTagName('Value')[0].textContent;
          break;
        }
      }
  
      // Заменяем запятую на точку
      const formattedUSDRate = parseFloat(usdRate.replace(',', '.'));
  
      // Проверяем, что элемент существует
      const usdRateElement = document.getElementById('usdRate');
      if (usdRateElement) {
        usdRateElement.textContent = formattedUSDRate.toFixed(2);
      }
  
      return formattedUSDRate; // Возвращаем курс доллара
    } catch (error) {
      console.error('Ошибка получения курса USD:', error);
      const usdRateElement = document.getElementById('usdRate');
      if (usdRateElement) {
        usdRateElement.textContent = "Ошибка";
      }
      return null;
    }
  }
  
  
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
  
  // Вызываем функцию для получения курса при загрузке страницы
  window.onload = function() {
    fetchUSDRate();
  };
  
  
  // Автоматически обновляем курсы валют при загрузке страницы
  window.onload = async function() {
    const usdRate = await fetchUSDRate();
    const cnyRate = await fetchCNYRate();
    document.getElementById('usdRate').value = usdRate;
    document.getElementById('cnyRate').value = cnyRate;
  };
  
