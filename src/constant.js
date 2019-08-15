const SUBJECTS = ['', '']
const TIME_INTERVAL = 12000 //added buffer of 2 seconds for code processing
const SENDER = ''
const FROM = ['']
const MAX_RESULT = 1
const EMAILS_TO_EXTRACT_CONTENT = [FROM[0]]
const KEYS_TO_EXTRACT_CONTENT = ['State Change:', 'Reason for State Change:']
const EMAILS_TO_ADD_HASHTAG = [{ email: FROM[0], hashTag: '#ops' }]

module.exports = {
    SUBJECTS,
    TIME_INTERVAL,
    SENDER,
    FROM,
    MAX_RESULT,
    EMAILS_TO_EXTRACT_CONTENT,
    KEYS_TO_EXTRACT_CONTENT,
    EMAILS_TO_ADD_HASHTAG
}