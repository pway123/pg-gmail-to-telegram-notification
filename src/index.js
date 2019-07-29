const emailHelper = require('./emailHelper');
const moment = require('moment');
const { TIME_INTERVAL, SUBJECTS, SENDER, FROM } = require('./constant')

async function list() {
    try {
        if (SUBJECTS.length <= 0) {
            throw new Error("No subject defined, please set at least one subject");
        }

        if (FROM.length <= 0) {
            throw new Error('From Address not defined')
        }


        if (!SENDER) {
            throw new Error('Sender email address not Defined')
        }

        let now = moment().format('x');
        let emails = await emailHelper.getEmails();

        let emailSubjects = []
        emails.map(email => {
            if (now - email.internalDate < (TIME_INTERVAL ? TIME_INTERVAL : 10000))
                email.payload.headers.map(item => {
                    if (item.name === 'Subject') {
                        emailSubjects.push(item.value)
                    }
                })
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