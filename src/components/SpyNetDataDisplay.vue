<template>
    <Textarea id="sql-query" placeholder="Enter SQL Query" class="w-full" v-model="sqlQuery" />
    <Button id="run-query" label="Run Query" class="w-full" @click="onRunQuery" />

    <ag-grid-vue :columnDefs="colDefs" style="height: 500px" :theme="myTheme" rowModelType="serverSide"
      :defaultColDef="defaultColDef" :cellSelection=true :pagination="true"
      :paginationPageSizeSelector="[10, 25, 50, 100]" :paginationPageSize="50"
      @grid-ready="onGridReady" :autoSizeStrategy="autoSizeStrategy">
    </ag-grid-vue>
</template>

<script setup lang="ts">
import Textarea from 'primevue/textarea';
import { ref, shallowRef, type Ref } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import { themeQuartz, colorSchemeDarkBlue, type GridReadyEvent, type IServerSideGetRowsRequest, type SizeColumnsToContentStrategy } from "ag-grid-enterprise";
import {
  AllEnterpriseModule,
  ModuleRegistry,
  type IServerSideDatasource,
  type IServerSideGetRowsParams,
  type LoadSuccessParams,
  type IDatasource,
  type IGetRowsParams,
  type RowModelType,
  type GridApi,
  type ColDef
} from 'ag-grid-enterprise';
ModuleRegistry.registerModules([AllEnterpriseModule]);

var dataSource: IServerSideDatasource;
var colDefs: ColDef[];
const sqlQuery = ref("");

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
const autoSizeStrategy = ref<SizeColumnsToContentStrategy
>({
  type: "fitCellContents",
});
const defaultColDef = ref({
  editable: true,
  filter: true,
});
function createServerSideDatasource(data: any[]): IServerSideDatasource {
  return {
    getRows: (params) => {
      console.log("[Datasource] - rows requested by grid: ", params.request);
      const response = {
        success: true,
        rows: data.slice(params.request.startRow, params.request.endRow),
      };
      setTimeout(() => {
        if (response.success) {
          params.success({ rowData: response.rows });
        } else {
          params.fail();
        }
      }, 500);
    },
  };
}
function createColDefs(data: any[]): ColDef[] {
  return Object.keys(data[0]).map(k => { return { field: k } })
}
function runQuery(query: string) {
  fetch("./api/query_mysql", {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: query})
  }).then((resp) => resp.json())
    .then((data: any) => {
      console.log(data);
      dataSource = createServerSideDatasource(data.rows);
      const colDefs = createColDefs(data.rows);
      gridApi!.value!.setGridOption("serverSideDatasource", dataSource);
      gridApi!.value!.setGridOption("columnDefs", colDefs);
    }
    );
}
const onGridReady = (params: GridReadyEvent) => {
  gridApi.value = params.api;
  runQuery("SELECT * FROM project");
};
const onRunQuery = () => {
  runQuery(sqlQuery.value);
}
</script>