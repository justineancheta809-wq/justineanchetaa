let currentQuestion = 0;

let quizAnswers = {
    experience: "",
    budget: "",
    group: ""
};


const quizQuestions = [

    {
        question: "What type of experience do you prefer?",
        options: [
            {
                text: "Beach and Island",
                value: "beach"
            },
            {
                text: "Mountain and Cool Weather",
                value: "mountain"
            },
            {
                text: "City and Culture",
                value: "city"
            },
            {
                text: "Nature and Adventure",
                value: "nature"
            }
        ]
    },

    {
        question: "What is your preferred budget?",
        options: [
            {
                text: "Budget Friendly",
                value: "budget"
            },
            {
                text: "Standard",
                value: "standard"
            },
            {
                text: "Comfort",
                value: "comfort"
            }
        ]
    },

    {
        question: "Who are you traveling with?",
        options: [
            {
                text: "Solo",
                value: "solo"
            },
            {
                text: "Friends",
                value: "friends"
            },
            {
                text: "Family",
                value: "family"
            }
        ]
    }
];


function loadQuestion() {

    const container =
        document.getElementById("quizContainer");

    const progress =
        document.getElementById("progressBar");

    if (!container) return;

    const question =
        quizQuestions[currentQuestion];

    container.innerHTML = `

        <div class="quiz-question">

            <h3>
                ${question.question}
            </h3>

            <div class="quiz-options">

                ${question.options.map(option => `

                    <button
                        onclick="selectAnswer('${option.value}')"
                    >
                        ${option.text}
                    </button>

                `).join("")}

            </div>

        </div>
    `;

    if (progress) {

        const percentage =
            ((currentQuestion + 1) /
            quizQuestions.length) * 100;

        progress.style.width =
            `${percentage}%`;
    }
}


function selectAnswer(answer) {

    if (currentQuestion === 0) {
        quizAnswers.experience = answer;
    }

    else if (currentQuestion === 1) {
        quizAnswers.budget = answer;
    }

    else if (currentQuestion === 2) {
        quizAnswers.group = answer;
    }

    nextQuestion();
}


function nextQuestion() {

    currentQuestion++;

    if (
        currentQuestion >=
        quizQuestions.length
    ) {

        showQuizResult();

        return;
    }

    loadQuestion();
}


function showQuizResult() {

    const container =
        document.getElementById("quizContainer");

    const result =
        document.getElementById("quizResult");

    const categoryMap = {
        beach: "Beach",
        mountain: "Mountain",
        city: "City",
        nature: "Nature"
    };

    const targetBudget = {
        budget: 1500,
        standard: 2800,
        comfort: 3500
    }[quizAnswers.budget] || 2500;

    const groupBonus = {
        solo: ["siargao", "cebu", "baguio"],
        friends: ["siargao", "cebu", "boracay", "palawan"],
        family: ["manila", "baguio", "boracay", "cebu"]
    }[quizAnswers.group] || [];

    function score(d) {
        let points = 0;
        if (d.category === categoryMap[quizAnswers.experience]) points += 100;
        points -= Math.abs(d.budget - targetBudget) / 100;
        if (groupBonus.includes(d.id)) points += 5;
        points += d.rating;
        return points;
    }

    const recommendation = destinations
        .slice()
        .sort((a, b) => score(b) - score(a))[0];

    if (container) {
        container.innerHTML = "";
    }

    if (result) {

        result.innerHTML = `

            <div class="quiz-result-card">

                <h3>
                    Your Recommended Destination
                </h3>

                <img
                    src="${recommendation.image}"
                    alt="${recommendation.name}" onerror="this.onerror=null;this.src=imageFallback;"
                >

                <h2>
                    ${recommendation.name}
                </h2>

                <p>
                    ${recommendation.description}
                </p>

                <button
                    onclick="openDestination('${recommendation.id}')"
                >
                    Explore ${recommendation.name}
                </button>

            </div>
        `;
    }
}


function restartQuiz() {

    currentQuestion = 0;

    quizAnswers = {
        experience: "",
        budget: "",
        group: ""
    };

    const result =
        document.getElementById("quizResult");

    if (result) {
        result.innerHTML = "";
    }

    loadQuestion();
}