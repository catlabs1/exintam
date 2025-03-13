let incorrectQuestions = JSON.parse(localStorage.getItem('incorrectQuestions')) || [];
let questions = []; // Загружаем базу вопросов

// Загружаем вопросы и начинаем тест
fetch('questions.json') // Замените на ваш JSON-файл
    .then(response => response.json())
    .then(data => {
        questions = data.filter(q => incorrectQuestions.includes(q.question_number));
        showQuestion();
    });

function showQuestion() {
    if (incorrectQuestions.length === 0) {
        alert("Вы исправили все ошибки! Возвращаемся на главную.");
        localStorage.removeItem('incorrectQuestions');
        window.location.href = "index.html";
        return;
    }

    // 🔥 Выбираем случайный вопрос
    let randomIndex = Math.floor(Math.random() * incorrectQuestions.length);
    let question = questions.find(q => q.question_number === incorrectQuestions[randomIndex]);

    let container = document.getElementById('questionContainer');
    container.innerHTML = ""; // Очищаем контейнер перед новым вопросом

    let questionElement = document.createElement('div');
    questionElement.classList.add('question');
    questionElement.innerHTML = `<p>${question.question}</p>`;

    let answerContainer = document.createElement('div');

    if (question.question_type === "onecheck") {
        question.answers.forEach((answer, i) => {
            let label = document.createElement('label');
            label.innerHTML = `<input type="radio" name="answer" value="${i}"> ${answer}`;
            answerContainer.appendChild(label);
        });
    } else if (question.question_type === "multicheck") {
        question.answers.forEach((answer, i) => {
            let label = document.createElement('label');
            label.innerHTML = `<input type="checkbox" name="answer" value="${i}"> ${answer}`;
            answerContainer.appendChild(label);
        });
    } else if (question.question_type === "stringcheck") {
        let input = document.createElement('input');
        input.type = "text";
        input.id = "textAnswer";
        answerContainer.appendChild(input);
    }

    let submitButton = document.createElement('button');
    submitButton.innerText = "Ответить";
    submitButton.addEventListener('click', () => checkAnswer(question, randomIndex));

    container.appendChild(questionElement);
    container.appendChild(answerContainer);
    container.appendChild(submitButton);
}

function checkAnswer(question, randomIndex) {
    let userAnswer = getUserAnswer(question.question_type);
    let correctAnswer = question.correct_answer;

    let isCorrect = false;

    if (question.question_type === "onecheck") {
        isCorrect = userAnswer === (parseInt(correctAnswer) - 1);
    } 
    else if (question.question_type === "multicheck") {
        let correctAnswers = correctAnswer.split('').map(num => parseInt(num) - 1).sort();
        let userAnswers = userAnswer.sort();
        isCorrect = JSON.stringify(userAnswers) === JSON.stringify(correctAnswers);
    } 
    else if (question.question_type === "stringcheck") {
        isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    }

    if (isCorrect) {
        incorrectQuestions.splice(randomIndex, 1); // ✅ Удаляем правильный ответ из списка
        localStorage.setItem('incorrectQuestions', JSON.stringify(incorrectQuestions));
        alert("Правильно ✅");
    } else {
        alert("Неправильно! ❌");
    }

    showQuestion(); // Загружаем следующий случайный вопрос
}

function getUserAnswer(type) {
    if (type === "onecheck") {
        let selected = document.querySelector('input[name="answer"]:checked');
        return selected ? parseInt(selected.value) : null;
    }
    else if (type === "multicheck") {
        return Array.from(document.querySelectorAll('input[name="answer"]:checked')).map(input => parseInt(input.value));
    }
    else if (type === "stringcheck") {
        return document.getElementById("textAnswer").value;
    }
}
