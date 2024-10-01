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

  async function calculatePrice() {
    const usdRateElement = document.getElementById('usdRate');
    const usdRate = parseFloat(usdRateElement.textContent) || 0; // Получаем курс доллара
    if (usdRate === 0) return; // Проверка на случай ошибки

    // Получаем курс юаня
    const cnyRateElement = document.getElementById('cnyRate');
    const cnyRate = parseFloat(cnyRateElement.textContent) || 0; // Корректно извлекаем курс юаня
    if (cnyRate === 0) {
        console.error('Курс юаня равен 0, деление невозможно!');
        return;
    }

    const purchasePrice = parseFloat(document.getElementById('purchasePrice').value) || 0;
    const logisticsCostUSD = parseFloat(document.getElementById('logisticsCostUSD').value) || 0;
    const advance = parseFloat(document.getElementById('advance').value) / 100 || 0;
    const moneyTerm = parseInt(document.getElementById('moneyTerm').value) || 0;
    const customDuty = parseFloat(document.getElementById('customDuty').value) || 0;
    const markup = parseFloat(document.getElementById('markup').value) || 0;

    // Переводим стоимость логистики из долларов в рубли
    const logisticsCostRUB = logisticsCostUSD * usdRate;

    // Общая стоимость закупки с логистикой и пошлиной
    const totalCost = purchasePrice + logisticsCostRUB + customDuty;

    // Дополнительный расчет на основе аванса и срока возврата денег
    const interestRate = 0.05; // Процентная ставка за день (примерная)
    const advanceCost = totalCost * (1 - advance); // Учитываем аванс
    const interestCost = advanceCost * interestRate * moneyTerm;

    // Итоговая цена продажи с учетом наценки, аванса и процентов за срок возврата
    const salePrice = (totalCost + (totalCost * markup / 100) + interestCost) / cnyRate;

    // Отображаем результат
    document.getElementById('result').textContent = salePrice.toFixed(2);
}

// Вызываем функцию при необходимости
calculatePrice();


function calculatePurchasePrice() {
    const marketPrice = parseFloat(document.getElementById('marketPrice').value) || 0; // Ценабиржевая
    const usdRate = parseFloat(document.getElementById('usdRatePurchase').textContent) || 0; // Курс доллара
    const logisticsCost = parseFloat(document.getElementById('logisticsCost').value) || 0; // Ставка перевозка
    const surveyorCost = parseFloat(document.getElementById('surveyorCost').value) || 0; // Расходы на сюрвейера
    const marginality = parseFloat(document.getElementById('marginality').value) || 0; // МаржаСС
    const creditCost = parseFloat(document.getElementById('creditCost').value) || 0; // Стоимость денег
    const returnVAT = parseFloat(document.getElementById('returnVAT').value) || 0; // НДС

    // Расчет пошлины
    let exportDutyRate = 0; // Временная переменная для пошлины
    if (usdRate < 80) {
        exportDutyRate = 0;
    } else if (usdRate < 85) {
        exportDutyRate = 4;
    } else if (usdRate < 90) {
        exportDutyRate = 4.5;
    } else if (usdRate < 95) {
        exportDutyRate = 5.5;
    } else if (usdRate < 100) {
        exportDutyRate = 7;
    }

    const exportDuty = (marketPrice - logisticsCost - surveyorCost) * (exportDutyRate / 100); // Прогнозная экспортная пошлина

    // Расчет цены закупки по новой формуле
    const purchasePrice = (marketPrice - logisticsCost - surveyorCost) * usdRate - exportDuty - (marginality / 100) * (marketPrice - logisticsCost - surveyorCost) - (creditCost / 100) * (marketPrice - logisticsCost - surveyorCost) + (returnVAT / 100) * (marketPrice - logisticsCost - surveyorCost);

    // Отображаем результат
    document.getElementById('purchasePriceResult').textContent = `${purchasePrice.toFixed(2)}`;
}
