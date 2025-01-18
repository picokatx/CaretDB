<template>
    <div id="database-wrapper" class="card flex flex-wrap px-1">
        <Panel id="table-controls" header="Table Controls" class="mb-3 flex-grow-1 max-w-20rem">
            <Select id="command-dropdown" v-model="selCommand" :options="items" @change="run_command" optionLabel="name"
                placeholder="Run Command" class="w-full md:w-56 my-1" />
            <Select id="table-dropdown" v-model="database_table_sel" :options="database_table_items" @change="update_table"
                optionLabel="name" placeholder="Choose Table to View" class="w-full md:w-56 my-1" />
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
            <SpyNetDataDisplay class="m-0 flex-grow-1" :relPath="dataPath" />
        </div>
    </div>
    <Dialog v-model:visible="edit_profile_visible" position="center" :draggable="false" modal header="Edit Profile"
        :style="{ width: '25rem' }">
        <FloatLabel class="flex items-center my-4 mx-2">
            <label for="sql_query" class="font-semibold w-24">SQL Query</label>
            <InputText id="sql_query" class="flex-auto" autocomplete="off" />
        </FloatLabel>
        <div class="flex align-content-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="edit_profile_visible = false"></Button>
            <Button type="button" label="Run" @click="edit_profile_visible = false"></Button>
        </div>
    </Dialog>
    <Dialog v-model:visible="search_text_visible" position="center" :draggable="false" modal header="Search By Text"
        :style="{ width: '25rem' }">
        <FloatLabel class="flex items-center my-4 mx-2">
            <label for="sql_query" class="font-semibold w-24">Enter Text</label>
            <InputText id="sql_query" class="flex-auto" autocomplete="off" />
        </FloatLabel>
        <div class="flex align-content-end gap-2">
            <Button type="button" label="Cancel" severity="secondary" @click="search_text_visible = false"></Button>
            <Button type="button" label="Run" @click="search_text_visible = false"></Button>
        </div>
    </Dialog> 
    <Toast />
</template>

<style lang="scss">
@use "~/node_modules/primeflex/primeflex.min.css";
@use "~/node_modules/driver.js/dist/driver.css";
</style>

<script lang="tsx">
// npx nuxi build --prerender
// 
import { driver } from "driver.js";
import Dialog from 'primevue/dialog';
import type { SelectChangeEvent } from 'primevue/select';
var dataPath = ref("/static_data/element_info_collate.json");
var edit_profile_visible = ref(false);
var search_text_visible = ref(false);
var selCommand = ref()
var database_table_sel = ref();
const table_info = ref([
    { key: 'Table Name', value: 'element_info_collate' },
    { key: 'Size', value: '46 MB' },
    { key: 'Rows', value: '100' },
    { key: 'Columns', value: '4' },
]);
const element_info = ref([
    { key: 'Element_id', value: '5a3db53b-9d72-43c6-ace5-7d4e895a1d6c' },
    { key: 'Tag', value: 'div' },
    { key: 'Xpath', value: '/html/body/div' },
    { key: 'Text', value: 'Google' },
    { key: 'Bbox', value: '[631.0, 630.9, 55.2, 16.8]' },
    { key: 'Attributes', value: "data-webtasks-id='86e5...' class='social-button-short-text'" },
    { key: 'Children', value: "" },
    { key: 'Uid', value: "86e56c65-30b2-4505" },

]);




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
        return { username: '', password: '' };
    },
    methods: {
        run_command(event: SelectChangeEvent) {
            switch (selCommand.value.code) {
                case 'taiga.command.sql_query':
                    edit_profile_visible.value = true;
                    break;
                case 'taiga.command.search_text':
                    search_text_visible.value = true;
                    break;
            }
        },
        update_table(event: SelectChangeEvent) {
            dataPath.value = `/static_data/${database_table_sel.value.code}.json`;
        }
    },
    mounted() {
        driverObj.drive();
    },
    setup() {
        return {
            items,
            edit_profile_visible,
            search_text_visible,
            breadcrumb_items,
            home,
            database_table_items,
            dataPath,
            selCommand,
            database_table_sel,
            table_info,
            element_info
        }
    }
}
</script>
