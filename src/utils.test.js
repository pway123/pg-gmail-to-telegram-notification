const utils = require('./utils');

describe('Utils Test', () => {
    describe('extractEmailBodyContent', () => {
        let content = 'aGVsbG8gd29ybGQ=' //base64 encode
        let extractTextFromLineOriginal = utils.extractTextFromLine;
        beforeAll(() => {
            utils.extractTextFromLine = jest.fn(() => '')
        })

        afterAll(() => {
            utils.extractTextFromLine = extractTextFromLineOriginal
        })

        test('If content param is undefine, should expect function to return empty string', () => {
            let bodyContent = utils.extractEmailBodyContent()
            expect(bodyContent).toEqual('')
        })

        test('If keys param is undefine, should expect function to return empty string', () => {
            let bodyContent = utils.extractEmailBodyContent(content)
            expect(bodyContent).toEqual('')
        })

        test('If keys param is empty array, should expect function to return empty string', () => {
            let bodyContent = utils.extractEmailBodyContent(content, [])
            expect(bodyContent).toEqual('')
        })

        test('If keys param is empty array, should expect function to return empty string', () => {
            let bodyContent = utils.extractEmailBodyContent(content, ['wo'])
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
});