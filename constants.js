const PAGE_TYPE_SIZE = 1
const PAGE_LENGTH_SIZE = 4
const PAGE_HEADER_SIZE = PAGE_TYPE_SIZE + PAGE_LENGTH_SIZE
const VALUE_LENGTH_SIZE = 2

const PAGE_TYPE = {
    LEAF: 0,
    NODE: 1
}

export {
    PAGE_TYPE_SIZE,
    PAGE_LENGTH_SIZE,
    PAGE_HEADER_SIZE,
    VALUE_LENGTH_SIZE,
    PAGE_TYPE
}
