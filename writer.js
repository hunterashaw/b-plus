import {
    PAGE_TYPE_SIZE,
    PAGE_HEADER_SIZE,
    VALUE_LENGTH_SIZE
} from './constants.js'

const encoder = new TextEncoder()

/**
 * @property {ArrayBuffer} buffer
 * @property {DataView} view
 * @property {Uint8Array} array
 * @property {number} offset
 * @property {number} end
 */
export default class PageReader {
    /**
     * @param {ArrayBuffer} buffer 
     */
    constructor(buffer) {
        this.buffer = buffer
        this.view = new DataView(this.buffer)
        this.array = new Uint8Array(this.buffer)
        this.offset = PAGE_HEADER_SIZE
        this.end = buffer.byteLength
    }

    /**
     * @param {Uint8Array} block 
     */
    write_block(block) {
        this.array.set(block, this.offset)
        this.offset += block.byteLength
    }

    /**
     * @param {string} value 
     */
    write(value) {
        this.view.setUint16(this.offset, value.length)
        this.offset += VALUE_LENGTH_SIZE
        this.array.set(encoder.encode(value), this.offset)
        this.offset += value.length
    }

    /**
     * @param {number} type 
     */
    write_type(type) {
        this.view.setUint8(0, type)
    }

    write_length() {
        console.log({action: 'write length', offset: this.offset})
        this.view.setUint32(PAGE_TYPE_SIZE, this.offset - PAGE_HEADER_SIZE)
    }
}
