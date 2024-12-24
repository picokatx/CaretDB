var recording_cols = [
  //Define Table Columns
  { field: "recording_id", title: "recording_id" },
  { field: "split", title: "split" },
  { field: "turn_count", title: "turn_count" },
  { field: "action_count", title: "action_count" },
  { field: "default_viewport", title: "default_viewport" },
];
var action_cols = [
  //Define Table Columns
  { field: "action_id", title: "action_id" },
  { field: "recording_id", title: "recording_id" },
  { field: "turn", title: "turn" },
  { field: "viewport", title: "viewport" },
  { field: "action_type", title: "action_type" },
  { field: "action_args", title: "action_args" },
];
var webstate_cols = [
  //Define Table Columns
  { field: "recording_id", title: "recording_id" },
  { field: "turn", title: "turn" },
  { field: "clean_html", title: "clean_html" },
  { field: "candidates", title: "candidates" },
];
var element_cols = [
  //Define Table Columns
  { field: "element_id", title: "element_id" },
  { field: "tag", title: "tag" },
  { field: "xpath", title: "xpath" },
  { field: "text", title: "text" },
  { field: "bbox", title: "bbox" },
  { field: "attributes", title: "attributes" },
  { field: "children", title: "children" },
  { field: "uid", title: "uid" },
];
data = [recording_info_collate, action_info_collate, webstate_info_collate, element_info_collate]
data_cols = [recording_cols, action_cols, webstate_cols, element_cols]
var starter_table = document.getElementById("table-dropdown").value
var prev_sel_row = null

var table_display = new Tabulator("#table-display", {
  paginationSize:25,  // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
  data: data[starter_table], //assign data to table
  layout: "fitColumns", //fit columns to width of table (optional)
  columns: data_cols[starter_table],
  pagination: true,
  paginationSizeSelector:[25, 50, 100], 
});

var table_info_display = new Tabulator("#table-info-display", {
  data: [{key: "columns", value: data_cols[starter_table].length}, {key: "entries", value: data[starter_table].length}],
  layout: "fitColumns",
  headerVisible:false,
  columns: [
    { field: "key", title: "Key", resizable:false },
    { field: "value", title: "Value", resizable:false },
  ],
});

var entry_info_display = new Tabulator("#entry-info-display", {
  data: [{key: "columns", value: data_cols[starter_table].length}, {key: "entries", value: data[starter_table].length}],
  layout: "fitColumns",
  headerVisible:false,
  columns: [
    { field: "key", title: "Key", resizable:false },
    { field: "value", title: "Value", resizable:false },
  ],
});
function getElementIndex(element) {
  var parent = element.parentNode;
  var children = Array.prototype.slice.call(parent.children);
  return children.indexOf(element);
}
function convertStructToList(obj) {
  return Object.keys(obj).map(key => {
    return { key: key, value: obj[key] };
  });
}

function updateTable(e) {
  table_display.clearData();
  table_display.setColumns(data_cols[this.value]);
  table_display.replaceData(data[this.value]);
  table_info_display.replaceData([{key: "columns", value: data_cols[this.value].length}, {key: "entries", value: data[this.value].length}]);
  prev_sel_row = null;
}
function updateRowDisplay(e) {
  entry_info_display.clearData();
  
}
function updateSQLDisplay(row) {
  var sqlDisplay = document.getElementById("sql-display");
  sqlDisplay.textContent = this.value
  sqlDisplay.removeAttribute("data-highlighted");
  hljs.highlightElement(sqlDisplay);
}
document.getElementById("sql-input").addEventListener("input", updateSQLDisplay);
document.getElementById("table-dropdown").addEventListener("change", updateTable)

table_display.on("rowClick", function(e, row){
  if (row.getElement().classList.contains('tabulator-expanded')) {
    row.getElement().classList.remove('tabulator-expanded');
    row.getElement().querySelectorAll('.tabulator-cell').forEach(element => {
      element.style.whiteSpace = 'nowrap';
      element.style.wordWrap = 'normal';
      element.style.height = '';
    });
  } else {
    if (prev_sel_row) {
      prev_sel_row.getElement().classList.remove('tabulator-expanded');
      prev_sel_row.getElement().querySelectorAll('.tabulator-cell').forEach(element => {
        element.style.whiteSpace = 'nowrap';
        element.style.wordWrap = 'normal';
        element.style.height = '';
      });
    }
    row.getElement().classList.add('tabulator-expanded');
    row.getElement().querySelectorAll('.tabulator-cell').forEach(element => {
      element.style.whiteSpace = 'normal';
      element.style.wordWrap = 'break-word';
      element.style.height = 'auto';
    });
    entry_info_display.replaceData(convertStructToList(row.getData()));
    prev_sel_row = row;
  }
});
