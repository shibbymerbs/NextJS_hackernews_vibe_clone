import { getPageNumbers } from '../src/components/Pagination'

describe('Pagination - getPageNumbers function', () => {
    describe('when total pages <= maxVisible (5)', () => {
        it('should return all page numbers when totalPages is 1', () => {
            const result = getPageNumbers(1, 1)
            expect(result).toEqual([1])
        })

        it('should return all page numbers when totalPages is 3', () => {
            const result = getPageNumbers(2, 3)
            expect(result).toEqual([1, 2, 3])
        })

        it('should return all page numbers when totalPages is 5', () => {
            const result = getPageNumbers(3, 5)
            expect(result).toEqual([1, 2, 3, 4, 5])
        })
    })

    describe('when total pages > maxVisible (5)', () => {
        it('should show first page, left ellipsis, current-1, current, current+1, right ellipsis, and last page', () => {
            const result = getPageNumbers(5, 10)
            expect(result).toEqual([1, 'left-ellipsis', 4, 5, 6, 'right-ellipsis', 10])
        })

        it('should not show left ellipsis when currentPage is 2', () => {
            const result = getPageNumbers(2, 10)
            expect(result).toEqual([1, 2, 3, 'right-ellipsis', 10])
        })

        it('should not show right ellipsis when currentPage is totalPages - 1', () => {
            const result = getPageNumbers(9, 10)
            expect(result).toEqual([1, 'left-ellipsis', 8, 9, 10])
        })

        it('should handle edge case when currentPage is 3', () => {
            const result = getPageNumbers(3, 10)
            expect(result).toEqual([1, 2, 3, 4, 'right-ellipsis', 10])
        })

        it('should handle edge case when currentPage is totalPages - 2', () => {
            const result = getPageNumbers(8, 10)
            expect(result).toEqual([1, 'left-ellipsis', 7, 8, 9, 10])
        })
    })

    describe('edge cases', () => {
        it('should handle currentPage at beginning with many pages', () => {
            const result = getPageNumbers(1, 20)
            expect(result).toEqual([1, 2, 'right-ellipsis', 20])
        })

        it('should handle currentPage at end with many pages', () => {
            const result = getPageNumbers(20, 20)
            expect(result).toEqual([1, 'left-ellipsis', 19, 20])
        })

        it('should handle large number of pages', () => {
            const result = getPageNumbers(50, 100)
            expect(result).toEqual([1, 'left-ellipsis', 49, 50, 51, 'right-ellipsis', 100])
        })
    })
})
