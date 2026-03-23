export const normalizeList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

export const normalizePaginated = (payload, page = 1) => {
    if (Array.isArray(payload)) {
        return {
            results: payload,
            count: payload.length,
            num_pages: 1,
            page,
        };
    }

    if (payload && Array.isArray(payload.results)) {
        return {
            results: payload.results,
            count: payload.count ?? payload.results.length,
            num_pages: payload.num_pages ?? 1,
            page: payload.page ?? page,
        };
    }

    if (payload && Array.isArray(payload.data)) {
        return {
            results: payload.data,
            count: payload.count ?? payload.data.length,
            num_pages: payload.num_pages ?? 1,
            page: payload.page ?? page,
        };
    }

    return {
        results: [],
        count: 0,
        num_pages: 1,
        page,
    };
};
