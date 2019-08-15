const base64 = require('js-base64').Base64;

function extractEmailBodyContent(content, keys) {
    if (!content || !keys) {
        return ''
    }

    let body = base64.decode(content.replace(/-/g, '+').replace(/_/g, '/'));
    let bodyContent = '';

    keys.map(key => {
        let indexOfKey = body.indexOf(key);
        bodyContent += `${key}${extractTextFromLine(body, indexOfKey + key.length, content.length).trim()}. `;
    });
    return bodyContent;

}

function extractTextFromLine(content, start, end) {
    if (start > end || (!start && start != 0) || !end || !content || content.charAt(start) === '\n') {
        return ''
    }
    return `${content.charAt(start)}${extractTextFromLine(content, start + 1, end)}`;
}

module.exports = {
    extractEmailBodyContent,
    extractTextFromLine
}