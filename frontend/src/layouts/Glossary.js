import React, { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import {
  TextField,
  Typography,
  IconButton,
  makeStyles,
} from "@material-ui/core";
import { Search as SearchIcon } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  searchContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
    maxWidth: "300px", // Adjust the maximum width as per your requirement
    // margin: "auto", // Center the search container
  },
  searchInput: {
    flex: 1,
    marginRight: theme.spacing(1),
  },
  searchButton: {
    padding: 2,
    minWidth: 10,
  },
  tableContainer: {
    height: "400px", // Set the height of the table container to make it scrollable
    width: "80%", // Set the width of the table container
    margin: "auto", // Center the table container
  },
}));

const AgGridTable = ({ data }) => {
  const classes = useStyles();
  const [searchText, setSearchText] = useState("");

  const handleSearch = (e) => {
    const searchValue = e.target.value;
    setSearchText(searchValue);
  };

  const filteredRows = data.filter(
    (row) =>
      row.name.toLowerCase().includes(searchText.toLowerCase()) ||
      row.value.toLowerCase().includes(searchText.toLowerCase())
  );

  const gridOptions = {
    pagination: true,
    paginationPageSize: 10,
  };

  const columnDefs = [
    { headerName: "S.No", field: "sNo", width: 100 },
    { headerName: "Keyword", field: "name", width: 200 },
    { headerName: "Name", field: "value", width: 500 },
  ];

  const rowData = filteredRows.map((row, index) => ({
    sNo: index + 1,
    name: row.name,
    value: row.value,
  }));

  return (
    <div style={{ padding: "20px" }}>
      <div className={classes.searchContainer}>
        <TextField
          type="text"
          value={searchText}
          onChange={handleSearch}
          variant="outlined"
          label="Search..."
          size="small"
          className={classes.searchInput}
        />
        <IconButton
          size="small"
          className={classes.searchButton}
          onClick={() => setSearchText("")}
        >
          <SearchIcon />
        </IconButton>
      </div>
      {filteredRows.length === 0 ? (
        <Typography variant="body1">No matching results found.</Typography>
      ) : (
        <div className={classes.tableContainer}>
          <div
            className="ag-theme-alpine"
            style={{ height: "100%", width: "100%" }}
          >
            <AgGridReact
              gridOptions={gridOptions}
              columnDefs={columnDefs}
              rowData={rowData}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const data = [
    { name: "HVAC", value: "Heating Ventilation and Air Conditioning" },
                { name: "UPS", value: "Uninterruptible Power Supply" },
                { name: "chW Valve", value: "Chilled Water Valve" },
                { name: "RAT", value: "Return Air Temperature" },
                { name: "SAT", value: "Supply Air Temperature" },
                { name: "AHU", value: "Air Handling Units" },
                { name: "VAV", value: "Variable air volume" },
                { name: "RAT SP", value: "Return Air Temperature Set Point" },
                { name: "SAT SP", value: "Supply Air Temperature Set Point" },
                { name: "CHW_Vlv_Pos", value: "Chilled Water Valve Position" },
                { name: "MA Damper", value: "Mixed Air Damper" },
                { name: "DPS(Fliter)", value: "Differential Pressure Switch" },
                { name: "FA Damper", value: "Fresh Air Damper" },
                { name: "DSP", value: "Duct Static Pressure" },
                { name: "SA Damper", value: "Supply Air Damper" },
                { name: "RA Co2", value: "Return Air Co2" },
                { name: "CSU", value: "Ceiling Suspended Units" },
                { name: "TFA", value: "Treated Fresh Air Units" },
                { name: "EM", value: "Energy Meter" },
                { name: "CWL PID", value: "Chilled Water line PID" },
                { name: "OAT", value: "Outside Air Temperature" },
                { name: "PID", value: "Proportional  Integral Derivative Controller" },
                { name: "PNG", value: "Portable Network Graphics" },
                { name: "CSV", value: "Comma-Separated Values" },
                { name: "SVG", value: "Scalable Vector Graphics" },
  // Your data items here...
];

const App = () => {
  return (
    <div>
      <h2>Abbreviations :</h2>
      <AgGridTable data={data} />
    </div>
  );
};

export default App;

