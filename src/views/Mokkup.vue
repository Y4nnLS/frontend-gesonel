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
const radarData = ref(null);
const lineOptions = ref(null);
const pieOptions = ref(null);
const polarOptions = ref(null);
const barOptions = ref(null);
const radarOptions = ref(null);

onMounted(() => {
    setColorOptions();
});

function setColorOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    barData.value = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
            {
                label: 'My First dataset',
                backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                borderColor: documentStyle.getPropertyValue('--p-primary-500'),
                data: [65, 59, 80, 81, 56, 55, 40]
            },
            {
                label: 'My Second dataset',
                backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                borderColor: documentStyle.getPropertyValue('--p-primary-200'),
                data: [28, 48, 40, 19, 86, 27, 90]
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
        labels: ['A', 'B', 'C'],
        datasets: [
            {
                data: [540, 325, 702],
                backgroundColor: [documentStyle.getPropertyValue('--p-indigo-500'), documentStyle.getPropertyValue('--p-purple-500'), documentStyle.getPropertyValue('--p-teal-500')],
                hoverBackgroundColor: [documentStyle.getPropertyValue('--p-indigo-400'), documentStyle.getPropertyValue('--p-purple-400'), documentStyle.getPropertyValue('--p-teal-400')]
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
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
            {
                label: 'First Dataset',
                data: [65, 59, 80, 81, 56, 55, 40],
                fill: false,
                backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                borderColor: documentStyle.getPropertyValue('--p-primary-500'),
                tension: 0.4
            },
            {
                label: 'Second Dataset',
                data: [28, 48, 40, 19, 86, 27, 90],
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
        labels: ['Indigo', 'Purple', 'Teal', 'Orange']
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

    radarData.value = {
        labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
        datasets: [
            {
                label: 'My First dataset',
                borderColor: documentStyle.getPropertyValue('--p-indigo-400'),
                pointBackgroundColor: documentStyle.getPropertyValue('--p-indigo-400'),
                pointBorderColor: documentStyle.getPropertyValue('--p-indigo-400'),
                pointHoverBackgroundColor: textColor,
                pointHoverBorderColor: documentStyle.getPropertyValue('--p-indigo-400'),
                data: [65, 59, 90, 81, 56, 55, 40]
            },
            {
                label: 'My Second dataset',
                borderColor: documentStyle.getPropertyValue('--p-purple-400'),
                pointBackgroundColor: documentStyle.getPropertyValue('--p-purple-400'),
                pointBorderColor: documentStyle.getPropertyValue('--p-purple-400'),
                pointHoverBackgroundColor: textColor,
                pointHoverBorderColor: documentStyle.getPropertyValue('--p-purple-400'),
                data: [28, 48, 40, 19, 96, 27, 100]
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
</script>

<template>
    <!-- Container Grid -->
    <div class="grid grid-cols-12 items-center">
        <!-- Título à esquerda ocupando 9 colunas -->
        <div class="col-span-9">
            <h2 class="text-left">Dashboard com dados mockados</h2>
        </div>
        <!-- Botões à direita ocupando 3 colunas -->
        <div class="col-span-3 grid grid-cols-3 gap-2">
            <Button label="Tela 1" :onClick="clicou"></Button>
            <Button label="Tela 2" disabled="true" :onClick="clicou"></Button>
            <Button label="Tela 3" disabled="true" :onClick="clicou"></Button>
        </div>
    </div>

    <!-- Conteúdo Principal -->
    <!-- Linha ocupando col-12 com 10 cards -->
    <div class="grid grid-cols-12 gap-2 mt-4">
        <!-- Card 1 -->
        <div class="card col-span-3 p-1 flex flex-col items-center bg-white shadow-sm">
            <label class="text-sm mb-2">Lorem ipsum</label>
            <InputText type="text" v-model="inputs[0]" class="border border-gray-300 p-1 w-full text-center" />
        </div>

        <!-- Card 2 -->
        <div class="card col-span-2 p-1 flex flex-col items-center bg-white shadow-sm">
            <label class="text-sm mb-2">Lorem ipsum</label>
            <InputText type="text" v-model="inputs[1]" class="border border-gray-300 p-1 w-full text-center" />
        </div>

        <!-- Card 6 -->
        <div class="card col-span-1 p-1 flex flex-col items-center bg-white shadow-sm">
            <label class="text-sm mb-2">Lorem ipsum</label>
            <InputText type="text" v-model="inputs[5]" class="border border-gray-300 p-1 w-full text-center" />
        </div>

        <!-- Card 7 -->
        <div class="card col-span-1 p-1 flex flex-col items-center bg-white shadow-sm">
            <label class="text-sm mb-2">Lorem ipsum</label>
            <InputText type="text" v-model="inputs[6]" class="border border-gray-300 p-1 w-full text-center" />
        </div>

        <!-- Card 9 -->
        <div class="card col-span-2 p-1 flex flex-col items-center bg-white shadow-sm">
            <label class="text-sm mb-2">Lorem ipsum</label>
            <InputText type="text" v-model="inputs[8]" class="border border-gray-300 p-1 w-full text-center" />
        </div>

        <!-- Card 10 -->
        <div class="card col-span-3 p-1 flex flex-col items-center bg-white shadow-sm">
            <label class="text-sm mb-2">Lorem ipsum</label>
            <InputText type="text" v-model="inputs[9]" class="border border-gray-300 p-1 w-full text-center" />
        </div>
    </div>
    <Divider class="p-0 m-0" />

    <div class="grid mt-4 grid-cols-12 gap-4 items-center">
        <StatsWidget />
    </div>

    <Divider class="p-0 m-0" />
    <div class="grid grid-cols-12 gap-4 mt-4">
        <!-- Container dos Gráficos - 2x2 -->
        <div class="col-span-12 grid grid-cols-2 gap-4">
            <!-- Gráfico Linear -->
            <div class="card p-4 bg-white shadow-md flex flex-col items-center">
                <div class="font-semibold text-xl mb-2">Linear</div>
                <Chart type="line" :data="lineData" :options="lineOptions"></Chart>
            </div>

            <!-- Gráfico de Barras -->
            <div class="card p-4 bg-white shadow-md flex flex-col items-center">
                <div class="font-semibold text-xl mb-2">Bar</div>
                <Chart type="bar" :data="barData" :options="barOptions"></Chart>
            </div>

            <!-- Gráfico Pie -->
            <div class="card p-4 bg-white shadow-md flex flex-col items-center">
                <div class="font-semibold text-xl mb-2">Pie</div>
                <Chart type="pie" :data="pieData" :options="pieOptions"></Chart>
            </div>

            <!-- Gráfico Radar -->
            <div class="card p-4 bg-white shadow-md flex flex-col items-center">
                <div class="font-semibold text-xl mb-2">Radar</div>
                <Chart type="radar" :data="radarData" :options="radarOptions"></Chart>
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
