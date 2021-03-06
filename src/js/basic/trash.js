let studyInstance = null;

export const getTrash = () => {
  if (!studyInstance) {
    studyInstance = new Trash();
  }
  return studyInstance;
}

import {getStudy} from './study';
import Cards from '../basic/cards';
const study = getStudy();
const cards = new Cards();
console.log(study)

export default class Trash {
    constructor() {
        this.allWords = [],
        this.removeWords = [],
        this.difficultWords = [],
        this.audioArray = []
    }

    init() {
        const BTN_REMOVE = document.querySelector('.filter-remove_words');
        const BTN_DIFFICULT = document.querySelector('.filter-difficult_words');
        const BTN_ALL = document.querySelector('.filter-all_words');
        const WORD_LIST = document.querySelector('.word-list');
        const BTN_DIFFICULT_STUDY = document.querySelector('.dictionary-start');

        const toggleClassMenu = (event) => {
            document.querySelector('.active').classList.remove('active');
            event.target.classList.add('active');
        }

        BTN_DIFFICULT_STUDY.addEventListener('click', async () => {
            console.log('study');
            study.arrayStudy.length = 0;
            study.arrayStudy = this.difficultWords;
            console.log(study.arrayStudy)
            console.log(this.difficultWords[0])
            cards.renderGameWrapper();
            cards.render(this.difficultWords[0]);
            cards.renderCardCount(1, study.arrayStudy.length)
            study.findCheckbox();
            study.removeClass('game-wrap', 'none');
            study.addClass('dictionary-wrap', 'none');
        });

        BTN_REMOVE.addEventListener('click', (event) => {
            toggleClassMenu(event);
            this.forEachCard(this.removeWords);
            study.addClass('dictionary-start', 'none');
        });

        BTN_DIFFICULT.addEventListener('click', (event) => {
            toggleClassMenu(event);
            this.forEachCard(this.difficultWords);
            console.log(this.difficultWords)
            study.removeClass('dictionary-start', 'none');
        });

        BTN_ALL.addEventListener('click', (event) => {
            toggleClassMenu(event);
            this.forEachCard(this.allWords);
            study.addClass('dictionary-start', 'none');
        });

        WORD_LIST.addEventListener('click', (event) => {
            const eventContains = (event, elementClass) => {
                const contains = event.target.classList.contains(`${elementClass}`);
                return contains;
            }
            
            if (eventContains(event, 'dictionary_trash')) {
                const id = event.target.dataset.id;
                this.recoveryWord(id);
                const elementWord = event.target.closest('.word');
                elementWord.remove();
            }

            if (eventContains(event, 'dictionary_voice')) {
                const pathAudio = event.target.dataset.audio;
                const path = `${study.urlData}${pathAudio}`
                study.audioPlay(path);
            }

        });

    }

    async setRemoveWord(value, arrDataWords) {
        console.log(arrDataWords)
        const {_id} = arrDataWords;
        console.log(_id);
        const userId = localStorage.getItem('userId');
        const dataRemove = {
            "userId": `${userId}`,
            "wordId": `${_id}`,
            "word": { "difficulty": `${value}`,
                    "optional":{"repeat": true}
                    },
        }
  
        let result = await study.createUserWord(dataRemove);
        if (result === null) {
            result = await study.updateUserWord(dataRemove);
        }
        
        console.log(result);
    }

    async setOptionalWord(value, arrDataWords) {
        const {_id} = arrDataWords;
        const userId = localStorage.getItem('userId');
        const data = {
            "userId": `${userId}`,
            "wordId": `${_id}`,
            "word": value
        }

        console.log(data)
  
        let result = await study.createUserWord(data);
        if (result === null) {
            result = await study.updateUserWord(data);
        }
        
        console.log(result);
    }

    async recoveryWordInWords(id) {	    
        console.log(id)
        const userId = localStorage.getItem('userId');	        
        const data = {	       
            "userId": `${userId}`,
            "wordId": `${id}`,
            "word": { 
                "difficulty": "string",
                    "optional": { 
                        "repeat": true 
                    } 
                }
        }
  	  
        const result = await study.updateUserWord(data);
        console.log(result)
    }

    async getDifficultWord(value) {
        const userId = localStorage.getItem('userId');
        const agregateWords = {
          "userId": `${userId}`,
          "wordsPerPage": 250,
          "filter": `{"userWord.difficulty": "${value}" }`,
        }
      
        const words = await study.getAgregateWords(agregateWords);
        console.log(words)
        if (words !== null) {
            const result = words[0].paginatedResults;
            return result;
        }
    }

    renderCard(arr) {
        if (arr || arr !== null) {
            console.log
            const {_id,textExample,textExampleTranslate,textMeaning,textMeaningTranslate,transcription,word,wordTranslate,audio,image} = arr;
            this.audioArray.push(audio);
            const difficultCards = `
                        <div class="dictionary-list icon">
                            <img class="voice dictionary_voice" data-audio="${audio}" src="./icons/voice.png" alt="voice">
                        </div>
                        <div class="dictionary-list words">
                            <span class="dictionary-list eng-word">${word}</span>
                            <span class="dictionary-list ru-word">${wordTranslate}</span>
                        </div>
                        <div class="dictionary-list icon">
                            <img class="trash dictionary_trash" data-id="${_id}" src="./icons/trash.png" alt="trash">
                        </div>
                    `
        const div = document.createElement('div');
        div.classList = ['dictionary-list word'];
        div.innerHTML = difficultCards;
        const WORD_LIST = document.querySelector('.word-list');
        
        WORD_LIST.appendChild(div);
        } 
    }

    forEachCard(arrWords){
        const WORD_LIST = document.querySelector('.word-list');
        WORD_LIST.innerHTML = '';
        if (arrWords.length !== 0) {
            arrWords.forEach(element => {
                this.renderCard(element);
            });
        };
    }

    recoveryWord(id) {
        const removeWordInArray = (arrWords) => {
            arrWords.forEach(({_id}, index) => {
                if (_id === id) {
                    arrWords.splice(index, 1);   
                }
            });
        }

        if (id) {
            const active = document.querySelector('.active');
            const text = active.textContent;

            if (text === 'Удалённые слова') {
                removeWordInArray(this.removeWords);
                removeWordInArray(this.allWords);
                this.recoveryWordInWords(id);
                console.log(this.removeWords)    
            }

            if (text === 'Сложные слова') {
                removeWordInArray(this.difficultWords);
                removeWordInArray(this.allWords);
                this.recoveryWordInWords(id);
                console.log(this.difficultWords);
            }

            if (text === 'Все') {
                removeWordInArray(this.allWords);
                removeWordInArray(this.difficultWords);
                removeWordInArray(this.removeWords);
                this.recoveryWordInWords(id);
            }

        }
    }


    
}