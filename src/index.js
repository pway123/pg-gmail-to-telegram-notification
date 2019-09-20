const moment = require('moment');
const emailHelper = require('./emailHelper');
const utils = require('./utils');
const fs = require('fs');
const { SUBJECTS, IFTTT_ACCOUNT_EMAIL, EMAIL_SENDER } = require('./constant');

async function list() {
    try {
        let now = moment().format('x');

        if (SUBJECTS.length <= 0) {
            throw new Error("No subject defined, please set at least one subject");
        }

        if (EMAIL_SENDER.length <= 0) {
            throw new Error('From Address not defined');
        }

        if (!IFTTT_ACCOUNT_EMAIL) {
            throw new Error('Sender email address not Defined');
        }

        let emails = await emailHelper.getEmails();

        let emailSubjects = [];
        emails.map(email => {
            if (utils.toSendEmailAsNotification(email.internalDate, now)) {
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

                    bodyContent = utils.extractEmailBodyContent(emailSender, email.payload.parts ? email.payload.parts[0].body.data : email.payload.body.data);

                    hashTag = utils.emailHashTag(emailSender, subject);

                    emailSubjects.push(`${subject} :: ${bodyContent} ${hashTag}`);
                }
            }
        })

        fs.writeFileSync(`${__dirname}/PREVIOUS_START_TIME`, now, 'utf8');

        return emailSubjects;
    }
    catch (err) {
        console.log("ERROR:list", err);
        return;
    }
}


async function start() {
    try {
        let subjects = await list();

        if (subjects && Array.isArray(subjects)) {

            console.log(`${subjects.length} number of notification to send`);

            subjects.map(async subject => {
                emailHelper.sendToIfttt(`${subject}`)
                    .catch(err => {
                        console.log("ERROR:sendToIfttt", err);
                    });
            })
        }
    }
    catch (err) {
        console.log("ERROR:start", err);
    }
}

start();
