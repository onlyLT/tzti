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
    var type = TYPES[state.resultCode];

    // 如果有立绘图片，先加载再渲染
    if (type.image) {
        var img = new Image();
        img.onload = function() { renderShareCanvas(type, img); };
        img.onerror = function() { renderShareCanvas(type, null); };
        img.src = type.image;
    } else {
        renderShareCanvas(type, null);
    }
}

function renderShareCanvas(type, avatarImg) {
    var canvas = document.getElementById('shareCanvas');
    var ctx = canvas.getContext('2d');
    var w = 640;
    var dpr = 2;
    var pad = 40;

    // 先用临时 canvas 计算文字行数来确定总高度
    var tmpCanvas = document.createElement('canvas');
    var tmpCtx = tmpCanvas.getContext('2d');
    tmpCtx.font = '13px "Noto Sans SC", sans-serif';
    var descLines = wrapText(tmpCtx, type.desc, w - pad * 2);
    tmpCtx.font = '13px "Noto Sans SC", sans-serif';
    var tipLines = wrapText(tmpCtx, type.tips, w - pad * 2 - 20);

    // 动态计算高度
    var avatarSize = avatarImg ? 200 : 0;
    var y = 0;
    y += 60;                              // 顶部留白 + 标题
    y += 60;                              // 类型码
    y += avatarImg ? avatarSize + 15 : 50; // 立绘或emoji
    y += 45;                              // 类型名
    y += 30;                              // 标签
    y += descLines.length * 22 + 20;      // 描述
    y += tipLines.length * 20 + 30;       // 生存建议
    y += 4 * 36 + 20;                     // 维度条
    y += 60;                              // 底部水印
    var h = y;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    // 背景
    ctx.fillStyle = '#faf8f5';
    ctx.fillRect(0, 0, w, h);

    // 水墨点缀
    var grad = ctx.createRadialGradient(w * 0.2, h * 0.4, 0, w * 0.2, h * 0.4, w * 0.5);
    grad.addColorStop(0, 'rgba(196, 58, 49, 0.04)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 顶部金线
    var lineGrad = ctx.createLinearGradient(0, 0, w, 0);
    lineGrad.addColorStop(0, '#c43a31');
    lineGrad.addColorStop(0.5, '#d4a847');
    lineGrad.addColorStop(1, '#c43a31');
    ctx.fillStyle = lineGrad;
    ctx.fillRect(0, 0, w, 3);

    // --- 开始绘制，用 curY 追踪当前位置 ---
    var curY = 40;

    // 标题
    ctx.fillStyle = '#b8922e';
    ctx.font = '13px "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    ctx.fillText('组 织 鉴 定 书', w / 2, curY);
    curY += 15;

    // 类型码
    ctx.fillStyle = '#c43a31';
    ctx.font = '900 44px "Noto Serif SC", serif';
    ctx.fillText(state.resultCode, w / 2, curY + 44);
    curY += 55;

    // 立绘或Emoji
    if (avatarImg) {
        var avatarX = w / 2 - avatarSize / 2;
        ctx.drawImage(avatarImg, avatarX, curY, avatarSize, avatarSize);
        curY += avatarSize + 15;
    } else {
        ctx.font = '48px sans-serif';
        ctx.fillText(type.emoji, w / 2, curY + 40);
        curY += 50;
    }

    // 类型名
    ctx.fillStyle = '#2a2a2a';
    ctx.font = '700 28px "Noto Serif SC", serif';
    ctx.fillText(type.name, w / 2, curY + 28);
    curY += 40;

    // 标签
    ctx.fillStyle = '#c43a31';
    ctx.font = '14px "Noto Sans SC", sans-serif';
    ctx.fillText(type.tagline, w / 2, curY);
    curY += 25;

    // 分割线
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, curY);
    ctx.lineTo(w - pad, curY);
    ctx.stroke();
    curY += 18;

    // 描述
    ctx.fillStyle = 'rgba(42, 42, 42, 0.75)';
    ctx.font = '13px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'left';
    for (var i = 0; i < descLines.length; i++) {
        ctx.fillText(descLines[i], pad, curY + i * 22);
    }
    curY += descLines.length * 22 + 12;

    // 生存建议
    ctx.fillStyle = 'rgba(196, 58, 49, 0.06)';
    var tipH = tipLines.length * 20 + 16;
    roundRect(ctx, pad, curY - 4, w - pad * 2, tipH, 6);
    ctx.fill();
    ctx.fillStyle = '#c43a31';
    roundRect(ctx, pad, curY - 4, 3, tipH, 1);
    ctx.fill();
    ctx.fillStyle = 'rgba(42, 42, 42, 0.6)';
    ctx.font = '12px "Noto Sans SC", sans-serif';
    for (var i = 0; i < tipLines.length; i++) {
        ctx.fillText(tipLines[i], pad + 14, curY + 10 + i * 20);
    }
    curY += tipH + 20;

    // 维度条
    var dims = [
        { key: 'jf', left: '卷', right: '佛' },
        { key: 'yg', left: '圆', right: '刚' },
        { key: 'xh', left: '显', right: '隐' },
        { key: 'wl', left: '稳', right: '浪' }
    ];

    for (var i = 0; i < dims.length; i++) {
        var d = dims[i];
        var pct = state.resultPcts[d.key];
        var barRowY = curY + i * 36;

        // 左标签
        ctx.fillStyle = '#c43a31';
        ctx.font = '500 13px "Noto Sans SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(d.left, pad + 10, barRowY + 11);

        // 轨道
        var trackX = pad + 30;
        var trackW = w - pad * 2 - 100;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
        roundRect(ctx, trackX, barRowY + 3, trackW, 8, 4);
        ctx.fill();

        // 填充
        var fillGrad = ctx.createLinearGradient(trackX, 0, trackX + trackW, 0);
        fillGrad.addColorStop(0, '#c43a31');
        fillGrad.addColorStop(1, 'rgba(196, 58, 49, 0.15)');
        ctx.fillStyle = fillGrad;
        roundRect(ctx, trackX, barRowY + 3, trackW * pct / 100, 8, 4);
        ctx.fill();

        // 百分比
        ctx.fillStyle = 'rgba(42, 42, 42, 0.4)';
        ctx.font = '11px "Noto Sans SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(pct + ':' + (100 - pct), w - pad - 35, barRowY + 11);

        // 右标签
        ctx.fillStyle = '#b8922e';
        ctx.font = '500 13px "Noto Sans SC", sans-serif';
        ctx.fillText(d.right, w - pad - 5, barRowY + 11);
    }
    curY += 4 * 36 + 10;

    // 底部水印
    ctx.fillStyle = 'rgba(42, 42, 42, 0.2)';
    ctx.font = '11px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('人民的T.I. — 体制内人格测试', w / 2, curY + 20);

    // 转为图片
    var dataUrl = canvas.toDataURL('image/png');
    var shareImage = document.getElementById('shareImage');
    shareImage.src = dataUrl;
    document.getElementById('shareHint').style.display = 'block';

    shareImage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function wrapText(ctx, text, maxWidth) {
    var lines = [];
    var currentLine = '';
    for (var i = 0; i < text.length; i++) {
        var testLine = currentLine + text[i];
        var metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = text[i];
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// ===== Init =====
(function init() {
    if (!checkUrlResult()) {
        showPage('intro');
    }
    initProgressBar();
})();
