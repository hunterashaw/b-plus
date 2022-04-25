import Page from './Page.js'

export default class Node extends Page {
    constructor(options) {
        super(options)
        if (this.type === undefined) this.type = 1
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
