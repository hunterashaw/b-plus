const encoder = new TextEncoder()
const decoder = new TextDecoder()

/**
 * @typedef KeyValue
 * @property {string} key
 * @property {string} value
 */

/**
 * @typedef PageOptions
 * @property {ArrayBuffer} buffer
 * @property {KeyValue[]} entries
 */

/**
 * @property {KeyValue[]} entries
 * @property {number} type
 * @property {number} length
 */
export default class Page {
    /**
     * @param {PageOptions} buffer
     */
    constructor(options = {}) {
        if (options.buffer) {
            const [type, pointers_length, heap_length] = new Uint32Array(
                options.buffer,
                0,
                3
            )
            const pointers = new Uint32Array(
                options.buffer,
                12,
                pointers_length
            )
            const heap = decoder.decode(
                new Uint8Array(
                    options.buffer,
                    4 * (pointers_length + 3),
                    heap_length
                )
            )

            this.type = type
            this.entries = []
            let length = 12
            for (let i = 0; i < pointers.length; i++) {
                const key = heap.substring(pointers[i], pointers[i + 1])
                i++
                const value = heap.substring(pointers[i], pointers[i + 1])
                length += 8 + key.length + value.length
                this.entries.push({ key, value })
            }
            this.length = length
        } else {
            this.entries = []
            this.length = 12
            if (options.entries)
                options.entries.forEach(({ key, value }) =>
                    this.insert(key, value)
                )
        }
    }

    /**
     * @param {string} key
     * @param {string} value
     */
    insert(key, value) {
        for (let i = 0; i < this.entries.length; i++) {
            if (this.entries[i].key >= key) {
                this.entries.splice(i, 0, { key, value })
                this.length += 8 + key.length + value.length
                return
            }
        }
        this.entries.push({ key, value })
        this.length += 8 + key.length + value.length
        return
    }

    /**
     * @returns {ArrayBuffer}
     */
    serialize() {
        const numbers = [this.type || 0, 0, 0]
        let heap = ''
        this.entries.forEach(({ key, value }) => {
            numbers.push(heap.length)
            numbers.push(heap.length + key.length)
            heap += key + value
        })
        numbers[1] = numbers.length - 3
        numbers[2] = heap.length

        const buffer = new ArrayBuffer(numbers.length * 4 + heap.length)
        new Uint32Array(buffer, 0, numbers.length).set(numbers)
        new Uint8Array(buffer, numbers.length * 4, heap.length).set(
            encoder.encode(heap)
        )
        return buffer
    }
}
