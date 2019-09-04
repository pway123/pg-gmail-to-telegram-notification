const fs = require('fs');
const { google } = require('googleapis');
const moment = require('moment');
const formatEmail = require('format-email');
const { SUBJECTS, FROM, IFTTT_ACCOUNT_EMAIL, MAX_RESULT } = require('./constant.js');
const { Base64 } = require('js-base64');

const wait = (time) => new Promise(resolve => setTimeout(resolve, time));
const ERR_MAX_RETRIES = 'Max retries, No email found matching search';

class EmailHelper {
    constructor() {
        const credentials = JSON.parse(fs.readFileSync(__dirname + '/gmail_credentials.json'));
        const token = JSON.parse(fs.readFileSync(__dirname + '/gmail_token.json'));

        this.oAuth2Client = this.initializeOAuthClient(credentials, token);
        this.gmail = google.gmail({ version: 'v1', auth: this.oAuth2Client });
    }

    /**
     * 
     * @param {object} credentials 
     * @param {object} token 
     */
    initializeOAuthClient(credentials, token) {
        const { client_secret, client_id, redirect_uris } = credentials.web;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        oAuth2Client.setCredentials(token);

        return oAuth2Client;
    }

    /**
     * 
     * @param {object} options 
     */
    async getEmails(options) {
        let startTime = moment().valueOf();

        let result = await this.getEmailsUntilMaxTries(options);

        let endTime = moment().valueOf();
        let totalTime = endTime - startTime;

        console.log(`Time to retrieve email is ${totalTime}ms`);
        return result;
    }

    /**
     * 
     * @param {object} options 
     */
    async getEmailsUntilMaxTries(options = {}) {
        try {
            let { maxResults = MAX_RESULT, maxTries = 2, interval = 1500 } = options;

            for (let numTries = 1; numTries <= maxTries; numTries++) {
                let messages = await this.listMessages(maxResults);
                if (!messages || messages.length < 1) {
                    if (numTries < maxTries) {
                        await wait(interval);
                    } else {
                        throw new Error(ERR_MAX_RETRIES);
                    }
                    continue;
                }

                console.log(`${messages.length} email(s) matching search found`);
                return await this.getMessages(messages);
            }
        }
        catch (err) {
            throw err;
        }

    }

    /**
     * 
     * @param {integer} maxResults 
     */
    async listMessages(maxResults) {

        let subjects = SUBJECTS.join('|')
        let fromEmailAddress = FROM.join('|')
        let filter = `from:(${fromEmailAddress}) subject:({${subjects}})`;

        return new Promise((resolve, reject) => {
            this.gmail.users.messages.list({
                userId: 'me',
                q: filter,
                maxResults
            }, async (err, res) => {
                if (err) {
                    reject(err);
                }
                resolve(res.data.messages);
            });
        });
    }

    /**
     * 
     * @param {array} messages 
     */
    getMessages(messages) {
        return Promise.all(messages.map(msg => this.getMessage(msg.id)));
    }

    /**
     * 
     * @param {string} messageId 
     */
    getMessage(messageId) {
        return new Promise((resolve, reject) => {
            this.gmail.users.messages.get({
                userId: 'me',
                id: messageId,
                format: 'full'
            }, (err, res) => {
                if (err) {
                    reject(err);
                }

                resolve(res.data);
            });
        });
    }

    /**
     * 
     * @param {string} subject 
     */
    async sendMessage(subject) {
        let email = formatEmail(IFTTT_ACCOUNT_EMAIL, 'trigger@applet.ifttt.com', subject, subject)
        // Using the js-base64 library for encoding:
        // https://www.npmjs.com/package/npm 
        var base64EncodedEmail = Base64.encodeURI(email);
        return new Promise((resolve, reject) => {
            this.gmail.users.messages.send({
                'userId': 'me',
                'resource': {
                    'raw': base64EncodedEmail
                }
            }, (err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res)
            });
        });
    }
}

let emailHelper = new EmailHelper();

const getEmails = async () => {
    try {
        return emailHelper.getEmails();
    } catch (err) {
        throw err;
    }
}

const sendToIfttt = async (subject) => {
    try {
        await emailHelper.sendMessage(subject);
    } catch (err) {
        throw err;
    }
}

module.exports = { getEmails, sendToIfttt };