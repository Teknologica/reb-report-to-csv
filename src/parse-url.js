const delimiters = {
    query: '?',
    params: '&',
};
export default function parseUrl(url) {
    let offset = 0;
    const max = 1000;
    let limit = max;
    if (!url.includes(delimiters.query)) {
        throw new Error('bad url');
    }
    const vals = url.split(delimiters.query);
    const base = vals[0];
    const params = vals[1].split(delimiters.params).filter(p => !(p.startsWith('limit') || p.startsWith('offset')));
    return {
        setOffset(v) {
            offset = v;
        },
        setLimit(v) {
            limit = v;
        },
        build() {
            const querystring = [].concat(params, [
                `limit=${limit}`,
                `offset=${offset}`,
            ]).join(delimiters.params);
            return `${base}?${querystring}`;
        }
    };
}
