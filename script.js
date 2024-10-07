async function fetchUSDRate() {
    const url = 'https://api.allorigins.win/get?url=' + encodeURIComponent('https://www.cbr.ru/scripts/XML_daily.asp');

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Ошибка при загрузке: ${response.status}`);
        }

        const data = await response.json(); 
        const xml = data.contents; 

   
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, 'text/xml');
        const valutes = xmlDoc.getElementsByTagName('Valute');

        let usdRate = null;


        for (let valute of valutes) {
            const charCode = valute.getElementsByTagName('CharCode')[0].textContent;
            if (charCode === 'USD') {
                usdRate = valute.getElementsByTagName('Value')[0].textContent;
                break;
            }
        }

        if (usdRate) {
           
            const formattedUSDRate = usdRate.replace(',', '.');

          
            const usdRateElement = document.getElementById('usdRate');
            if (usdRateElement) {
                usdRateElement.textContent = `${formattedUSDRate}`; 
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
    const customDutyRate = parseFloat(document.getElementById('customDuty').value) / 100; 
    const advance = parseFloat(document.getElementById('advance').value) / 100; 
    const moneyTerm = parseInt(document.getElementById('moneyTerm').value);
    const markup = parseFloat(document.getElementById('markup').value);
    const survey = 600; 

    const logisticsCostRUB = logisticsCostUSD * usdRate;

    const totalCost = purchasePrice + logisticsCostRUB;

    const interestRate = 0.0003896103896; 
    const remainingAmount = totalCost * (1 - advance);
    const interestCost = remainingAmount * interestRate * moneyTerm;

    const VATRefund = purchasePrice / 1.1 * 0.1;

    const preSalePrice = ((totalCost + interestCost + survey) - VATRefund) * (1 + markup / 100);

    const customDuty = (preSalePrice) * customDutyRate;

    const salePrice = preSalePrice + customDuty;

    const salePriceCNY = salePrice / cnyRate;

    document.getElementById('result').textContent = `${salePriceCNY.toFixed(0)} ¥/тн`; 
}




function calculatePurchasePrice() {
    const usdRate = parseFloat(document.getElementById('usdRate').textContent) || 0;
    const cnyRate = parseFloat(document.getElementById('cnyRate').textContent) || 0;
    const salePriceCNY = parseFloat(document.getElementById('marketPrice2').value);
    const logisticsCostUSD = parseFloat(document.getElementById('logisticsCostUSD2').value);
    const customDutyRate = parseFloat(document.getElementById('customDuty2').value) / 100; 
    const advance = parseFloat(document.getElementById('advance2').value) / 100; 
    const moneyTerm = parseInt(document.getElementById('moneyTerm2').value);
    const markup = parseFloat(document.getElementById('markup2').value);
    const survey = 600; 

    const salePriceRUB = salePriceCNY * cnyRate;

    const customDuty = salePriceRUB * customDutyRate;

    const preSalePrice = salePriceRUB - customDuty;

    const VATRefund = (preSalePrice - survey) / 1.1 * 0.1;

    const totalCost = (preSalePrice + VATRefund) / (1 + markup / 100);

    const interestRate = 0.0003896103896; 
    const remainingAmount = totalCost * (1 - advance); 
    const interestCost = remainingAmount * interestRate * moneyTerm;

    const purchasePrice = totalCost - interestCost;

    const logisticsCostRUB = logisticsCostUSD * usdRate;

    const finalPurchasePrice = purchasePrice - logisticsCostRUB - survey * 2;

document.getElementById('purchasePriceResult').textContent = `${finalPurchasePrice.toFixed(0)} ₽/тн`; 

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


let currentCalculator = ''; 

function openTelegramModal(calculatorType) {
    currentCalculator = calculatorType;
    document.getElementById('telegramModal').style.display = 'flex';
}

function closeTelegramModal() {
    document.getElementById('telegramModal').style.display = 'none';
}

window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
};

  
  // Функция показа кастомного алерта
  function showAlert() {
    const alertBox = document.getElementById("successAlert");
    alertBox.style.display = "flex"; // Показать алерт
  }
  
  // Функция закрытия кастомного алерта
  function closeAlert() {
    const alertBox = document.getElementById("successAlert");
    alertBox.style.display = "none"; // Скрыть алерт
  }
  


async function sendTelegram() {
    const chatType = document.getElementById('telegramChatSelect').value;
    if (!chatType) {
        alert('Пожалуйста, выберите чат для отправки.');
        return;
    }

    let message = '';
    if (currentCalculator === 'sell') {
        const purchasePrice = document.getElementById('purchasePrice').value || '0';
        const logisticsCostUSD = document.getElementById('logisticsCostUSD').value || '0';
        const customDuty = document.getElementById('customDuty').value || '0';
        const advance = document.getElementById('advance').value || '0';
        const moneyTerm = document.getElementById('moneyTerm').value || '0';
        const markup = document.getElementById('markup').value || '0';
        const result = document.getElementById('result').textContent || '0 ¥/тн';

        message = `🏷️ *Продажа*\n` +
                  `Цена закупки: ${purchasePrice} ₽/тн\n` +
                  `Стоимость логистики: ${logisticsCostUSD} $/тн\n` +
                  `Пошлина: ${customDuty}%\n` +
                  `Размер аванса покупателя: ${advance}%\n` +
                  `Срок денег: ${moneyTerm} дней\n` +
                  `Маржа: ${markup}%\n` +
                  `👉 Цена продажи: ${result}`;
    } else if (currentCalculator === 'buy') {
        const marketPrice2 = document.getElementById('marketPrice2').value || '0';
        const logisticsCostUSD2 = document.getElementById('logisticsCostUSD2').value || '0';
        const customDuty2 = document.getElementById('customDuty2').value || '0';
        const advance2 = document.getElementById('advance2').value || '0';
        const moneyTerm2 = document.getElementById('moneyTerm2').value || '0';
        const markup2 = document.getElementById('markup2').value || '0';
        const purchasePriceResult = document.getElementById('purchasePriceResult').textContent || '0 ₽/тн';

        message = `🛒 *Закупка*\n` +
                  `Цена продажи: ${marketPrice2} ¥/тн\n` +
                  `Стоимость логистики: ${logisticsCostUSD2} $/тн\n` +
                  `Пошлина: ${customDuty2}%\n` +
                  `Размер аванса покупателя: ${advance2}%\n` +
                  `Срок денег: ${moneyTerm2} дней\n` +
                  `Маржа: ${markup2}%\n` +
                  `👉 Цена закупки с НДС: ${purchasePriceResult}`;
    } else {
        alert('Неизвестный тип калькулятора.');
        return;
    }

    const botToken = '7034021771:AAFJMbmA2XjGFFpvQqTymR_AJ5-xwKq1g6c'; 
    const buyerChannelID = '-1002049012362';  
    const supplierChannelID = '-1001855848392';  

    let chatID = '';
    if (chatType === 'buyer') {
        chatID = buyerChannelID;
    } else if (chatType === 'supplier') {
        chatID = supplierChannelID;
    } else {
        alert('Неверный выбор чата.');
        return;
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatID,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        const result = await response.json();
        if (result.ok) {
            showAlert();
            closeTelegramModal();
        } else {
            console.error('Ошибка отправки в Telegram:', result.description);
            alert('Ошибка отправки сообщения в Telegram.');
        }
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        alert('Произошла ошибка при отправке сообщения.');
    }
}



window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
};


async function sendToTelegram(channelType) {
    const buyerChannelID = '667861609';  
    const supplierChannelID = '667861609';  
    const botToken = '7741982545:AAEfuO1rs0rr6W6vtX-IgkM5pkCtEnBsCT8';  

    const chatID = channelType === 'buyer' ? buyerChannelID : supplierChannelID;

    const salePriceCNY = document.getElementById('result').textContent || 'Нет данных';
    const purchasePrice = document.getElementById('purchasePriceResult').textContent || 'Нет данных';

    const message = `Результаты расчета:\nЦена продажи: ${salePriceCNY}\nЦена закупки: ${purchasePrice}`;

    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatID,
                text: message
            })
        });

        const result = await response.json();
        if (result.ok) {
            alert('Сообщение успешно отправлено!');
        } else {
            alert('Ошибка отправки сообщения в Telegram.');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при отправке сообщения.');
    }
}
