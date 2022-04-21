import {
    PAGE_HEADER_SIZE,
    PAGE_TYPE_SIZE,
    VALUE_LENGTH_SIZE
} from './constants.js'

const decoder = new TextDecoder()

/**
 * @property {ArrayBuffer} buffer
 * @property {DataView} view
 * @property {number} type
 * @property {number} length
 * @property {number} offset
 * @property {number} end
 * @property {number} peak
 */
export default class PageReader {
    /**
     * @param {ArrayBuffer} buffer 
     */
    constructor(buffer) {
        this.buffer = buffer
        this.view = new DataView(this.buffer)
        this.type = this.view.getUint8(0)
        this.length = this.view.getUint32(PAGE_TYPE_SIZE)
        this.offset = PAGE_HEADER_SIZE
        this.end = PAGE_HEADER_SIZE + this.length
        this.peak = PAGE_HEADER_SIZE
    }

    /**
     * @param {bool} traverse 
     * @param {bool} skip 
     * @returns {string | undefined}
     */
    read(traverse = false, skip = false) {
        if (this.offset >= this.end) return
        const length = this.view.getUint16(this.offset)
        if (length === 0) return
        const start = this.offset + VALUE_LENGTH_SIZE
        if (traverse) this.offset = start + length
        else this.peak = start + length
        if (skip) return
        return decoder.decode(new Uint8Array(this.buffer, start, length))
    }

    traverse() {
        this.offset = this.peak
    }

    /**
     * 
     * @param {number} start 
     * @param {number} length
     * @returns {Uint8Array}
     */
    read_block(start, length) {
        console.log({start, length})
        const result = new Uint8Array(this.buffer, start, start + length)
        console.log({result})
        console.log('\n')
        return result
    }
}
