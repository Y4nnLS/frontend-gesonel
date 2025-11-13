<script setup>
/* eslint-disable */
import StatsWidget from '@/components/dashboard/StatsWidget.vue';
import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref, watch } from 'vue';

// ====== layout/composables ======
const { getPrimary, getSurface, isDarkTheme } = useLayout();

// ====== helpers de estado demo ======
const teste = ref(0);
const inputs = Array.from({ length: 10 }, () => ref(''));
function clicou() {
    teste.value++;
}

// ====== Chart refs ======
const lineData = ref(null);
const pieData = ref(null);
const pieDataMM = ref(null);
const polarData = ref(null);
const barData = ref(null);

const radarData1 = ref(null); // 1D
const radarDataMM = ref(null); // MultiModal

const lineOptions = ref(null);
const pieOptions = ref(null);
const polarOptions = ref(null);
const barOptions = ref(null);
const radarOptions = ref(null); // usado por ambos (escala em %)

// ====== Rótulos ======
const predictedLabels = ['Raiva', 'Nojo', 'Medo', 'Felicidade', 'Neutro', 'Tristeza', 'Surpresa'];

// ====== MATRIZ DE CONFUSÃO (1D) ======
const confusionMatrix = ref([
    { trueLabel: 'Raiva', Raiva: 1401, Nojo: 117, Medo: 41, Felicidade: 95, Neutro: 22, Tristeza: 15, Surpresa: 37 },
    { trueLabel: 'Nojo', Raiva: 40, Nojo: 1457, Medo: 29, Felicidade: 24, Neutro: 51, Tristeza: 114, Surpresa: 13 },
    { trueLabel: 'Medo', Raiva: 11, Nojo: 15, Medo: 1490, Felicidade: 66, Neutro: 9, Tristeza: 95, Surpresa: 42 },
    { trueLabel: 'Felicidade', Raiva: 80, Nojo: 19, Medo: 112, Felicidade: 1303, Neutro: 96, Tristeza: 39, Surpresa: 79 },
    { trueLabel: 'Neutro', Raiva: 7, Nojo: 33, Medo: 11, Felicidade: 6, Neutro: 1621, Tristeza: 50, Surpresa: 0 },
    { trueLabel: 'Tristeza', Raiva: 1, Nojo: 113, Medo: 66, Felicidade: 26, Neutro: 96, Tristeza: 1426, Surpresa: 0 },
    { trueLabel: 'Surpresa', Raiva: 37, Nojo: 14, Medo: 61, Felicidade: 93, Neutro: 14, Tristeza: 5, Surpresa: 1504 }
]);

// ====== MATRIZ DE CONFUSÃO (MultiModal) ======
const confusionMatrixMM = ref([
    { trueLabel: 'Raiva', Raiva: 1555, Nojo: 61, Medo: 7, Felicidade: 55, Neutro: 7, Tristeza: 18, Surpresa: 16 },
    { trueLabel: 'Nojo', Raiva: 25, Nojo: 1596, Medo: 12, Felicidade: 19, Neutro: 14, Tristeza: 48, Surpresa: 7 },
    { trueLabel: 'Medo', Raiva: 51, Nojo: 37, Medo: 1455, Felicidade: 56, Neutro: 23, Tristeza: 77, Surpresa: 23 },
    { trueLabel: 'Felicidade', Raiva: 49, Nojo: 29, Medo: 19, Felicidade: 1543, Neutro: 21, Tristeza: 40, Surpresa: 24 },
    { trueLabel: 'Neutro', Raiva: 13, Nojo: 40, Medo: 15, Felicidade: 12, Neutro: 1587, Tristeza: 55, Surpresa: 3 },
    { trueLabel: 'Tristeza', Raiva: 7, Nojo: 65, Medo: 32, Felicidade: 33, Neutro: 31, Tristeza: 1554, Surpresa: 4 },
    { trueLabel: 'Surpresa', Raiva: 62, Nojo: 59, Medo: 32, Felicidade: 85, Neutro: 15, Tristeza: 23, Surpresa: 1449 }
]);

// ====== KPIs dos widgets ======
const json_1d_model = { accuracy: '83.61%', recall: '83.61%', f1_score: '83.60%' };
const json_mm_model = { accuracy: '89.02%', recall: '89.02%', f1_score: '89.04%' };

// ====== init ======
onMounted(() => {
    setColorOptions();
});

// ====== charts setup (cores, dados, opções) ======
function setColorOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    // ---- BAR demo ----
    barData.value = {
        labels: ['A1', 'B1', 'C1', 'A2', 'B2', 'C2'],
        datasets: [
            {
                label: 'Acurácia (Treino)',
                backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                borderColor: documentStyle.getPropertyValue('--p-primary-500'),
                data: [92, 90, 91, 93, 89, 88]
            },
            {
                label: 'Acurácia (Teste)',
                backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                borderColor: documentStyle.getPropertyValue('--p-primary-200'),
                data: [90, 88, 89, 91, 87, 85]
            }
        ]
    };
    barOptions.value = {
        plugins: { legend: { labels: { color: textColor } } },
        scales: {
            x: { ticks: { color: textColorSecondary, font: { weight: 500 } }, grid: { display: false, drawBorder: false } },
            y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder, drawBorder: false } }
        }
    };

    // ---- PIE demo (pode ser a distribuição do dataset) ----
    pieDataMM.value = {
        labels: [...predictedLabels],
        datasets: [
            {
                data: [1719, 1721, 1722, 1725, 1725, 1726, 1725],
                backgroundColor: [
                    documentStyle.getPropertyValue('--p-indigo-500'),
                    documentStyle.getPropertyValue('--p-purple-500'),
                    documentStyle.getPropertyValue('--p-teal-500'),
                    documentStyle.getPropertyValue('--p-orange-500'),
                    documentStyle.getPropertyValue('--p-cyan-500'),
                    documentStyle.getPropertyValue('--p-yellow-500'),
                    documentStyle.getPropertyValue('--p-green-500')
                ],
                hoverBackgroundColor: [
                    documentStyle.getPropertyValue('--p-indigo-400'),
                    documentStyle.getPropertyValue('--p-purple-400'),
                    documentStyle.getPropertyValue('--p-teal-400'),
                    documentStyle.getPropertyValue('--p-orange-400'),
                    documentStyle.getPropertyValue('--p-cyan-400'),
                    documentStyle.getPropertyValue('--p-yellow-400'),
                    documentStyle.getPropertyValue('--p-green-400')
                ]
            }
        ]
    };
    pieData.value = {
        labels: [...predictedLabels],
        datasets: [
            {
                data: [1728, 1728, 1728, 1728, 1728, 1728, 1728],
                backgroundColor: [
                    documentStyle.getPropertyValue('--p-indigo-500'),
                    documentStyle.getPropertyValue('--p-purple-500'),
                    documentStyle.getPropertyValue('--p-teal-500'),
                    documentStyle.getPropertyValue('--p-orange-500'),
                    documentStyle.getPropertyValue('--p-cyan-500'),
                    documentStyle.getPropertyValue('--p-yellow-500'),
                    documentStyle.getPropertyValue('--p-green-500')
                ],
                hoverBackgroundColor: [
                    documentStyle.getPropertyValue('--p-indigo-400'),
                    documentStyle.getPropertyValue('--p-purple-400'),
                    documentStyle.getPropertyValue('--p-teal-400'),
                    documentStyle.getPropertyValue('--p-orange-400'),
                    documentStyle.getPropertyValue('--p-cyan-400'),
                    documentStyle.getPropertyValue('--p-yellow-400'),
                    documentStyle.getPropertyValue('--p-green-400')
                ]
            }
        ]
    };
    pieOptions.value = { plugins: { legend: { labels: { usePointStyle: true, color: textColor } } } };

    // ---- LINE demo ----
    lineData.value = {
        labels: ['Época 1', 'Época 2', 'Época 3', 'Época 4', 'Época 5', 'Época 6', 'Época 7', 'Época 8', 'Época 9', 'Época 10'],
        datasets: [
            { label: 'Modelo A1', data: [70, 75, 80, 82, 85, 87, 88, 89, 90, 91], fill: false, backgroundColor: documentStyle.getPropertyValue('--p-primary-500'), borderColor: documentStyle.getPropertyValue('--p-primary-500'), tension: 0.4 },
            { label: 'Modelo B1', data: [68, 73, 78, 80, 83, 85, 87, 88, 89, 90], fill: false, backgroundColor: documentStyle.getPropertyValue('--p-primary-200'), borderColor: documentStyle.getPropertyValue('--p-primary-200'), tension: 0.4 }
        ]
    };
    lineOptions.value = {
        plugins: { legend: { labels: { color: textColor } } },
        scales: {
            x: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder, drawBorder: false } },
            y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder, drawBorder: false } }
        }
    };

    // ---- POLAR demo ----
    polarData.value = {
        datasets: [
            {
                data: [11, 16, 7, 3],
                backgroundColor: [documentStyle.getPropertyValue('--p-indigo-500'), documentStyle.getPropertyValue('--p-purple-500'), documentStyle.getPropertyValue('--p-teal-500'), documentStyle.getPropertyValue('--p-orange-500')],
                label: 'Distribuição de Emoções'
            }
        ]
    };
    polarOptions.value = { plugins: { legend: { labels: { color: textColor } } }, scales: { r: { grid: { color: surfaceBorder } } } };

    // ======================================================
    // RADAR (1D) — métricas do print, em %
    // ordem: ['Raiva','Nojo','Medo','Felicidade','Neutro','Tristeza','Surpresa']
    // ======================================================
    const precision1D = [89.62, 80.29, 81.99, 79.05, 85.77, 78.77, 90.54];
    const recall1D = [80.44, 82.29, 82.99, 77.31, 93.04, 80.75, 88.08];
    const f11D = [84.78, 81.28, 82.48, 78.17, 89.15, 79.74, 89.29];

    radarData1.value = {
        labels: predictedLabels,
        datasets: [
            {
                label: 'Precisão',
                data: precision1D,
                fill: true,
                borderColor: documentStyle.getPropertyValue('--p-indigo-400'),
                pointBackgroundColor: documentStyle.getPropertyValue('--p-indigo-400'),
                pointBorderColor: documentStyle.getPropertyValue('--p-indigo-400'),
                pointHoverBorderColor: documentStyle.getPropertyValue('--p-indigo-400')
            },
            {
                label: 'Recall',
                data: recall1D,
                fill: true,
                borderColor: documentStyle.getPropertyValue('--p-teal-400'),
                pointBackgroundColor: documentStyle.getPropertyValue('--p-teal-400'),
                pointBorderColor: documentStyle.getPropertyValue('--p-teal-400'),
                pointHoverBorderColor: documentStyle.getPropertyValue('--p-teal-400')
            },
            {
                label: 'F1-Score',
                data: f11D,
                fill: true,
                borderColor: documentStyle.getPropertyValue('--p-purple-400'),
                pointBackgroundColor: documentStyle.getPropertyValue('--p-purple-400'),
                pointBorderColor: documentStyle.getPropertyValue('--p-purple-400'),
                pointHoverBorderColor: documentStyle.getPropertyValue('--p-purple-400')
            }
        ]
    };

    // ======================================================
    // RADAR (MULTIMODAL) — HARDCODED (placeholders)
    // Troque quando tiver os números reais
    // ======================================================
    const precisionMM = [88.25, 84.58, 92.56, 85.58, 93.46, 85.62, 94.95];
    const recallMM = [90.46, 92.74, 84.49, 89.45, 92.0, 90.03, 84.0];
    const f1MM = [89.34, 88.47, 88.34, 87.47, 92.73, 87.77, 89.14];

    radarDataMM.value = {
        labels: predictedLabels,
        datasets: [
            {
                label: 'Precisão',
                data: precisionMM,
                fill: true,
                borderColor: documentStyle.getPropertyValue('--p-green-400'),
                pointBackgroundColor: documentStyle.getPropertyValue('--p-green-400'),
                pointBorderColor: documentStyle.getPropertyValue('--p-green-400'),
                pointHoverBorderColor: documentStyle.getPropertyValue('--p-green-400')
            },
            {
                label: 'Recall',
                data: recallMM,
                fill: true,
                borderColor: documentStyle.getPropertyValue('--p-cyan-400'),
                pointBackgroundColor: documentStyle.getPropertyValue('--p-cyan-400'),
                pointBorderColor: documentStyle.getPropertyValue('--p-cyan-400'),
                pointHoverBorderColor: documentStyle.getPropertyValue('--p-cyan-400')
            },
            {
                label: 'F1-Score',
                data: f1MM,
                fill: true,
                borderColor: documentStyle.getPropertyValue('--p-orange-400'),
                pointBackgroundColor: documentStyle.getPropertyValue('--p-orange-400'),
                pointBorderColor: documentStyle.getPropertyValue('--p-orange-400'),
                pointHoverBorderColor: documentStyle.getPropertyValue('--p-orange-400')
            }
        ]
    };

    // ---- opções comuns ao radar (escala em %) ----
    radarOptions.value = {
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' },
            tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.r.toFixed(2)}%` } }
        },
        scales: {
            r: {
                suggestedMin: 70,
                suggestedMax: 100,
                ticks: { showLabelBackdrop: false, callback: (v) => `${v}%` },
                pointLabels: { font: { size: 12 } }
            }
        }
    };
}

// re-render ao trocar tema/cores
watch(
    [getPrimary, getSurface, isDarkTheme],
    () => {
        setColorOptions();
    },
    { immediate: true }
);

// ====== Heatmap por célula (usa matriz 1D como base para normalizar) ======
const maxValue = Math.max(...confusionMatrix.value.flatMap((row) => predictedLabels.map((k) => row[k])));

function cellStyle({ data, column }) {
    const value = data[column.field];
    const alpha = value / maxValue; // 0..1
    return {
        backgroundColor: `rgba(33,150,243,${alpha.toFixed(2)})`,
        color: alpha > 0.5 ? '#fff' : '#000',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };
}
const activeTab = ref('0'); // aba ativa: '0' = 1D, '1' = MultiModal
const refreshKey = ref(0); // força re-render dos charts

function onTabChange() {
    refreshKey.value++; // incrementa sempre que a aba muda
}
</script>

<template>
    <div class="grid items-center">
        <Tabs v-model:value="activeTab" @update:value="onTabChange">
            <TabList>
                <Tab value="0">1D</Tab>
                <Tab value="1">MultiModal</Tab>
            </TabList>

            <TabPanels>
                <!-- ===================== TAB 1D ===================== -->
                <TabPanel value="0">
                    <div class="grid mt-4 grid-cols-12 gap-4 items-center">
                        <StatsWidget :data="json_1d_model" />
                        <Divider class="col-span-12" />

                        <div class="col-span-12 grid grid-cols-2 gap-4">
                            <!-- Radar + Pie -->
                            <div class="grid grid-cols-2 gap-4">
                                <div class="card p-4 bg-white shadow-md flex flex-col">
                                    <div class="font-semibold text-xl mb-2">Perfil de Emoções (1D)</div>
                                    <div class="w-full h-[320px]">
                                        <!-- <- altura definida -->
                                        <Chart type="radar" :data="radarData1" :options="radarOptions" :key="refreshKey" class="w-full h-full" />
                                        <!-- <- preencher o container -->
                                    </div>
                                </div>

                                <div class="card p-4 bg-white shadow-md flex flex-col items-center">
                                    <div class="font-semibold text-xl mb-2">Distribuição de Emoções</div>
                                    <Chart type="pie" :data="pieData" :options="pieOptions" :key="refreshKey" />
                                </div>
                            </div>

                            <!-- Matriz 1D -->
                            <div class="card p-4 bg-white shadow-md" style="overflow: auto; max-height: 450px">
                                <div class="font-semibold text-xl mb-4">Matriz de Confusão (1D)</div>
                                <DataTable :value="confusionMatrix" showGridlines :tableStyle="{ width: '100%' }" scrollable scrollHeight="calc(100% - 2rem)">
                                    <Column field="trueLabel" header="Classe Verdadeira" :style="{ width: '15%' }" />
                                    <Column v-for="pred in predictedLabels" :key="pred" :field="pred" :header="pred" :bodyStyle="cellStyle" :style="{ textAlign: 'center', width: `${85 / predictedLabels.length}%` }" />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>

                <!-- ===================== TAB MultiModal ===================== -->
                <TabPanel value="1">
                    <div class="grid mt-4 grid-cols-12 gap-4 items-center">
                        <StatsWidget :data="json_mm_model" />
                        <Divider class="col-span-12" />

                        <div class="col-span-12 grid grid-cols-2 gap-4">
                            <!-- Radar + Pie -->
                            <div class="grid grid-cols-2 gap-4">
                                <!-- <div class="card p-4 bg-white shadow-md flex flex-col">
                                    <div class="font-semibold text-xl mb-2">Perfil de Emoções (MultiModal)</div>
                                    <div class="w-full h-[320px]">
                                        <Chart type="radar" :data="radarDataMM" :options="radarOptions" :key="refreshKey" />
                                    </div>
                                </div> -->
                                <div class="card p-4 bg-white shadow-md flex flex-col">
                                    <div class="font-semibold text-xl mb-2">Perfil de Emoções (MultiModal)</div>
                                    <div class="w-full h-[320px]">
                                        <!-- <- altura definida -->
                                        <Chart type="radar" :data="radarDataMM" :options="radarOptions" :key="refreshKey" class="w-full h-full" />
                                        <!-- <- preencher o container -->
                                    </div>
                                </div>
                                <div class="card p-4 bg-white shadow-md flex flex-col items-center">
                                    <div class="font-semibold text-xl mb-2">Distribuição de Emoções</div>
                                    <Chart type="pie" :data="pieDataMM" :options="pieOptions" :key="refreshKey" />
                                </div>
                            </div>

                            <!-- Matriz MM -->
                            <div class="card p-4 bg-white shadow-md" style="overflow: auto; max-height: 450px">
                                <div class="font-semibold text-xl mb-4">Matriz de Confusão (MultiModal)</div>
                                <DataTable :value="confusionMatrixMM" showGridlines :tableStyle="{ width: '100%' }" scrollable scrollHeight="calc(100% - 2rem)">
                                    <Column field="trueLabel" header="Classe Verdadeira" :style="{ width: '15%' }" />
                                    <Column v-for="pred in predictedLabels" :key="pred" :field="pred" :header="pred" :bodyStyle="cellStyle" :style="{ textAlign: 'center', width: `${85 / predictedLabels.length}%` }" />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>

    <Divider class="p-0 m-0" />
</template>

<style scoped>
.card {
    padding: 1rem;
    margin-bottom: 0;
}
</style>
