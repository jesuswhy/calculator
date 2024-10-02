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
    const customDuty = (preSalePrice) * customDutyRate;

    // Итоговая цена продажи с учётом пошлины
    const salePrice = preSalePrice + customDuty;

    // Конвертация в юани
    const salePriceCNY = salePrice / cnyRate;

    // Отображение результата
    document.getElementById('result').textContent = `${salePriceCNY.toFixed(0)} ¥/тн`; // Добавляем "руб."
}




function calculatePurchasePrice() {
    const usdRate = parseFloat(document.getElementById('usdRate').textContent) || 0;
    const cnyRate = parseFloat(document.getElementById('cnyRate').textContent) || 0;
    const salePriceCNY = parseFloat(document.getElementById('marketPrice2').value);
    const logisticsCostUSD = parseFloat(document.getElementById('logisticsCostUSD2').value);
    const customDutyRate = parseFloat(document.getElementById('customDuty2').value) / 100; // Пошлина в %
    const advance = parseFloat(document.getElementById('advance2').value) / 100; // Размер аванса
    const moneyTerm = parseInt(document.getElementById('moneyTerm2').value);
    const markup = parseFloat(document.getElementById('markup2').value);
    const survey = 600; // Дополнительные фиксированные расходы

    // Конвертация цены продажи из юаней в рубли
    const salePriceRUB = salePriceCNY * cnyRate;

    // Учитываем пошлину
    const customDuty = salePriceRUB * customDutyRate;

    // Предварительная цена продажи без учёта пошлины
    const preSalePrice = salePriceRUB - customDuty;

    // Учитываем возврат НДС
    const VATRefund = (preSalePrice - survey) / 1.1 * 0.1;

    // Общая стоимость закупки без логистики
    const totalCost = (preSalePrice + VATRefund) / (1 + markup / 100);

    // Процент за срок денег, учитывая, что покупатель уже заплатил аванс
    const interestRate = 0.0003896103896; // Среднесуточная процентная ставка
    const remainingAmount = totalCost * (1 - advance); // Сумма после аванса
    const interestCost = remainingAmount * interestRate * moneyTerm;

    // Закупочная цена без учёта логистики
    const purchasePrice = totalCost - interestCost;

    // Логистика в рублях
    const logisticsCostRUB = logisticsCostUSD * usdRate;

    // Общая закупочная цена с учетом логистики
    const finalPurchasePrice = purchasePrice - logisticsCostRUB - survey * 2;

    // Отображение результата
document.getElementById('purchasePriceResult').textContent = `${finalPurchasePrice.toFixed(0)} ₽/тн`; // Добавляем "руб."

}



async function fetchCNYRateFromCB() {
    const url = 'https://api.allorigins.win/get?url=' + encodeURIComponent('https://www.cbr.ru/scripts/XML_daily.asp');

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Ошибка при загрузке: ' + response.status);
        
        const data = await response.json();
        const xml = data.contents;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        const valutes = xmlDoc.getElementsByTagName('Valute');

        let cnyRate = null;
        for (let valute of valutes) {
            const charCode = valute.getElementsByTagName('CharCode')[0].textContent;
            if (charCode === 'CNY') {
                cnyRate = valute.getElementsByTagName('Value')[0].textContent.replace(',', '.');
                break;
            }
        }

        return cnyRate ? parseFloat(cnyRate) : null;
    } catch (error) {
        console.error('Ошибка получения курса с ЦБ:', error);
        return null;
    }
}

function fetchCNYRateFromMOEX() {
    return new Promise((resolve, reject) => {
        const url = 'https://iss.moex.com/iss/engines/currency/markets/selt/securities.jsonp?iss.only=securities,marketdata&securities=CETS:CNYRUB_TOM&iss.meta=off&iss.json=extended&callback=parseMOEXData&lang=ru';
        const script = document.createElement('script');
        script.src = url;

        window.parseMOEXData = function(data) {
            try {
                if (Array.isArray(data) && data.length > 1) {
                    const marketData = data[1].marketdata;
                    const cnyData = marketData.find(item => item.SECID === "CNYRUB_TOM");
                    if (cnyData) {
                        resolve(parseFloat(cnyData.LAST));
                    } else {
                        reject('Курс юаня не найден на MOEX.');
                    }
                } else {
                    reject('Полученные данные не содержат нужной информации.');
                }
            } catch (error) {
                reject('Ошибка обработки данных MOEX: ' + error);
            }
        };

        document.body.appendChild(script);
    });
}

async function fetchCNYRate() {
    try {
        const cnyRateCB = await fetchCNYRateFromCB();
        const cnyRateMOEX = await fetchCNYRateFromMOEX();

        const cnyRate = Math.min(cnyRateCB || Infinity, cnyRateMOEX || Infinity);

        const cnyRateElement = document.getElementById('cnyRate');
        const cnySourceElement = document.getElementById('cnySource');

        cnyRateElement.textContent = cnyRate.toFixed(2);
        if (cnyRate === cnyRateCB) {
            cnySourceElement.textContent = 'Источник: ЦБ РФ';
        } else {
            cnySourceElement.textContent = 'Источник: MOEX';
        }
    } catch (error) {
        console.error('Ошибка получения курса юаня:', error);
        document.getElementById('cnyRate').textContent = 'Ошибка';
    }
}

window.onload = function() {
    fetchCNYRate();
    fetchUSDRate();
};

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
};


