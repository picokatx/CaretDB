<template>
    <ClientOnly>
        <ag-grid-vue :rowData="rowData" :columnDefs="colDefs" :defaultColDef="defaultColDef" class="h-screen"
            :theme="theme" @grid-ready="onGridReady" :cellSelection=true :pagination="true"
            :paginationPageSizeSelector="[10, 25, 50, 100]" :paginationPageSize="50"
            :autoSizeStrategy="autoSizeStrategy">
        </ag-grid-vue>
    </ClientOnly>
</template>
<style>
@import 'primeicons/primeicons.css';
</style>

<script lang="tsx">
interface DataDisplayParams {
    relPath: string;
}

import SpyNetTag from "./SpyNetTag.vue";
import SpyNetPrimaryKeyDisplay from "./SpyNetPrimaryKeyDisplay.vue";
import { ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';
import { themeQuartz, colorSchemeDarkBlue } from "ag-grid-community";
import { type ColDef } from 'ag-grid-community';
import { ref } from 'vue';
import { AgGridVue } from "ag-grid-vue3";
import {
    LicenseManager,
    AdvancedFilterModule,
    type GridReadyEvent,
    type GridApi,
    type SizeColumnsToContentStrategy
} from "ag-grid-enterprise";
ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    AdvancedFilterModule,
]);
const myTheme = themeQuartz.withPart(colorSchemeDarkBlue).withParams({
    spacing: 2,
    wrapperBorderRadius: 0,
    backgroundColor: '#1a202c',
    foregroundColor: '#ce9178',
    headerTextColor: '#84aedf',
    headerBackgroundColor: '#42586d',
    oddRowBackgroundColor: '#2a3a55',
    headerColumnResizeHandleColor: '#84aedf',
    // there's still other colors that need to be filled in
});
const gridApi = shallowRef<GridApi | null>(null);
const rowData = ref(null);
const defaultColDef = ref({
    editable: true,
    filter: true,
});
const colDefs = shallowRef<object | null>(null);
const colDefs_db: { [key: string]: ColDef[] } = {
    "/static_data/recording_info_collate.json": [
        { field: "recording_id", tooltipField: "recording_id", cellRenderer: "SpyNetPrimaryKeyDisplay" },
        {
            field: "split", cellRenderer: "SpyNetTag", cellClass: 'flex align-items-center justify-content-center pb-1 pt-1',
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: {
                values: ['train', 'validation', 'test', 'test_iid', 'test_geo', 'test_vis', 'test_cat', 'test_web'],
                allowTyping: true,
                filterList: true,
                highlightMatch: true,
                valueListMaxHeight: 220
            },
        },
        { field: "turn_count", },
        { field: "action_count", },
        { field: "default_viewport", },
    ],
    "/static_data/action_info_collate.json": [
        { field: "action_id", tooltipField: "action_id", cellRenderer: "SpyNetPrimaryKeyDisplay" },
        { field: "recording_id", tooltipField: "recording_id", cellRenderer: "SpyNetPrimaryKeyDisplay" },
        { field: "turn", },
        { field: "viewport", },
        {
            field: "action_type", cellRenderer: "SpyNetTag", cellClass: 'flex align-items-center justify-content-center pb-1 pt-1',
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: {
                values: ['change', 'click', 'load', 'say', 'scroll', 'submit', 'text_input'],
                allowTyping: true,
                filterList: true,
                highlightMatch: true,
                valueListMaxHeight: 220
            },
        },
        { field: "action_args", },
    ],
    "/static_data/webstate_info_collate.json": [
        { field: "recording_id", tooltipField: "recording_id", cellRenderer: "SpyNetPrimaryKeyDisplay" },
        { field: "turn", },
        { field: "clean_html", },
        { field: "candidates", },
    ],
    "/static_data/element_info_collate.json": [
        { field: "element_id", tooltipField: "element_id", cellRenderer: "SpyNetPrimaryKeyDisplay" },
        {
            field: "tag", cellRenderer: "SpyNetTag", cellClass: 'flex align-items-center justify-content-center pb-1 pt-1',
            cellEditor: 'agRichSelectCellEditor',
            cellEditorParams: {
                values: ['a',
                    'article',
                    'body',
                    'button',
                    'cite',
                    'code',
                    'details',
                    'div',
                    'em',
                    'form',
                    'ghs-router-outlet',
                    'h1',
                    'h2',
                    'h3',
                    'h5',
                    'h6',
                    'header',
                    'hr',
                    'i',
                    'img',
                    'input',
                    'label',
                    'li',
                    'line',
                    'main',
                    'p',
                    'path',
                    'section',
                    'select',
                    'source',
                    'span',
                    'svg',
                    'table',
                    'td',
                    'textarea',
                    'th',
                    'ul',
                    'use',
                    'video'],
                allowTyping: true,
                filterList: true,
                highlightMatch: true,
                valueListMaxHeight: 220
            }
        },
        { field: "xpath", },
        { field: "text", },
        { field: "bbox", },
        { field: "attributes", },
        { field: "children", },
        { field: "uid", },
    ],
};
const autoSizeStrategy = ref<SizeColumnsToContentStrategy
>({
    type: "fitCellContents",
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
        SpyNetTag,
        SpyNetPrimaryKeyDisplay
    },
    props: {
        relPath: {
            type: String,
            required: true,
        },
    },
    watch: {
        relPath(newValue: string, oldValue: string) {
            fetch(newValue)
                .then((resp) => resp.json())
                .then((data) => {
                    gridApi!.value!.setGridOption("rowData", data);
                    colDefs.value = colDefs_db[newValue];
                    gridApi!.value!.autoSizeAllColumns()
                });
        },
    },
    setup(props: DataDisplayParams) {
        const onGridReady = (params: GridReadyEvent) => {
            gridApi.value = params.api;
            const updateData = (data: any) => (
                rowData.value = data,
                colDefs.value = colDefs_db[props.relPath]
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
            defaultColDef,
            autoSizeStrategy
        };
    },
};
</script>