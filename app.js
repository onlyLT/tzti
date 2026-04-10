/* 人民的T.I. — 体制内人格测试 — 应用逻辑 */

// ===== State =====
var state = {
    currentQuestion: 0,
    answers: [],
    scores: { jf: 0, yg: 0, xh: 0, wl: 0 },
    resultCode: '',
    resultPcts: { jf: 50, yg: 50, xh: 50, wl: 50 }
};

// ===== Page Transitions =====
function showPage(pageId) {
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) {
        pages[i].classList.remove('active');
    }
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0, 0);
}

// ===== Start Test =====
function startTest() {
    state.currentQuestion = 0;
    state.answers = [];
    state.scores = { jf: 0, yg: 0, xh: 0, wl: 0 };
    document.getElementById('shareHint').style.display = 'none';
    document.getElementById('shareCta').style.display = 'none';
    showPage('quiz');
    renderQuestion(0);
}

function restartTest() {
    history.replaceState(null, '', window.location.pathname);
    showPage('intro');
}

// ===== Quiz Engine =====
function renderQuestion(index) {
    var q = QUESTIONS[index];
    var letters = ['A', 'B', 'C', 'D'];

    document.getElementById('currentQ').textContent = index + 1;
    document.getElementById('totalQ').textContent = QUESTIONS.length;
    document.getElementById('progressFill').style.width = ((index + 1) / QUESTIONS.length * 100) + '%';

    document.getElementById('questionText').textContent = q.text;

    var optionsHtml = '';
    for (var i = 0; i < q.options.length; i++) {
        var selectedClass = (state.answers[index] === i) ? ' selected' : '';
        optionsHtml += '<div class="option' + selectedClass + '" onclick="selectOption(' + index + ', ' + i + ')">';
        optionsHtml += '<div class="option-content">';
        optionsHtml += '<span class="option-letter">' + letters[i] + '</span>';
        optionsHtml += '<span>' + q.options[i].text + '</span>';
        optionsHtml += '</div></div>';
    }
    document.getElementById('optionsContainer').innerHTML = optionsHtml;
}

function selectOption(questionIndex, optionIndex) {
    state.answers[questionIndex] = optionIndex;

    var options = document.querySelectorAll('.option');
    for (var i = 0; i < options.length; i++) {
        options[i].classList.remove('selected');
    }
    options[optionIndex].classList.add('selected');

    setTimeout(function() {
        if (questionIndex < QUESTIONS.length - 1) {
            animateToQuestion(questionIndex + 1, 'forward');
        } else {
            calculateResult();
            showResult();
        }
    }, 300);
}

function animateToQuestion(newIndex, direction) {
    var card = document.getElementById('questionCard');
    var outClass = direction === 'forward' ? 'slide-out-left' : 'slide-out-right';
    var inClass = direction === 'forward' ? 'slide-in-right' : 'slide-in-left';

    card.classList.add(outClass);

    setTimeout(function() {
        card.classList.remove(outClass);
        state.currentQuestion = newIndex;
        renderQuestion(newIndex);
        card.classList.add(inClass);

        setTimeout(function() {
            card.classList.remove(inClass);
        }, 300);
    }, 300);
}

// ===== Progress Bar Click (回退) =====
function initProgressBar() {
    document.getElementById('progressFill').parentElement.addEventListener('click', function(e) {
        var rect = this.getBoundingClientRect();
        var pct = (e.clientX - rect.left) / rect.width;
        var targetQ = Math.floor(pct * QUESTIONS.length);
        targetQ = Math.max(0, Math.min(targetQ, QUESTIONS.length - 1));

        if (targetQ < state.answers.length) {
            var direction = targetQ < state.currentQuestion ? 'backward' : 'forward';
            animateToQuestion(targetQ, direction);
        }
    });
}

// ===== Scoring =====
function calculateResult() {
    state.scores = { jf: 0, yg: 0, xh: 0, wl: 0 };

    for (var i = 0; i < QUESTIONS.length; i++) {
        if (state.answers[i] === undefined) continue;

        var option = QUESTIONS[i].options[state.answers[i]];
        var multiplier = QUESTIONS[i].weighted ? 2 : 1;

        if (option.scores.jf) state.scores.jf += option.scores.jf * multiplier;
        if (option.scores.yg) state.scores.yg += option.scores.yg * multiplier;
        if (option.scores.xh) state.scores.xh += option.scores.xh * multiplier;
        if (option.scores.wl) state.scores.wl += option.scores.wl * multiplier;
    }

    var code = '';
    code += state.scores.jf >= 0 ? 'J' : 'F';
    code += state.scores.yg >= 0 ? 'Y' : 'G';
    code += state.scores.xh >= 0 ? 'X' : 'H';
    code += state.scores.wl >= 0 ? 'W' : 'L';
    state.resultCode = code;

    var maxScore = 24;
    state.resultPcts = {
        jf: clampPct(50 + (state.scores.jf / maxScore) * 50),
        yg: clampPct(50 + (state.scores.yg / maxScore) * 50),
        xh: clampPct(50 + (state.scores.xh / maxScore) * 50),
        wl: clampPct(50 + (state.scores.wl / maxScore) * 50)
    };
}

function clampPct(val) {
    return Math.max(5, Math.min(95, Math.round(val)));
}

// ===== Result Display =====
function showResult() {
    var type = TYPES[state.resultCode];
    if (!type) {
        type = TYPES['FYXW'];
        state.resultCode = 'FYXW';
    }

    document.getElementById('resultCode').textContent = state.resultCode;
    if (type.image) {
        document.getElementById('resultEmoji').innerHTML = '<img src="' + type.image + '" alt="' + type.name + '" class="result-avatar" />';
    } else {
        document.getElementById('resultEmoji').textContent = type.emoji;
    }
    document.getElementById('resultName').textContent = type.name;
    document.getElementById('resultTagline').textContent = type.tagline;
    document.getElementById('resultDesc').textContent = type.desc;
    document.getElementById('resultTips').innerHTML = '<p>' + type.tips + '</p>';

    renderDimensionBars();
    updateShareUrl();

    showPage('result');

    setTimeout(function() {
        animateDimensionBars();
    }, 100);
}

function renderDimensionBars() {
    var dims = [
        { key: 'jf', left: '卷', right: '佛', leftLabel: 'J', rightLabel: 'F' },
        { key: 'yg', left: '圆', right: '刚', leftLabel: 'Y', rightLabel: 'G' },
        { key: 'xh', left: '显', right: '隐', leftLabel: 'X', rightLabel: 'H' },
        { key: 'wl', left: '稳', right: '浪', leftLabel: 'W', rightLabel: 'L' }
    ];

    var html = '';
    for (var i = 0; i < dims.length; i++) {
        var d = dims[i];
        var pct = state.resultPcts[d.key];
        var leftPct = pct;
        var rightPct = 100 - pct;
        var fillClass = (pct >= 50) ? 'left-fill' : 'right-fill';
        var fillPct = (pct >= 50) ? pct : rightPct;

        html += '<div class="dim-bar-row">';
        html += '<span class="dim-bar-label left">' + d.left + '</span>';
        html += '<div class="dim-bar-track" data-dim="' + d.key + '" data-pct="' + fillPct + '">';
        html += '<div class="dim-bar-fill ' + fillClass + '"></div>';
        html += '</div>';
        html += '<span class="dim-bar-pct">' + leftPct + ':' + rightPct + '</span>';
        html += '<span class="dim-bar-label right">' + d.right + '</span>';
        html += '</div>';
    }

    document.getElementById('dimensionBars').innerHTML = html;
}

function animateDimensionBars() {
    var tracks = document.querySelectorAll('.dim-bar-track');
    for (var i = 0; i < tracks.length; i++) {
        var pct = tracks[i].getAttribute('data-pct');
        var fill = tracks[i].querySelector('.dim-bar-fill');
        fill.style.width = pct + '%';
    }
}

// ===== URL Sharing =====
function updateShareUrl() {
    var params = state.resultCode + '-' +
        state.resultPcts.jf + '-' +
        state.resultPcts.yg + '-' +
        state.resultPcts.xh + '-' +
        state.resultPcts.wl;

    history.replaceState(null, '', '?r=' + params);
}

function checkUrlResult() {
    var params = new URLSearchParams(window.location.search);
    var r = params.get('r');
    if (!r) return false;

    var parts = r.split('-');
    if (parts.length !== 5) return false;

    var code = parts[0];
    if (!TYPES[code]) return false;

    state.resultCode = code;
    state.resultPcts = {
        jf: parseInt(parts[1]) || 50,
        yg: parseInt(parts[2]) || 50,
        xh: parseInt(parts[3]) || 50,
        wl: parseInt(parts[4]) || 50
    };

    document.getElementById('shareCta').style.display = 'block';

    showResult();
    return true;
}

// ===== Share Image =====
function shareResult() {
    var card = document.getElementById('resultCard');
    html2canvas(card, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
    }).then(function(canvas) {
        var dataUrl = canvas.toDataURL('image/png');
        var shareImage = document.getElementById('shareImage');
        shareImage.src = dataUrl;
        document.getElementById('shareHint').style.display = 'block';
        shareImage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}


// ===== Intro Background =====
function generateIntroBg() {
    var intro = document.getElementById('intro');
    var grid = document.createElement('div');
    grid.className = 'intro-bg-grid';

    var keys = Object.keys(TYPES);
    // 重复两遍铺满
    var allKeys = keys.concat(keys);
    for (var i = 0; i < allKeys.length; i++) {
        var img = document.createElement('img');
        img.src = TYPES[allKeys[i]].image;
        img.alt = '';
        grid.appendChild(img);
    }
    intro.insertBefore(grid, intro.firstChild);
}

// ===== Init =====
(function init() {
    if (!checkUrlResult()) {
        showPage('intro');
    }
    initProgressBar();
    generateIntroBg();
})();
