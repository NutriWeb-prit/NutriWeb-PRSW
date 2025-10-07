const questions = [
    {
        question: "Qual é o seu principal objetivo ao procurar acompanhamento nutricional?",
        options: [
            { text: "Melhorar meu desempenho físico e esportivo", scores: { sport: 2 } },
            { text: "Cuidar da aparência, pele e corpo", scores: { aesthetic: 2 } },
            { text: "Tratar ou controlar alguma condição de saúde", scores: { clinical: 2 } },
            { text: "Ter uma alimentação saudável sem abrir mão da praticidade", scores: { balanced: 2 } }
        ]
    },
    {
        question: "Você segue (ou gostaria de seguir) algum padrão alimentar específico?",
        options: [
            { text: "Dieta vegetariana ou vegana", scores: { vegetarian: 2 } },
            { text: "Alimentação variada sem restrições", scores: { balanced: 1 } },
            { text: "Alimentação mais natural e voltada para prevenção de doenças", scores: { functional: 2 } }
        ]
    },
    {
        question: "Você pratica atividades físicas com frequência?",
        options: [
            { text: "Sim, treinos intensos ou competições", scores: { sport: 2 } },
            { text: "Sim, mas apenas para manter a saúde", scores: { functional: 1 } },
            { text: "Não pratico regularmente", scores: { balanced: 1 } }
        ]
    },
    {
        question: "Em relação à sua saúde, qual a sua maior prioridade hoje?",
        options: [
            { text: "Tratar doenças crônicas (diabetes, hipertensão, colesterol, etc.)", scores: { clinical: 2 } },
            { text: "Melhorar a digestão, energia e equilíbrio do organismo", scores: { functional: 2 } },
            { text: "Prevenir problemas de saúde antes que apareçam", scores: { functional: 1 } }
        ]
    },
    {
        question: "Qual fase da vida você está vivendo ou para quem busca orientação?",
        options: [
            { text: "Gestação ou cuidados com bebê/criança", scores: { maternal: 2 } },
            { text: "Terceira idade", scores: { geriatric: 2 } },
            { text: "Vida adulta sem condições específicas", scores: {} }
        ]
    },
    {
        question: "Você gostaria de um acompanhamento focado em estética corporal (ex.: emagrecimento, ganho de massa, definição)?",
        options: [
            { text: "Sim, emagrecimento/estética", scores: { aesthetic: 2 } },
            { text: "Sim, mas com foco em performance", scores: { sport: 2 } },
            { text: "Não, meu foco é saúde", scores: { clinical: 1 } }
        ]
    },
    {
        question: "Como você descreveria seu estilo de vida alimentar?",
        options: [
            { text: "Organizado, mas quero otimizar resultados", scores: { sport: 1, functional: 1 } },
            { text: "Desequilibrado, preciso de ajuda para recomeçar", scores: { clinical: 2 } },
            { text: "Já sigo hábitos saudáveis, quero prevenção", scores: { functional: 2 } }
        ]
    },
    {
        question: "Você tem interesse em estratégias mais naturais e personalizadas (ervas, fitoquímicos, alimentos funcionais)?",
        options: [
            { text: "Sim, quero prevenção e longevidade", scores: { functional: 1, geriatric: 1 } },
            { text: "Não, prefiro orientações básicas", scores: {} }
        ]
    },
    {
        question: "Qual a sua maior motivação para mudar sua alimentação agora?",
        options: [
            { text: "Saúde (prevenção ou tratamento)", scores: { clinical: 1, functional: 1 } },
            { text: "Estética (melhorar aparência física)", scores: { aesthetic: 2 } },
            { text: "Esporte (desempenho e performance)", scores: { sport: 2 } },
            { text: "Vegetarianismo (estilo de vida sem carne)", scores: { vegetarian: 2 } },
            { text: "Materno-infantil (cuidados na gravidez ou com bebês/crianças)", scores: { maternal: 2 } },
            { text: "Longevidade (alimentação na terceira idade)", scores: { geriatric: 2 } }
        ]
    },
    {
        question: "Como você gostaria que fosse seu plano alimentar?",
        options: [
            { text: "Prático e adaptado ao meu dia a dia", scores: { balanced: 2 } },
            { text: "Altamente personalizado e voltado a nutrientes específicos", scores: { functional: 1, aesthetic: 1 } },
            { text: "Direcionado para um objetivo claro (esporte, estética ou saúde)", scores: { sport: 1, aesthetic: 1, clinical: 1 } }
        ]
    }
];

const nutritionTypes = {
    sport: { emoji: "💪", name: "Nutrição Esportiva", description: "Você busca melhorar seu desempenho físico e alcançar resultados através da alimentação direcionada para atletas e praticantes de atividades físicas intensas." },
    aesthetic: { emoji: "✨", name: "Nutrição Estética", description: "Seu foco está na aparência, composição corporal e saúde da pele. Um nutricionista estético pode te ajudar a alcançar seus objetivos de forma saudável." },
    clinical: { emoji: "❤️", name: "Nutrição Clínica", description: "Você precisa de acompanhamento para tratar ou controlar condições de saúde. Um nutricionista clínico é especializado em dietas terapêuticas." },
    balanced: { emoji: "🥗", name: "Nutrição Balanceada", description: "Você busca uma alimentação equilibrada e prática no dia a dia. Um nutricionista generalista pode te orientar com um plano alimentar sustentável." },
    vegetarian: { emoji: "🌱", name: "Nutrição Vegetariana/Vegana", description: "Você segue ou deseja seguir uma alimentação à base de plantas. Um nutricionista especializado garantirá que sua dieta seja completa e nutritiva." },
    functional: { emoji: "🌿", name: "Nutrição Funcional/Preventiva", description: "Você valoriza alimentos naturais e a prevenção de doenças. A nutrição funcional trabalha com a individualidade bioquímica para otimizar sua saúde." },
    maternal: { emoji: "👶", name: "Nutrição Materno-Infantil", description: "Você está na gestação ou cuida de bebês e crianças. Um nutricionista materno-infantil oferece orientação especializada para essa fase tão importante." },
    geriatric: { emoji: "🌸", name: "Nutrição Geriátrica", description: "Você está na terceira idade ou cuida de idosos. A nutrição geriátrica foca em longevidade, qualidade de vida e prevenção de doenças relacionadas à idade." }
};

let currentQuestion = 0;
let scores = {
    sport: 0,
    aesthetic: 0,
    clinical: 0,
    balanced: 0,
    vegetarian: 0,
    functional: 0,
    maternal: 0,
    geriatric: 0
};
let answers = [];

function renderQuestion() {
    const container = document.getElementById('quizContent');
    const q = questions[currentQuestion];
    
    let html = `
        <div class="question-card active">
            <h3 class="question-text">${q.question}</h3>
            <div class="options">
    `;
    
    q.options.forEach((opt, idx) => {
        const isSelected = answers[currentQuestion] === idx;
        html += `
            <div class="option ${isSelected ? 'selected' : ''}" onclick="selectOption(${idx})">
                ${opt.text}
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    updateProgress();
    updateNavButtons();
}

function selectOption(idx) {
    answers[currentQuestion] = idx;
    
    const options = document.querySelectorAll('.option');
    options.forEach((opt, i) => {
        opt.classList.toggle('selected', i === idx);
    });
    
    document.getElementById('btnNext').disabled = false;
}

function updateProgress() {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('questionCounter').textContent = `Pergunta ${currentQuestion + 1} de ${questions.length}`;
}

function updateNavButtons() {
    document.getElementById('btnBack').style.visibility = currentQuestion === 0 ? 'hidden' : 'visible';
    
    const btnNext = document.getElementById('btnNext');
    if (currentQuestion === questions.length - 1) {
        btnNext.textContent = 'Ver Resultado';
    } else {
        btnNext.textContent = 'Próxima';
    }
    
    btnNext.disabled = answers[currentQuestion] === undefined;
}

function nextQuestion() {
    if (answers[currentQuestion] === undefined) return;
    
    const selectedOption = questions[currentQuestion].options[answers[currentQuestion]];
    for (let type in selectedOption.scores) {
        scores[type] += selectedOption.scores[type];
    }
    
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        renderQuestion();
    } else {
        showResult();
    }
}

function previousQuestion() {
    if (currentQuestion > 0) {
        const selectedOption = questions[currentQuestion].options[answers[currentQuestion]];
        if (selectedOption) {
            for (let type in selectedOption.scores) {
                scores[type] -= selectedOption.scores[type];
            }
        }
        currentQuestion--;
        renderQuestion();
    }
}

function showResult() {
    let maxScore = 0;
    let resultType = 'balanced';
    
    for (let type in scores) {
        if (scores[type] > maxScore) {
            maxScore = scores[type];
            resultType = type;
        }
    }
    
    const result = nutritionTypes[resultType];
    
    document.getElementById('quizContent').style.display = 'none';
    document.getElementById('navButtons').style.display = 'none';
    document.getElementById('questionCounter').style.display = 'none';
    document.querySelector('.progress-bar').style.display = 'none';
    
    const resultContainer = document.getElementById('resultContainer');
    document.getElementById('resultEmoji').textContent = result.emoji;
    document.getElementById('resultTitle').textContent = result.name;
    document.getElementById('resultDescription').textContent = result.description;
    resultContainer.classList.add('active');
}

function restartQuiz() {
    currentQuestion = 0;
    scores = {
        sport: 0,
        aesthetic: 0,
        clinical: 0,
        balanced: 0,
        vegetarian: 0,
        functional: 0,
        maternal: 0,
        geriatric: 0
    };
    answers = [];
    
    document.getElementById('quizContent').style.display = 'block';
    document.getElementById('navButtons').style.display = 'flex';
    document.getElementById('questionCounter').style.display = 'block';
    document.querySelector('.progress-bar').style.display = 'block';
    document.getElementById('resultContainer').classList.remove('active');
    
    renderQuestion();
}

renderQuestion();