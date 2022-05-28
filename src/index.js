const path = require('path');
require("dotenv").config({ path: path.join(__dirname, "/../.env") });
const moment = require('moment');
const emailHelper = require('./emailHelper');
const utils = require('./utils');
const fs = require('fs');
const { SUBJECTS, IFTTT_ACCOUNT_EMAIL, EMAIL_SENDER } = require('./constant');

async function list(now) {
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
                
                if (subject.includes('[PG-File-Parser][SC] Successful file import for') || subject.includes('[PG-File-Parser][MK] Successful file import for')) {
                    const body = utils.decodeBase64(email.payload.parts ? email.payload.parts[0].body.data : email.payload.body.data);
                    const intErrCount = utils.extractRefIntErrFromLine(body);
                    if (intErrCount > 0) {
                        hashTag = utils.emailHashTag(emailSender, subject);

                        emailSubjects.push(`${subject} :: <b>With Reference Integrity Error</b> ${hashTag}`);
                    }
                }
                else if (subject) {

                    bodyContent = utils.extractEmailBodyContent(emailSender, email.payload.parts ? email.payload.parts[0].body.data : email.payload.body.data);

                    hashTag = utils.emailHashTag(emailSender, subject);

                    emailSubjects.push(`${subject} :: ${bodyContent} ${hashTag}`);
                }
            }
        })
        return emailSubjects;
    }
    catch (err) {
        console.log("ERROR:list", err);
        return null;
    }
}


async function start() {
    try {
        let now = moment().format('x');
        console.log(`###### Start Job at ${moment(Number(now)).format('MMMM Do YYYY, h:mm:ss a')} #######`);
        let subjects = await list(now);
        if (subjects && Array.isArray(subjects)) {

            console.log(`${subjects.length} number of notification to send`);

            subjects.map(async subject => {
                console.log('>>>> subject:', subject);
                // emailHelper.sendToIfttt(`${subject}`)
                //     .catch(err => {
                //         console.log("ERROR:sendToIfttt", err);
                //     });
            })

            fs.writeFileSync(`${__dirname}/PREVIOUS_START_TIME`, now, 'utf8');
        }
    }
    catch (err) {
        console.log("ERROR:start", err);
    }
}

start();
