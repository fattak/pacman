//////////////////////////////////////////////////////////////////////////////////////
// Quiz Module

var quiz = (function() {
    
    // Generate a random number between min and max (inclusive)
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Generate a random arithmetic operation
    function randomOperation() {
        const ops = ['+', '-', '*'];
        return ops[Math.floor(Math.random() * ops.length)];
    }

    // Generate a quiz question and answers
    function generateQuiz() {
        const num1 = randomInt(1, 50);
        const num2 = randomInt(1, 20);
        const operation = randomOperation();
        
        let correctAnswer;
        switch(operation) {
            case '+': correctAnswer = num1 + num2; break;
            case '-': correctAnswer = num1 - num2; break;
            case '*': correctAnswer = num1 * num2; break;
        }

        // Generate 3 wrong answers
        let wrongAnswers = [];
        while(wrongAnswers.length < 3) {
            const offset = randomInt(-10, 10);
            const wrongAnswer = correctAnswer + offset;
            if (offset !== 0 && !wrongAnswers.includes(wrongAnswer)) {
                wrongAnswers.push(wrongAnswer);
            }
        }

        // Randomly insert correct answer into choices
        const choices = [...wrongAnswers];
        const correctIndex = randomInt(0, 3);
        choices.splice(correctIndex, 0, correctAnswer);

        return {
            question: `${num1} ${operation} ${num2} = ?`,
            choices: choices,
            correctAnswer: correctAnswer,
            correctIndex: correctIndex
        };
    }

    // Create and show the quiz modal
    function showQuizModal(quiz, callback) {
        // Create modal container
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #FFB8AE;
            color: white;
            font-family: "Press Start 2P", monospace;
            text-align: center;
            z-index: 1000;
        `;

        // Add question
        const question = document.createElement('div');
        question.textContent = quiz.question;
        question.style.cssText = `
            font-size: 24px;
            margin-bottom: 20px;
            color: #FFB8AE;
        `;
        modal.appendChild(question);

        // Add choice buttons
        quiz.choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.textContent = choice;
            button.style.cssText = `
                display: block;
                width: 200px;
                margin: 10px auto;
                padding: 10px;
                background: #000;
                border: 2px solid #FFB8AE;
                color: #FFB8AE;
                font-family: "Press Start 2P", monospace;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.2s;
            `;
            button.onmouseover = () => {
                button.style.background = '#FFB8AE';
                button.style.color = '#000';
            };
            button.onmouseout = () => {
                button.style.background = '#000';
                button.style.color = '#FFB8AE';
            };
            button.onclick = () => {
                modal.remove();
                const isCorrect = index === quiz.correctIndex;
                showResult(isCorrect, quiz.correctAnswer, callback);
            };
            modal.appendChild(button);
        });

        document.body.appendChild(modal);
    }

    // Show the result message
    function showResult(isCorrect, correctAnswer, callback) {
        const resultModal = document.createElement('div');
        resultModal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            padding: 20px;
            border-radius: 10px;
            border: 2px solid ${isCorrect ? '#4CAF50' : '#f44336'};
            color: white;
            font-family: "Press Start 2P", monospace;
            text-align: center;
            z-index: 1001;
            font-size: 20px;
        `;

        if (isCorrect) {
            resultModal.textContent = 'Correct!!';
            resultModal.style.color = '#4CAF50';
        } else {
            resultModal.innerHTML = `
                <div style="color: #f44336;">Sorry Wrong...</div>
                <div style="margin-top: 10px;">The correct answer is ${correctAnswer}</div>
            `;
        }

        document.body.appendChild(resultModal);

        // Remove result after delay and call callback
        setTimeout(() => {
            resultModal.remove();
            callback(isCorrect);
        }, 2000);
    }

    return {
        // Main function to start a quiz
        prompt: function(callback) {
            const quizData = generateQuiz();
            showQuizModal(quizData, callback);
        }
    };
})();
