# TZTI 体制内人格测试 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a shareable personality test web app that maps users to 16 体制内 (Chinese bureaucratic system) archetypes across 4 dimensions.

**Architecture:** Pure static SPA with 3 page states (intro → quiz → result) managed by vanilla JS. Data layer (`data.js`) holds all questions and type definitions. App logic (`app.js`) manages state transitions, scoring, and share features. Single CSS file for all visual styling.

**Tech Stack:** HTML5, CSS3 (flexbox, CSS custom properties, transitions), vanilla JavaScript (ES5-compatible, no modules), Canvas API for share image generation, Google Fonts (Noto Serif SC, Noto Sans SC).

---

## File Map

| File | Responsibility |
|------|---------------|
| `index.html` | Page structure: 3 sections (intro, quiz, result), font imports, script tags |
| `style.css` | All visual styling: variables, layout, components, animations, responsive |
| `data.js` | 16 type definitions (code, name, emoji, tagline, description, tips) + 24 questions with scoring |
| `app.js` | State machine (page transitions), quiz engine, scoring, result rendering, URL sharing, Canvas export |

---

### Task 1: Project Scaffold & HTML Structure

**Files:**
- Create: `index.html`

- [ ] **Step 1: Initialize git repo**

```bash
cd /e/dev/tzti
git init
```

- [ ] **Step 2: Create index.html with full page structure**

Create `index.html` with the complete HTML structure containing all 3 page sections. This is the only HTML file — everything else is CSS and JS.

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>TZTI 体制内人格测试</title>
    <meta name="description" content="24道题，测出你在体制内的真实人格。4个维度，16种类型，你是局长预备役还是摸鱼之王？">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700;900&family=Noto+Sans+SC:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="app">
        <!-- 首页 -->
        <section id="intro" class="page active">
            <div class="container intro-container">
                <div class="seal">
                    <div class="seal-inner">
                        <span class="seal-text">体制内<br>人格鉴定</span>
                    </div>
                </div>
                <h1 class="title">T Z T I</h1>
                <p class="subtitle">体 制 内 人 格 测 试</p>
                <p class="subtitle-en">Tǐzhì nèi Type Indicator</p>
                <div class="dim-tags">
                    <span class="dim-tag">卷 vs 佛</span>
                    <span class="dim-tag">圆 vs 刚</span>
                    <span class="dim-tag">显 vs 隐</span>
                    <span class="dim-tag">稳 vs 浪</span>
                </div>
                <p class="intro-desc">24道题，测出你在体制内的真实人格<br>4个维度 · 16种类型</p>
                <button class="btn btn-primary" onclick="startTest()">开 始 鉴 定</button>
                <p class="disclaimer">* 纯属娱乐，请勿对号入座（虽然你一定会）</p>
            </div>
        </section>

        <!-- 答题页 -->
        <section id="quiz" class="page">
            <div class="container quiz-container">
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <div class="progress-text">第 <span id="currentQ">1</span> / <span id="totalQ">24</span> 题</div>
                <div class="question-area" id="questionArea">
                    <div class="question-card" id="questionCard">
                        <p class="question-text" id="questionText"></p>
                        <div class="options" id="optionsContainer"></div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 结果页 -->
        <section id="result" class="page">
            <div class="container result-container">
                <!-- 分享引导（仅通过URL参数访问时显示） -->
                <div class="share-cta" id="shareCta" style="display:none">
                    <p>你的朋友测出了 Ta 的体制内人格，你也来试试？</p>
                    <button class="btn btn-primary" onclick="startTest()">我也要测</button>
                </div>
                <div class="result-card" id="resultCard">
                    <div class="result-header">
                        <span class="result-badge">组 织 鉴 定 书</span>
                    </div>
                    <div class="result-type-code" id="resultCode"></div>
                    <div class="result-emoji" id="resultEmoji"></div>
                    <div class="result-type-name" id="resultName"></div>
                    <div class="result-tagline" id="resultTagline"></div>
                    <div class="result-desc" id="resultDesc"></div>
                    <div class="dimension-bars" id="dimensionBars"></div>
                    <div class="result-tips" id="resultTips"></div>
                    <div class="result-seal">
                        <div class="seal seal-small">
                            <div class="seal-inner">
                                <span class="seal-text">鉴定<br>有效</span>
                            </div>
                        </div>
                    </div>
                    <div class="result-footer">
                        <span>TZTI 体制内人格测试</span>
                    </div>
                </div>
                <div class="result-actions">
                    <button class="btn btn-secondary" onclick="restartTest()">重新鉴定</button>
                    <button class="btn btn-primary" onclick="shareResult()">生成分享图</button>
                </div>
                <div class="share-hint" id="shareHint" style="display:none">
                    <p>长按图片保存，分享到朋友圈</p>
                    <img id="shareImage" />
                </div>
            </div>
        </section>
    </div>

    <canvas id="shareCanvas" style="display:none"></canvas>
    <script src="data.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 3: Verify in browser**

Open `index.html` in browser. Should see a blank page (no CSS/JS yet) with raw HTML content visible. Check browser console — should show 404 errors for `style.css`, `data.js`, `app.js` (expected, files not created yet). No JS errors from the HTML itself.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add HTML structure with intro, quiz, and result sections"
```

---

### Task 2: Type Definitions Data

**Files:**
- Create: `data.js`

- [ ] **Step 1: Create data.js with all 16 type definitions**

Create `data.js` with the `TYPES` object. Each type keyed by its 4-letter code, containing: `name` (代号), `emoji`, `tagline` (一句话标签), `desc` (3-4句详细描述), `tips` (生存建议).

```javascript
/* TZTI 体制内人格测试 — 数据层 */

// 16种体制内人格类型定义
var TYPES = {
    JYXW: {
        name: '局长预备役',
        emoji: '👔',
        tagline: '能力强情商高，步步为营的红人',
        desc: '开会永远坐第一排，汇报材料写到凌晨三点，同事关系处理得滴水不漏。你不是在开会就是在去开会的路上，公务接待标准和八项规定条款倒背如流。领导眼中的接班人，同事心中的卷王。你的"新质生产力"调研报告已经被区里当范文转发了。',
        tips: '建议：适当示弱，别让所有人都觉得你在抢功。记住，能力太强也是一种"不稳定因素"。'
    },
    JYXL: {
        name: '体制弄潮儿',
        emoji: '🏄',
        tagline: '能干会来事还敢创新的异类',
        desc: '别人还在等通知你已经在搞创新试点了。在体制内你是最不像体制内的那个人，偏偏混得还不错。你敢在落实"高质量发展"的会上提出和领导不一样的方案，关键是领导还真被你说服了。同事对你又羡慕又担心。',
        tips: '建议：创新可以，但要学会给领导留"拍板"的面子。你的方案再好，最终要让领导觉得是他的主意。'
    },
    JYHW: {
        name: '深水鱼',
        emoji: '🐟',
        tagline: '表面波澜不惊，暗中稳步上升',
        desc: '从不主动出风头，但每次提拔名单都有你。你深谙"闷声发大财"的道理，是同事们最看不透的人。八项规定后别人抱怨没油水了，你却觉得规则越明确对你越有利。年终总结写得四平八稳，但每个数据都恰好对标了上级考核指标。',
        tips: '建议：偶尔暴露一点小缺点，太完美的人会让人不安。'
    },
    JYHL: {
        name: '暗棋手',
        emoji: '♟️',
        tagline: '圆滑低调却每步都有算计',
        desc: '努力且圆滑，但不按常理出牌。你可能是最危险的那种同事——看似随和实则每步都有算计，而且还敢走别人不敢走的路。组织学习政策文件时你看的是字里行间的机会，对标对表的时候你对标的是自己的晋升时间线。',
        tips: '建议：算计太深容易把自己绕进去。有时候"傻一点"反而是最聪明的策略。'
    },
    JGXW: {
        name: '劳模标兵',
        emoji: '🏅',
        tagline: '干活没得说，但提拔永远差一步',
        desc: '业务能力年年第一，领导嘴上夸"踏实肯干"，实际提拔的永远是别人。你是那种所有人都觉得"该升了"但就是升不上去的人。八项规定的自查报告你写得最认真，"赋能增效"的方案你做得最详细，但功劳簿上永远只有你的名字打底。',
        tips: '建议：别只顾埋头干活，偶尔也要抬头看路。能力是门票，但关系才是座位号。'
    },
    JGXL: {
        name: '愣头青',
        emoji: '🔥',
        tagline: '有能力有脾气，敢当面怼领导',
        desc: '新人时期就敢在会上怼领导的不合理安排，老同事看你既佩服又替你捏把汗。你觉得形式主义的学习心得是浪费时间，公款吃喝更是深恶痛绝。要么飞黄腾达，要么原地踏步，没有中间态。你在体制内活成了一个传说。',
        tips: '建议：正义感是好事，但学会选择战场。不是每场仗都值得打，有些山头要迂回着上。'
    },
    JGHW: {
        name: '老黄牛',
        emoji: '🐂',
        tagline: '默默干活最多，功劳永远记不到',
        desc: '你是单位里最让人放心的人，但也是最容易被忽视的人。活永远干不完，功劳永远记不到。十四五规划的材料是你通宵赶出来的，但署名是科长的。你不会推活，不会邀功，不会在领导面前刷存在感，只会在加班的办公室里叹气。',
        tips: '建议：善良不等于好欺负。学会说"不"是职场生存的必修课，不是选修课。'
    },
    JGHL: {
        name: '体制孤狼',
        emoji: '🐺',
        tagline: '能力强有原则，活成体制内异类',
        desc: '你在体制内活成了一个异类，偏偏谁都拿你没办法，因为活离了你还真不行。不参加无意义的聚餐，不写违心的表态材料，不在领导面前演戏。八项规定你举双手赞成，因为终于有规定替你拒绝那些虚伪应酬了。',
        tips: '建议：孤独是强者的必修课，但别让孤独变成孤立。至少要有一两个可以信任的盟友。'
    },
    FYXW: {
        name: '万金油',
        emoji: '🧴',
        tagline: '哪都能待哪都不扎根，永远的安全牌',
        desc: '佛系但圆滑，到哪个部门都吃得开，但从不出全力。你是办公室里最受欢迎的人，因为你既不威胁任何人，又能帮所有人的忙。公务接待你安排得妥妥帖帖，对标指标你写得规规矩矩。稳如泰山，也闲如泰山。',
        tips: '建议：安全牌打多了容易被遗忘。偶尔主动接一个有挑战性的活，让人记住你的价值。'
    },
    FYXL: {
        name: '八面佛',
        emoji: '🫖',
        tagline: '啥活没干但人均欠你一个人情',
        desc: '佛系但社牛，不卷但人缘好到离谱。你可能不是干活最多的，但一定是聚餐组局最积极的（当然是AA制，八项规定后你第一个适应）。在体制内活成了一个传说——啥也没干但所有人都觉得你很厉害。跨部门串联全靠你。',
        tips: '建议：人脉是资产也是负债。欠你人情的人多了，找你办事的也多了。学会筛选。'
    },
    FYHW: {
        name: '太极宗师',
        emoji: '☯️',
        tagline: '推事推责推加班，无人能伤',
        desc: '推功夫一流：推事、推责、推加班。你把"这个我不太了解，你问问XX"练到了炉火纯青。看似人畜无害，实则无人能伤。写落实八项规定的心得体会？"建议让更了解情况的同志来写。"年终总结要对标高质量发展？"这块XX科更专业。"',
        tips: '建议：推太多容易被贴标签。偶尔接一个无关痛痒的小活，维持"还是有在干活"的印象。'
    },
    FYHL: {
        name: '神隐大师',
        emoji: '👻',
        tagline: '上班如隐身，实现了精神自由',
        desc: '佛系、圆滑、低调、放飞自我。上班如隐身，下班似穿越。同事经常忘记你的存在，直到需要凑人头。你在体制内实现了真正的"精神自由"——工位上看似在研究政策文件，实际上在看小说。你是八项规定最大的受益者，因为再也没人叫你去应酬了。',
        tips: '建议：隐身太久容易被裁。每个季度至少刷一次存在感，让领导记得有你这个人。'
    },
    FGXW: {
        name: '铁面佛',
        emoji: '🗿',
        tagline: '不争名逐利但谁都知道不好惹',
        desc: '佛系但有底线，不争名逐利但也绝不同流合污。你是体制内的一股清流，虽然不卷但谁都知道你不好惹。八项规定你觉得早该有了，看到有人踩红线你虽然不举报但绝不同流。同事对你的评价永远是"这个人挺正的"。',
        tips: '建议：正直是你的护城河，但别把护城河修成了围墙。适当的灵活不等于妥协。'
    },
    FGXL: {
        name: '体制侠客',
        emoji: '⚔️',
        tagline: '不争不抢但看不惯就要管',
        desc: '你是那种不争不抢但看不惯就要说的人。别人劝你别多管闲事你偏要管。发现有人用公车办私事你会匿名举报，看到形式主义的对标考核你敢在会上直接说。体制内最稀有的物种——真正的理想主义者。',
        tips: '建议：侠客精神值得敬佩，但要保护好自己。先确保自己站稳了，再去拉别人一把。'
    },
    FGHW: {
        name: '摸鱼之王',
        emoji: '🐠',
        tagline: '多做多错不做不错的践行者',
        desc: '上班打卡下班走人，工作能拖就拖，不能拖就做到及格线。你把"多做多错、少做少错、不做不错"奉为圭臬。八项规定是你合法拒绝加班应酬的终极挡箭牌："不好意思，规定不允许。"偶尔被点名也不慌——反正佛了。',
        tips: '建议：摸鱼可以，但别让自己真的变成咸鱼。保持一项核心技能，让自己始终有退路。'
    },
    FGHL: {
        name: '编外哲学家',
        emoji: '🤔',
        tagline: '最通透的人，也最容易被认为有问题',
        desc: '你经常思考"我为什么在这里"，然后得出结论"算了先干着吧"。你是体制内最通透的人，也是最容易被认为"有问题"的人。开会讨论"赋能增效"的时候你在想这个词到底什么意思，写学习心得的时候你真的在认真思考而不是复制粘贴。',
        tips: '建议：通透是一种天赋，但在体制内，适当的"糊涂"是生存智慧。想明白的事不一定要说出来。'
    }
};
```

- [ ] **Step 2: Verify data loads**

Open `index.html` in browser. Open console, type `TYPES.JYXW.name`. Should output `"局长预备役"`. Type `Object.keys(TYPES).length`. Should output `16`.

- [ ] **Step 3: Commit**

```bash
git add data.js
git commit -m "feat: add 16 personality type definitions with descriptions and tips"
```

---

### Task 3: Questions Data

**Files:**
- Modify: `data.js` (append after TYPES)

- [ ] **Step 1: Add all 24 questions to data.js**

Append the `QUESTIONS` array to `data.js`. Each question has `text` (场景), `options` (4个选项), and each option has `text` and `scores` (维度影响). Scoring uses: `jf` (卷佛, positive=卷), `yg` (圆刚, positive=圆), `xh` (显隐, positive=显), `wl` (稳浪, positive=稳). The last 4 questions (indices 20-23) are weighted questions — their scores are doubled during calculation.

```javascript
// 24道测试题
// 前20题为基础题，后4题为加权决胜题（分值在计算时×2）
// scores: jf(卷+/佛-), yg(圆+/刚-), xh(显+/隐-), wl(稳+/浪-)
var QUESTIONS = [
    // ===== 人际关系与职场生存（10题）=====
    {
        text: '领导在工作群发了一条消息，你的第一反应是？',
        options: [
            { text: '立刻回复"收到"并附上最新工作进展', scores: { jf: 2, yg: 1 } },
            { text: '观察一下谁先回，跟着回一个"收到"', scores: { jf: -1, yg: 1 } },
            { text: '看完觉得和我无关就不回了', scores: { jf: -1, yg: -1 } },
            { text: '认真分析消息内容，有疑问直接私聊领导', scores: { jf: 1, yg: -1 } }
        ]
    },
    {
        text: '单位开大会，你习惯坐在哪里？',
        options: [
            { text: '前排居中，方便和领导互动', scores: { xh: 2, jf: 1 } },
            { text: '中间靠边，不远不近刚刚好', scores: { wl: 1, xh: -1 } },
            { text: '最后一排靠门，随时准备撤退', scores: { xh: -2, jf: -1 } },
            { text: '无所谓，有座就行', scores: { jf: -1, wl: -1 } }
        ]
    },
    {
        text: '有个重要项目需要负责人，你会？',
        options: [
            { text: '主动请缨，这是表现的好机会', scores: { jf: 2, xh: 1 } },
            { text: '等领导点名，点到就认真干', scores: { wl: 1, xh: -1 } },
            { text: '暗中做好准备，让领导"自然而然"想到你', scores: { jf: 1, yg: 1 } },
            { text: '想办法推给更合适的人选', scores: { jf: -1, yg: 1 } }
        ]
    },
    {
        text: '发现同事工作中出了明显错误，你会？',
        options: [
            { text: '私下找他提醒，给人留面子', scores: { yg: 2, wl: 1 } },
            { text: '在会上直接指出，对事不对人', scores: { yg: -2, xh: 1 } },
            { text: '不说，不关我的事', scores: { jf: -1, xh: -1 } },
            { text: '告诉领导，让领导来处理', scores: { yg: 1, wl: 1 } }
        ]
    },
    {
        text: '下班时间到了但领导还没走，你会？',
        options: [
            { text: '继续工作或者装忙，等领导走', scores: { jf: 1, yg: 1 } },
            { text: '准时下班，到点就是到点', scores: { yg: -1, wl: -1 } },
            { text: '收拾东西但走得很慢，观察其他人的动向', scores: { yg: 1, xh: -1 } },
            { text: '悄悄从后门溜走', scores: { jf: -1, xh: -2 } }
        ]
    },
    {
        text: '年终考核，你觉得最重要的是？',
        options: [
            { text: '实打实的工作业绩和数据', scores: { jf: 1, yg: -1 } },
            { text: '领导对你的印象和评价', scores: { yg: 2, wl: 1 } },
            { text: '别垫底就行，平安过关', scores: { jf: -2, wl: 1 } },
            { text: '考核结果不重要，自己学到东西最重要', scores: { yg: -1, wl: -1 } }
        ]
    },
    {
        text: '得知同事升职了，你的真实想法是？',
        options: [
            { text: '分析他为什么能升，复盘自己的差距', scores: { jf: 2, yg: 1 } },
            { text: '恭喜恭喜，与我无关', scores: { jf: -1, xh: -1 } },
            { text: '如果他确实有能力，心服口服', scores: { yg: -1, wl: 1 } },
            { text: '有点不爽，但也不会让人看出来', scores: { yg: 1, xh: -1 } }
        ]
    },
    {
        text: '领导安排了一个你觉得不合理的任务，你会？',
        options: [
            { text: '先接下来，执行中再想办法调整', scores: { yg: 1, wl: 1 } },
            { text: '当场委婉表达不同意见', scores: { yg: -1, xh: 1 } },
            { text: '接了但偷偷按自己的方式做', scores: { yg: -1, wl: -1 } },
            { text: '先摸清领导的真实意图再决定怎么办', scores: { yg: 2, jf: 1 } }
        ]
    },
    {
        text: '办公室里有两派明争暗斗，你会？',
        options: [
            { text: '两边都处好关系，保持中立', scores: { yg: 2, wl: 1 } },
            { text: '选一边站，跟对人很重要', scores: { yg: 1, wl: -1 } },
            { text: '埋头干活不掺和，用实力说话', scores: { yg: -1, xh: -1 } },
            { text: '看热闹不嫌事大，当个吃瓜群众', scores: { jf: -1, xh: -1 } }
        ]
    },
    {
        text: '同事请你帮忙做一件不在你职责范围内的事，你会？',
        options: [
            { text: '帮了，反正也是积累人脉', scores: { yg: 1, jf: 1 } },
            { text: '看关系远近再决定', scores: { yg: 1, wl: 1 } },
            { text: '直接说"这不是我的职责范围"', scores: { yg: -2, xh: 1 } },
            { text: '教他怎么做，但不替他做', scores: { yg: -1, jf: -1 } }
        ]
    },
    // ===== 八项规定与日常合规（6题）=====
    {
        text: '中秋节前，合作单位的人提着礼品来"坐坐"，你会？',
        options: [
            { text: '客气接待，但礼品坚决不收，规定就是规定', scores: { yg: 1, wl: 1 } },
            { text: '直接拒绝，连门都不让进', scores: { yg: -2, xh: 1 } },
            { text: '收下后悄悄上交给纪检部门', scores: { yg: 1, xh: -1 } },
            { text: '打太极："哎呀这怎么好意思，你看我这办公室也没地方放……"', scores: { yg: 2, jf: -1 } }
        ]
    },
    {
        text: '单位聚餐从五星酒店改成了食堂AA制，你的反应？',
        options: [
            { text: '早该这样了，支持八项规定', scores: { yg: -1, wl: 1 } },
            { text: '无所谓，反正我也不爱应酬', scores: { jf: -1, xh: -1 } },
            { text: '主动张罗组织，食堂也能吃出氛围感', scores: { xh: 1, yg: 1 } },
            { text: '终于可以名正言顺地不参加了', scores: { jf: -2, xh: -1 } }
        ]
    },
    {
        text: '领导让你写一份落实八项规定的自查报告，你会？',
        options: [
            { text: '认真梳理，借机展示我们部门的成绩', scores: { jf: 1, yg: 1 } },
            { text: '找去年的模板，改改数据就交了', scores: { jf: -1, wl: 1 } },
            { text: '把真实问题写进去，报告就该实事求是', scores: { yg: -1, wl: -1 } },
            { text: '先看看其他部门怎么写的，不能太出格也不能太敷衍', scores: { yg: 2, wl: 1 } }
        ]
    },
    {
        text: '你发现有同事用公车接孩子放学，你会？',
        options: [
            { text: '当没看见，多一事不如少一事', scores: { jf: -1, yg: 1 } },
            { text: '私下提醒他注意影响', scores: { yg: 1, wl: 1 } },
            { text: '直接向纪检部门反映', scores: { yg: -2, wl: -1 } },
            { text: '在心里记下来，说不定以后用得上', scores: { yg: 1, xh: -1 } }
        ]
    },
    {
        text: '上级来检查工作，领导让你"准备准备"，你的理解是？',
        options: [
            { text: '把真实工作成果整理好，用数据说话', scores: { yg: -1, jf: 1 } },
            { text: '心领神会，该补的材料补，该美化的美化', scores: { yg: 2, wl: 1 } },
            { text: '问领导具体要准备什么，别自己瞎猜', scores: { wl: 1, yg: -1 } },
            { text: '能应付就应付，检查年年有，别太当回事', scores: { jf: -2, wl: -1 } }
        ]
    },
    {
        text: '出差住宿，标准是每晚300元，你会？',
        options: [
            { text: '严格按标准来，合规最重要', scores: { wl: 2, yg: -1 } },
            { text: '订标准内最好的，在规则内把生活过好', scores: { wl: 1, yg: 1 } },
            { text: '找个便宜的，省下来的差价……算了还是别想了', scores: { jf: -1, wl: 1 } },
            { text: '先看有没有朋友能安排，能省则省', scores: { yg: 1, wl: -1 } }
        ]
    },
    // ===== 政策学习与发展规划（4题）=====
    {
        text: '领导让你写一份"新质生产力"调研报告，你会？',
        options: [
            { text: '深入研究政策文件，走访调研，写出有深度的报告', scores: { jf: 2, yg: -1 } },
            { text: '先看看上级怎么提的，对标对表把框架搭好', scores: { yg: 1, wl: 1 } },
            { text: '网上搜几篇参考文章，整合一下交差', scores: { jf: -1, yg: 1 } },
            { text: '认真思考"新质生产力"到底怎么落地，写出自己的真实看法', scores: { yg: -2, wl: -1 } }
        ]
    },
    {
        text: '单位组织学习最新政策文件，要求写心得体会，你会？',
        options: [
            { text: '认真学习，写出有个人见解的心得', scores: { jf: 1, yg: -1 } },
            { text: '"靶向发力""赋能增效"这些词先安排上，框架比内容重要', scores: { yg: 2, xh: 1 } },
            { text: '复制粘贴改一改，应付了事', scores: { jf: -2, xh: -1 } },
            { text: '请教写得好的同事，学习他们的套路', scores: { yg: 1, jf: 1 } }
        ]
    },
    {
        text: '开会讨论"高质量发展"落实方案，轮到你发言，你会？',
        options: [
            { text: '提前准备，讲得有理有据，让领导刮目相看', scores: { jf: 1, xh: 2 } },
            { text: '"同意前面几位同志的意见"，然后复述一遍领导的话', scores: { yg: 2, jf: -1 } },
            { text: '提出一个不一样的角度，哪怕有争议', scores: { yg: -1, wl: -2 } },
            { text: '尽量少说，说多错多', scores: { xh: -2, wl: 1 } }
        ]
    },
    {
        text: '年终总结要对标"十四五规划"指标，你的态度是？',
        options: [
            { text: '认真对标每个指标，用数据证明成绩', scores: { jf: 2, wl: 1 } },
            { text: '指标完成不了的地方，换个角度重新解读', scores: { yg: 2, xh: 1 } },
            { text: '照搬去年的总结，改改数据和年份', scores: { jf: -2, wl: 1 } },
            { text: '老实写完成了多少就是多少，不注水', scores: { yg: -2, wl: -1 } }
        ]
    },
    // ===== 加权决胜题（4题，每个维度1题，计算时分值×2）=====
    {
        text: '周末接到工作电话，说有个紧急材料要赶，你的真实反应是？',
        weighted: true,
        options: [
            { text: '二话不说去单位，工作就是生活', scores: { jf: 2 } },
            { text: '电话里先问清楚，能远程解决就不去', scores: { jf: 1 } },
            { text: '去是去，但心里把安排这事的人骂了八百遍', scores: { jf: -1 } },
            { text: '手机静音，周一再说', scores: { jf: -2 } }
        ]
    },
    {
        text: '你对体制内"人情世故"这四个字的真实态度？',
        weighted: true,
        options: [
            { text: '这就是游戏规则，不学就出局', scores: { yg: 2 } },
            { text: '能配合就配合，但我有自己的底线', scores: { yg: 1 } },
            { text: '不喜欢但能忍，毕竟还要在这混', scores: { yg: -1 } },
            { text: '拒绝虚伪，做真实的自己', scores: { yg: -2 } }
        ]
    },
    {
        text: '你理想中在单位的存在感是？',
        weighted: true,
        options: [
            { text: '全单位都知道我的名字和成绩', scores: { xh: 2 } },
            { text: '领导知道我就行，不需要人尽皆知', scores: { xh: 1 } },
            { text: '最好没人注意到我，安安静静干活', scores: { xh: -1 } },
            { text: '存在感是什么？能吃吗？', scores: { xh: -2 } }
        ]
    },
    {
        text: '如果有一个机会：去新成立的部门当负责人，但风险很大，你会？',
        weighted: true,
        options: [
            { text: '绝对不去，现在的位置好好的何必折腾', scores: { wl: 2 } },
            { text: '先打听清楚背景和支持力度再说', scores: { wl: 1 } },
            { text: '有点心动，但要看具体条件', scores: { wl: -1 } },
            { text: '去！搏一把单车变摩托', scores: { wl: -2 } }
        ]
    }
];
```

- [ ] **Step 2: Verify questions load**

Open browser console, type `QUESTIONS.length`. Should output `24`. Type `QUESTIONS[23].weighted`. Should output `true`. Type `QUESTIONS[0].options.length`. Should output `4`.

- [ ] **Step 3: Commit**

```bash
git add data.js
git commit -m "feat: add 24 quiz questions with scoring (20 base + 4 weighted)"
```

---

### Task 4: Base Styles & Intro Page

**Files:**
- Create: `style.css`

- [ ] **Step 1: Create style.css with CSS variables, base styles, and intro page**

```css
/* ===== CSS Variables ===== */
:root {
    --bg-primary: #1a1a2e;
    --bg-card: rgba(255, 255, 255, 0.05);
    --bg-card-hover: rgba(255, 255, 255, 0.08);
    --color-red: #c43a31;
    --color-red-dark: #a02e27;
    --color-gold: #d4a847;
    --color-gold-dim: rgba(212, 168, 71, 0.3);
    --color-text: #f0e6d3;
    --color-text-dim: rgba(240, 230, 211, 0.6);
    --color-text-dimmer: rgba(240, 230, 211, 0.35);
    --font-serif: 'Noto Serif SC', serif;
    --font-sans: 'Noto Sans SC', sans-serif;
    --transition-normal: 0.3s ease;
    --transition-slow: 0.4s ease;
}

/* ===== Reset & Base ===== */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html, body {
    height: 100%;
    overflow-x: hidden;
}

body {
    font-family: var(--font-sans);
    background-color: var(--bg-primary);
    color: var(--color-text);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    /* 水墨纹理背景 */
    background-image:
        radial-gradient(ellipse at 20% 50%, rgba(196, 58, 49, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(212, 168, 71, 0.06) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, rgba(196, 58, 49, 0.05) 0%, transparent 50%);
    background-attachment: fixed;
}

/* ===== Layout ===== */
#app {
    min-height: 100vh;
    position: relative;
}

.page {
    display: none;
    min-height: 100vh;
    position: relative;
}

.page.active {
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn var(--transition-slow) ease;
}

.container {
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    padding: 24px 20px;
}

/* ===== Buttons ===== */
.btn {
    display: inline-block;
    padding: 14px 48px;
    border: none;
    border-radius: 8px;
    font-family: var(--font-sans);
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-normal);
    letter-spacing: 2px;
}

.btn:active {
    transform: scale(0.97);
}

.btn-primary {
    background: linear-gradient(135deg, var(--color-red), var(--color-red-dark));
    color: var(--color-text);
    box-shadow: 0 4px 15px rgba(196, 58, 49, 0.3);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(196, 58, 49, 0.4);
}

.btn-secondary {
    background: transparent;
    color: var(--color-text-dim);
    border: 1px solid var(--color-text-dimmer);
}

.btn-secondary:hover {
    border-color: var(--color-text-dim);
    color: var(--color-text);
}

/* ===== Seal (印章) ===== */
.seal {
    width: 100px;
    height: 100px;
    border: 3px solid var(--color-red);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    position: relative;
    transform: rotate(-15deg);
    opacity: 0.9;
}

.seal::before {
    content: '';
    position: absolute;
    inset: 4px;
    border: 1px solid var(--color-red);
    border-radius: 50%;
    opacity: 0.5;
}

.seal-inner {
    text-align: center;
}

.seal-text {
    font-family: var(--font-serif);
    font-size: 16px;
    font-weight: 900;
    color: var(--color-red);
    line-height: 1.3;
    letter-spacing: 2px;
}

.seal-small {
    width: 60px;
    height: 60px;
}

.seal-small .seal-text {
    font-size: 11px;
    letter-spacing: 1px;
}

/* ===== Intro Page ===== */
.intro-container {
    text-align: center;
    padding-top: 60px;
    padding-bottom: 40px;
}

.title {
    font-family: var(--font-serif);
    font-size: 56px;
    font-weight: 900;
    color: var(--color-gold);
    letter-spacing: 16px;
    margin-bottom: 8px;
    text-shadow: 0 2px 10px rgba(212, 168, 71, 0.3);
}

.subtitle {
    font-family: var(--font-serif);
    font-size: 18px;
    color: var(--color-text);
    letter-spacing: 8px;
    margin-bottom: 4px;
}

.subtitle-en {
    font-size: 13px;
    color: var(--color-text-dim);
    letter-spacing: 1px;
    margin-bottom: 32px;
}

.dim-tags {
    display: flex;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 32px;
}

.dim-tag {
    padding: 6px 14px;
    border: 1px solid var(--color-gold-dim);
    border-radius: 20px;
    font-size: 13px;
    color: var(--color-gold);
    letter-spacing: 1px;
}

.intro-desc {
    font-size: 15px;
    color: var(--color-text-dim);
    line-height: 1.8;
    margin-bottom: 40px;
}

.disclaimer {
    margin-top: 24px;
    font-size: 12px;
    color: var(--color-text-dimmer);
}
```

- [ ] **Step 2: Verify intro page renders**

Open `index.html` in browser. Should see the intro page with: seal badge, TZTI title in gold, subtitle, 4 dimension tags, description text, and the red "开始鉴定" button. Background should show subtle ink-wash gradients.

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: add base styles and intro page styling"
```

---

### Task 5: Quiz & Result Page Styles

**Files:**
- Modify: `style.css` (append)

- [ ] **Step 1: Add quiz page styles**

Append to `style.css`:

```css
/* ===== Quiz Page ===== */
.quiz-container {
    padding-top: 40px;
    padding-bottom: 40px;
}

.progress-bar {
    width: 100%;
    height: 4px;
    background: var(--bg-card);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 12px;
    cursor: pointer;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-red), var(--color-gold));
    border-radius: 2px;
    transition: width var(--transition-normal);
    width: 0%;
}

.progress-text {
    text-align: center;
    font-size: 13px;
    color: var(--color-text-dim);
    margin-bottom: 32px;
}

.question-area {
    position: relative;
    overflow: hidden;
    min-height: 400px;
}

.question-card {
    transition: all var(--transition-normal);
}

.question-card.slide-out-left {
    animation: slideOutLeft var(--transition-normal) ease forwards;
}

.question-card.slide-in-right {
    animation: slideInRight var(--transition-normal) ease forwards;
}

.question-card.slide-out-right {
    animation: slideOutRight var(--transition-normal) ease forwards;
}

.question-card.slide-in-left {
    animation: slideInLeft var(--transition-normal) ease forwards;
}

.question-text {
    font-family: var(--font-serif);
    font-size: 18px;
    font-weight: 700;
    line-height: 1.8;
    margin-bottom: 28px;
    color: var(--color-text);
}

.options {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.option {
    padding: 16px 20px;
    background: var(--bg-card);
    border: 1px solid var(--color-gold-dim);
    border-radius: 10px;
    cursor: pointer;
    transition: all var(--transition-normal);
    font-size: 15px;
    line-height: 1.6;
    color: var(--color-text);
    position: relative;
    overflow: hidden;
}

.option::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(196, 58, 49, 0.15), rgba(212, 168, 71, 0.1));
    opacity: 0;
    transition: opacity var(--transition-normal);
}

.option:hover {
    border-color: var(--color-gold);
    background: var(--bg-card-hover);
    transform: translateY(-1px);
}

.option:hover::before {
    opacity: 1;
}

.option.selected {
    border-color: var(--color-gold);
    background: rgba(212, 168, 71, 0.12);
}

.option.selected::before {
    opacity: 1;
}

.option-letter {
    display: inline-block;
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    border-radius: 50%;
    background: var(--color-gold-dim);
    color: var(--color-gold);
    font-size: 12px;
    font-weight: 700;
    margin-right: 12px;
    flex-shrink: 0;
}

.option-content {
    display: flex;
    align-items: flex-start;
}
```

- [ ] **Step 2: Add result page styles**

Append to `style.css`:

```css
/* ===== Result Page ===== */
.result-container {
    padding-top: 40px;
    padding-bottom: 40px;
}

.share-cta {
    text-align: center;
    padding: 16px 20px;
    margin-bottom: 20px;
    background: rgba(212, 168, 71, 0.1);
    border: 1px solid var(--color-gold-dim);
    border-radius: 10px;
}

.share-cta p {
    font-size: 14px;
    color: var(--color-gold);
    margin-bottom: 12px;
}

.share-cta .btn {
    padding: 10px 32px;
    font-size: 14px;
}

.result-card {
    background: var(--bg-card);
    border: 1px solid var(--color-gold-dim);
    border-radius: 16px;
    padding: 32px 24px;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.result-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--color-red), var(--color-gold), var(--color-red));
}

.result-header {
    margin-bottom: 24px;
}

.result-badge {
    font-family: var(--font-serif);
    font-size: 14px;
    color: var(--color-gold);
    letter-spacing: 6px;
    padding: 6px 20px;
    border: 1px solid var(--color-gold-dim);
    border-radius: 4px;
}

.result-type-code {
    font-family: var(--font-serif);
    font-size: 48px;
    font-weight: 900;
    color: var(--color-gold);
    letter-spacing: 8px;
    margin-bottom: 8px;
    text-shadow: 0 2px 15px rgba(212, 168, 71, 0.3);
}

.result-emoji {
    font-size: 48px;
    margin-bottom: 12px;
}

.result-type-name {
    font-family: var(--font-serif);
    font-size: 28px;
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: 8px;
}

.result-tagline {
    font-size: 15px;
    color: var(--color-gold);
    margin-bottom: 24px;
    font-style: italic;
}

.result-desc {
    font-size: 14px;
    line-height: 1.9;
    color: var(--color-text-dim);
    text-align: left;
    margin-bottom: 28px;
    padding: 0 4px;
}

/* Dimension Bars */
.dimension-bars {
    margin-bottom: 28px;
}

.dim-bar-row {
    display: flex;
    align-items: center;
    margin-bottom: 14px;
    gap: 10px;
}

.dim-bar-label {
    font-size: 13px;
    font-weight: 500;
    width: 28px;
    text-align: center;
    flex-shrink: 0;
}

.dim-bar-label.left {
    color: var(--color-red);
}

.dim-bar-label.right {
    color: var(--color-gold);
}

.dim-bar-track {
    flex: 1;
    height: 8px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 4px;
    position: relative;
    overflow: hidden;
}

.dim-bar-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    border-radius: 4px;
    transition: width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    width: 0%;
}

.dim-bar-fill.left-fill {
    background: linear-gradient(90deg, var(--color-red), rgba(196, 58, 49, 0.3));
    left: 0;
}

.dim-bar-fill.right-fill {
    background: linear-gradient(270deg, var(--color-gold), rgba(212, 168, 71, 0.3));
    right: 0;
    left: auto;
}

.dim-bar-pct {
    font-size: 11px;
    color: var(--color-text-dimmer);
    width: 36px;
    text-align: center;
    flex-shrink: 0;
}

.result-tips {
    text-align: left;
    padding: 16px;
    background: rgba(212, 168, 71, 0.06);
    border-left: 3px solid var(--color-gold-dim);
    border-radius: 0 8px 8px 0;
    margin-bottom: 24px;
}

.result-tips p {
    font-size: 13px;
    line-height: 1.8;
    color: var(--color-text-dim);
}

.result-seal {
    margin-bottom: 16px;
}

.result-footer {
    font-size: 12px;
    color: var(--color-text-dimmer);
    letter-spacing: 2px;
}

/* Result Actions */
.result-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    justify-content: center;
}

.result-actions .btn {
    flex: 1;
    padding: 14px 16px;
    font-size: 15px;
}

/* Share Image */
.share-hint {
    text-align: center;
    margin-top: 20px;
}

.share-hint p {
    font-size: 13px;
    color: var(--color-text-dim);
    margin-bottom: 12px;
}

.share-hint img {
    width: 100%;
    max-width: 400px;
    border-radius: 12px;
    border: 1px solid var(--color-gold-dim);
}
```

- [ ] **Step 3: Add animations and responsive styles**

Append to `style.css`:

```css
/* ===== Animations ===== */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideOutLeft {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(-100%); opacity: 0; }
}

@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}

@keyframes slideInLeft {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes barGrow {
    from { width: 0%; }
}

/* ===== Responsive ===== */
@media (max-width: 400px) {
    .title {
        font-size: 44px;
        letter-spacing: 12px;
    }

    .subtitle {
        font-size: 16px;
        letter-spacing: 6px;
    }

    .dim-tags {
        gap: 8px;
    }

    .dim-tag {
        padding: 5px 10px;
        font-size: 12px;
    }

    .result-type-code {
        font-size: 40px;
    }

    .result-type-name {
        font-size: 24px;
    }

    .result-actions {
        flex-direction: column;
    }
}

/* ===== Scrollbar ===== */
::-webkit-scrollbar {
    width: 4px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: var(--color-gold-dim);
    border-radius: 2px;
}
```

- [ ] **Step 4: Verify all pages look correct**

Open `index.html`. The intro page should render with full styling. The quiz and result sections aren't visible yet (no `active` class), but you can temporarily add `active` class in devtools to check them.

- [ ] **Step 5: Commit**

```bash
git add style.css
git commit -m "feat: add quiz page, result page styles, animations, and responsive design"
```

---

### Task 6: Core App Logic — State & Quiz Engine

**Files:**
- Create: `app.js`

- [ ] **Step 1: Create app.js with state management and quiz engine**

```javascript
/* TZTI 体制内人格测试 — 应用逻辑 */

// ===== State =====
var state = {
    currentQuestion: 0,
    answers: [],       // 存储每题选择的选项索引
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
    showPage('quiz');
    renderQuestion(0);
}

function restartTest() {
    showPage('intro');
}

// ===== Quiz Engine =====
function renderQuestion(index) {
    var q = QUESTIONS[index];
    var card = document.getElementById('questionCard');
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
    // 记录答案
    state.answers[questionIndex] = optionIndex;

    // 高亮选中项
    var options = document.querySelectorAll('.option');
    for (var i = 0; i < options.length; i++) {
        options[i].classList.remove('selected');
    }
    options[optionIndex].classList.add('selected');

    // 延迟后跳转下一题或显示结果
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

        // 只能回退到已答过的题目
        if (targetQ < state.answers.length) {
            var direction = targetQ < state.currentQuestion ? 'backward' : 'forward';
            animateToQuestion(targetQ, direction);
        }
    });
}
```

- [ ] **Step 2: Verify quiz starts and questions render**

Open `index.html`, click "开始鉴定". Should see the first question with 4 options. Click an option — it should highlight, then after 0.3s slide to the next question. Progress bar should update.

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: add state management, page transitions, and quiz engine"
```

---

### Task 7: Scoring & Result Rendering

**Files:**
- Modify: `app.js` (append)

- [ ] **Step 1: Add scoring calculation**

Append to `app.js`:

```javascript
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

    // 计算类型码
    var code = '';
    code += state.scores.jf >= 0 ? 'J' : 'F';
    code += state.scores.yg >= 0 ? 'Y' : 'G';
    code += state.scores.xh >= 0 ? 'X' : 'H';
    code += state.scores.wl >= 0 ? 'W' : 'L';
    state.resultCode = code;

    // 计算各维度百分比（映射到0-100，50为中点）
    // 最大可能分值：基础题最大每题2分×20=40, 加权题2分×2×4=16, 总计约56
    // 但实际上每题只影响1-2个维度，所以单维度最大约20-28
    var maxScore = 24; // 合理的单维度最大分值估计
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
```

- [ ] **Step 2: Add result rendering**

Append to `app.js`:

```javascript
// ===== Result Display =====
function showResult() {
    var type = TYPES[state.resultCode];
    if (!type) {
        // fallback：如果出现未定义的组合（不应该发生），默认显示FYXW
        type = TYPES['FYXW'];
        state.resultCode = 'FYXW';
    }

    document.getElementById('resultCode').textContent = state.resultCode;
    document.getElementById('resultEmoji').textContent = type.emoji;
    document.getElementById('resultName').textContent = type.name;
    document.getElementById('resultTagline').textContent = type.tagline;
    document.getElementById('resultDesc').textContent = type.desc;
    document.getElementById('resultTips').innerHTML = '<p>' + type.tips + '</p>';

    renderDimensionBars();
    updateShareUrl();

    showPage('result');

    // 触发维度条动画
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
        var leftPct = pct;       // 左极(正向)百分比
        var rightPct = 100 - pct; // 右极百分比

        html += '<div class="dim-bar-row">';
        html += '<span class="dim-bar-label left">' + d.left + '</span>';
        html += '<div class="dim-bar-track" data-dim="' + d.key + '" data-pct="' + leftPct + '">';
        html += '<div class="dim-bar-fill left-fill"></div>';
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
```

- [ ] **Step 3: Verify end-to-end flow**

Open `index.html`, complete all 24 questions. Should navigate to result page showing: type code, emoji, name, tagline, description, dimension bars (animated), and tips. Try "重新鉴定" button — should go back to intro.

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "feat: add scoring calculation and result page rendering"
```

---

### Task 8: URL Sharing & Share Image

**Files:**
- Modify: `app.js` (append)

- [ ] **Step 1: Add URL parameter encoding/decoding**

Append to `app.js`:

```javascript
// ===== URL Sharing =====
function updateShareUrl() {
    var params = state.resultCode + '-' +
        state.resultPcts.jf + '-' +
        state.resultPcts.yg + '-' +
        state.resultPcts.xh + '-' +
        state.resultPcts.wl;

    var url = window.location.origin + window.location.pathname + '?r=' + params;
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

    // 显示分享引导
    document.getElementById('shareCta').style.display = 'block';

    showResult();
    return true;
}
```

- [ ] **Step 2: Add Canvas share image generation**

Append to `app.js`:

```javascript
// ===== Share Image =====
function shareResult() {
    var canvas = document.getElementById('shareCanvas');
    var ctx = canvas.getContext('2d');
    var type = TYPES[state.resultCode];

    var w = 640;
    var h = 920;
    var dpr = 2;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    // 背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    // 水墨纹理（简化）
    var grad = ctx.createRadialGradient(w * 0.2, h * 0.3, 0, w * 0.2, h * 0.3, w * 0.5);
    grad.addColorStop(0, 'rgba(196, 58, 49, 0.08)');
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

    // 标题
    ctx.fillStyle = '#d4a847';
    ctx.font = '14px "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    ctx.fillText('组 织 鉴 定 书', w / 2, 50);

    // 类型码
    ctx.fillStyle = '#d4a847';
    ctx.font = '900 52px "Noto Serif SC", serif';
    ctx.fillText(state.resultCode, w / 2, 120);

    // Emoji
    ctx.font = '48px sans-serif';
    ctx.fillText(type.emoji, w / 2, 180);

    // 类型名
    ctx.fillStyle = '#f0e6d3';
    ctx.font = '700 32px "Noto Serif SC", serif';
    ctx.fillText(type.name, w / 2, 230);

    // 标签
    ctx.fillStyle = '#d4a847';
    ctx.font = '15px "Noto Sans SC", sans-serif';
    ctx.fillText(type.tagline, w / 2, 265);

    // 描述（自动换行）
    ctx.fillStyle = 'rgba(240, 230, 211, 0.7)';
    ctx.font = '13px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'left';
    var descLines = wrapText(ctx, type.desc, w - 80);
    var descY = 300;
    for (var i = 0; i < descLines.length; i++) {
        ctx.fillText(descLines[i], 40, descY + i * 22);
    }

    // 维度条
    var barY = descY + descLines.length * 22 + 30;
    var dims = [
        { key: 'jf', left: '卷', right: '佛' },
        { key: 'yg', left: '圆', right: '刚' },
        { key: 'xh', left: '显', right: '隐' },
        { key: 'wl', left: '稳', right: '浪' }
    ];

    for (var i = 0; i < dims.length; i++) {
        var d = dims[i];
        var pct = state.resultPcts[d.key];
        var y = barY + i * 40;

        // 左标签
        ctx.fillStyle = '#c43a31';
        ctx.font = '500 14px "Noto Sans SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(d.left, 40, y + 12);

        // 轨道
        var trackX = 65;
        var trackW = w - 170;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        roundRect(ctx, trackX, y + 2, trackW, 10, 5);
        ctx.fill();

        // 填充
        var fillGrad = ctx.createLinearGradient(trackX, 0, trackX + trackW, 0);
        fillGrad.addColorStop(0, '#c43a31');
        fillGrad.addColorStop(1, 'rgba(196, 58, 49, 0.2)');
        ctx.fillStyle = fillGrad;
        roundRect(ctx, trackX, y + 2, trackW * pct / 100, 10, 5);
        ctx.fill();

        // 百分比
        ctx.fillStyle = 'rgba(240, 230, 211, 0.4)';
        ctx.font = '11px "Noto Sans SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(pct + ':' + (100 - pct), w - 65, y + 12);

        // 右标签
        ctx.fillStyle = '#d4a847';
        ctx.font = '500 14px "Noto Sans SC", sans-serif';
        ctx.fillText(d.right, w - 25, y + 12);
    }

    // 印章
    var sealY = barY + 4 * 40 + 40;
    ctx.beginPath();
    ctx.arc(w / 2, sealY, 28, 0, Math.PI * 2);
    ctx.strokeStyle = '#c43a31';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w / 2, sealY, 24, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(196, 58, 49, 0.5)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.fillStyle = '#c43a31';
    ctx.font = '900 11px "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    ctx.fillText('鉴定', w / 2, sealY - 4);
    ctx.fillText('有效', w / 2, sealY + 10);

    // 底部
    ctx.fillStyle = 'rgba(240, 230, 211, 0.25)';
    ctx.font = '11px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TZTI 体制内人格测试', w / 2, h - 30);

    // 转为图片
    var dataUrl = canvas.toDataURL('image/png');
    var shareImage = document.getElementById('shareImage');
    shareImage.src = dataUrl;
    document.getElementById('shareHint').style.display = 'block';

    // 滚动到图片位置
    shareImage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Canvas 辅助函数
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
```

- [ ] **Step 3: Add initialization**

Append to `app.js`:

```javascript
// ===== Init =====
(function init() {
    // 检查URL参数
    if (!checkUrlResult()) {
        showPage('intro');
    }
    initProgressBar();
})();
```

- [ ] **Step 4: Verify full flow including sharing**

1. Open `index.html`, complete all 24 questions
2. On result page, click "生成分享图" — should render a share image below the buttons
3. Check URL bar — should show `?r=XXXX-nn-nn-nn-nn`
4. Copy the URL, open in new tab — should show result page directly with "你的朋友测出了..." CTA
5. Click "重新鉴定" → should go back to intro and clear URL

- [ ] **Step 5: Commit**

```bash
git add app.js
git commit -m "feat: add URL sharing, share image generation, and app initialization"
```

---

### Task 9: Final Polish & Integration Verification

**Files:**
- May modify: `style.css`, `app.js`, `index.html` (minor fixes)

- [ ] **Step 1: Full end-to-end test — desktop browser**

Open `index.html` in desktop browser. Complete the full flow:
1. Intro page loads with correct styling
2. Click "开始鉴定" — transitions to quiz
3. Answer all 24 questions — options highlight, cards slide, progress updates
4. Result page shows — type code, emoji, name, tagline, desc, dimension bars animate, tips shown
5. Click "生成分享图" — image renders correctly
6. Click "重新鉴定" — returns to intro
7. Test progress bar click-to-navigate (go back to earlier questions)

- [ ] **Step 2: Full end-to-end test — mobile viewport**

Open browser devtools, switch to mobile viewport (375×667). Repeat the same flow. Check:
1. No horizontal overflow
2. Options are tap-friendly (enough padding)
3. Share image renders correctly at mobile resolution
4. Text is readable, no truncation issues

- [ ] **Step 3: URL sharing test**

1. Complete test, copy URL from address bar
2. Open in new tab/incognito — should show result directly
3. Verify CTA ("你的朋友测出了...") is visible
4. Click "我也要测" — should start fresh test

- [ ] **Step 4: Commit final state**

```bash
git add -A
git commit -m "feat: TZTI 体制内人格测试 v1.0 complete"
```
