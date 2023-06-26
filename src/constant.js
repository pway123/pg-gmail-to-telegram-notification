const SUBJECTS = [
    '[PG ID Interface]',
    'Imperva',
    'ALARM:',
    'has FAILED',
    'Parents Gateway Common Service',
    '[PG-File-Parser] Job Attempt Not Ran Again',
    '[PG-File-Parser] Unexpected Error in',
    '[PG-File-Parser] Failed file import',
    '[Bamboo]'
]
const TIME_INTERVAL = 60000
const IFTTT_ACCOUNT_EMAIL = process.env.IFTTT_ACCOUNT_EMAIL
const EMAIL_SENDER = process.env.EMAIL_SENDER.split(',')
const MAX_RESULT = 10
/**
 * {
        email: 'emailSender',
        keys: ['some string']
    }
 */
const EMAILS_TO_EXTRACT_CONTENT = [{
    email: EMAIL_SENDER[0],
    keys: ['- State Change:', '- Reason for State Change:']
}]

/**
 * Email that require hash tag to be added based on from address and words match
 *  {
        email: 'emailSender',
        hashTag: '#ops',
        wordsToMatchInSubject: [{word:'some string', toContain: true}]
    },
 */
const EMAILS_TO_ADD_HASHTAG = [{
    email: EMAIL_SENDER[0],
    hashTag: '#ops',
    wordsToMatchInSubject: [{ word: 'pg-p-cw', toContain: true }]
},
{
    email: EMAIL_SENDER[1],
    hashTag: '#ops',
    wordsToMatchInSubject: []
},
{
    email: EMAIL_SENDER[3],
    hashTag: '#ops',
    wordsToMatchInSubject: []
},
{
    email: EMAIL_SENDER[2],
    hashTag: '#ops',
    wordsToMatchInSubject: [{ word: 'PG Native - To Deploy App Market', toContain: true }]
},
{
    email: EMAIL_SENDER[2],
    hashTag: '#dev',
    wordsToMatchInSubject: []
},
{
    email: EMAIL_SENDER[0],
    hashTag: '#dev',
    wordsToMatchInSubject: [{ word: 'pg-p-cw', toContain: false }]
},
{
    email: EMAIL_SENDER[4],
    hashTag: '#ops',
    wordsToMatchInSubject: [{ word: '[PG ID Interface] Job', toContain: true },{ word: '[PG-File-Parser]', toContain: true }]
},
{
    email: EMAIL_SENDER[5],
    hashTag: "#ops",
    wordsToMatchInSubject: [{ word: '[Bamboo]', toContain: true }]
}]
const OVERLAP_BUFFER = 3000;

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
