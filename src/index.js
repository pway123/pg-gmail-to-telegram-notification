const emailHelper = require('./emailHelper');
const moment = require('moment');

const {
    TIME_INTERVAL,
    SUBJECTS,
    IFTTT_ACCOUNT_EMAIL,
    FROM,
    EMAILS_TO_EXTRACT_CONTENT,
    KEYS_TO_EXTRACT_CONTENT,
    EMAILS_TO_ADD_HASHTAG } = require('./constant');
const util = require('./utils');

async function list() {
    try {
        if (SUBJECTS.length <= 0) {
            throw new Error("No subject defined, please set at least one subject");
        }

        if (FROM.length <= 0) {
            throw new Error('From Address not defined')
        }

        if (!IFTTT_ACCOUNT_EMAIL) {
            throw new Error('Sender email address not Defined')
        }

        let now = moment().format('x');
        let emails = await emailHelper.getEmails();

        let emailSubjects = []
        emails.map(email => {
            if (now - email.internalDate < (TIME_INTERVAL ? TIME_INTERVAL : 10000)) {
                let subject = ''
                let bodyContent = '';
                let hashTag = ''
                email.payload.headers.map(item => {

                    if (item.name === 'From') {

                        EMAILS_TO_EXTRACT_CONTENT.map(emailToExtractContent => {
                            if (item.value.includes(emailToExtractContent)) {
                                bodyContent = util.extractEmailBodyContent(email.payload.parts[0].body.data, KEYS_TO_EXTRACT_CONTENT);
                            }
                        })

                        EMAILS_TO_ADD_HASHTAG.map(emailToAddHashTag => {
                            if (item.value.includes(emailToAddHashTag.email)) {
                                hashTag = emailToAddHashTag.hashTag
                            }
                        })
                    }

                    if (item.name === 'Subject') {
                        subject = item.value;
                    }
                })

                if (subject) {
                    emailSubjects.push(`${subject} :: ${bodyContent} ${hashTag}`)
                }
            }
        })

        console.log(`${emailSubjects.length} number of notification to send`)
        emailSubjects.map(async subject => {
            await emailHelper.sendToIfttt(`${subject} - ${moment().format('MMMM Do YYYY, h:mm:ss ')}`) //iftt won't trigger is subject have been sent previously
        })
    }
    catch (err) {
        console.log("ERROR", err);
    }
}


list()

