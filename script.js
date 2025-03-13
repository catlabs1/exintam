document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const questionCount = parseInt(params.get("count")) || 5; // Количество вопросов, которое нужно отобразить

    
    fetch("questions.json")
        .then((response) => response.json())
        .then((data) => {
            // Функция для случайного перемешивания массива
            function shuffleArray(arr) {
                for (let i = arr.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
                }
            }

            shuffleArray(data); // Перемешиваем все вопросы

            const questions = data.slice(0, questionCount); // Берем только нужное количество вопросов
            const questionContainer =
                document.getElementById("question-container");
            questionContainer.innerHTML = ""; // Очищаем контейнер перед вставкой вопросов

            questions.forEach((question, index) => {
                let questionElement = document.createElement("div");
                questionElement.classList.add("question");
                questionElement.setAttribute('data-question-index', index);

                let questionHTML = `<p class='text-question'>${index + 1}. ${question.question}</p>`;

                // Отображаем варианты в зависимости от типа вопроса
                if (question.question_type === "onecheck") {
                    question.answers.forEach((answer, i) => {
                        questionHTML += `
                            <label class='variants'>
                                <input type="radio" name="question${index}" value="${i}"> ${answer}
                            </label><br>
                        `;
                    });
                } else if (question.question_type === "multicheck") {
                    question.answers.forEach((answer, i) => {
                        questionHTML += `
                            <label class='variants'>
                                <input type="checkbox" name="question${index}" value="${i}"> ${answer}
                            </label><br>
                        `;
                    });
                } else if (question.question_type === "stringcheck") {
                    questionHTML += `<input type="text" name="question${index}" placeholder="Введите ваш ответ">`;
                }

                questionElement.innerHTML = questionHTML;
                questionContainer.appendChild(questionElement);

                // Добавляем обработчик событий для установки обводки
                addInputListeners(questionElement, index, question.question_type);
            });

            // 
            function addInputListeners(questionElement, index, questionType) {
                if (questionType === "onecheck") {
                    document.querySelectorAll(`input[name="question${index}"]`).forEach(input => {
                        input.addEventListener("change", () => updateBorder(questionElement, index, questionType));
                    });
                } 
                else if (questionType === "multicheck") {
                    document.querySelectorAll(`input[name="question${index}"]`).forEach(input => {
                        input.addEventListener("change", () => updateBorder(questionElement, index, questionType));
                    });
                } 
                else if (questionType === "stringcheck") {
                    document.querySelector(`input[name="question${index}"]`).addEventListener("input", () => {
                        updateBorder(questionElement, index, questionType);
                    });
                }
            }

            function updateBorder(questionElement, index, questionType) {
                let answered = false;

                if (questionType === "onecheck") {
                    answered = document.querySelector(`input[name="question${index}"]:checked`) !== null;
                } 
                else if (questionType === "multicheck") {
                    answered = document.querySelectorAll(`input[name="question${index}"]:checked`).length > 0;
                } 
                else if (questionType === "stringcheck") {
                    const inputValue = document.querySelector(`input[name="question${index}"]`).value.trim();
                    answered = inputValue.length > 0;
                }

                questionElement.style.border = answered ? "2px solid #9c9ea7cc" : "2px solid transparent";
            }


            // 






                // Обработчик кнопки "Завершить тест"
                document.getElementById('submitBtn').addEventListener('click', function () {
                    let score = 0;
                    const incorrectQuestions = [];
                    const incorrectIndexes = [];    // Для подсветки

                    questions.forEach((question, index) => {
                        const userAnswer = getUserAnswer(index, question.question_type);
                        const correctAnswer = question.correct_answer;

                        let isCorrect = false;

                        if (question.question_type === "onecheck") {
                            // ✅ Исправляем индексацию: уменьшаем correctAnswer на 1
                            isCorrect = userAnswer === (parseInt(correctAnswer) - 1);
                        } 
                        // else if (question.question_type === "multicheck") {
                        //     const correctAnswers = correctAnswer.split(',').map(Number);
                        //     const userAnswers = Array.from(document.querySelectorAll(`input[name="question${index}"]:checked`))
                        //                             .map(input => parseInt(input.value));
                        //     isCorrect = arraysEqual(userAnswers, correctAnswers);
                        // } 
                        // else if (question.question_type === "stringcheck") {
                        //     isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
                        // }

                        else if (question.question_type === "multicheck") {
                            const correctAnswers = correctAnswer.split('').map(num => parseInt(num) - 1).sort(); // ✅ Уменьшаем на 1 и сортируем
                            const userAnswers = Array.from(document.querySelectorAll(`input[name="question${index}"]:checked`))
                                                    .map(input => parseInt(input.value))
                                                    .sort(); // ✅ Сортируем, чтобы порядок не мешал
                
                            isCorrect = JSON.stringify(userAnswers) === JSON.stringify(correctAnswers); // ✅ Сравниваем отсортированные массивы
                        } 
                        else if (question.question_type === "stringcheck") {
                            isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
                        }

                        if (!isCorrect) {
                            incorrectQuestions.push(question.question_number);  // ✅ Глобальный номер в localStorage
                            incorrectIndexes.push(index);                      // ✅ Локальный индекс для border
                        } else {
                            score++;
                        }
                    });

                    // Сохраняем неверные вопросы в localStorage
                    localStorage.setItem('incorrectQuestions', JSON.stringify(incorrectQuestions));

                    // Подсвечиваем неправильные ответы красным
                    highlightIncorrectQuestions(incorrectIndexes);

                    // alert(
                    //     `Тест завершен! Ваш результат: ${score} из ${questionCount}`
                    // );
                    const resultAns = document.getElementById("result"); 
                    resultAns.innerHTML = `Вы набрали <br> ${score}/${questionCount}`;

                    // ✅ Скрываем кнопку "Завершить тест"
                    document.getElementById('submitBtn').style.display = 'none';

                    // ✅ Показываем кнопку "Вернуться на главную"
                    document.getElementById('returnBtn').style.display = 'block';
                });

            // Функция для получения ответа пользователя в зависимости от типа вопроса
            function getUserAnswer(index, type) {
                if (type === "onecheck") {
                    const selectedRadio = document.querySelector(
                        `input[name="question${index}"]:checked`
                    );
                    return selectedRadio ? parseInt(selectedRadio.value) : null;
                } else if (type === "multicheck") {
                    const selectedCheckboxes = document.querySelectorAll(
                        `input[name="question${index}"]:checked`
                    );
                    return Array.from(selectedCheckboxes).map((checkbox) =>
                        parseInt(checkbox.value)
                    );
                } else if (type === "stringcheck") {
                    const input = document.querySelector(
                        `input[name="question${index}"]`
                    );
                    return input ? input.value.trim() : "";
                }
                return null;
            }

            // Функция для сравнения массивов (для мульти-выбора)
            function arraysEqual(a, b) {
                return (
                    a.length === b.length &&
                    a.every((val, index) => val === b[index])
                );
            }

            // // Подсветка неверных вопросов
            // function highlightIncorrectQuestions(incorrectQuestions) {
            //     incorrectQuestions.forEach(index => {
            //         document.querySelector(`[data-question-index="${index}"]`).style.border = "2px solid #d18282";
            //     });
            // }


            function highlightIncorrectQuestions(incorrectIndexes) {
                incorrectIndexes.forEach(index => {
                    const questionElement = document.querySelector(`[data-question-index="${index}"]`);
                    if (questionElement) {  // ✅ Проверяем, существует ли элемент
                        questionElement.style.border = "2px solid #c65e5e";
            
                        const question = questions[index];
                        let correctAnswerText = "";

                        if (question.question_type === "onecheck" || question.question_type === "multicheck") {
                            const correctAnswers = question.correct_answer.split('').map(num => parseInt(num) - 1);
                            correctAnswerText = correctAnswers.map(correctIndex => question.answers[correctIndex]).join(", ");
                        } 
                        else if (question.question_type === "stringcheck") {
                            correctAnswerText = question.correct_answer;
                        }


                        if (question.question_type === "onecheck" || question.question_type === "multicheck") {
                            const correctAnswers = question.correct_answer.split(',').map(Number);
            
                            correctAnswers.forEach(correctIndex => {
                                const correctLabel = questionElement.querySelector(`[data-answer-index="${correctIndex}"]`);
                                if (correctLabel) {  // ✅ Проверяем, найден ли правильный ответ
                                    correctLabel.style.backgroundColor = "#328f47";
                                }
                            });
                        }

                        // Если правильный ответ найден, добавляем его в конец вопроса
                        if (correctAnswerText) {
                            let correctAnswerElement = document.createElement("p");
                            correctAnswerElement.className = "сorrectAns";
                            correctAnswerElement.style.color = "#2e2e2e";
                            // correctAnswerElement.textContent = `Верный ответ: <br> ${correctAnswerText}`;
                            correctAnswerElement.innerHTML = `<p class='titleCorrect'>Верный ответ:</p> <br>${correctAnswerText}`;
                            questionElement.appendChild(correctAnswerElement);
                        }

                    } else {
                        console.error(`Ошибка: Не найден вопрос с data-question-index="${index}"`);
                    }
                });
            }
            
        })
        .catch((error) => console.error("Ошибка загрузки вопросов:", error));
});
