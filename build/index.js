const encoder = new TextEncoder();
const decoder = new TextDecoder();

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
class Page {
    /**
     * @param {PageOptions} buffer
     */
    constructor(options = {}) {
        if (options.buffer) {
            const [type, pointers_length, heap_length] = new Uint32Array(
                options.buffer,
                0,
                3
            );
            const pointers = new Uint32Array(
                options.buffer,
                12,
                pointers_length
            );
            const heap = decoder.decode(
                new Uint8Array(
                    options.buffer,
                    4 * (pointers_length + 3),
                    heap_length
                )
            );

            this.type = type;
            this.entries = [];
            let length = 12;
            for (let i = 0; i < pointers.length; i++) {
                const key = heap.substring(pointers[i], pointers[i + 1]);
                i++;
                const value = heap.substring(pointers[i], pointers[i + 1]);
                length += 8 + key.length + value.length;
                this.entries.push({ key, value });
            }
            this.length = length;
        } else {
            this.entries = [];
            this.length = 12;
            if (options.entries)
                options.entries.forEach(({ key, value }) =>
                    this.insert(key, value)
                );
        }
    }

    /**
     * @param {string} key
     * @param {string} value
     */
    insert(key, value) {
        for (let i = 0; i < this.entries.length; i++) {
            if (this.entries[i].key >= key) {
                this.entries.splice(i, 0, { key, value });
                this.length += 8 + key.length + value.length;
                return
            }
        }
        this.entries.push({ key, value });
        this.length += 8 + key.length + value.length;
        return
    }

    /**
     * @returns {ArrayBuffer}
     */
    serialize() {
        const numbers = [this.type || 0, 0, 0];
        let heap = '';
        this.entries.forEach(({ key, value }) => {
            numbers.push(heap.length);
            numbers.push(heap.length + key.length);
            heap += key + value;
        });
        numbers[1] = numbers.length - 3;
        numbers[2] = heap.length;

        const buffer = new ArrayBuffer(numbers.length * 4 + heap.length);
        new Uint32Array(buffer, 0, numbers.length).set(numbers);
        new Uint8Array(buffer, numbers.length * 4, heap.length).set(
            encoder.encode(heap)
        );
        return buffer
    }
}

class Leaf extends Page {
    constructor(options) {
        super(options);
        if (this.type === undefined) this.type = 0;
    }

    /**
     * @param {string} key
     * @param {string} ceiling
     * @returns {KeyValue[]}
     */
    greater_than(key, ceiling = undefined) {
        let start;
        for (let i = 0; i < this.entries.length; i++) {
            if (start === undefined) {
                if (this.entries[i].key >= key) {
                    if (ceiling === undefined) return this.entries.slice(i)
                    if (this.entries[i].key > ceiling) return []
                    start = i;
                }
            } else {
                if (this.entries[i].key > ceiling)
                    return this.entries.slice(start, i)
            }
        }
        if (start) return this.entries.slice(start)
        return []
    }

    /**
     * @param {string} key
     * @returns {string[]}
     */
    equal_to(key) {
        const results = [];
        for (let i = 0; i < this.entries.length; i++) {
            if (this.entries[i].key < key) continue
            if (this.entries[i].key === key) results.push(this.entries[i].value);
            else return results
        }
        return results
    }
}

class Node extends Page {
    constructor(options) {
        super(options);
        if (this.type === undefined) this.type = 1;
    }

    /**
     * @param {string} key
     * @return {string}
     */
    lookup(key) {
        for (let i = 0; i < this.entries.length; i++) {
            if (this.entries[i].key >= key) return this.entries[i].value
        }
    }
}

export { Leaf, Node, Page };
