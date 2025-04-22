<template>
    <div id="database-wrapper" class="card flex flex-wrap px-1">
        <Panel id="table-controls" header="Table Controls" class="mb-3 flex-grow-1 max-w-20rem">
            
            <Divider />
            <Fieldset id="table-info" legend="Table Info" class="w-12">
                <DataTable :value="table_info" size="small" class="w-15rem" tableStyle="max-width: 2rem">
                    <Column field="key" header="Key"></Column>
                    <Column field="value" header="Value"></Column>
                </DataTable>
            </Fieldset>
            <Fieldset id="element-info" legend="Element Info" class="w-12">
                <DataTable :value="element_info" size="small" class="w-15rem" tableStyle="max-width: 2rem">
                    <Column field="key" header="Key"></Column>
                    <Column field="value" header="Value"></Column>
                </DataTable>
            </Fieldset>
        </Panel>
        <Divider layout="vertical" class='mb-3 hidden sm:block' />
        <div id="data-table" header="Data Table" class="mb-3 flex-grow-1">
            <SpyNetDataDisplay class="m-0 flex-grow-1" />
        </div>
    </div>
</template>

<style lang="scss">
@use "../../node_modules/primeflex/primeflex.min.css";
@use "../../node_modules/driver.js/dist/driver.css";
@use "../../src/styles/app.css";
</style>

<script setup lang="tsx">
import SpyNetDataDisplay from './SpyNetDataDisplay.vue';
</script>

<script lang="tsx">
import { driver } from "driver.js";
import { ref } from 'vue';

const driverObj = driver({
    popoverClass: 'taiga-theme',
    showProgress: true,
    steps: [
        {
            element: '#database-wrapper', popover: {
                title: 'Intro to SpyNet',
                description: 'Hi! Let me guide you through the SpyNet User Interface. Use < and > to advance the tour.',
                side: "top",
                align: 'center'
            }
        },
        { element: '#table-controls', popover: { title: 'Overview', description: 'on the left hand side are the table controls. these allow us to view and modify information about the database' } },
        { element: '#data-table', popover: { title: 'Overview', description: 'on the right hand side is the data table. It displays data from your database' } },
        { element: '#table-controls', popover: { title: 'Table Controls', description: 'Let us start with the controls first' } },
        { element: '#command-dropdown', popover: { title: 'Table Controls', description: 'Trigger an SQL query or text search on the database using this dropdown' } },
        { element: '#table-dropdown', popover: { title: 'Table Controls', description: 'Select the table to view using this dropdown' } },
        { element: '#table-info', popover: { title: 'Table Controls', description: 'Table metadata is shown here. (disclaimer: not functional in this build)' } },
        { element: '#element-info', popover: { title: 'Table Controls', description: 'Element metadata is shown here. (disclaimer: not functional in this build)' } },
        { element: '#table-controls', popover: { title: 'Table Controls', description: 'Other information about the table can also be displayed here' } },
        { element: '#data-table', popover: { title: 'Data-Table', description: 'Let\'s move on to the data table' } },
        { element: '.ag-header-cell:nth-child(1)', popover: { title: 'Data-Table', description: 'Each column has a header with some functionality' } },
        { element: '.ag-header-cell-menu-button:nth-child(1)', popover: { title: 'Data-Table', description: 'The Menu button creates a dropdown to sort, autosize, or pin a column.' } },
        
        { element: '.ag-icon-filter:nth-child(1)', popover: { title: 'Data-Table', description: 'The Filter button creates a multiselect to choose which cell values to include' } },
        
        { element: '.ag-header-cell-resize:nth-child(1)', popover: { title: 'Data-Table', description: 'Drag this divider to resize a column manually' } },
        { element: '.ag-body-viewport:nth-child(1)', popover: { title: 'Data-Table', description: 'Now we move on to the rows.' } },
        { element: '.ag-row-first:nth-child(1)', popover: { title: 'Data-Table', description: 'Each row has a key denoted by a link icon. Hover over the link to see the actual key' } },
        { element: '.ag-cell:nth-child(2)', popover: { title: 'Data-Table', description: 'You can double click cells to edit them. Some may have dropdowns to choose values from.' } },
        { element: '.ag-body-viewport:nth-child(1)', popover: { title: 'Data-Table', description: 'You can also right click a cell for more actions.' } },
        { element: '.ag-body-viewport:nth-child(1)', popover: { title: 'Data-Table', description: 'drag and hold to do actions on multiple cells. (doesn\t work in this tour)' } },
        { element: '.ag-paging-panel', popover: { title: 'Data-Table', description: 'Now let\'s talk about the footer' } },
        { element: '.ag-paging-page-summary-panel', popover: { title: 'Data-Table', description: 'Click the arrows to navigate up and down the table' } },
        { element: '.ag-picker-field:nth-child(1)', popover: { title: 'Data-Table', description: 'You can also adjust the number of rows displayed in the table.' } },
        {
            element: '#database-wrapper', popover: {
                title: 'Have Fun!',
                description: 'That\'s all, we hope you will enjoy using SpyNet!',
                side: "top",
                align: 'center'
            }
        },
    ]
});

const home = ref({
    icon: 'pi pi-home'
});
const breadcrumb_items = ref([
    { label: 'Database' },
]);
const database_table_items = ref([
    {
        name: 'Recordings',
        code: 'recording_info_collate'
    },
    {
        name: 'Actions',
        code: 'action_info_collate'
    },
    {
        name: 'Webstates',
        code: 'webstate_info_collate'
    },
    {
        name: 'Elements',
        code: 'element_info_collate'
    }
]);
const items: any = ref([
    {
        name: 'SQL Query',
        code: 'taiga.command.sql_query'
    },
    {
        name: 'Search Text',
        code: 'taiga.command.search_text'
    },
])
export default {
    data: function () {
    },
    methods: {
    },
    mounted() {
        driverObj.drive();
    },
    setup() {
        return {
            items,
            breadcrumb_items,
            home,
            database_table_items,
        }
    }
}
</script>
