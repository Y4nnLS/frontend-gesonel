<script setup>
/* eslint-disable */
import { ref } from 'vue';
import cust1 from './cust1.json';

const customers1 = ref(cust1);

function getSeverity(status) {
    switch (status) {
        case 'raiva':
            return 'danger';

        case 'felicidade':
            return 'success';

        case 'neutro':
            return 'info';

        case 'desgosto':
            return 'warn';

        case 'tristeza':
            return null;
    }
}

function handleButtonClick(data) {
    console.warn(data);
}
</script>

<template>
    <div class="grid grid-cols-12 gap-4 p-4 h-full">
        <aside class="col-span-3 flex flex-col gap-4">
            <div class="card mb-2">
                <div class="col-span-full lg:col-span-6">
                    <div class="card">
                        <div class="font-semibold text-xl mb-4">Upload de Áudio</div>
                        <FileUpload
                            name="demo[]"
                            @uploader="onUpload"
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
                    :rows="18"
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
                        <template #body="{ data }"> </template>
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
                    <DataTable :value="customers1" :paginator="true" :rows="11" dataKey="id" :resizableColumns="true" :rowHover="true" showGridlines>
                        <template #empty> No customers found. </template>
                        <template #loading> Loading customers data. Please wait. </template>
                        <Column field="name" header="Nome" style="min-width: 12rem">
                            <template #body="{ data }"> </template>
                        </Column>
                        <Column header="Dados" filterField="date" dataType="date" style="min-width: 10rem" />
                        <Column header="Status" filterField="balance" dataType="numeric" style="min-width: 10rem" />
                        <Column header="Emoções" field="status" :filterMenuStyle="{ width: '14rem' }" style="min-width: 12rem">
                            <template #body="{ data }">
                                <Tag :value="data.status" :severity="getSeverity(data.status)" />
                            </template>
                        </Column>
                        <Column field="verified" header="Analisado" dataType="boolean" bodyClass="text-center" style="min-width: 8rem">
                            <template #body="{ data }">
                                <i class="pi" :class="{ 'pi-check-circle text-green-500 ': data.verified, 'pi-times-circle text-red-500': !data.verified }"></i>
                            </template>
                        </Column>
                        <Column header="Ações" dataType="boolean" bodyClass="text-center" style="min-width: 8rem">
                            <template #body="{ data }">
                                <Button class="p-button-rounded" icon="pi pi-upload" severity="success" style="width: 30px; height: 30px" @click="handleButtonClick(data)"></Button>
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
