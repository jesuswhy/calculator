async function fetchUSDRate() {
    const url = 'https://api.allorigins.win/get?url=' + encodeURIComponent('https://www.cbr.ru/scripts/XML_daily.asp');

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Ошибка при загрузке: ${response.status}`);
        }

        const data = await response.json(); // Получаем JSON
        const xml = data.contents; // Получаем XML содержимое

        // Парсим XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        const valutes = xmlDoc.getElementsByTagName('Valute');

        let usdRate = null;

        // Ищем данные о долларе
        for (let valute of valutes) {
            const charCode = valute.getElementsByTagName('CharCode')[0].textContent;
            if (charCode === 'USD') {
                usdRate = valute.getElementsByTagName('Value')[0].textContent;
                break;
            }
        }

        if (usdRate) {
            // Заменяем запятую на точку в результате
            const formattedUSDRate = usdRate.replace(',', '.');

            // Выводим курс доллара в элементе на странице
            const usdRateElement = document.getElementById('usdRate');
            if (usdRateElement) {
                usdRateElement.textContent = `${formattedUSDRate}`; // Устанавливаем курс доллара в элемент
            }
            console.log('Курс доллара: ' + formattedUSDRate);
        } else {
            console.error('Курс доллара не найден в данных.');
        }
    } catch (error) {
        console.error('Ошибка обработки данных:', error);
    }
}

function fetchCNYRate() {
    // URL для получения данных с MOEX для курса юаня
    const url = 'https://iss.moex.com/iss/engines/currency/markets/selt/securities.jsonp?iss.only=securities,marketdata&securities=CETS:USD000UTSTOM,CETS:EUR_RUB__TOM,CETS:CNYRUB_TOM,CETS:GBPRUB_TOM&iss.meta=off&iss.json=extended&callback=parseCNYRate&lang=ru';

    // Создаем скрипт с JSONP запросом
    const script = document.createElement('script');
    script.src = url;

    // Функция обратного вызова для обработки полученных данных
    window.parseCNYRate = function(data) {
        try {
            console.log(data); // Выводим данные для отладки
            
            // Проверяем, что данные содержат нужную информацию
            if (Array.isArray(data) && data.length > 1) {
                const marketData = data[1].marketdata; // Получаем массив marketdata

                // Ищем данные о юане
                const cnyData = marketData.find(item => item.SECID === "CNYRUB_TOM");
                if (cnyData) {
                    const cnyRate = cnyData.LAST; // Извлекаем LAST цену
                    const cnyRateElement = document.getElementById('cnyRate');
                    if (cnyRateElement) {
                        cnyRateElement.textContent = `${cnyRate}`; // Устанавливаем курс юаня в элемент
                    }
                    console.log('Курс юаня: ' + cnyRate);
                } else {
                    console.error('Курс юаня не найден в данных.');
                }
            } else {
                console.error('Полученные данные не содержат нужной информации.');
            }
        } catch (error) {
            console.error('Ошибка обработки данных:', error);
        }
    };

    // Добавляем скрипт на страницу
    document.body.appendChild(script);
}


  // Объединяем оба вызова при загрузке страницы
  window.onload = function() {
    fetchUSDRate();
    fetchCNYRate();
  };


  function calculatePrice() {
    const usdRate = parseFloat(document.getElementById('usdRate').textContent) || 0;
    const cnyRate = parseFloat(document.getElementById('cnyRate').textContent) || 0;
    const purchasePrice = parseFloat(document.getElementById('purchasePrice').value);
    const logisticsCostUSD = parseFloat(document.getElementById('logisticsCostUSD').value);
    const customDutyRate = parseFloat(document.getElementById('customDuty').value) / 100; // Пошлина в %
    const advance = parseFloat(document.getElementById('advance').value) / 100; // Размер аванса
    const moneyTerm = parseInt(document.getElementById('moneyTerm').value);
    const markup = parseFloat(document.getElementById('markup').value);
    const survey = 600; // Дополнительные фиксированные расходы

    // Логистика в рублях
    const logisticsCostRUB = logisticsCostUSD * usdRate;

    // Общая стоимость закупки с учетом логистики
    const totalCost = purchasePrice + logisticsCostRUB;

    // Процент за срок денег, учитывая, что покупатель уже заплатил аванс
    const interestRate = 0.0003896103896; // Среднесуточная процентная ставка
    const remainingAmount = totalCost * (1 - advance); // Сумма после аванса
    const interestCost = remainingAmount * interestRate * moneyTerm;

    // Возврат НДС
    const VATRefund = purchasePrice / 1.1 * 0.1;

    // Предварительная цена продажи без учёта пошлины
    const preSalePrice = ((totalCost + interestCost + survey) - VATRefund) * (1 + markup / 100);

    // Пошлина = (Предварительная цена продажи - Логистика) * Размер пошлины в %
    const customDuty = (preSalePrice - logisticsCostRUB) * customDutyRate;

    // Итоговая цена продажи с учётом пошлины
    const salePrice = preSalePrice + customDuty;

    // Конвертация в юани
    const salePriceCNY = salePrice / cnyRate;

    // Отображение результата
    document.getElementById('result').textContent = salePriceCNY.toFixed(2);
}




function calculatePurchasePrice() {
    const usdRate = parseFloat(document.getElementById('usdRate').textContent) || 0;
    const marketPrice = parseFloat(document.getElementById('marketPrice').value);
    const logisticsCostUSD = parseFloat(document.getElementById('logisticsCostUSD').value);
    const customDuty = parseFloat(document.getElementById('customDuty').value);
    const advance = parseFloat(document.getElementById('advance').value) / 100;
    const moneyTerm = parseInt(document.getElementById('moneyTerm').value);
    const markup = parseFloat(document.getElementById('markup').value);

    // Логистика в рублях
    const logisticsCostRUB = logisticsCostUSD * usdRate;

    // Расчет цены закупки с учетом логистики, пошлин и процента денег
    const purchasePrice = (marketPrice - logisticsCostRUB - 2 /* сюрвейер */) * usdRate 
                        - customDuty 
                        - (marketPrice * 0.02) /* МаржаСС */ 
                        - (marketPrice * 0.023 * moneyTerm / 30) /* Стоимость денег */
                        + (marketPrice * 0.09) /* НДС */;

    document.getElementById('purchasePriceResult').textContent = purchasePrice.toFixed(2);
}


function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
  }
  
  function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
  }
  
  // Закрытие модального окна при клике вне его
  window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  };
