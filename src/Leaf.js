import Page from './Page.js'

export default class Leaf extends Page {
    constructor(options) {
        super(options)
        if (this.type === undefined) this.type = 0
    }

    /**
     * @param {string} key
     * @param {string} ceiling
     * @returns {KeyValue[]}
     */
    greater_than(key, ceiling = undefined) {
        let start
        for (let i = 0; i < this.entries.length; i++) {
            if (start === undefined) {
                if (this.entries[i].key >= key) {
                    if (ceiling === undefined) return this.entries.slice(i)
                    if (this.entries[i].key > ceiling) return []
                    start = i
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
        const results = []
        for (let i = 0; i < this.entries.length; i++) {
            if (this.entries[i].key < key) continue
            if (this.entries[i].key === key) results.push(this.entries[i].value)
            else return results
        }
        return results
    }
}
