const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require("./american-to-british-titles.js")
const britishOnly = require('./british-only.js')

const reverseDictionary = function (obj) {
  
  return Object.assign({}, ...Object.entries(obj).map(([key, value]) => ({[value]: key}))); 
};


class Translator {

  translate(text, dictionary, titles, timeRegex, locale) {
    const lowerCaseText = text.toLowerCase(); 
    const useForMapping = {}; 

    const wordsWithSpace = Object.fromEntries(
      Object.entries(dictionary).filter(([key, value]) => {
        return key.includes(" ");
      })
    );

    const findTextTimes = lowerCaseText.match(timeRegex); 

    if (findTextTimes) {
      findTextTimes.map(function(time) {
        if (locale == 'americanToBritish') {
          return useForMapping[time] = time.replace(':', '.'); 
        } else {
          return useForMapping[time] = time.replace('.', ':');   
        }
      })
    }

    Object.entries(titles).map(([key, value]) => {
      if (lowerCaseText.includes(key)) {
        useForMapping[key] = value.charAt(0).toUpperCase() + value.slice(1);
      }
    });

    Object.entries(wordsWithSpace).map(([key, value]) => {
      if (lowerCaseText.includes(key)) {
        useForMapping[key] = value;
      }
    });

    let individualWordRegex = /(\w+)|(\w+([-'])(\w+)?['-]?(\w+))/g;
    
    lowerCaseText.match(individualWordRegex).forEach(function(word) {
      if (dictionary[word]) {
        useForMapping[word] = dictionary[word]; 
      }
    });

    if (Object.keys(useForMapping).length == 0) {
      return null; 
    }

    const translationWithEffect = this.replacementWithEffect(text, useForMapping);
    const translation = this.replacement(text, useForMapping);

    return [translationWithEffect, translation]; 
    
  }

  replacementWithEffect(text, useForMapping) {
    const myRegex = new RegExp(Object.keys(useForMapping).join('|'), 'ig');
    return text.replace(myRegex, function(word) {
      return `<span class="highlight">${useForMapping[word.toLowerCase()]}</span>`;
    });
  }  

  replacement(text, useForMapping) {
    const myRegex = new RegExp(Object.keys(useForMapping).join('|'), 'ig');
    return text.replace(myRegex, function(word) {
      return useForMapping[word.toLowerCase()];
    });
  }

  toBritishEnglish(text) {
    const dictionary = {...americanToBritishSpelling, ...americanOnly};
    const titles = americanToBritishTitles; 
    const timeRegex = /([1-9]|(1[012])):[0-5][0-9]/g;

    const translated = this.translate(text, dictionary, titles, timeRegex, 'americanToBritish');
    
    if (!translated) {
      return false; 
    } else {
      return translated; 
    }
  }

  toAmericanEnglish(text) {
    const dictionary = {...reverseDictionary(americanToBritishSpelling), ...britishOnly}; 
    const titles = reverseDictionary(americanToBritishTitles);
    const timeRegex = /([1-9]|(1[012])).[0-5][0-9]/g;

    const translated = this.translate(text, dictionary, titles, timeRegex, 'britishToAmerican'); 

    if (!translated) {
      return false; 
    } else {
      return translated; 
    }
    
  }
  
}

module.exports = Translator;