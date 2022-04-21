import { VALUE_LENGTH_SIZE, PAGE_TYPE, PAGE_HEADER_SIZE } from './constants.js'
import PageWriter from './writer.js'
import PageReader from './reader.js'

const PAGE_SIZE = 1000

/**
 * @param {string} key 
 * @param {string} value 
 * @param {PageReader} reader 
 * @returns {ArrayBuffer}
 */
const insert_kv = (key, value, source, destination) => {
    const reader = new PageReader(source)
    const writer = new PageWriter(destination)

    const new_length = (2 * VALUE_LENGTH_SIZE) + key.length + value.length + reader.length
    if (new_length > (PAGE_SIZE - PAGE_HEADER_SIZE))
        throw new Error('Page overflow.')

    let start = reader.offset
    
    let current = reader.read(false, false)
    console.log({current})
    while (current !== undefined && current < key) {
        reader.traverse() // traverse key
        reader.read(true, true) // skip value
        current = reader.read(false, false)
        console.log({current})
    }
    console.log({end: reader.offset})
    const length = reader.offset - start

    if (length)
        writer.write_block(reader.read_block(start, length))
    writer.write(key)
    writer.write(value)


    if (current) {
        console.log({action: 'end block', offset: reader.offset, length: reader.length })
        writer.write_block(reader.read_block(reader.offset, reader.length - reader.offset))
    }
    
    writer.write_type(PAGE_TYPE.LEAF)
    writer.write_length()

    return destination
}

let page = new ArrayBuffer(1024)

const read_page = () => {
    const reader = new PageReader(page)

    let value = reader.read(true, false)

    while (value) {
        console.log(value)
        value = reader.read(true, false)
    }
}

const entries = [ 7, 12, 0, 4, 15, 6, 8, 1, 144]

for (const entry of entries) {
    let destination = new ArrayBuffer(1024)

    insert_kv(`key ${entry}`, `value ${entry}`, page, destination)

    page = destination

    read_page()
    console.log('\n')
}



