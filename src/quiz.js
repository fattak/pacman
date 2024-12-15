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
            padding: ${mobile ? (window.innerHeight > window.innerWidth ? '40px' : '20px') : '20px'};
            border-radius: 10px;
            border: 2px solid #FFB8AE;
            color: white;
            font-family: "Press Start 2P", monospace;
            text-align: center;
            z-index: 1000;
            max-height: ${window.innerHeight > window.innerWidth ? '90vh' : '80vh'};
            overflow-y: auto;
            -webkit-tap-highlight-color: transparent;
        `;

        // Add question
        const question = document.createElement('div');
        question.textContent = quiz.question;
        question.style.cssText = `
            font-size: ${mobile ? (window.innerHeight > window.innerWidth ? '32px' : '24px') : '24px'};
            margin-bottom: ${mobile ? (window.innerHeight > window.innerWidth ? '40px' : '20px') : '20px'};
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
        let countdownInterval;
        const startCountdown = () => {
            countdownInterval = setInterval(() => {
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
                    cleanup();
                    clearInterval(countdownInterval);
                    modal.remove();
                    showResult(false, quiz.correctAnswer, callback);
                }
            }, 1000);
        };

        // Add keyboard number support
        const handleKeyPress = (e) => {
            const num = parseInt(e.key);
            if (num >= 1 && num <= 4) {  // Check if pressed key is 1-4
                cleanup();
                clearInterval(countdownInterval);
                modal.remove();
                const index = num - 1;
                const isCorrect = index === quiz.correctIndex;
                showResult(isCorrect, quiz.correctAnswer, callback);
            }
        };
        document.addEventListener('keypress', handleKeyPress);

        // Clean up event listener when quiz ends
        const cleanup = () => {
            document.removeEventListener('keypress', handleKeyPress);
        };

        // Add choice buttons
        quiz.choices.forEach((choice, index) => {
            const button = document.createElement('button');
            
            // Create container for number and choice
            const buttonContent = document.createElement('div');
            buttonContent.style.cssText = `
                display: flex;
                align-items: center;
                width: 100%;
                position: relative;
            `;
            
            // Number on the left
            const numberSpan = document.createElement('span');
            numberSpan.textContent = `(${index + 1})`;
            numberSpan.style.cssText = `
                position: absolute;
                left: ${mobile ? '20px' : '10px'};
            `;
            
            // Choice text centered
            const choiceSpan = document.createElement('span');
            choiceSpan.textContent = choice;
            choiceSpan.style.cssText = `
                flex-grow: 1;
                text-align: center;
                margin: 0 ${mobile ? '40px' : '30px'};  // Space for number on both sides
            `;
            
            buttonContent.appendChild(numberSpan);
            buttonContent.appendChild(choiceSpan);
            button.appendChild(buttonContent);
            
            button.style.cssText = `
                display: block;
                width: ${mobile ? (window.innerHeight > window.innerWidth ? '280px' : '240px') : '200px'};
                margin: ${mobile ? (window.innerHeight > window.innerWidth ? '20px' : '10px') : '10px'} auto;
                padding: ${mobile ? (window.innerHeight > window.innerWidth ? '20px' : '12px') : '10px'};
                background: #000;
                border: 2px solid #FFB8AE;
                color: #FFB8AE;
                font-family: "Press Start 2P", monospace;
                font-size: ${mobile ? (window.innerHeight > window.innerWidth ? '24px' : '18px') : '16px'};
                cursor: pointer;
                -webkit-tap-highlight-color: transparent;
                user-select: none;
                touch-action: manipulation;
                text-align: left;  // Allow internal alignment to take effect
            `;

            const handleClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                cleanup();
                clearInterval(countdownInterval);
                modal.remove();
                const isCorrect = index === quiz.correctIndex;
                showResult(isCorrect, quiz.correctAnswer, callback);
            };

            // Add both click and touch events
            button.onclick = handleClick;
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
                handleClick(e);
            };
            button.ontouchcancel = (e) => {
                e.preventDefault();
                e.stopPropagation();
                button.style.background = '#000';
                button.style.color = '#FFB8AE';
            };

            modal.appendChild(button);
        });

        document.body.appendChild(modal);
        startCountdown();  // Start the countdown after everything is set up
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

    // Check if Moti4Learn Quiz API is available
    function isMoti4LearnQuizApiAvailable() {
        try {
            return window.parent && window.parent.quizApi && typeof window.parent.quizApi.takeQuiz === 'function';
        } catch (e) {
            // If we can't access window.parent, we're not in the Moti4Learn iframe
            return false;
        }
    }

    // Main function to start a quiz
    async function prompt(callback) {
        // Try to use Moti4Learn Quiz API first
        if (isMoti4LearnQuizApiAvailable()) {
            try {
                const result = await window.parent.quizApi.takeQuiz();
                
                // Convert Moti4Learn result to legacy format
                if (result.attempt) {
                    callback(result.isCorrect);
                    // callback(true); // for easy testing, making it always correct
                } else {
                    // If no attempt was made (timeout or closed), treat as incorrect
                    callback(false);
                }
                return;  // Exit here after handling Moti4Learn quiz
            } catch (error) {
                console.warn('Failed to use Moti4Learn Quiz API, falling back to legacy quiz:', error);
                // Fall through to legacy quiz implementation
            }
        }

        // Legacy quiz implementation - only runs if Moti4Learn is not available or fails
        const quizData = generateQuiz();
        showQuizModal(quizData, callback);
    }

    return {
        prompt
    };
})();
