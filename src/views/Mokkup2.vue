<script setup>
/* eslint-disable */
import { ref, watch } from 'vue';
import { useWsAudioUpdates } from '../layout/composables/useWsAudioUpdates.js';
import * as dataBack from '../service/DataBackService.js';
import cust1 from './cust1.json';

const { msgs } = useWsAudioUpdates();

const audioFiles = ref([]);
const total = ref(0); // total de registros (se o back enviar)
const rows = ref(20); // page size (limit)
const first = ref(0); // offset
const loading = ref(false);

const customers1 = ref(cust1);

function getSeverity(status) {
    switch ((status || '').toLowerCase()) {
        case 'angry':
            return 'danger';
        case 'happy':
            return 'success';
        case 'sad':
            return 'info';
        case 'desgosto':
            return 'warning'; // em PrimeVue é 'warning'
        case 'tristeza':
            return null;
        default:
            return null;
    }
}

async function getAllAudios(limit = rows.value, offset = first.value) {
    loading.value = true;
    const response = await dataBack.getAudios('token', limit, offset);
    if (response.ok) {
        const json = await response.json().catch(() => ({}));

        // aceita { items, total } e garante número
        const items = Array.isArray(json) ? json : (json.items ?? []);
        const t = Array.isArray(json) ? json.length : json.totalRecords;

        audioFiles.value = items;

        // só atualiza se vier um número válido; nunca zera por engano
        const n = Number(t);
        if (Number.isFinite(n) && n >= 0) {
            total.value = n;
        }
    } else {
        console.error('Erro:', response.status);
    }
    loading.value = false;
}

function onPage(e) {
    // PrimeVue passa: e.first (offset), e.rows (limit), e.page
    first.value = e.first;
    rows.value = e.rows;
    getAllAudios(e.rows, e.first);
}

function handleButtonClick() {
    getAllAudios(); // recarrega a página atual
}

async function downloadAudio(audioId) {
    const response = await dataBack.downloadAudioById('token', audioId);
    if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audio_${audioId}.wav`; // ou outro nome adequado
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } else {
        console.error('Erro ao baixar áudio:', response.status);
    }
}
// WS (mantive seu código)
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

// primeiro carregamento
getAllAudios();
</script>

<template>
    <div class="grid grid-cols-12 gap-4 p-4 h-full">
        <aside class="col-span-3 flex flex-col gap-4">
            <div class="card mb-2">
                <div class="col-span-full lg:col-span-6">
                    <div class="card">
                        <div class="font-semibold text-xl mb-4">Upload de Áudio</div>
                        <!-- @uploader="onUpload" -->
                        <FileUpload
                            name="demo[]"
                            :multiple="true"
                            accept="image/*"
                            :maxFileSize="1000000"
                            customUpload
                            chooseLabel="Selecionar"
                            uploadLabel="Upload"
                            cancelLabel="Cancelar"
                            chooseIcon="pi pi-upload text-xl"
                            uploadIcon="pi pi-cloud-upload text-xl"
                            cancelIcon="pi pi-ban text-xl"
                            D
                        />
                    </div>
                </div>
            </div>
            <div class="card flex-1">
                <div class="font-semibold text-base mb-2">Atividades Recentes</div>
                <DataTable
                    :value="customers1"
                    :paginator="true"
                    :rows="20"
                    dataKey="id"
                    :resizableColumns="true"
                    :rowHover="true"
                    showGridlines
                    paginator
                    paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                    currentPageReportTemplate="{first} to {last} of {totalRecords}"
                >
                    <template #empty> No customers found. </template>
                    <template #loading> Loading customers data. Please wait. </template>
                    <Column field="name" header="Nome" style="min-width: 12rem">
                        <template #body="{ data }"> {{ data.id }} </template>
                    </Column>
                    <Column header="Dados" filterField="Data" dataType="date"> </Column>
                    <Column header="Ações" filterField="balance" dataType="numeric"> </Column>
                </DataTable>
            </div>
        </aside>

        <main class="col-span-9">
            <div class="card h-full flex flex-col">
                <div class="flex-1 flex flex-col">
                    <div class="font-semibold text-xl mb-4">Tabela de Dados</div>
                    <DataTable
                        :value="audioFiles"
                        :lazy="true"
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
                    >
                        <template #empty> Nenhum áudio encontrado. </template>
                        <template #loading> <ProgressSpinner strokeWidth="4" animationDuration="2s" class="w-full h-full" fill="transparent" /> </template>
                        <template #header
                            ><div class="col-12 mb-2 m-0 p-0 mt-2">
                                <h4 class="text-center mt-2 m-0">{{ total }} {{ total === 1 ? 'resultado' : 'resultados' }}.</h4>
                            </div></template
                        >
                        <Column field="rel_path" header="Nome" style="min-width: 12rem" />
                        <Column header="Dados" field="confidence_score" style="min-width: 10rem" />
                        <Column header="Status" field="processing_status" style="min-width: 10rem" />
                        <Column header="Emoção" field="predicted_emotion" :filterMenuStyle="{ width: '14rem' }" style="min-width: 12rem">
                            <template #body="{ data }">
                                <Tag :value="data.predicted_emotion ?? '—'" :severity="getSeverity(data.predicted_emotion)" />
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
                                ></i>
                            </template>
                        </Column>
                        <Column header="Ações" bodyClass="text-center" style="min-width: 8rem">
                            <template #body="{ data }">
                                <Button class="p-button-rounded" icon="pi pi-refresh" severity="success" style="width: 30px; height: 30px" @click="handleButtonClick" />
                                <Button class="p-button-rounded ml-1" icon="pi pi-download" severity="info" style="width: 30px; height: 30px" @click="downloadAudio(data.id)" />
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>
        </main>
    </div>
</template>
<style scoped>
.card {
    padding: 1rem;
    margin-bottom: 0;
}
</style>
