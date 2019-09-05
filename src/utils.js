const base64 = require('js-base64').Base64;
const { EMAILS_TO_EXTRACT_CONTENT, EMAILS_TO_ADD_HASHTAG } = require('./constant');

/**
 * 
 * @param {string} email 
 * @param {string} content 
 * @returns {string}
 */
function extractEmailBodyContent(email, content) {
    if (!email || !content) {
        return '';
    }

    let keys = keysToExtractEmailContent(email);

    if (!keys) {
        return '';
    }

    let body = base64.decode(content.replace(/-/g, '+').replace(/_/g, '/'));
    let bodyContent = '';

    keys.map(key => {
        let indexOfKey = body.indexOf(key);
        bodyContent += `${key}${extractTextFromLine(body, indexOfKey + key.length, content.length).trim()}. `;
    });
    return bodyContent;

}

/**
 * 
 * @param {string} content 
 * @param {integer} start 
 * @param {integer} end 
 * @returns {string}
 */
function extractTextFromLine(content, start, end) {
    if (start > end || (!start && start != 0) || !end || !content || content.charAt(start) === '\n') {
        return ''
    }
    return `${content.charAt(start)}${extractTextFromLine(content, start + 1, end)}`;
}

/**
 * 
 * @param {string} email 
 * @returns {array||undefined}
 */
function keysToExtractEmailContent(email) {
    if (!EMAILS_TO_EXTRACT_CONTENT) {
        return;
    }

    for (let i = 0; i < EMAILS_TO_EXTRACT_CONTENT.length; i++) {
        if (EMAILS_TO_EXTRACT_CONTENT[i]['email'] === email) {
            return EMAILS_TO_EXTRACT_CONTENT[i]['keys'];
        }
    }

    return;
}

/**
 * 
 * @param {sting} subject 
 * @param {array} words 
 * @returns {boolean}
 * 
 * when either of the words is found in the subject, the function will return true
 */
function findWordsInSubject(subject, words) {
    if (!words)
        return false;

    for (let i = 0; i < words.length; i++) {
        if (subject.indexOf(words[i]) > -1) {
            return true;
        }
    }

    return false;
}

/**
 * 
 * @param {string} emailSender 
 * @param {string} subject 
 * @returns {string}
 */
function emailHashTag(emailSender, subject) {
    let hashTagArr = [];

    if (EMAILS_TO_ADD_HASHTAG) {
        EMAILS_TO_ADD_HASHTAG.forEach(emailToAddHashTag => {
            let wordsToMatch = emailToAddHashTag.wordsToMatchInSubject;
            if (emailSender.includes(emailToAddHashTag.email) && ((wordsToMatch && wordsToMatch.length > 0) ? findWordsInSubject(subject, wordsToMatch) : true)) {
                hashTagArr.push(emailToAddHashTag.hashTag);
            }
        });
    }

    return hashTagArr.join(' ');
}

module.exports = {
    extractEmailBodyContent,
    extractTextFromLine,
    keysToExtractEmailContent,
    findWordsInSubject,
    emailHashTag
}