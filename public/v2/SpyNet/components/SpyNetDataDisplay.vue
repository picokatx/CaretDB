<template>
    <div style="height: 100%">
        <div style="height: 100%; box-sizing: border-box;">
            <ClientOnly>
                <ag-grid-vue :rowData="rowData" :columnDefs="colDefs" :defaultColDef="defaultColDef" style="height: 500px"
                    :theme="theme" @grid-ready="onGridReady" :cellSelection=true :pagination="true"
                    :paginationPageSizeSelector="[10, 25, 50, 100]" :paginationPageSize="10">
                </ag-grid-vue>
            </ClientOnly>
        </div>
    </div>
</template>

<script lang="tsx">
interface DataDisplayParams {
    relPath: string;
}

import { ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';
import { themeQuartz, colorSchemeDarkBlue } from "ag-grid-community";
import { ref } from 'vue';
import { AgGridVue } from "ag-grid-vue3";
import {
    LicenseManager,
    AdvancedFilterModule,
    type GridReadyEvent,
    type GridApi
} from "ag-grid-enterprise";
ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    AdvancedFilterModule,
]);

const myTheme = themeQuartz.withPart(colorSchemeDarkBlue).withParams({
    spacing: 2,
    backgroundColor: '#1a202c',
    foregroundColor: '#ce9178',
    headerTextColor: '#84aedf',
    headerBackgroundColor: '#42586d',
    oddRowBackgroundColor: '#2a3a55',
    headerColumnResizeHandleColor: '#84aedf',
    // there's still other colors that need to be filled in
});

export default {
    name: "App",
    data: function () {
        return {
            theme: myTheme,
        };
    },
    components: {
        AgGridVue,
    },
    props: {
        relPath: {
            type: String,
            required: true,
        },
    },
    setup(props: DataDisplayParams) {
        const gridApi = shallowRef<GridApi | null>(null);
        const rowData = ref(null);
        const defaultColDef = ref({
            editable: true,
            filter: true,
        });
        const colDefs = shallowRef<object | null>(null);
        const onGridReady = (params: GridReadyEvent) => {
            gridApi.value = params.api;
            const updateData = (data: any) => (
                rowData.value = data,
                colDefs.value = Object.keys(data[0]).map((key: string) => ({
                    field: key,
                    title: key,
                }))
            );
            fetch(props.relPath)
                .then((resp) => resp.json())
                .then((data) => {
                    updateData(data);
                });
        };
        return {
            rowData,
            colDefs,
            onGridReady,
            defaultColDef
        };
    },
};
</script>