const average = require('../utils/for_testing').average

describe('average', () => {

    test('average a one value', () => {
        expect(average([1])).toBe(1)
    })

    test('test avearge of an array', () => {
        expect(average([1, 2, 3, 4])).toBe(2.5)
    })

    test('empty array average should be zero', () => {
        expect(average([])).toBe(0)
    })

})