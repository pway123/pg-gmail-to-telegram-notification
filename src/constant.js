const SUBJECTS = ['']
const TIME_INTERVAL = 10100 //added buffer of 0.1 seconds for code to pull emails from gmail
const IFTTT_ACCOUNT_EMAIL = ''
const EMAIL_SENDER = ['']
const MAX_RESULT = 10
/**
 * {
        email: 'emailSender',
        keys: ['some string']
    }
 */
const EMAILS_TO_EXTRACT_CONTENT = []

/**
 * Email that require hash tag to be added based on from address and words match
 *  {
        email: 'emailSender',
        hashTag: '#ops',
        wordsToMatchInSubject: [{word:'some string', toContain: true}]
    },
 */
const EMAILS_TO_ADD_HASHTAG = []
const OVERLAP_BUFFER = 500;

module.exports = {
    SUBJECTS,
    TIME_INTERVAL,
    IFTTT_ACCOUNT_EMAIL,
    EMAIL_SENDER,
    MAX_RESULT,
    EMAILS_TO_EXTRACT_CONTENT,
    EMAILS_TO_ADD_HASHTAG,
    OVERLAP_BUFFER
}