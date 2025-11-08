<script setup>
/* eslint-disable */
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useWsAudioUpdates } from '../layout/composables/useWsAudioUpdates.js';
import * as dataBack from '../service/DataBackService.js';
import cust1 from './cust1.json';

const toast = useToast();
const confirm = useConfirm();
const { msgs } = useWsAudioUpdates();

// ---------- estados principais (não-pendentes)
const audioFiles = ref([]);
const total = ref(0); // total (não-pendentes)
const rows = ref(20); // page size (não-pendentes)
const first = ref(0); // offset (não-pendentes)
const loading = ref(false);

// ---------- estados pendentes (atividades recentes)
const audioFilesPending = ref([]);
const totalPending = ref(0); // total (pendentes)
const rowsPending = ref(20); // page size (pendentes)
const firstPending = ref(0); // offset (pendentes)
const loadingPending = ref(false);

// (se quiser manter o feed fake/WS à esquerda, deixei aqui)
const customers1 = ref(cust1);

// ---------- helpers ----------
function getSeverity(status) {
    switch ((status || '').toLowerCase()) {
        case 'angry':
            return 'danger';
        case 'happy':
            return 'success';
        case 'sad':
            return 'info';
        case 'desgosto':
            return 'warning';
        case 'tristeza':
            return null;
        default:
            return null;
    }
}
// ---------- EMOÇÕES: normalização + metadados (ícone + classe + rótulo) ----------
function normalizeEmotion(raw) {
    const e = String(raw || '')
        .trim()
        .toLowerCase();
    // sinônimos PT/EN que já vi no teu fluxo:
    if (['desgosto', 'disgust'].includes(e)) return 'disgust';
    if (['tristeza', 'sad', 'sadness'].includes(e)) return 'sadness';
    if (['feliz', 'alegria', 'happy'].includes(e)) return 'happy';
    if (['medo', 'fear'].includes(e)) return 'fear';
    if (['raiva', 'angry'].includes(e)) return 'angry';
    if (['surpresa', 'surprise'].includes(e)) return 'surprise';
    if (['neutro', 'neutral'].includes(e)) return 'neutral';
    return e || null;
}

// Meta por emoção: ícone PrimeIcons + classe para cor + label bonito
const EMOTION_META = {
    angry: { icon: 'pi pi-bolt', cls: 'emo-angry', label: 'angry' },
    disgust: { icon: 'pi pi-ban', cls: 'emo-disgust', label: 'disgust' },
    fear: { icon: 'pi pi-exclamation-triangle', cls: 'emo-fear', label: 'fear' },
    happy: { icon: 'pi pi-smile', cls: 'emo-happy', label: 'happy' },
    neutral: { icon: 'pi pi-meh', cls: 'emo-neutral', label: 'neutral' },
    sadness: { icon: 'pi pi-minus-circle', cls: 'emo-sadness', label: 'sadness' },
    surprise: { icon: 'pi pi-bell', cls: 'emo-surprise', label: 'surprise' }
};

function getEmotionMeta(raw) {
    const key = normalizeEmotion(raw);
    return key && EMOTION_META[key] ? EMOTION_META[key] : null;
}

// ---------- busca combinada (uma função, duas requisições) ----------
async function refreshAudios(
    pLimit = rowsPending.value,
    pOffset = firstPending.value, // pendentes
    nLimit = rows.value,
    nOffset = first.value // não-pendentes
) {
    loading.value = true;
    loadingPending.value = true;
    try {
        const [respPending, respAll] = await Promise.all([
            // only_pending = true  -> Atividades Recentes
            dataBack.getAudios('token', pLimit, pOffset, true),
            // only_pending = false -> Tabela principal
            dataBack.getAudios('token', nLimit, nOffset, false)
        ]);

        // --- pendentes ---
        if (respPending.ok) {
            const jsonP = await respPending.json().catch(() => ({}));
            const itemsP = Array.isArray(jsonP) ? jsonP : (jsonP.items ?? []);
            const tP = Array.isArray(jsonP) ? jsonP.length : jsonP.totalRecords;
            audioFilesPending.value = itemsP;
            const nP = Number(tP);
            if (Number.isFinite(nP) && nP >= 0) totalPending.value = nP;
        } else {
            console.error('Erro (pendentes):', respPending.status);
        }

        // --- não-pendentes (principal) ---
        if (respAll.ok) {
            const jsonN = await respAll.json().catch(() => ({}));
            const itemsN = Array.isArray(jsonN) ? jsonN : (jsonN.items ?? []);
            const tN = Array.isArray(jsonN) ? jsonN.length : jsonN.totalRecords;
            audioFiles.value = itemsN;
            const nN = Number(tN);
            if (Number.isFinite(nN) && nN >= 0) total.value = nN;
        } else {
            console.error('Erro (principal):', respAll.status);
        }
    } finally {
        loading.value = false;
        loadingPending.value = false;
    }
}

// paginação principal (não-pendentes)
function onPage(e) {
    first.value = e.first;
    rows.value = e.rows;
    refreshAudios(rowsPending.value, firstPending.value, e.rows, e.first);
}

// paginação pendentes (atividades recentes)
function onPagePending(e) {
    firstPending.value = e.first;
    rowsPending.value = e.rows;
    refreshAudios(e.rows, e.first, rows.value, first.value);
}

// refresh manual
function handleButtonClick() {
    refreshAudios();
}

async function detailStatus(audioId) {
    const response = await dataBack.uploadStatus('token', audioId);
    if (response.ok) {
        const json = await response.json().catch(() => ({}));
        toast.add({
            severity: 'info',
            summary: `Detalhes do Áudio ID ${audioId}`,
            detail: JSON.stringify(json, null, 2),
            life: 8000,
            sticky: true
        });
    } else {
        console.error('Erro ao buscar detalhes do áudio:', response.status);
        toast.add({
            severity: 'error',
            summary: 'Erro ao buscar detalhes',
            detail: `Status ${response.status}`,
            life: 4000
        });
    }
}

// download .wav
async function downloadAudio(audioId) {
    const response = await dataBack.downloadAudioById('token', audioId);
    if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audio_${audioId}.wav`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } else {
        console.error('Erro ao baixar áudio:', response.status);
    }
}

// upload com toast 409 (já cadastrado)
async function onUpload(event) {
    try {
        const file = event?.files?.[0];
        if (!file) return;

        const res = await dataBack.saveAudio('token', file);
        if (res.status === 409) {
            toast.add({
                severity: 'warn',
                summary: 'Áudio já cadastrado',
                detail: 'Este arquivo já existe no banco (SHA-256 duplicado).',
                life: 4000
            });
            return;
        }
        if (!(res.status === 200 || res.status === 201)) {
            console.error('Falha no upload:', res.status);
            toast.add({
                severity: 'error',
                summary: 'Falha no upload',
                detail: `Status ${res.status}`,
                life: 4000
            });
            return;
        }

        toast.add({
            severity: 'success',
            summary: 'Upload concluído',
            detail: 'Áudio enviado com sucesso.',
            life: 3000
        });

        // recarrega mantendo as páginas atuais
        await refreshAudios();
    } finally {
        event?.options?.clear?.(); // limpa o FileUpload
    }
}

// confirmação de exclusão
function confirmDelete(row) {
    confirm.require({
        message: `Tem certeza que deseja excluir este áudio?\n${row.rel_path || row.id}`,
        header: 'Confirmação',
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: 'Cancelar',
        acceptLabel: 'Excluir',
        acceptClass: 'p-button-danger',
        accept: () => deleteAudio(row.id)
    });
}

// exclusão
async function deleteAudio(audioId) {
    const response = await dataBack.deleteAudio('token', audioId);
    if (response.status === 200 || response.status === 204) {
        toast.add({
            severity: 'success',
            summary: 'Áudio excluído',
            detail: `O áudio de ID ${audioId} foi excluído com sucesso.`,
            life: 4000
        });
        await refreshAudios(); // recarrega listas
    } else {
        console.error('Erro ao excluir áudio:', response.status);
        toast.add({
            severity: 'error',
            summary: 'Erro ao excluir áudio',
            detail: `Não foi possível excluir o áudio de ID ${audioId}.`,
            life: 4000
        });
    }
}

// WebSocket (mantido)
watch(
    msgs,
    (list) => {
        const last = list[list.length - 1];
        if (!last) return;
        try {
            const item = typeof last === 'string' ? JSON.parse(last) : last;
            customers1.value.unshift({
                id: item.id ?? crypto.randomUUID?.() ?? String(Date.now()),
                name: item.rel_path ?? 'evento',
                status: item.op?.toLowerCase?.() ?? 'neutro',
                verified: item.op === 'INSERT',
                date: item.at ?? new Date().toISOString()
            });
            if (customers1.value.length > 200) customers1.value.pop();
        } catch (e) {
            console.warn('Falha ao processar WS:', e);
        }
    },
    { deep: true }
);
function nameBeforeWav(relPath) {
    const m = (relPath || '').match(/[^/\\]+(?=\.wav$)/i);
    return m ? m[0] : '';
}
// primeiro carregamento
refreshAudios();

/* --- novo estado para o player --- */
const audioDialogVisible = ref(false);
const currentAudioSrc = ref(null);
const currentAudioName = ref('');

const tableRows = computed(() =>
    audioFiles.value.flatMap((a) => [
        {
            __rowid: `${a.id}-1d`,
            audio_id: a.id,
            rel_path: a.rel_path,
            model: '1D',
            accuracy: a.model1d_confidence_score ?? null,
            emotion: a.model1d_predicted_emotion ?? null,
            processing_status: a.processing_status,
            _raw: a
        },
        {
            __rowid: `${a.id}-mm`,
            audio_id: a.id,
            rel_path: a.rel_path,
            model: 'Multimodal',
            accuracy: a.mm_confidence_score ?? null,
            emotion: a.mm_predicted_emotion ?? null,
            processing_status: a.processing_status,
            _raw: a // se precisar de mais campos
        }
    ])
);

/* limpa o blob url quando fechar */
function revokeAudioUrl() {
    if (currentAudioSrc.value) {
        URL.revokeObjectURL(currentAudioSrc.value);
        currentAudioSrc.value = null;
    }
}

// processar (analisar) 1 áudio já existente
async function analyzeAudioById(audioId) {
    try {
        const res = await dataBack.analyzeAudio('token', audioId);
        if (res.status === 200 || res.status === 202) {
            toast.add({
                severity: 'success',
                summary: 'Análise iniciada',
                detail: `Áudio ${audioId} enviado para análise.`,
                life: 4000
            });
        } else if (res.status === 409) {
            toast.add({
                severity: 'warn',
                summary: 'Já em análise',
                detail: 'Este áudio já foi enfileirado/está em processamento.',
                life: 4000
            });
        } else {
            toast.add({
                severity: 'error',
                summary: 'Falha ao analisar',
                detail: `Status ${res.status}`,
                life: 5000
            });
        }
        await refreshAudios(); // atualiza as duas listas
    } catch (e) {
        console.error(e);
        toast.add({
            severity: 'error',
            summary: 'Erro na requisição',
            detail: String(e?.message || e),
            life: 6000
        });
    }
}

/* abre o dialog e carrega o blob via DataBackService (usa Authorization) */
async function openAudioDialog(row) {
    try {
        revokeAudioUrl();
        currentAudioName.value = nameBeforeWav(row.rel_path) || `audio_${row.audio_id}`;
        currentAudioSrc.value = await dataBack.getAudioStreamUrl('token', row.audio_id);
        audioDialogVisible.value = true;
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: 'Falha ao carregar áudio',
            detail: String(e?.message || e),
            life: 5000
        });
        console.error(e);
    }
}

/* ao fechar */
function onHideAudioDialog() {
    audioDialogVisible.value = false;
    revokeAudioUrl();
}

onBeforeUnmount(revokeAudioUrl);
</script>

<template>
    <Toast />
    <ConfirmDialog />

    <div class="grid grid-cols-12 gap-4 p-4 h-full">
        <!-- Lateral esquerda: Upload Atividades Recentes (PENDENTES) -->
        <aside class="col-span-3 flex flex-col gap-4">
            <div class="card mb-2">
                <div class="col-span-full lg:col-span-6">
                    <div class="card">
                        <div class="font-semibold text-xl mb-4">Upload de Áudio</div>
                        <FileUpload
                            name="file"
                            :multiple="false"
                            accept="audio/wav, audio/*"
                            :maxFileSize="1000000"
                            customUpload
                            chooseLabel="Selecionar"
                            uploadLabel="Upload"
                            cancelLabel="Cancelar"
                            chooseIcon="pi pi-upload text-xl"
                            uploadIcon="pi pi-cloud-upload text-xl"
                            cancelIcon="pi pi-ban text-xl"
                            @uploader="onUpload"
                        />
                    </div>
                </div>
            </div>

            <div class="card flex-1">
                <div class="font-semibold text-base mb-2">Atividades Recentes</div>

                <DataTable
                    :value="audioFilesPending"
                    :lazy="true"
                    :loading="loadingPending"
                    :paginator="true"
                    :rows="rowsPending"
                    :first="firstPending"
                    :rowsPerPageOptions="[10, 15, 20, 25, 30]"
                    :totalRecords="totalPending"
                    dataKey="id"
                    :resizableColumns="true"
                    :rowHover="true"
                    showGridlines
                    @page="onPagePending"
                    paginator
                    paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    currentPageReportTemplate="{first} a {last} de {totalRecords}"
                >
                    <template #empty> Nenhum áudio pendente. </template>
                    <template #loading> Carregando pendentes... </template>
                    <template #header>
                        <div class="col-12 mb-2 m-0 p-0 mt-2">
                            <h4 class="text-center mt-2 m-0">{{ totalPending }} {{ totalPending === 1 ? 'resultado' : 'resultados' }}.</h4>
                        </div>
                    </template>

                    <Column field="rel_path" header="Nome" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ nameBeforeWav(data.rel_path) }}
                        </template>
                    </Column>

                    <Column header="Ações" style="min-width: 10rem">
                        <template #body="{ data }">
                            <Button class="p-button-rounded" icon="pi pi-send" severity="info" v-tooltip.top="'Processar'" style="width: 30px; height: 30px" @click="analyzeAudioById(data.id)" />
                            <Button class="p-button-rounded ml-2" icon="pi pi-trash" severity="danger" v-tooltip.top="'Excluir'" style="width: 30px; height: 30px" @click="confirmDelete(data)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </aside>

        <!-- Direita: Tabela principal (NÃO-PENDENTES) -->
        <main class="col-span-9">
            <div class="card h-full flex flex-col">
                <div class="flex-1 flex flex-col">
                    <div class="font-semibold text-xl mb-4">Tabela de Dados</div>

                    <DataTable
                        :value="tableRows"
                        rowGroupMode="rowspan"
                        groupRowsBy="rel_path"
                        :lazy="true"
                        stripedRows
                        rowHover
                        :loading="loading"
                        :paginator="true"
                        :rows="rows"
                        :first="first"
                        :rowsPerPageOptions="[10, 15, 20, 25, 30]"
                        :totalRecords="total"
                        dataKey="id"
                        :resizableColumns="true"
                        :rowHover="true"
                        showGridlines
                        @page="onPage"
                        paginator
                        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                        currentPageReportTemplate="{first} a {last} de {totalRecords}"
                    >
                        <template #empty> Nenhum áudio encontrado. </template>
                        <template #loading>
                            <ProgressSpinner strokeWidth="4" animationDuration="2s" class="w-full h-full" fill="transparent" />
                        </template>
                        <template #header>
                            <div class="col-12 mb-2 m-0 p-0 mt-2">
                                <h4 class="text-center mt-2 m-0">{{ total }} {{ total === 1 ? 'resultado' : 'resultados' }}.</h4>
                            </div>
                        </template>

                        <Column field="rel_path" header="Nome" style="min-width: 12rem">
                            <template #body="{ data }">
                                {{ nameBeforeWav(data.rel_path) }}
                            </template>
                        </Column>
                        <Column field="model" header="Modelo" style="min-width: 12rem" />
                        <Column header="Confiabilidade" field="accuracy" style="min-width: 10rem" />
                        <Column header="Status" field="processing_status" style="min-width: 10rem" />
                        <Column field="emotion" header="Emoção" :filterMenuStyle="{ width: '14rem' }" style="min-width: 12rem">
                            <template #body="{ data }">
                                <template v-if="getEmotionMeta(data.emotion)">
                                    <Tag :value="getEmotionMeta(data.emotion).label" :icon="getEmotionMeta(data.emotion).icon" :class="['emotion-tag', getEmotionMeta(data.emotion).cls]" />
                                </template>
                                <template v-else>
                                    <Tag value="—" class="emotion-tag emo-unknown" />
                                </template>
                            </template>
                        </Column>

                        <Column field="processing_status" header="Analisado" style="min-width: 8rem" bodyClass="text-center">
                            <template #body="{ data }">
                                <i
                                    class="pi"
                                    :class="{
                                        'pi-check-circle text-green-500': data.processing_status === 'completed',
                                        'pi-times-circle text-red-500': data.processing_status !== 'completed'
                                    }"
                                />
                            </template>
                        </Column>

                        <Column header="Ações" bodyClass="text-center" style="min-width: 10rem">
                            <template #body="{ data }">
                                <Button class="p-button-rounded" icon="pi pi-play" severity="secondary" v-tooltip.top="'Ouvir'" style="width: 30px; height: 30px" @click="openAudioDialog(data)" />
                                <Button class="p-button-rounded" icon="pi pi-search" severity="secondary" v-tooltip.top="'Recarregar listas'" style="width: 30px; height: 30px" @click="detailStatus(data.audio_id)" />
                                <Button class="p-button-rounded" icon="pi pi-send" severity="success" v-tooltip.top="'Analisar este áudio'" style="width: 30px; height: 30px" @click="analyzeAudioById(data.audio_id)" />
                                <Button class="p-button-rounded ml-1" icon="pi pi-download" severity="info" v-tooltip.top="'Baixar .wav'" style="width: 30px; height: 30px" @click="downloadAudio(data.audio_id)" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>
        </main>
    </div>
    <Dialog v-model:visible="audioDialogVisible" modal :draggable="false" header="Pré-escuta do áudio" :style="{ width: '36rem', maxWidth: '95vw' }" @hide="onHideAudioDialog">
        <div class="flex flex-col gap-3">
            <div class="text-sm opacity-80 truncate">{{ currentAudioName }}</div>
            <audio v-if="currentAudioSrc" :src="currentAudioSrc" controls style="width: 100%"></audio>
            <div v-else class="text-sm">Carregando áudio…</div>
        </div>
    </Dialog>
</template>

<style scoped>
.card {
    padding: 1rem;
    margin-bottom: 0;
}
/* ===== Tags de emoção (cores customizadas) ===== */
:deep(.emotion-tag) {
    border: 0;
    font-weight: 600;
    text-transform: lowercase;
}

/* Angry — vermelho */
:deep(.emotion-tag.emo-angry) {
    background: #fee2e2; /* red-100 */
    color: #991b1b; /* red-800 */
}

/* Disgust — verde oliva */
:deep(.emotion-tag.emo-disgust) {
    background: #e7f3d1; /* olive-ish */
    color: #3f6212; /* lime-800 approx */
}

/* Fear — âmbar/alerta */
:deep(.emotion-tag.emo-fear) {
    background: #fef3c7; /* amber-100 */
    color: #92400e; /* amber-800 */
}

/* Happy — verde sucesso */
:deep(.emotion-tag.emo-happy) {
    background: #dcfce7; /* green-100 */
    color: #166534; /* green-800 */
}

/* Neutral — cinza */
:deep(.emotion-tag.emo-neutral) {
    background: #f3f4f6; /* gray-100 */
    color: #374151; /* gray-700 */
}

/* Sadness — azul frio */
:deep(.emotion-tag.emo-sadness) {
    background: #dbeafe; /* blue-100 */
    color: #1e40af; /* blue-800 */
}

/* Surprise — roxo/acentuado */
:deep(.emotion-tag.emo-surprise) {
    background: #ede9fe; /* violet-100 */
    color: #5b21b6; /* violet-800 */
}

/* Desconhecido */
:deep(.emotion-tag.emo-unknown) {
    background: #e5e7eb; /* gray-200 */
    color: #374151; /* gray-700 */
}
</style>
