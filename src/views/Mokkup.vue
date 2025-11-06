<script setup>
/* eslint-disable */
import StatsWidget from '@/components/dashboard/StatsWidget.vue';
import { ref } from 'vue';

const teste = ref(0);
const inputs = Array.from({ length: 10 }, () => ref(''));

function clicou() {
    teste.value++;
}

import { useLayout } from '@/layout/composables/layout';
import { onMounted, watch } from 'vue';

const { getPrimary, getSurface, isDarkTheme } = useLayout();
const lineData = ref(null);
const pieData = ref(null);
const polarData = ref(null);
const barData = ref(null);
const radarData1 = ref(null);
const radarData2 = ref(null);
const lineOptions = ref(null);
const pieOptions = ref(null);
const polarOptions = ref(null);
const barOptions = ref(null);
const radarOptions = ref(null);

const predictedLabels = ['Felicidade', 'Tristeza', 'Raiva', 'Medo', 'Neutro', 'Surpresa', 'Nojo'];

// Matriz de confusão com as 7 emoções
const confusionMatrix = ref([
    { trueLabel: 'Felicidade', Felicidade: 50, Tristeza: 2, Raiva: 1, Medo: 0, Neutro: 2, Surpresa: 1, Nojo: 0 },
    { trueLabel: 'Tristeza', Felicidade: 3, Tristeza: 45, Raiva: 0, Medo: 1, Neutro: 1, Surpresa: 2, Nojo: 0 },
    { trueLabel: 'Raiva', Felicidade: 2, Tristeza: 1, Raiva: 40, Medo: 4, Neutro: 3, Surpresa: 0, Nojo: 1 },
    { trueLabel: 'Medo', Felicidade: 0, Tristeza: 1, Raiva: 3, Medo: 42, Neutro: 4, Surpresa: 0, Nojo: 2 },
    { trueLabel: 'Neutro', Felicidade: 1, Tristeza: 2, Raiva: 2, Medo: 3, Neutro: 47, Surpresa: 1, Nojo: 1 },
    { trueLabel: 'Surpresa', Felicidade: 1, Tristeza: 2, Raiva: 2, Medo: 3, Neutro: 5, Surpresa: 35, Nojo: 2 },
    { trueLabel: 'Nojo', Felicidade: 1, Tristeza: 2, Raiva: 2, Medo: 3, Neutro: 4, Surpresa: 1, Nojo: 37 }
]);

onMounted(() => {
    setColorOptions();
});

function setColorOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

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
        plugins: {
            legend: {
                labels: {
                    fontColor: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary,
                    font: {
                        weight: 500
                    }
                },
                grid: {
                    display: false,
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            }
        }
    };

    pieData.value = {
        labels: [...predictedLabels],
        datasets: [
            {
                data: [20, 15, 25, 30, 10, 18, 12], // valores simulados
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

    pieOptions.value = {
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    color: textColor
                }
            }
        }
    };

    lineData.value = {
        labels: ['Época 1', 'Época 2', 'Época 3', 'Época 4', 'Época 5', 'Época 6', 'Época 7', 'Época 8', 'Época 9', 'Época 10'],
        datasets: [
            {
                label: 'Modelo A1',
                data: [70, 75, 80, 82, 85, 87, 88, 89, 90, 91],
                fill: false,
                backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                borderColor: documentStyle.getPropertyValue('--p-primary-500'),
                tension: 0.4
            },
            {
                label: 'Modelo B1',
                data: [68, 73, 78, 80, 83, 85, 87, 88, 89, 90],
                fill: false,
                backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                borderColor: documentStyle.getPropertyValue('--p-primary-200'),
                tension: 0.4
            }
        ]
    };

    lineOptions.value = {
        plugins: {
            legend: {
                labels: {
                    fontColor: textColor
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            },
            y: {
                ticks: {
                    color: textColorSecondary
                },
                grid: {
                    color: surfaceBorder,
                    drawBorder: false
                }
            }
        }
    };

    polarData.value = {
        datasets: [
            {
                data: [11, 16, 7, 3],
                backgroundColor: [documentStyle.getPropertyValue('--p-indigo-500'), documentStyle.getPropertyValue('--p-purple-500'), documentStyle.getPropertyValue('--p-teal-500'), documentStyle.getPropertyValue('--p-orange-500')],
                label: 'My dataset'
            }
        ],
        label: 'Distribuição de Emoções'
    };

    polarOptions.value = {
        plugins: {
            legend: {
                labels: {
                    color: textColor
                }
            }
        },
        scales: {
            r: {
                grid: {
                    color: surfaceBorder
                }
            }
        }
    };

    radarData2.value = {
        labels: ['Felicidade', 'Tristeza', 'Raiva', 'Medo', 'Surpresa', 'Nojo', 'Neutro'],
        datasets: [
            {
                label: 'Modelo A1',
                borderColor: documentStyle.getPropertyValue('--p-indigo-400'),
                pointBackgroundColor: documentStyle.getPropertyValue('--p-indigo-400'),
                pointBorderColor: documentStyle.getPropertyValue('--p-indigo-400'),
                pointHoverBackgroundColor: textColor,
                pointHoverBorderColor: documentStyle.getPropertyValue('--p-indigo-400'),
                data: [65, 59, 90, 81, 56, 55, 40]
            },
            {
                label: 'Modelo A2',
                borderColor: documentStyle.getPropertyValue('--p-purple-400'),
                pointBackgroundColor: documentStyle.getPropertyValue('--p-purple-400'),
                pointBorderColor: documentStyle.getPropertyValue('--p-purple-400'),
                pointHoverBackgroundColor: textColor,
                pointHoverBorderColor: documentStyle.getPropertyValue('--p-purple-400'),
                data: [28, 48, 40, 19, 96, 27, 100]
            }
        ]
    };

    radarData1.value = {
        labels: ['Felicidade', 'Tristeza', 'Raiva', 'Medo', 'Surpresa', 'Nojo', 'Neutro'],
        datasets: [
            {
                label: 'Modelo A1',
                borderColor: documentStyle.getPropertyValue('--p-indigo-400'),
                pointBackgroundColor: documentStyle.getPropertyValue('--p-indigo-400'),
                pointBorderColor: documentStyle.getPropertyValue('--p-indigo-400'),
                pointHoverBackgroundColor: textColor,
                pointHoverBorderColor: documentStyle.getPropertyValue('--p-indigo-400'),
                data: [65, 59, 90, 81, 56, 55, 40]
            }
        ]
    };

    radarOptions.value = {
        plugins: {
            legend: {
                labels: {
                    fontColor: textColor
                }
            }
        },
        scales: {
            r: {
                grid: {
                    color: textColorSecondary
                }
            }
        }
    };
}

watch(
    [getPrimary, getSurface, isDarkTheme],
    () => {
        setColorOptions();
    },
    { immediate: true }
);

// calcula o máximo pra normalizar
const maxValue = Math.max(...confusionMatrix.value.flatMap((row) => predictedLabels.map((k) => row[k])));

// função que retorna um objeto de estilos dinâmico
function cellStyle({ data, column }) {
    const value = data[column.field];
    const alpha = value / maxValue; // normaliza entre 0 e 1
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
</script>

<template>
    <!-- Container Grid -->
    <!-- <div class="grid grid-cols-12 items-center">
        <div class="col-span-9">
            <h2 class="text-left">Dashboard com dados mockados</h2>
        </div>
        <div class="col-span-3 grid grid-cols-3 gap-2">
            <Button label="Tela 1" :onClick="clicou"></Button>
            <Button label="Tela 2" disabled="true" :onClick="clicou"></Button>
            <Button label="Tela 3" disabled="true" :onClick="clicou"></Button>
        </div>
    </div> -->

    <div class="grid mt-4 grid-cols-12 gap-4 items-center">
        <StatsWidget />
    </div>

    <Divider class="p-0 m-0" />
    <div class="grid grid-cols-12 gap-4 mt-4">
        <!-- Container dos Gráficos - 2x2 -->
        <!-- <div class="col-span-12 grid grid-cols-2 gap-4">
            <div class="card p-4 bg-white shadow-md flex flex-col items-center">
                <div class="font-semibold text-xl mb-2">Evolução da Acurácia por Época</div>
                <Chart type="line" :data="lineData" :options="lineOptions"></Chart>
            </div>

            <div class="card p-4 bg-white shadow-md flex flex-col items-center">
                <div class="font-semibold text-xl mb-2">Comparação de Acurácia: Treino vs. Teste</div>
                <Chart type="bar" :data="barData" :options="barOptions"></Chart>
            </div>
        </div> -->
        <div class="col-span-12 grid grid-cols-3 gap-4">
            <!-- Gráfico Radar -->
            <div class="card p-4 bg-white shadow-md flex flex-col items-center">
                <div class="font-semibold text-xl mb-2">Perfil de Emoções</div>
                <Chart type="radar" :data="radarData1" :options="radarOptions"></Chart>
            </div>

            <!-- Gráfico Pie -->
            <div class="card p-4 bg-white shadow-md flex flex-col items-center">
                <div class="font-semibold text-xl mb-2">Distribuição de Emoções</div>
                <Chart type="pie" :data="pieData" :options="pieOptions"></Chart>
            </div>

            <div class="card p-4 bg-white shadow-md" style="overflow: auto; max-height: 450px">
                <div class="font-semibold text-xl mb-4">Matriz de Confusão</div>

                <DataTable :value="confusionMatrix" showGridlines :tableStyle="{ width: '100%' }" scrollable scrollHeight="calc(100% - 2rem)">
                    <Column field="trueLabel" header="Classe Verdadeira" :style="{ width: '15%' }" />

                    <Column v-for="pred in predictedLabels" :key="pred" :field="pred" :header="pred" :bodyStyle="cellStyle" :style="{ textAlign: 'center', width: `${85 / predictedLabels.length}%` }" />
                </DataTable>
            </div>
        </div>
    </div>
</template>
<style scoped>
.card {
    padding: 1rem;
    margin-bottom: 0;
}
</style>
