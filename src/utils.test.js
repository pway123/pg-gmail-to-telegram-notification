const utils = require('./utils');
const { TIME_INTERVAL } = require('./constant');
const fs = require("fs");

jest.mock('fs');

jest.mock('./constant', () => ({
    EMAILS_TO_EXTRACT_CONTENT: [
        {
            email: 'test@gmail.com',
            keys: ['key1', 'key2']
        },
        {
            email: 'test2@gmail.com',
            keys: []
        },
        {
            email: 'test3@gmail.com',
            keys: ['wo']
        }
    ],
    TIME_INTERVAL: 10000,
    EMAILS_TO_ADD_HASHTAG: [{
        email: 'test@gmail.com',
        hashTag: '#ops',
        wordsToMatchInSubject: [{ word: 'word-1', toContain: true }, { word: 'word-2', toContain: true }]
    }, {
        email: 'test@gmail.com',
        hashTag: '#ops2',
        wordsToMatchInSubject: [{ word: 'word-1', toContain: true }, { word: 'word-2', toContain: true }]
    },
    {
        email: 'test@gmail.com',
        hashTag: '#ops3',
        wordsToMatchInSubject: []
    }],
    OVERLAP_BUFFER: 500
}));

describe('Utils Test', () => {


    afterAll(() => {
        jest.resetModules();
        jest.resetAllMocks();
    })

    describe('extractEmailBodyContent', () => {
        let email = 'test@gmail.com'
        let content = 'aGVsbG8gd29ybGQ=' //base64 encode form, after decode is "hello world."
        let extractTextFromLineOriginal = utils.extractTextFromLine;
        beforeAll(() => {
            utils.extractTextFromLine = jest.fn(() => '')
        })

        afterAll(() => {
            utils.extractTextFromLine = extractTextFromLineOriginal
        })

        test('If email and content param is undefine, should expect function to return empty string', () => {
            let bodyContent = utils.extractEmailBodyContent()
            expect(bodyContent).toEqual('')
        })

        test('If content param is undefine, should expect function to return empty string', () => {
            let bodyContent = utils.extractEmailBodyContent(email)
            expect(bodyContent).toEqual('')
        })

        test('If keys param is empty array, should expect function to return empty string', () => {
            let bodyContent = utils.extractEmailBodyContent('test2@gmail.com', content)
            expect(bodyContent).toEqual('')
        })

        test('Expect function exrtract and return "world." from the "hello world" when email is found and keys is/are found in the content', () => {
            let bodyContent = utils.extractEmailBodyContent('test3@gmail.com', content)
            expect(bodyContent).toEqual('world. ')
        })
    });


    describe('extractTextFromLine', () => {

        let content = 'hello world\ngood morning';
        test('If content, start and end param is undefine, should expect function to return empty string', () => {
            let extractedString = utils.extractTextFromLine()
            expect(extractedString).toEqual('')
        })

        test('If start and end param is undefine, should expect function to return empty string', () => {
            let extractedString = utils.extractTextFromLine(content)
            expect(extractedString).toEqual('')
        })

        test('If start exceed end param is undefine, should expect function to return empty string', () => {
            let extractedString = utils.extractTextFromLine(content, content.length + 1, content.length)
            expect(extractedString).toEqual('')
        })

        test('If given start as 0, should expect function to return hello world as a string', () => {
            let extractedString = utils.extractTextFromLine(content, 0, content.length)
            expect(extractedString).toEqual('hello world')
        })
    });


    describe('findWordsInSubject', () => {

        let subject = `ALARM: "pg-test-cw_alarm-sqs_test" in Asia Pacific (United State)`;

        test('If either words is contain in the subject, function should return true', () => {
            let result = utils.findWordsInSubject(subject, [{ word: 'test', toContain: true }, { word: 'pg-test', toContain: true }])
            expect(result).toBe(true);
        })

        test('If neither words is contain in the subject, function should return false', () => {
            let result = utils.findWordsInSubject(subject, [{ word: 'not-found', toContain: true }, { word: 'testing', toContain: true }])
            expect(result).toBe(false);
        })

        test('If all words are not contain in the subject, function should return true', () => {
            let result = utils.findWordsInSubject(subject, [{ word: 'not-found', toContain: false }, { word: 'testing', toContain: false }])
            expect(result).toBe(true);
        })

        test('If word object is invalid, expect function to throw error', () => {
            expect(() => { utils.findWordsInSubject(subject, ['not-found', 'testing']) }).toThrow();
        })

        test('Function should return false when words param is an empty array', () => {
            let result = utils.findWordsInSubject(subject, [])
            expect(result).toBe(false);
        })

        test('Function should return false when words param is not given', () => {
            let result = utils.findWordsInSubject(subject)
            expect(result).toBe(false);
        })

        test('Function should return false when subject and words param is not given', () => {
            let result = utils.findWordsInSubject()
            expect(result).toBe(false);
        })
    });

    describe('keysToExtractEmailContent', () => {

        let email = `test <test@gmail.com>`;

        test('Expect function to return the keys stated in EMAILS_TO_EXTRACT_CONTENT if email is included in EMAILS_TO_EXTRACT_CONTENT', () => {
            let result = utils.keysToExtractEmailContent(email);
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual('key1');
            expect(result[1]).toEqual('key2');
        })

        test('Expect function to return undefine if email does not match any in EMAILS_TO_EXTRACT_CONTENT', () => {
            let result = utils.keysToExtractEmailContent('nofound@gmail.com');
            expect(result).toBeUndefined();
        })

    });

    describe('emailHashTag', () => {

        let email = `test@gmail.com`;
        let subject = 'test subject for-word-1-to be found'

        test('Expect function to return the hashtag ops and ops2 if email and words is included in EMAILS_TO_ADD_HASHTAG', () => {
            utils.findWordsInSubject = jest.fn(() => true);
            let result = utils.emailHashTag(email, subject);
            expect(result).toEqual('#ops #ops2 #ops3')
        })

        test('Expect function to return the hashtag stated in EMAILS_TO_ADD_HASHTAG if email is included in EMAILS_TO_ADD_HASHTAG', () => {
            utils.findWordsInSubject = jest.fn(() => false);
            let hashtag = utils.emailHashTag(email, 'test subject for-word-3-to be found');
            expect(hashtag).toEqual('#ops3');
        })

        test('Expect function to return the hashtag as empty string if email is not included in EMAILS_TO_ADD_HASHTAG', () => {
            let result = utils.emailHashTag('nofound@gmail.com', subject);
            expect(result).toEqual('')
        })

    });

    describe('toSendEmailAsNotification', () => {
        let functionStartTimeStamp = 100000;
        let emailSendTimeStamp = functionStartTimeStamp - (TIME_INTERVAL / 2);

        const FOLDER_PRESENT_CONFIG = {
            "PREVIOUS_START_TIME": 10000
        }

        const NO_FOLDER_PRESENT_CONFIG = {
            "PREVIOUS_START_TIME": undefined
        }

        test('Expect function to return true when email timestamp it fall with the time interval and PREVIOUS_START_TIME is not set', () => {
            fs.__createMockFiles(FOLDER_PRESENT_CONFIG);
            let result = utils.toSendEmailAsNotification(emailSendTimeStamp, functionStartTimeStamp);
            expect(result).toBe(true);
        })

        test('Expect function to return true when email timestamp it fall with the time interval and PREVIOUS_START_TIME is undefined', () => {
            fs.__createMockFiles(NO_FOLDER_PRESENT_CONFIG);
            let result = utils.toSendEmailAsNotification(emailSendTimeStamp, functionStartTimeStamp);
            expect(result).toBe(true);
        })

        test('Expect function to return true when email timestamp it fall with the time interval and PREVIOUS_START_TIME is defined from previous run', () => {
            fs.__createMockFiles({ "PREVIOUS_START_TIME": functionStartTimeStamp - TIME_INTERVAL });
            let result = utils.toSendEmailAsNotification(emailSendTimeStamp, functionStartTimeStamp);
            expect(result).toBe(true);
        })

        test('Expect function to return false when email timestamp it fall outside the time interval and PREVIOUS_START_TIME is undefined', () => {
            fs.__createMockFiles(NO_FOLDER_PRESENT_CONFIG);
            let result = utils.toSendEmailAsNotification(functionStartTimeStamp - (TIME_INTERVAL * 3), functionStartTimeStamp);
            expect(result).toBe(false);
        })

        test('Expect function to return false when email timestamp it fall outside the time interval and PREVIOUS_START_TIME is undefined', () => {
            fs.__createMockFiles({ "PREVIOUS_START_TIME": functionStartTimeStamp - TIME_INTERVAL });
            let result = utils.toSendEmailAsNotification(functionStartTimeStamp - (TIME_INTERVAL * 3), functionStartTimeStamp);
            expect(result).toBe(false);
        })
    });
});