<template>
  <div class="card p-4">
    <h2 class="text-xl mb-4">PrimeVue Material Theme Test</h2>
    <div class="p-fluid">
      <div class="field mb-4">
        <label for="name" class="mb-2 block">Name</label>
        <InputText id="name" v-model="name" placeholder="Enter your name" />
      </div>
      <div class="field mb-4">
        <label for="country" class="mb-2 block">Country</label>
        <Select id="country" v-model="country" :options="countries" optionLabel="name" placeholder="Select a Country"
          class="w-full" />
      </div>
      <div class="flex gap-2 mt-4">
        <Button label="Submit" icon="pi pi-check" @click="showToast" />
        <Button label="Clear" icon="pi pi-times" severity="secondary" outlined @click="clearForm" />
      </div>
    </div>
    <Toast />
    <ProgressSpinner />
    <div class="mt-6 pt-4 border-t-1 border-gray-200">
      <h3 class="mb-3">Material Style Data Table</h3>
      <ag-grid-vue :rowData="rowData" :columnDefs="colDefs" style="height: 500px">
      </ag-grid-vue>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { AgGridVue } from 'ag-grid-vue3';
import {
  AllEnterpriseModule,
  ModuleRegistry,
  type IServerSideDatasource,
  type IServerSideGetRowsParams,
  type LoadSuccessParams
} from 'ag-grid-enterprise';

ModuleRegistry.registerModules([AllEnterpriseModule]);

const rowData = ref([
  { fname: 'Jared', minit: 'D', lname: 'James', ssn: '111111100', bdate: '1966-10-10', address: '123 Peachtree, Atlanta, GA', sex: 'M', salary: 85120.00, superssn: '111111103', dno: 6 },
  { fname: 'Jon', minit: 'C', lname: 'Jones', ssn: '111111101', bdate: '1967-11-14', address: '111 Allgood, Atlanta, GA', sex: 'M', salary: 45120.00, superssn: '111111100', dno: 6 },
  { fname: 'Justin', minit: 'n', lname: 'Mark', ssn: '111111102', bdate: '1966-01-12', address: '2342 May, Atlanta, GA', sex: 'M', salary: 40120.00, superssn: '111111100', dno: 6 },
  { fname: 'Brad', minit: 'C', lname: 'Knight', ssn: '111111103', bdate: '1968-02-13', address: '176 Main St., Atlanta, GA', sex: 'M', salary: 44120.00, superssn: 'NULL', dno: 6 },
  { fname: 'John', minit: 'B', lname: 'Smith', ssn: '123456789', bdate: '1955-01-09', address: '731 Fondren, Houston, TX', sex: 'M', salary: 30120.00, superssn: '333333300', dno: 5 },
  { fname: 'Evan', minit: 'E', lname: 'Wallis', ssn: '222222200', bdate: '1958-01-16', address: '134 Pelham, Milwaukee, WI', sex: 'M', salary: 92120.00, superssn: '111111103', dno: 7 },
  { fname: 'Josh', minit: 'U', lname: 'Zell', ssn: '222222201', bdate: '1954-05-22', address: '266 McGrady, Milwaukee, WI', sex: 'M', salary: 56120.00, superssn: '222222200', dno: 7 },
  { fname: 'Andy', minit: 'C', lname: 'Vile', ssn: '222222202', bdate: '1944-06-21', address: '1967 Jordan, Milwaukee, WI', sex: 'M', salary: 53120.00, superssn: '222222200', dno: 7 },
  { fname: 'Tom', minit: 'G', lname: 'Brand', ssn: '222222203', bdate: '1966-12-16', address: '112 Third St, Milwaukee, WI', sex: 'M', salary: 62620.00, superssn: '222222200', dno: 7 },
  { fname: 'Jenny', minit: 'F', lname: 'Vos', ssn: '222222204', bdate: '1967-11-11', address: '263 Mayberry, Milwaukee, WI', sex: 'F', salary: 61120.00, superssn: '222222201', dno: 7 },
  { fname: 'Chris', minit: 'A', lname: 'Carter', ssn: '222222205', bdate: '1960-03-21', address: '565 Jordan, Milwaukee, WI', sex: 'F', salary: 43120.00, superssn: '222222201', dno: 7 },
  { fname: 'Kim', minit: 'C', lname: 'Grace', ssn: '333333300', bdate: '1970-10-23', address: '6677 Mills Ave, Sacramento, CA', sex: 'F', salary: 79120.00, superssn: '111111103', dno: 6 },
  { fname: 'Jeff', minit: 'H', lname: 'Chase', ssn: '333333301', bdate: '1970-01-07', address: '145 Bradbury, Sacramento, CA', sex: 'M', salary: 44120.00, superssn: '333333300', dno: 6 },
  { fname: 'Franklin', minit: 'T', lname: 'Wong', ssn: '333445555', bdate: '1945-12-08', address: '638 Voss, Houston, TX', sex: 'M', salary: 40120.00, superssn: '888665555', dno: 5 },
  { fname: 'Alex', minit: 'D', lname: 'Freed', ssn: '444444400', bdate: '1950-10-09', address: '4333 Pillsbury, Milwaukee, WI', sex: 'M', salary: 89120.00, superssn: '111111103', dno: 7 },
  { fname: 'Bonnie', minit: 'S', lname: 'Bays', ssn: '444444401', bdate: '1956-06-19', address: '111 Hollow, Milwaukee, WI', sex: 'F', salary: 70120.00, superssn: '444444400', dno: 7 },
  { fname: 'Alec', minit: 'C', lname: 'Best', ssn: '444444402', bdate: '1966-06-18', address: '233 Solid, Milwaukee, WI', sex: 'M', salary: 60120.00, superssn: '444444400', dno: 7 },
  { fname: 'Sam', minit: 'S', lname: 'Snedden', ssn: '444444403', bdate: '1977-07-31', address: '987 Windy St, Milwaukee, WI', sex: 'M', salary: 48120.00, superssn: '444444400', dno: 7 },
  { fname: 'Joyce', minit: 'A', lname: 'English', ssn: '453453453', bdate: '1962-07-31', address: '5631 Rice, Houston, TX', sex: 'F', salary: 25120.00, superssn: '333333300', dno: 5 },
  { fname: 'John', minit: 'C', lname: 'James', ssn: '555555500', bdate: '1975-06-30', address: '7676 Bloomington, Sacramento, CA', sex: 'M', salary: 81120.00, superssn: '111111103', dno: 6 },
  { fname: 'Nandita', minit: 'K', lname: 'Ball', ssn: '555555501', bdate: '1969-04-16', address: '222 Howard, Sacramento, CA', sex: 'M', salary: 62120.00, superssn: '555555500', dno: 6 },
  { fname: 'Bob', minit: 'B', lname: 'Bender', ssn: '666666600', bdate: '1968-04-17', address: '8794 Garfield, Chicago, IL', sex: 'M', salary: 96120.00, superssn: '111111103', dno: 8 },
  { fname: 'Jill', minit: 'J', lname: 'Jarvis', ssn: '666666601', bdate: '1966-01-14', address: '6234 Lincoln, Chicago, IL', sex: 'F', salary: 36120.00, superssn: '666666600', dno: 8 },
  { fname: 'Kate', minit: 'W', lname: 'King', ssn: '666666602', bdate: '1966-04-16', address: '1976 Boone Trace, Chicago, IL', sex: 'F', salary: 44120.00, superssn: '666666600', dno: 8 },
  { fname: 'Lyle', minit: 'G', lname: 'Leslie', ssn: '666666603', bdate: '1963-06-09', address: '417 Hancock Ave, Chicago, IL', sex: 'M', salary: 41120.00, superssn: '666666601', dno: 8 },
  { fname: 'Billie', minit: 'J', lname: 'King', ssn: '666666604', bdate: '1960-01-01', address: '556 Washington, Chicago, IL', sex: 'F', salary: 38120.00, superssn: '666666603', dno: 8 },
  { fname: 'Jon', minit: 'A', lname: 'Kramer', ssn: '666666605', bdate: '1964-08-22', address: '1988 Windy Creek, Seattle, WA', sex: 'M', salary: 41620.00, superssn: '666666603', dno: 8 },
  { fname: 'Ray', minit: 'H', lname: 'King', ssn: '666666606', bdate: '1949-08-16', address: '213 Delk Road, Seattle, WA', sex: 'M', salary: 44620.00, superssn: '666666604', dno: 8 },
  { fname: 'Gerald', minit: 'D', lname: 'Small', ssn: '666666607', bdate: '1962-05-15', address: '122 Ball Street, Dallas, TX', sex: 'M', salary: 29120.00, superssn: '666666602', dno: 8 },
  { fname: 'Arnold', minit: 'A', lname: 'Head', ssn: '666666608', bdate: '1967-05-19', address: '233 Spring St, Dallas, TX', sex: 'M', salary: 33120.00, superssn: '666666602', dno: 8 },
  { fname: 'Helga', minit: 'C', lname: 'Pataki', ssn: '666666609', bdate: '1969-03-11', address: '101 Holyoke St, Dallas, TX', sex: 'F', salary: 32120.00, superssn: '666666602', dno: 8 },
  { fname: 'Naveen', minit: 'B', lname: 'Drew', ssn: '666666610', bdate: '1970-05-23', address: '198 Elm St, Philadelphia, PA', sex: 'M', salary: 34120.00, superssn: '666666607', dno: 8 },
  { fname: 'Carl', minit: 'E', lname: 'Reedy', ssn: '666666611', bdate: '1977-06-21', address: '213 Ball St, Philadelphia, PA', sex: 'M', salary: 32120.00, superssn: '666666610', dno: 8 },
  { fname: 'Sammy', minit: 'G', lname: 'Hall', ssn: '666666612', bdate: '1970-01-11', address: '433 Main Street, Miami, FL', sex: 'M', salary: 37120.00, superssn: '666666611', dno: 8 },
  { fname: 'Red', minit: 'A', lname: 'Bacher', ssn: '666666613', bdate: '1980-05-21', address: '196 Elm Street, Miami, FL', sex: 'M', salary: 33620.00, superssn: '666666612', dno: 8 },
  { fname: 'Ramesh', minit: 'K', lname: 'Narayan', ssn: '666884444', bdate: '1952-09-15', address: '971 Fire Oak, Humble, TX', sex: 'M', salary: 38120.00, superssn: '333333300', dno: 5 },
  { fname: 'James', minit: 'E', lname: 'Borg', ssn: '888665555', bdate: '1927-11-10', address: '450 Stone, Houston, TX', sex: 'M', salary: 55120.00, superssn: '111111103', dno: 1 },
  { fname: 'Jennifer', minit: 'S', lname: 'Wallace', ssn: '987654321', bdate: '1931-06-20', address: '291 Berry, Bellaire, TX', sex: 'F', salary: 43120.00, superssn: '888665555', dno: 4 },
  { fname: 'Ahmad', minit: 'V', lname: 'Jabbar', ssn: '987987987', bdate: '1959-03-29', address: '980 Dallas, Houston, TX', sex: 'M', salary: 25120.00, superssn: '111111100', dno: 4 },
  { fname: 'Alicia', minit: 'J', lname: 'Zelaya', ssn: '999887777', bdate: '1958-07-19', address: '3321 Castle, Spring, TX', sex: 'F', salary: 25120.00, superssn: '888665555', dno: 4 },
]);
const colDefs = ref([
  { field: "fname" },
  { field: "minit" },
  { field: "lname" },
  { field: "ssn" },
  { field: "bdate" },
  { field: "address" },
  { field: "sex" },
  { field: "salary" },
  { field: "superssn" },
  { field: "dno" }
]);
// rowModelType="serverSide"
// const datasource: IServerSideDatasource = {
//   getRows(params: IServerSideGetRowsParams<any, any>) {
//     fetch('./olympicWinners/', {
//       method: 'post',
//       body: JSON.stringify(params.request),
//       headers: { 'Content-Type': 'application/json; charset=utf-8' }
//     })
//       .then(httpResponse => httpResponse.json())
//       .then(response => {
//         const loadSuccessParams: LoadSuccessParams = {
//           rowData: response.rows,
//           rowCount: response.lastRow
//         }
//         params.success(loadSuccessParams);
//       })
//       .catch(error => {
//         params.fail();
//       })
//   }
// };


const toast = useToast();
const name: Ref<string> = ref('');
const country: Ref<{ name: string; code: string } | null> = ref(null);

const countries = ref([
  { name: 'United States', code: 'US' },
  { name: 'United Kingdom', code: 'UK' },
  { name: 'Germany', code: 'DE' },
  { name: 'Japan', code: 'JP' },
  { name: 'Canada', code: 'CA' }
]);

const showToast = () => {
  if (name.value) {
    const message = country.value
      ? `Hello, ${name.value} from ${country.value.name}!`
      : `Hello, ${name.value}!`;

    toast.add({ severity: 'success', summary: 'Success', detail: message, life: 3000 });
  } else {
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Please enter your name', life: 3000 });
  }
};

const clearForm = () => {
  name.value = '';
  country.value = null;
};
</script>