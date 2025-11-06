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
// DataBackService.js
export async function getAudios(authToken, limit = 20, offset = 0, pending = false) {
    const dataBackUrl = `${global.backendUrl()}/v1/audios?limit=${limit}&offset=${offset}&pending=${pending}`;
    const header = { Authorization: 'Bearer ' + authToken };
    return getRequestHeader(dataBackUrl, header);
}

export async function getAudioById(authToken, audioId) {
    const dataBackUrl = `${global.backendUrl()}/v1/audios/${audioId}`;
    const header = { Authorization: 'Bearer ' + authToken };
    return getRequestHeader(dataBackUrl, header);
}

export async function downloadAudioById(authToken, audioId) {
    const dataBackUrl = `${global.backendUrl()}/v1/audios/download/${audioId}`;
    const header = { Authorization: 'Bearer ' + authToken };
    return getRequestHeader(dataBackUrl, header);
}

export async function saveAudio(authToken, file) {
    const dataBackUrl = `${global.backendUrl()}/v1/audios/postAudio`;

    // Backend espera o campo "file"
    const form = new FormData();
    form.append('file', file, file.name);

    // NÃO definir Content-Type (o browser coloca o boundary)
    const header = { Authorization: 'Bearer ' + authToken };

    // Usa sua helper como está: (url, headers, body, isString)
    return postRequestHeader(dataBackUrl, header, form, /* isString */ false);
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

export async function uploadStatus(authToken, audioId) {
    const dataBackUrl = `${global.backendUrl()}/v1/upload/status/${audioId}`;
    const header = { Authorization: 'Bearer ' + authToken };
    return getRequestHeader(dataBackUrl, header);
}

// DataBackService.js
export async function getAudioStreamUrl(authToken, audioId) {
    const url = `${global.backendUrl()}/v1/audios/download/${audioId}`;
    const headers = { Authorization: 'Bearer ' + authToken };

    const res = await fetch(url, { headers });

    if (!res.ok) {
        // tenta ler mensagem para debugar no toast
        let text = '';
        try {
            text = await res.text();
        } catch {}
        throw new Error(`Falha no download (${res.status}): ${text || 'sem corpo'}`);
    }

    const ct = (res.headers.get('Content-Type') || '').toLowerCase();
    if (!ct.startsWith('audio/')) {
        const text = await res.text().catch(() => '');
        throw new Error(`Resposta não é áudio (Content-Type=${ct}). Corpo: ${text.slice(0, 200)}…`);
    }

    const blob = await res.blob();
    if (!blob || blob.size === 0) {
        throw new Error('Blob de áudio vazio (size=0).');
    }

    return URL.createObjectURL(blob); // blob:...
}

export async function analyzeAudio(authToken, audioId) {
    const url = `${global.backendUrl()}/analyzeAudio`;
    return fetch(url, {
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + authToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ audio_id: audioId, modelos: ['all'] })
    });
}

// #endregion ======================================================= AUDIOS ======================================================
