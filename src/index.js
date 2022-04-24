const page_type = {
    leaf: 0,
    node: 1
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

/**
 * @typedef KeyValue
 * @property {string} key
 * @property {string} value
 */

/**
 * @param {KeyValue} entry
 * @param {KeyValue[]} page
 * @returns {KeyValue[]}
 */
function insert(entry, page) {
    for (let i = 0; i < page.length; i++) {
        if (page[i].key >= entry.key) {
            page.splice(i, 0, entry)
            return
        }
    }
    page.push(entry)
    return
}

/**
 * @param {string} key
 * @param {KeyValue[]} page
 * @returns {string[]}
 */
function equals(key, page) {
    const results = []
    for (let i = 0; i < page.length; i++) {
        if (page[i].key < key) continue
        if (page[i].key === key) results.push(page[i].value)
        else return results
    }
    return results
}

/**
 * @param {string} key
 * @param {KeyValue[]} page
 * @param {string} ceiling
 * @returns {KeyValue[]}
 */
function greater_than(key, page, ceiling = undefined) {
    let start
    for (let i = 0; i < page.length; i++) {
        if (start === undefined) {
            if (page[i].key >= key) {
                if (ceiling === undefined) return page.slice(i)
                if (page[i].key > ceiling) return []
                start = i
            }
        } else {
            if (page[i].key > ceiling) return page.slice(start, i)
        }
    }
    if (start) return page.slice(start)
    return []
}

/**
 * @param {KeyValue[]} page
 * @returns {number}
 */
function get_length(page) {
    let result = 12
    for (const entry of page)
        result += 8 + entry.key.length + entry.value.length
    return result
}

/**
 * @param {KeyValue[]} page
 * @param {number} type
 * @returns {Uint8Array}
 */
function serialize(page, type) {
    const numbers = [type, 0, 0]
    let heap = ''

    /**
     * @param {KeyValue} entry
     */
    const push = entry => {
        numbers.push(heap.length)
        numbers.push(heap.length + entry.key.length)
        heap += entry.key + entry.value
    }
    page.forEach(push)
    numbers[1] = numbers.length - 3
    numbers[2] = heap.length

    const buffer = new ArrayBuffer(numbers.length * 4 + heap.length)
    new Uint32Array(buffer, 0, numbers.length).set(numbers)
    new Uint8Array(buffer, numbers.length * 4, heap.length).set(
        encoder.encode(heap)
    )
    return buffer
}

/**
 * @typedef Deserialized
 * @property {number} type
 * @property {KeyValue[]} page

/**
 * @param {ArrayBuffer} buffer
 * @returns {Deserialized}
 */
function deserialize(buffer) {
    const [type, pointers_length, heap_length] = new Uint32Array(buffer, 0, 3)
    const pointers = new Uint32Array(buffer, 12, pointers_length)
    const heap = decoder.decode(
        new Uint8Array(buffer, 4 * (pointers_length + 3), heap_length)
    )

    const page = []
    for (let i = 0; i < pointers.length; i++) {
        const key = heap.substring(pointers[i], pointers[i + 1])
        i++
        const value = heap.substring(pointers[i], pointers[i + 1])
        page.push({ key, value })
    }
    return { type, page }
}

const page = []

for (let i = 0; i < 10; i++) {
    const value = Math.floor(Math.random() * 100)
    insert({ key: `key ${value}`, value: `value ${value}` }, page)
}

console.log(page)

console.log(greater_than('key 5', page, 'key 8'))
