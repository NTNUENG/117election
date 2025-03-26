async function loadData(lang = "zh") {
    const realMain = document.querySelector("main");
    realMain.setAttribute('data-lang', lang);

    const inputValues = {};
    document.querySelectorAll("input").forEach(input => {
        if (['studentId', 'password'].includes(input.id)) inputValues[input.id] = input.value;
    });

    const structure = await fetch("json/login/structure.json").then(res => res.json());
    const localisation = await fetch(`json/login/localisation_${lang}.json`).then(res => res.json());

    function createElement(node) {
        if (!node.tag) {
            if (node.children) {
                const fragment = document.createDocumentFragment();
                node.children.forEach(child => fragment.appendChild(createElement(child)));
                return fragment;
            }
            return document.createTextNode(localisation[node.text] || node.text || "");
        }

        const element = document.createElement(node.tag);

        for (const [key, value] of Object.entries(node)) {
            if (["tag", "children", "text"].includes(key)) continue;
            if (key === "placeholder") {
                element.setAttribute(key, localisation[value] || value);
            } else if (["style", "class", "id", "onclick", "data-lang", "minlength", "maxlength"].includes(key)) {
                element.setAttribute(key, value);
            } else if (key === "disabled") {
                element.disabled = value;
            } else if (key === "required") {
                element.required = value;
            } else {
                element[key] = value;
            }
        }

        if (node.text) {
            element.textContent = localisation[node.text] || null;
        }

        if (node.children) {
            node.children.forEach(child => element.appendChild(createElement(child)));
        }

        return element;
    }

    const existingMain = document.querySelector(".main");
    if (existingMain) existingMain.remove();

    const newMain = document.createElement("div");
    const mainContent = createElement(structure.main);
    newMain.classList.add('main');
    newMain.append(mainContent);
    realMain.append(newMain);

    await initialise();

    document.querySelectorAll("input, textarea").forEach(input => {
        const savedValue = inputValues[input.id];
        if (savedValue !== undefined) {
            input.value = savedValue;
        }
    });

    const langButtons = document.querySelectorAll("button[data-lang]");
    langButtons.forEach(button => {
        const buttonLang = button.getAttribute("data-lang");
        button.disabled = buttonLang === lang;
        button.classList.toggle('btn-fill', buttonLang === lang);

        button.replaceWith(button.cloneNode(true));
        const newButton = document.querySelector(`button[data-lang="${buttonLang}"]`);
        if (!button.disabled) {
            newButton.addEventListener("click", () => loadData(buttonLang));
        }
    });
}

window.onload = () => {
    const userLang = navigator.language || navigator.userLanguage;
    const defaultLang = userLang.startsWith("en") ? "en" : "zh";
    loadData(defaultLang);
};

async function initialise() {
    async function loadSaltData() {
        const response = await fetch('json/accounts/user_salts.json');
        const data = await response.json();
        return data;
    }

    async function loadLocalisation(lang) {
        const localisation = await fetch(`json/accounts/localisation_${lang}.json`).then(res => res.json());
        return localisation;
    }

    const saltData = await loadSaltData();
    let currentLang = document.querySelector('main').getAttribute('data-lang');
    let localisation = await loadLocalisation(currentLang);

    const main = document.querySelector('main');
    const snackbar = document.createElement('div');
    snackbar.id = 'snackbar';
    main.append(snackbar);

    const message = document.getElementById('snackbar');
    const loginButton = document.getElementById('loginButton');

    async function showMessage(msg) {
        loginButton.disabled = true;
        const lang = main.getAttribute('data-lang');

        if (lang !== currentLang) {
            currentLang = lang;
            localisation = await loadLocalisation(lang);
        }

        message.classList.add('show');
        message.innerHTML = localisation[msg];
        setTimeout(function () {
            message.classList.remove('show');
            loginButton.disabled = false;
        }, 2900);
    }

    loginButton.addEventListener('click', () => {
        const userId = document.getElementById('studentId').value;
        const inputPassword = document.getElementById('password').value;

        if (saltData[userId]) {
            const storedSalt = saltData[userId];
            const generatedPasswordHash = CryptoJS.SHA1(userId + storedSalt).toString(CryptoJS.enc.Hex).slice(0, 16);

            if (generatedPasswordHash === inputPassword) {
                showMessage('login_success');
                onLoginSuccess();
            } else {
                showMessage('wrong_password');
            }
        } else {
            showMessage('wrong_id');
        }
    });

    function onLoginSuccess() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;

        const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6xqvqVKHhhX4mfq4t8sDD2lKoaSFqgLdIjvghAdXZeeCyfe8I-RQrxEPiUjvRw35x900U1NG_ng3y/pub?gid=379223829&single=true&output=csv";
        const studentId = document.querySelector('#studentId').value;
        const formSudentId = document.getElementById('1227160475');
        formSudentId.value = studentId;

        const formSelection = document.getElementById('1551241513');
        formSelection.value = "";

        document.getElementById('submitBtn').disabled = true;

        let jsonData = [];

        fetch(url)
            .then(r => r.text())
            .then(csvToJson)
            .then(getRespondedUsers)
            .catch(err => console.error("Error fetching CSV:", err));

        function csvToJson(csvString) {
            const rows = csvString.split("\n");
            const headers = rows[0].split(",");
            for (let i = 1; i < rows.length; i++) {
                const values = rows[i].split(",");
                const obj = {};
                for (let j = 0; j < headers.length; j++) {
                    obj[headers[j].trim()] = values[j].trim();
                }
                jsonData.push(obj);
            }
        }

        function getRespondedUsers() {
            const hasResponded = jsonData.some(submission => studentId === submission.學號);
            if (hasResponded) {
                showMessage('has_responded');
                return;
            }

            loadVoteData(currentLang);
        }
    }
}

async function loadVoteData(lang = "zh") {
    const existingMain = document.querySelector(".main");
    if (existingMain) existingMain.remove();

    document.querySelector('#hsyuenjyugongbau').classList.remove('display-none');
}