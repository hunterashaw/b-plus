import { expect } from '@jest/globals'
import { Page, Leaf } from '../src/index'

test('page sorting', () => {
    const page = new Page()
    const entries = [
        { key: 'key 1', value: 'value 1' },
        { key: 'key 7', value: 'value 7' },
        { key: 'key 0', value: 'value 0' },
        { key: 'key 01', value: 'value 01' },
        { key: 'key 3', value: 'value 3' }
    ]
    entries.forEach(({ key, value }) => page.insert(key, value))

    expect(page.entries).toEqual([
        { key: 'key 0', value: 'value 0' },
        { key: 'key 01', value: 'value 01' },
        { key: 'key 1', value: 'value 1' },
        { key: 'key 3', value: 'value 3' },
        { key: 'key 7', value: 'value 7' }
    ])
})

test('page serialization', () => {
    const page = new Page()
    const entries = [
        { key: 'key 1', value: 'value 1' },
        { key: 'key 7', value: 'value 7' },
        { key: 'key 0', value: 'value 0' },
        { key: 'key 01', value: 'value 01' },
        { key: 'key 3', value: 'value 3' }
    ]
    entries.forEach(({ key, value }) => page.insert(key, value))

    expect(new Page(page.serialize()).entries).toEqual(page.entries)
})
