import { expect, test } from '@jest/globals'
import { Page, Leaf, Node } from '../index'

test('Page Sorting', () => {
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

test('Page Serialization', () => {
    const page = new Page()
    const entries = [
        { key: 'key 1', value: 'value 1' },
        { key: 'key 7', value: 'value 7' },
        { key: 'key 0', value: 'value 0' },
        { key: 'key 01', value: 'value 01' },
        { key: 'key 3', value: 'value 3' }
    ]
    entries.forEach(({ key, value }) => page.insert(key, value))

    expect(new Page({ buffer: page.serialize() }).entries).toEqual(page.entries)
})

test('Node Lookup', () => {
    const pages = new Map()
    const node = new Node()

    for (let i = 0; i < 4; i++) {
        const leaf = new Leaf()

        for (let p = 0; p < 10; p++)
            leaf.insert(`key ${i}${p}`, `value ${i}${p}`)

        const high_key = leaf.entries[leaf.entries.length - 1].key
        const page_key = (i + 1).toString()

        node.insert(high_key, page_key)
        pages.set(page_key, leaf)
    }

    const lookup = 'key 21'
    const leaf = pages.get(node.lookup(lookup))
    expect(leaf.equal_to(lookup)).toEqual(['value 21'])
})
