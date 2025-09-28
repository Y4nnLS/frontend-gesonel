/* eslint-disable */
import * as global from './GlobalVariables.js';

// #region ======================================================= FUNÇÕES GENÉRICAS PARA REQUISIÇÕES =======================================================
async function getRequestHeader(url, headers, nTries = 0) {
    return fetch(url, { headers: headers }).then(async (response) => {
        if (response.status != 200 && response.status != 401 && response.status != 403) {
            // máximo 4 tentativas, na 4a não verifica o resultado, apenas retorna.
            if (nTries > 1) {
                return response;
            } else {
                return await getRequestHeader(url, headers, nTries + 1);
            }
        } else {
            return response;
        }
    });
}

async function postRequestHeader(url, headers, body, isString, nTries = 0) {
    if (isString) {
        body = JSON.stringify(body);
    }
    return fetch(url, { method: 'POST', headers: headers, body }).then(async (response) => {
        if (response.status != 200 && response.status != 201 && response.status != 204 && response.status != 401 && response.status != 403) {
            // máximo 4 tentativas, na 4a não verifica o resultado, apenas retorna.
            if (nTries > 1) {
                return response;
            } else {
                return await postRequestHeader(url, headers, body, isString, nTries + 1);
            }
        } else {
            return response;
        }
    });
}

async function putRequestHeader(url, headers, body, nTries = 0) {
    return fetch(url, { method: 'PUT', headers: headers, body: JSON.stringify(body) }).then(async (response) => {
        if (response.status != 200 && response.status != 401 && response.status != 403) {
            // máximo 4 tentativas, na 4a não verifica o resultado, apenas retorna.
            if (nTries > 1) {
                return response;
            } else {
                return await putRequestHeader(url, headers, body, nTries + 1);
            }
        } else {
            return response;
        }
    });
}

async function deleteRequestHeader(url, headers, nTries = 0) {
    return fetch(url, { method: 'DELETE', headers: headers }).then(async (response) => {
        if (response.status != 200 && response.status != 204 && response.status != 401 && response.status != 403) {
            // máximo 4 tentativas, na 4a não verifica o resultado, apenas retorna.
            if (nTries > 1) {
                return response;
            } else {
                return await deleteRequestHeader(url, headers, nTries + 1);
            }
        } else {
            return response;
        }
    });
}
// #endregion ======================================================= FUNÇÕES GENÉRICAS PARA REQUISIÇÕES =======================================================

// #region ======================================================= AUDIOS ======================================================
export async function getAudios(authToken) {
    const dataBackUrl = `${global.backendUrl()}/v1/audios?limit=50&offset=0`;
    const header = { Authorization: 'Bearer ' + authToken };
    return getRequestHeader(dataBackUrl, header);
}
export async function getAudioById(authToken, audioId) {
    const dataBackUrl = `${global.backendUrl()}/v1/audios/${audioId}`;
    const header = { Authorization: 'Bearer ' + authToken };
    return getRequestHeader(dataBackUrl, header);
}

export async function saveAudio(authToken, audio) {
    // os parametros já são o body completamente montado
    const dataBackUrl = `${global.backendUrl()}/v1/audios`;
    const header = { Authorization: 'Bearer ' + authToken };
    return postRequestHeader(dataBackUrl, header);
}

export async function editAudio(authToken, audioId, parameters) {
    // os parametros já são o body completamente montado
    const dataBackUrl = `${global.backendUrl()}/v1/audios/${audioId}`;
    const body = parameters;
    const header = { Authorization: 'Bearer ' + authToken };
    return putRequestHeader(dataBackUrl, header, body);
}

export async function deleteAudio(authToken, audioId) {
    const dataBackUrl = `${global.backendUrl()}/v1/audios/${audioId}`;
    const header = { 'Content-Type': 'application/json', Authorization: 'Bearer ' + authToken };
    return deleteRequestHeader(dataBackUrl, header);
}
// #endregion ======================================================= AUDIOS ======================================================
