<template>
  <title>do you ever wonder</title>
  <div style="height: 100%">
    <div style="height: 100%; box-sizing: border-box;">
      <ag-grid-vue :rowData="rowData" :columnDefs="colDefs" style="height: 500px" :theme="theme"></ag-grid-vue>
    </div>
  </div>
</template>
<script>
import {
  ModuleRegistry,
  ClientSideRowModelModule
} from 'ag-grid-community';
import { ref } from 'vue';
import { AgGridVue } from "ag-grid-vue3"; // Vue Data Grid Component
ModuleRegistry.registerModules([
  ClientSideRowModelModule
]);
import { themeQuartz } from "ag-grid-community"; // or themeBalham, themeAlpine

const myTheme = themeQuartz.withParams({
  /* params not working */
  /* Low spacing = very compact */
  spacing: 2,
  /* Changes the color of the grid text */
  foregroundColor: 'rgb(14, 68, 145)',
  /* Changes the color of the grid background */
  backgroundColor: 'rgb(241, 247, 255)',
  /* Changes the header color of the top row */
  headerBackgroundColor: 'rgb(228, 237, 250)',
  /* Changes the hover color of the row*/
  rowHoverColor: 'rgb(216, 226, 255)',
});

export default {
  name: "App",
  data: function () {
    return {
      theme: myTheme,
    };
  },
  components: {
    AgGridVue, // Add Vue Data Grid component
  },
  setup() {
    // Row Data: The data to be displayed.
    const rowData = ref([
      { make: "Tesla", model: "Model Y", price: 64950, electric: true },
      { make: "Ford", model: "F-Series", price: 33850, electric: false },
      { make: "Toyota", model: "Corolla", price: 29600, electric: false },
    ]);

    // Column Definitions: Defines the columns to be displayed.
    const colDefs = ref([
      { field: "make" },
      { field: "model" },
      { field: "price" },
      { field: "electric" }
    ]);

    return {
      rowData,
      colDefs,
    };
  },
};
</script>