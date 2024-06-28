import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./AuditInspection.css";

function AuditInspection() {
  const [trainings, setTrainings] = useState([]);
  const [filters, setFilters] = useState({
    trainingName: "",
    startYear: "",
    endYear: "",
    studentYear: "",
    semester: "",
    totalStudents: "",
    venue: "",
    noOfHours: "",
    duration: "",
    mode: "",
    trainerName: "",
    designation: "",
    company: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coordinators, setCoordinators] = useState([]);
  const [selectedCoordinators, setSelectedCoordinators] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "" });
  const [filterVisibility, setFilterVisibility] = useState({
    trainingName: false,
    startYear: false,
    endYear: false,
    studentYear: false,
    semester: false,
    totalStudents: false,
    venue: false,
    noOfHours: false,
    duration: false,
    mode: false,
    trainerName: false,
    designation: false,
    company: false,
    coordinators: false, // Add visibility state for coordinators
  });

  useEffect(() => {
    fetchTrainings();
    fetchCoordinators(); // Fetch coordinators data on component mount
  }, []);

  const fetchTrainings = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/trainings-api/trainings"
      );
      const fetchedTrainings = response.data.payload;
      setTrainings(fetchedTrainings);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching trainings:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchCoordinators = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/coordinators-api/coordinators"
      );
      const transformedCoordinators = response.data.coordinators.map(
        (coordinator) => ({
          value: coordinator.id,
          label: coordinator.name,
        })
      );
      setCoordinators(transformedCoordinators);
    } catch (error) {
      console.error("Error fetching coordinators:", error);
      setError(error.message);
    }
  };

  const handleCoordinatorChange = (selectedOptions) => {
    setSelectedCoordinators(selectedOptions);
    const selectedCoordinatorIds = selectedOptions.map(
      (option) => option.value
    );
    // Update filter state with selected coordinator IDs
    handleFilterChange("coordinators", selectedCoordinatorIds.join(","));
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") {
        direction = "desc";
      } else if (sortConfig.direction === "desc") {
        direction = "";
      } else {
        direction = "asc";
      }
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const handleFilterVisibility = (key) => {
    setFilterVisibility((prevVisibility) => ({
      ...prevVisibility,
      [key]: !prevVisibility[key],
    }));
  };

  const handleClearFilter = (key) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: "",
    }));
  };

  const filteredTrainings = trainings.filter((training) => {
    return Object.keys(filters).every((filterKey) => {
      if (filterKey === "coordinators") {
        // Handle filtering by coordinators
        const selectedCoordinatorIds = filters.coordinators.split(",");
        return selectedCoordinatorIds.includes(training.coordinatorId);
      }
      if (filters[filterKey]) {
        return (
          training[filterKey] &&
          training[filterKey]
            .toString()
            .toLowerCase()
            .includes(filters[filterKey].toLowerCase())
        );
      }
      return true;
    });
  });

  const sortedTrainings = filteredTrainings.sort((a, b) => {
    if (sortConfig.key && sortConfig.direction) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
    }
    return 0;
  });

  const getSortArrow = (key) => {
    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") {
        return "↑";
      }
      if (sortConfig.direction === "desc") {
        return "↓";
      }
    }
    return "↑";
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(sortedTrainings);
    autoFitColumns(worksheet);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trainings");
    XLSX.writeFile(workbook, "trainings.xlsx", {
      bookType: "xlsx",
      type: "buffer",
    });
  };

  const downloadPDF = () => {
    const doc = new jsPDF("p", "pt", "a4");
    
    doc.autoTable({
      head: [
        [
          "Training Name",
          "Start Year",
          "End Year",
          "Student Year",
          "Semester",
          "Status",
          "Total Students",
          "No of Hours",
          "Duration",
          "Mode",
          "Status",
          "Trainer Name",
          "Designation",
          "Company",
        ],
      ],
      body: sortedTrainings.map(
        ({
          trainingName,
          startYear,
          endYear,
          studentYear,
          semester,
          totalStudents,
          venue,
          noOfHours,
          duration,
          mode,
          status,
          trainerName,
          designation,
          company,
        }) => [
          trainingName,
          startYear,
          endYear,
          studentYear,
          semester,
          totalStudents,
          venue,
          noOfHours,
          duration,
          mode,
          status,
          trainerName,
          designation,
          company,
        ]
      ),
      margin: { top: 20, right: 20, bottom: 30, left: 20 }, // Set equal margins
      columnStyles: {
        0: { cellWidth: 60 }, // Training Name
        1: { cellWidth: 40 }, // Start Year
        2: { cellWidth: 40 }, // End Year
        3: { cellWidth: 40 }, // Student Year
        4: { cellWidth: 40, overflow: 'visible' }, // Semester, no wrapping
        5: { cellWidth: 40 }, // Status
        6: { cellWidth: 40 }, // No of Hours
        7: { cellWidth: 40, overflow: 'visible' }, // Duration, no wrapping
        8: { cellWidth: 40 }, // Mode
        9: { cellWidth: 60 }, // Trainer Name
        10: { cellWidth: 60 }, // Designation
        11: { cellWidth: 60 }, // Company
      },
      styles: {
        overflow: 'linebreak', // Handle long text
        cellPadding: 2, // Cell padding
        fontSize: 8, // Font size
      },
      headStyles: {
        fontSize: 8, // Font size for header
      },
      pageBreak: 'auto', // Handle page breaks
    });
    doc.save("trainings.pdf");
  };
  
  const autoFitColumns = (worksheet) => {
    const columns = [];
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const maxLength = [];
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellAddress = { c: C, r: R };
        const cell = XLSX.utils.encode_cell(cellAddress);
        const cellValue = worksheet[cell] ? worksheet[cell].v : "";
        maxLength.push(cellValue ? cellValue.toString().length : 0);
      }
      const max = Math.max(...maxLength);
      columns.push({ wch: max });
    }
    worksheet["!cols"] = columns;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="audit-inspection">
      <div className="download-buttons">
        <button onClick={downloadExcel} className="btn btn-success mx-2">
          Download Excel
        </button>
        <button onClick={downloadPDF} className="btn btn-danger mx-2">
          Download PDF
        </button>
      </div>
      <div className="filter-controls">
        <button
          onClick={() => handleFilterVisibility("coordinators")}
          className="btn btn-primary mb-3"
        >
          {filterVisibility.coordinators ? "Hide Coordinators" : "Filter by Coordinators"}
        </button>
        {filterVisibility.coordinators && (
          <Select
            isMulti
            value={selectedCoordinators}
            onChange={handleCoordinatorChange}
            options={coordinators}
            className="basic-multi-select"
            classNamePrefix="select"
          />
        )}
      </div>
      <table className="table rounded rounded-3">
        <thead>
          <tr>
            {[
              { label: "Training Name", column: "trainingName" },
              { label: "Start Year", column: "startYear" },
              { label: "End Year", column: "endYear" },
              { label: "Student Year", column: "studentYear" },
              { label: "Semester", column: "semester" },
              { label: "Total Students", column: "totalStudents" },
              { label: "Venue", column: "venue" },
              { label: "No of Hours", column: "noOfHours" },
              { label: "Duration (hours)", column: "duration" },
              { label: "Mode", column: "mode" },
              { label: "Status", column: "status" },
              { label: "Trainer Name", column: "trainerName" },
              { label: "Designation", column: "designation" },
              { label: "Company", column: "company" },
            ].map(({ label, column }) => (
              <th
                key={column}
                className="sortable"
                onClick={() => handleSort(column)}
              >
                {label}{" "}
                <span className="sort-arrow">{getSortArrow(column)}</span>
                <div
                  className="filter-controls"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleFilterVisibility(column)}
                    className="btn btn-primary mb-3"
                  >
                    {filterVisibility[column] ? "Hide" : "Search"}
                  </button>
                  {filterVisibility[column] && (
                    <div className="filter-input-clear">
                      <input
                        type="text"
                        className="form-control"
                        value={filters[column]}
                        onChange={(e) =>
                          handleFilterChange(column, e.target.value)
                        }
                      />
                      <button
                        className="btn btn-danger mx-2"
                        onClick={() => handleClearFilter(column)}
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedTrainings.map((training) => (
            <tr key={training._id}>
              <td>{training.trainingName}</td>
              <td>{training.startYear}</td>
              <td>{training.endYear}</td>
              <td>{training.studentYear}</td>
              <td>{training.semester}</td>
              <td>{training.totalStudents}</td>
              <td>{training.venue}</td>
              <td>{training.noOfHours}</td>
              <td>{training.duration}</td>
              <td>{training.mode}</td>
              <td>{training.status}</td>
              <td>{training.trainerName}</td>
              <td>{training.designation}</td>
              <td>{training.company}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AuditInspection;
