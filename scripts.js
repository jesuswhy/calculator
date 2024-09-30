document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('respondentForm');
    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const age = document.getElementById('age').value;
            const education = document.getElementById('education').value;

            fetch('https://script.google.com/macros/s/AKfycbx60sngeOCzowTO9qPwGLGe4TsLaalRY7XKpUWy9IVSQvnW2mjrLm3g3cUnPUuOJNe3/exec', {
                method: 'POST',
                body: JSON.stringify({ name, age, education }),
                headers: { 'Content-Type': 'application/json' }
            }).then(response => response.json())
              .then(data => {
                  alert('Ваши данные сохранены.');
                  window.location.href = 'test.html';
              })
              .catch(error => console.error('Ошибка:', error));
        });
    }

    // Таймер и кнопки управления тестом
    let startTime, blackEndTime, redEndTime;
    let timerInterval;
    let currentPhase = "notStarted"; // notStarted, blackPhase, redPhase

    // Запуск таймера
    function startTimer() {
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 1000);
    }

    function updateTimer() {
        const elapsedTime = Date.now() - startTime;
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);

        document.getElementById('timer').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    // Начало теста
    document.getElementById('startButton').addEventListener('click', function () {
        if (currentPhase === "notStarted") {
            currentPhase = "blackPhase";
            document.getElementById('startButton').disabled = true;
            document.getElementById('submitButton').disabled = false;
            startTimer();
        }
    });

    // Завершение теста
    document.getElementById('finishButton').addEventListener('click', function () {
        if (currentPhase === "blackPhase") {
            blackEndTime = Date.now();
            const blackTime = Math.floor((blackEndTime - startTime) / 1000);
            document.getElementById('blackTime').value = blackTime;
            currentPhase = "redPhase";
            alert("Теперь найдите красные числа.");
        } else if (currentPhase === "redPhase") {
            redEndTime = Date.now();
            const redTime = Math.floor((redEndTime - blackEndTime) / 1000);
            document.getElementById('redTime').value = redTime;
            stopTimer();
            currentPhase = "finished";
            alert("Тест завершен.");
            document.getElementById('finishButton').disabled = true;
        }
    });
});
