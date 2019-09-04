const emailHelper = require('./emailHelper');
const moment = require('moment');

const {
    TIME_INTERVAL,
    SUBJECTS,
    IFTTT_ACCOUNT_EMAIL,
    FROM,
    EMAILS_TO_ADD_HASHTAG } = require('./constant');
const utils = require('./utils');

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
                let emailSender = '';
                let subject = '';
                let bodyContent = '';
                let hashTag = '';
                email.payload.headers.map(item => {

                    if (item.name === 'From') {
                        emailSender = item.value;
                    }

                    if (item.name === 'Subject') {
                        subject = item.value;
                    }
                })

                if (subject) {

                    bodyContent = utils.extractEmailBodyContent(email.payload.parts[0].body.data, keys);

                    hashTag = utils.emailHashTag(emailSender, subject);

                    emailSubjects.push(`${subject} :: ${bodyContent} ${hashTag}`)
                }
            }
        })

        return emailSubjects;
    }
    catch (err) {
        console.log("ERROR", err);
    }
}


let subjects = list();

console.log(`${subjects.length} number of notification to send`);

subjects.map(async subject => {
    await emailHelper.sendToIfttt(`${subject} - ${moment().format('MMMM Do YYYY, h:mm:ss ')}`) //iftt won't trigger is subject have been sent previously
})
