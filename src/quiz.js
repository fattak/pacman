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

    // Check if device is mobile
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Create and show the quiz modal
    function showQuizModal(quiz, callback) {
        const mobile = isMobile();
        
        // Create modal container
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            padding: ${mobile ? '40px' : '20px'};
            border-radius: 10px;
            border: 2px solid #FFB8AE;
            color: white;
            font-family: "Press Start 2P", monospace;
            text-align: center;
            z-index: 1000;
            -webkit-tap-highlight-color: transparent;
        `;

        // Add question
        const question = document.createElement('div');
        question.textContent = quiz.question;
        question.style.cssText = `
            font-size: ${mobile ? '32px' : '24px'};
            margin-bottom: ${mobile ? '40px' : '20px'};
            color: #FFB8AE;
            line-height: 1.4;
        `;
        modal.appendChild(question);

        // Add timer container
        const timerContainer = document.createElement('div');
        timerContainer.style.cssText = `
            margin-bottom: ${mobile ? '30px' : '20px'};
            text-align: center;
        `;

        // Add timer text
        const timer = document.createElement('div');
        timer.style.cssText = `
            font-size: ${mobile ? '24px' : '18px'};
            margin-bottom: ${mobile ? '10px' : '8px'};
            color: #FFB8AE;
        `;
        timer.textContent = '15';

        // Add progress bar container
        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = `
            width: 100%;
            height: ${mobile ? '12px' : '8px'};
            background: #333;
            border-radius: 10px;
            overflow: hidden;
        `;

        // Add progress bar
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            width: 100%;
            height: 100%;
            background: #FFB8AE;
            border-radius: 10px;
            transition: width 0.1s linear;
        `;
        
        progressContainer.appendChild(progressBar);
        timerContainer.appendChild(timer);
        timerContainer.appendChild(progressContainer);
        modal.appendChild(timerContainer);

        // Start countdown
        let timeLeft = 15;
        const countdown = setInterval(() => {
            timeLeft--;
            timer.textContent = timeLeft;
            
            // Update progress bar
            const progress = (timeLeft / 15) * 100;
            progressBar.style.width = `${progress}%`;
            
            if (timeLeft <= 5) {
                timer.style.color = '#f44336';
                progressBar.style.background = '#f44336';
            }
            
            if (timeLeft <= 0) {
                clearInterval(countdown);
                modal.remove();
                showResult(false, quiz.correctAnswer, callback);
            }
        }, 1000);

        // Add choice buttons
        quiz.choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.textContent = choice;
            button.style.cssText = `
                display: block;
                width: ${mobile ? '280px' : '200px'};
                margin: ${mobile ? '20px' : '10px'} auto;
                padding: ${mobile ? '20px' : '10px'};
                background: #000;
                border: 2px solid #FFB8AE;
                color: #FFB8AE;
                font-family: "Press Start 2P", monospace;
                font-size: ${mobile ? '24px' : '16px'};
                cursor: pointer;
                -webkit-tap-highlight-color: transparent;
                user-select: none;
                touch-action: manipulation;
            `;

            const handleClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                modal.remove();
                const isCorrect = index === quiz.correctIndex;
                showResult(isCorrect, quiz.correctAnswer, callback);
            };

            // Add both click and touch events
            button.onclick = (e) => {
                clearInterval(countdown);
                handleClick(e);
            };
            button.ontouchstart = (e) => {
                e.preventDefault();
                e.stopPropagation();
                button.style.background = '#FFB8AE';
                button.style.color = '#000';
            };
            button.ontouchend = (e) => {
                e.preventDefault();
                e.stopPropagation();
                button.style.background = '#000';
                button.style.color = '#FFB8AE';
                clearInterval(countdown);
                handleClick(e);
            };
            button.ontouchcancel = (e) => {
                e.preventDefault();
                e.stopPropagation();
                button.style.background = '#000';
                button.style.color = '#FFB8AE';
            };

            // Mouse events for non-touch devices
            if (!mobile) {
                button.onmouseover = () => {
                    button.style.background = '#FFB8AE';
                    button.style.color = '#000';
                };
                button.onmouseout = () => {
                    button.style.background = '#000';
                    button.style.color = '#FFB8AE';
                };
            }

            modal.appendChild(button);
        });

        document.body.appendChild(modal);
    }

    // Show the result message
    function showResult(isCorrect, correctAnswer, callback) {
        const mobile = isMobile();
        
        const resultModal = document.createElement('div');
        resultModal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            padding: ${mobile ? '40px' : '20px'};
            border-radius: 10px;
            border: 2px solid ${isCorrect ? '#4CAF50' : '#f44336'};
            color: white;
            font-family: "Press Start 2P", monospace;
            text-align: center;
            z-index: 1001;
            font-size: ${mobile ? '28px' : '20px'};
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            user-select: none;
            touch-action: manipulation;
        `;

        if (isCorrect) {
            resultModal.textContent = 'Correct!!';
            resultModal.style.color = '#4CAF50';
        } else {
            resultModal.innerHTML = `
                <div style="color: #f44336;">Sorry Wrong...</div>
                <div style="margin-top: ${mobile ? '20px' : '10px'};">The correct answer is ${correctAnswer}</div>
            `;
        }

        // Add a small delay before allowing dismissal
        let canDismiss = false;
        setTimeout(() => {
            canDismiss = true;
        }, 500);

        const handleDismiss = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (!canDismiss) return;
            
            resultModal.remove();
            document.removeEventListener('click', handleDismiss);
            document.removeEventListener('touchend', handleDismiss);
            document.removeEventListener('keydown', handleKeydown);
            callback(isCorrect);
        };

        // Handle click/tap anywhere
        document.addEventListener('click', handleDismiss);
        document.addEventListener('touchend', handleDismiss);

        // Handle arrow keys
        const handleKeydown = (e) => {
            if (e.key.startsWith('Arrow')) {
                handleDismiss();
            }
        };
        document.addEventListener('keydown', handleKeydown);

        document.body.appendChild(resultModal);
    }

    return {
        // Main function to start a quiz
        prompt: function(callback) {
            const quizData = generateQuiz();
            showQuizModal(quizData, callback);
        }
    };
})();
