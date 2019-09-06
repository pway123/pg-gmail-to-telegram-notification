const moment = require('moment');
const emailHelper = require('./emailHelper');
const utils = require('./utils');
const { TIME_INTERVAL, SUBJECTS, IFTTT_ACCOUNT_EMAIL, EMAIL_SENDER } = require('./constant');

async function list() {
    try {
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

            let timeInterval = (TIME_INTERVAL ? TIME_INTERVAL : 10000);
            let emailTime = email.internalDate % timeInterval;

            if (timeInterval - emailTime < timeInterval) {
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

                    bodyContent = utils.extractEmailBodyContent(emailSender, email.payload.parts[0].body.data);

                    hashTag = utils.emailHashTag(emailSender, subject);

                    emailSubjects.push(`${subject} :: ${bodyContent} ${hashTag}`);
                }
            }
        })

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
                await emailHelper.sendToIfttt(`${subject} - ${moment().format('MMMM Do YYYY, h:mm:ss ')}`); //iftt won't trigger is subject have been sent previously
            })
        }
    }
    catch (err) {
        console.log("ERROR:start", err);
    }
}

start();
