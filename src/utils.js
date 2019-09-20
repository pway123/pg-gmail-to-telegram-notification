const base64 = require('js-base64').Base64;
const { EMAILS_TO_EXTRACT_CONTENT, EMAILS_TO_ADD_HASHTAG, TIME_INTERVAL, OVERLAP_BUFFER } = require('./constant');
const fs = require('fs');

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
        bodyContent += `${key}${extractTextFromLine(body, indexOfKey + key.length, body.length).trim()}. `;
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
function keysToExtractEmailContent(emailSender) {
    if (!EMAILS_TO_EXTRACT_CONTENT) {
        return;
    }

    for (let i = 0; i < EMAILS_TO_EXTRACT_CONTENT.length; i++) {
        if (emailSender.includes(EMAILS_TO_EXTRACT_CONTENT[i]['email'])) {
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

    let wordFound = false;

    if (!words)
        return wordFound;

    for (let i = 0; i < words.length; i++) {
        if (!('toContain' in words[i])) {
            throw new Error('word object toContain is undefined');
        }

        if (!('word' in words[i])) {
            throw new Error('word object word is undefined');
        }

        if (words[i]['toContain'] && subject.indexOf(words[i]['word']) > -1) {
            wordFound = true;
            break;
        }
        else if (!words[i]['toContain'] && subject.indexOf(words[i]['word']) === -1) {
            wordFound = true;
        }
        else if (!words[i]['toContain'] && subject.indexOf(words[i]['word']) !== -1) {
            wordFound = false;
        }
    }


    return wordFound;
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
            if (emailSender.includes(emailToAddHashTag.email) && ((wordsToMatch && wordsToMatch.length > 0) ? this.findWordsInSubject(subject, wordsToMatch) : true)) {
                hashTagArr.push(emailToAddHashTag.hashTag);
            }
        });
    }

    return hashTagArr.join(' ');
}

function toSendEmailAsNotification(emailInternalTimeStamp, startTimeStamp) {
    let perviousStartTime;
    let toSendEmailAsNotification = false;

    try {
        if (fs.existsSync(`${__dirname}/PREVIOUS_START_TIME`)) {
            perviousStartTime = fs.readFileSync(`${__dirname}/PREVIOUS_START_TIME`);
            if (perviousStartTime) {

                perviousStartTime = Number(perviousStartTime.toString('utf8'));
            }
        }

        if ((!perviousStartTime || perviousStartTime === null || perviousStartTime === 'undefined')
            && (startTimeStamp - emailInternalTimeStamp <= (TIME_INTERVAL ? TIME_INTERVAL : 10000))) {
            toSendEmailAsNotification = true
        }
        else if ((perviousStartTime && perviousStartTime !== 'undefined' && perviousStartTime !== null)
            && (perviousStartTime - OVERLAP_BUFFER <= emailInternalTimeStamp && emailInternalTimeStamp <= startTimeStamp)) {
            toSendEmailAsNotification = true
        }

        return toSendEmailAsNotification;
    } catch (err) {
        console.log(err);
        return toSendEmailAsNotification;
    }
}


module.exports = {
    extractEmailBodyContent,
    extractTextFromLine,
    keysToExtractEmailContent,
    findWordsInSubject,
    emailHashTag,
    toSendEmailAsNotification
}