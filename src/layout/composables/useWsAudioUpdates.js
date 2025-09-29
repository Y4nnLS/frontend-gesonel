// src/layout/composables/useWsAudioUpdates.js
import { onBeforeUnmount, onMounted, ref } from 'vue';
import * as global from '../../service/GlobalVariables.js';
/**
 * WebSocket com reconexão exponencial, keep-alive (ping) e limpeza.
 * @param {string} url  Ex.: "/ws/audio-updates" (com proxy) ou "ws://127.0.0.1:8000/ws/audio-updates"
 * @param {object} opts { pingMs=30000, maxBackoffMs=15000, immediate=true }
 */
export function useWsAudioUpdates(opts = { pingMs: 30000, maxBackoffMs: 15000, immediate: true }) {
    const msgs = ref([]); // mensagens recebidas (JSON ou string)
    const status = ref('idle'); // idle | connecting | open | closed
    const error = ref(null);

    let ws = null;
    let pingId = null;
    let retryId = null;
    let attempts = 0;

    const connect = () => {
        if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

        status.value = 'connecting';
        error.value = null;
        const finalUrl = global.webSocketUrl();
        console.log('[WS] connecting to', finalUrl);

        ws = new WebSocket(finalUrl);

        ws.onopen = () => {
            status.value = 'open';
            attempts = 0;
            // keep-alive
            pingId = setInterval(() => {
                try {
                    ws?.readyState === 1 && ws.send('ping');
                } catch {}
            }, opts.pingMs ?? 30000);
        };

        ws.onmessage = (e) => {
            try {
                msgs.value.push(JSON.parse(e.data));
            } catch {
                msgs.value.push(e.data);
            }
            if (msgs.value.length > 500) msgs.value.shift();
        };

        ws.onerror = (e) => {
            console.error('[WS] error', e);
            error.value = e;
        };

        ws.onclose = () => {
            status.value = 'closed';
            if (pingId) {
                clearInterval(pingId);
                pingId = null;
            }
            const delay = Math.min(1000 * Math.pow(1.5, ++attempts), opts.maxBackoffMs ?? 15000);
            retryId = setTimeout(connect, delay);
        };
    };

    const disconnect = () => {
        if (retryId) {
            clearTimeout(retryId);
            retryId = null;
        }
        if (pingId) {
            clearInterval(pingId);
            pingId = null;
        }
        try {
            ws?.close();
        } catch {}
        ws = null;
        status.value = 'closed';
    };

    const send = (data) => {
        if (ws?.readyState === 1) {
            ws.send(typeof data === 'string' ? data : JSON.stringify(data));
        }
    };

    onMounted(() => {
        if (opts.immediate ?? true) connect();
    });
    onBeforeUnmount(disconnect);

    return { msgs, status, error, connect, disconnect, send };
}
