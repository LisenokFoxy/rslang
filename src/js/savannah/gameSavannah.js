//start page creation
function initGame() {
  const startPage = document.createElement("div");
  startPage.classList.add("page-wrapper");
  startPage.innerHTML = `<div class="start-page">
  <h2 class="header-block">САВАННА</h2>
  <div class="levelSettings">
              <p class="level__text">Выбери свой уровень </p>
              <select class="level radio-toolbar" id="level">
                  <option value="0">A1</option>
                  <option value="1">A2</option>
                  <option value="2">B1</option>
                  <option value="3">B2</option>
                  <option value="4">C1</option>
                  <option value="5">C2</option>
              </select>
          </div>
  <div class="body-block"><p>Тренировка Саванна развивает словарный запас. <br> Успей угадать слова до того, как они упадут! 
  <br> Если ты изучил мало слов, тренировка дополнится словами согласно выбранного уровня сложности.</p></div>
  <img class="game-icon" src="img/savannah-icon.svg"></img>
  <div class="button-wrapper">
  <button class="start-btn">Начать</button>
  </div>
  </div>`;
  document.body.append(startPage);

  //Start button click
  const startBtn = document.querySelector(".start-btn");
  startBtn.addEventListener("click", () => {
    document.querySelector(".body-block").classList.toggle("hidden");

    //timer
    function timer(from, to) {
      let current = from;
      startPage.innerHTML = `
      <div class="game-page">
      <div class="timer">
      <div class="circle-timer">
          <div class="timer-slot">
              <div class="timer-lt"></div>
          </div>
          <div class="timer-slot">
              <div class="timer-rt"></div>
          </div>
          <div class="countThree"></div>
      </div>
    </div>
    </div>`;

      const timerId = setInterval(function () {
        document.querySelector(".countThree").innerHTML = current;
        if (current == to) {
          clearInterval(timerId);
          startPage.remove();
          startGame();
        }
        current--;
      }, 1000);
    }
    timer(3, 0);
  });
}

initGame();

//game page creation
const wordsLimit = 31;
let stat = 0;
let error = 0;
let countWordId = [];
let countGameWords = 0;
let hardWords = [];
let hardWordsTranslate = [];
let weakWords = [];
let wordsRandomArray = [];

const gamePage = document.createElement("div");
function startGame() {
  //Q&A block, heart block creation
  gamePage.classList.add("page-wrapper");
  gamePage.innerHTML = ` <div class="game-page">
    <div class="wrap-game" id="wrap-game">
    <div class="rating">
    <div class="star-success"></div>
      <div class="star-success"></div>
      <div class="star-success"></div>
      <div class="star-success"></div>
      <div class="star-success"></div></div>
  </div>
    <div class="words">
    <div class="question ">
        <p class="word"></p>
    </div>
    <div class="item">
        <button class="translationRight" id='answerBtn'></button>
        <button class="translation2" id='answerBtn'></button>
        <button class="translation3" id='answerBtn'></button>
        <button class="translation4" id='answerBtn'></button>
    </div>
    </div>
    <div class="translations">
    <div class="answers"></div>
    </div>
    </div>`;
  document.body.append(gamePage);
  stat = 0;
  error = 0;
  countWordId = [];
  countGameWords = 0;
  hardWords = [];
  hardWordsTranslate = [];
  weakWords = [];
  wordsRandomArray = [];
  loadGame();
  animateGame();
}

let right_translation = document.querySelector(".translationRight");

//change answers order
function changeAnswersOrder() {
  let time = Math.floor(Math.random() * Math.floor(4));
  let time2 = Math.floor(Math.random() * Math.floor(4));
  let time3 = Math.floor(Math.random() * Math.floor(4));
  let time4 = Math.floor(Math.random() * Math.floor(4));

  const answerOrder = document.querySelector(".translationRight");
  answerOrder.style.setProperty("order", time);

  const answerOrder2 = document.querySelector(".translation2");
  answerOrder2.style.setProperty("order", time2);

  const answerOrder3 = document.querySelector(".translation3");
  answerOrder3.style.setProperty("order", time3);

  const answerOrder4 = document.querySelector(".translation4");
  answerOrder4.style.setProperty("order", time4);
}

let group = level.addEventListener("change", function () {
  localStorage.setItem("level", this.value);
});

//load word & answer options
async function loadGame() {
  const wordToTranslate = document.querySelector(".word");
  let right_translation = document.querySelector(".translationRight");

  //Get hard user words
  async function getUserHardWord() {
    const token = localStorage.getItem("token");
    const userID = localStorage.getItem("userId");
    const rawResponse = await fetch(
      `https://afternoon-falls-25894.herokuapp.com/users/${userID}/aggregatedWords?filter=%7B%22userWord.difficulty%22%3A%22hard%22%7D`,
      {
        method: "GET",
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    const content = await rawResponse.json();
    let results = content[0].paginatedResults;

    //Get hard word & right translation
    async function getWordToTranslate() {
      let wordsRandom = Math.floor(Math.random() * Math.floor(results.length));
      if (results.length === 0) {
        if (countGameWords < wordsLimit) {
          loadWord();
        } else getStatistics();
      } else if (!countWordId.includes(results[wordsRandom]._id)) {
        wordToTranslate.innerHTML = results[wordsRandom].word;
        right_translation.innerHTML = results[wordsRandom].wordTranslate;
        let hardWord = results[wordsRandom].word;
        let hardWordTranslate = results[wordsRandom].wordTranslate;
        hardWords.push(hardWord);
        hardWordsTranslate.push(hardWordTranslate);
        countWordId.push(results[wordsRandom]._id);
      } else if (countWordId.length < results.length) {
        getWordToTranslate();
      } else if (countWordId.length === results.length) {
        if (results.length < wordsLimit) {
          if (countGameWords < wordsLimit) {
            loadWord();
          } else getStatistics();
        } else getStatistics();
      }
    }
    countGameWords++;
    getWordToTranslate();
  }
  getUserHardWord();

  //Get other words
  const getWords = async (page, group) => {
    try {
      const url = `https://afternoon-falls-25894.herokuapp.com/words?page=${page}&group=${group}`;
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  let count = Math.floor(Math.random() * Math.floor(3));

  //Get a word with correct translation from
  const loadWord = async () => {
    function getUniqueNumber() {
      const getRandom = Math.floor(Math.random() * Math.floor(30));
      if (!wordsRandomArray.includes(getRandom)) {
        wordsRandomArray.push(getRandom);
      } else {
        getUniqueNumber();
      }
    }
    getUniqueNumber();

    if (countGameWords < 30) {
      const getRandomNum = wordsRandomArray[wordsRandomArray.length - 1];
      const group = localStorage.getItem("level") || 0;
      const data = await getWords(getRandomNum, group);
      let { word, wordTranslate } = data[count];
      wordToTranslate.innerHTML = word;
      right_translation.innerHTML = wordTranslate;
      hardWords.push(word);
      hardWordsTranslate.push(wordTranslate);
    }
  };
  changeAnswersOrder();

  //load wrong answer options
  const loadWrongTranslations = async () => {
    const getRandomNum = Math.floor(Math.random() * Math.floor(30));
    const group = localStorage.getItem("level") || 0;
    const data = await getWords(getRandomNum, group);
    const translation2 = document.querySelector(".translation2");
    const translation3 = document.querySelector(".translation3");
    const translation4 = document.querySelector(".translation4");
    translation2.innerHTML =
      data[Math.floor(Math.random() * Math.floor(20))].wordTranslate;
    translation3.innerHTML =
      data[Math.floor(Math.random() * Math.floor(20))].wordTranslate;
    translation4.innerHTML =
      data[Math.floor(Math.random() * Math.floor(20))].wordTranslate;
  };
  loadWrongTranslations();
}

//animation & buttons click logic
async function animateGame() {
  let pos = 0;
  let id = setInterval(frame, 13);
  let elem = document.querySelector(".star-success");
  let target = document.querySelector(".word");

  function frame() {
    if (pos == 550) {
      clearInterval(id);
      target.innerText = "";
      if (countGameWords < wordsLimit && error < 5) {
        getIncorrectChoice();
        animateGame();
      }
    } else {
      if (elem) {
        pos++;
        target.style.top = pos + "px";
      }
    }
  }

  //right&wrong answers counter, buttons click logic
  function getCorrectChoice() {
    let right_translation = document.querySelector(".translationRight");
    right_translation.onclick = function (event) {
      // play audio of correct click
      let audio = new Audio();
      audio.src = "../audio/correct.mp3";
      audio.autoplay = true;
      clearInterval(id);
      target.innerText = "🦁👍";
      pos = 0;
      id = setInterval(frame, 13);
      loadGame(event);
      stat++;
    };
  }

  //incorrect choice
  async function getIncorrectChoice() {
    // play audio & change picture of wrong click
    const rating = document.querySelector(".rating");
    let elem = document.querySelector(".star-success");
    error++;
    let audio = new Audio();
    audio.src = "../audio/error.mp3";
    audio.autoplay = true;
    target.innerText = "";
    if (elem && error < 5) {
      elem.remove();
      rating.innerHTML += `<div class="star-error"></div>`;
      weakWords.push(hardWords.pop());
      loadGame();
    } else if (error === 5) {
      clearInterval(id);
      weakWords.push(hardWords.pop());
      getStatistics();
    }
  }

  function selectWrong2() {
    document.querySelector(".translation2").onclick = function (event) {
      clearInterval(id);
      getIncorrectChoice();
      pos = 0;
      id = setInterval(frame, 13);
    };
  }

  function selectWrong3() {
    document.querySelector(".translation3").onclick = function (event) {
      clearInterval(id);
      getIncorrectChoice();
      pos = 0;
      id = setInterval(frame, 13);
    };
  }

  function selectWrong4() {
    document.querySelector(".translation4").onclick = function (event) {
      clearInterval(id);
      getIncorrectChoice();
      pos = 0;
      id = setInterval(frame, 13);
    };
  }

  function res() {
    let elem = document.querySelector(".star-success");
    if (elem) {
      getCorrectChoice();
      selectWrong2();
      selectWrong3();
      selectWrong4();
    } else {
      getStatistics();
    }
  }
  res();
}

//Statistic page
function getStatistics() {
  let resultHardWord = `${hardWords.join(" ")}`;
  let resultWeakWord = `${weakWords.join(" ")}`;

  const statictics = document.createElement("div");
  statictics.classList.add("page-wrapper");
  statictics.innerHTML = `
      <div class="statistics-page">
          <h2 class="header-block">изучено слов: ${stat} на изучении: ${error}</h2>
          <div class="body-statblock">${userScore}</div>
          <div class="slider">
              <input type="radio" name="switch" id="btn1" checked >
              <input type="radio" name="switch" id="btn2" >
              <div class="switch">
                  <label for="btn1" id="s1"></label>
                  <label for="btn2" id="s2"></label>
              </div>
              <div class="slider-inner">
                  <div class="slides">
                      <div class="one"><strong>Изученные слова:</strong> <br>${resultHardWord}</div>
                      <div class="two"><strong>На изучении:</strong> <br>${resultWeakWord}</div>
                  </div>
              </div> 
          </div>
          <div class="button-wrapper">
              <button class="continue-btn">начать заново</button>
          </div>
      </div>
  </div>`;

  document.body.append(statictics);

  //Change user text according to statictics
  let userScore = document.querySelector(".body-statblock");
  function analyzeUserScore() {
    if (stat <= 5) {
      userScore.innerText = `🙈 В этот раз не получилось, но продолжай тренироваться!`;
    } else if (stat <= 15 && stat > 5) {
      userScore.innerText = `🦓 Неплохо, но есть над чем поработать`;
    } else {
      userScore.innerText = `🐾Поздравляем, отличный результат!`;
    }
  }
  analyzeUserScore();

  //Continue button click
  const continueBtn = document.querySelector(".continue-btn");
  continueBtn.addEventListener("click", () => {
    statictics.remove();
    initGame();
  });
}
