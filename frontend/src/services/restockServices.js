export const getAllRestockRequests = async (api) => {
    const res = await api.get("/api/restocks");
    return res.data;
}

export const getRestockRequestById = async (api, id) => {
    const res = await api.get(`/api/restocks/${id}`);
    return res;
}

export const createRestockRequest = async (api, restockRequestData) => {
    const res = await api.post("/api/restocks", restockRequestData);
    return res.data;
}

export const updateRestockRequest = async (api, id, updatedData) => {
    const res = await api.put(`/api/restocks/${id}`, updatedData);
    return res.data;
}

export const getAllLinks = async (api) => {
    const res = await api.get("/api/restocks/links");
    return res.data;
}

export const getLinkById = async (api, id) => {
    const res = await api.get(`/api/restocks/links/${id}`);
    return res;
}

export const createLink = async (api, linkData) => {
    const res = await api.post("/api/restocks/links", linkData);
    return res.data;
}

export const updateLink = async (api, id, updatedData) => {
    const res = await api.put(`/api/restocks/links/${id}`, updatedData);
    return res.data;
}

