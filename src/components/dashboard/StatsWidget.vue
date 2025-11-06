<template>
    <!-- Precision -->
    <div class="col-span-12 lg:col-span-6 xl:col-span-4">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Precision</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">95%</div>
                </div>
                <div class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-bullseye text-green-500 !text-xl"></i>
                </div>
            </div>
            <span class="text-primary font-medium">Precision média</span>
            <span class="text-muted-color">última execução</span>
        </div>
    </div>

    <!-- Recall -->
    <div class="col-span-12 lg:col-span-6 xl:col-span-4">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Recall</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">88%</div>
                </div>
                <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-refresh text-blue-500 !text-xl"></i>
                </div>
            </div>
            <span class="text-primary font-medium">Recall médio</span>
            <span class="text-muted-color">última execução</span>
        </div>
    </div>

    <!-- F1-score -->
    <div class="col-span-12 lg:col-span-6 xl:col-span-4">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">F1-score</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">91%</div>
                </div>
                <div class="flex items-center justify-center bg-yellow-100 dark:bg-yellow-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-star text-yellow-500 !text-xl"></i>
                </div>
            </div>
            <span class="text-primary font-medium">F1-score médio</span>
            <span class="text-muted-color">última execução</span>
        </div>
    </div>

    <!-- Validação Cruzada -->
    <!-- <div class="col-span-12 lg:col-span-6 xl:col-span-3">
        <div class="card mb-0">
            <div class="flex justify-between mb-4">
                <div>
                    <span class="block text-muted-color font-medium mb-4">Support</span>
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">92%</div>
                </div>
                <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                    <i class="pi pi-th-large text-purple-500 !text-xl"></i>
                </div>
            </div>
            <span class="text-primary font-medium">k-fold = 5</span>
            <span class="text-muted-color">média de acurácia</span>
        </div>
    </div> -->
</template>
