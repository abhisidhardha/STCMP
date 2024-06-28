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
    coordinators: "", 
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
    coordinators: false, 
  });

  useEffect(() => {
    fetchTrainings();
    fetchCoordinators(); 
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
      const facultyResponse = await axios.get('http://localhost:5000/faculty-api/facultyList');
                const transformedFacultyList = facultyResponse.data.faculty.map(faculty => ({
                    label: faculty.userName,
                    value: faculty.userId
                }));
      setCoordinators(transformedFacultyList);
    } catch (error) {
      console.error("Error fetching coordinators:", error);
      setError(error.message);
    }
  };

  const handleCoordinatorChange = (selectedOptions) => {
    setSelectedCoordinators(selectedOptions);
    const selectedCoordinatorIds = selectedOptions.map(option => option.value);
    // Update filter state with selected coordinator IDs
    handleFilterChange('coordinators', selectedCoordinatorIds.join(','));
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

  const filteredTrainings = trainings.filter(training => {
    return Object.keys(filters).every(filterKey => {
      if (filterKey === 'coordinators' && filters.coordinators) {
        const selectedCoordinatorIds = filters.coordinators.split(',');
        return selectedCoordinatorIds.some(id => training.programCoordinator.includes(id));
      }
      if (filters[filterKey]) {
        return (
          training[filterKey] &&
          training[filterKey].toString().toLowerCase().includes(filters[filterKey].toLowerCase())
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
    const dataToExport = sortedTrainings.map(({ _id, studentsData, programCoordinator, ...rest }) => rest);
  
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
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
          "Venue",
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
      margin: { top: 10, right: 10, bottom: 10, left: 10 }, // Reduced margins
      columnStyles: {
        0: { cellWidth: 70 }, // Training Name
        1: { cellWidth: 30 }, // Start Year
        2: { cellWidth: 30 }, // End Year
        3: { cellWidth: 35 }, // Student Year
        4: { cellWidth: 30 }, // Semester
        5: { cellWidth: 30 }, // Status
        6: { cellWidth: 35 }, // Total Students
        7: { cellWidth: 50 }, // Venue
        8: { cellWidth: 30 }, // No of Hours
        9: { cellWidth: 30 }, // Duration
        10: { cellWidth: 30 }, // Mode
        11: { cellWidth: 30 }, // Status (duplicate, consider removing)
        12: { cellWidth: 50 }, // Trainer Name
        13: { cellWidth: 50 }, // Designation
        14: { cellWidth: 50 }, // Company
      },
      styles: {
        overflow: "linebreak",
        cellPadding: 1,
        fontSize: 7,
      },
      headStyles: {
        fontSize: 7,
        fillColor: [200, 200, 200],
      },
      pageBreak: "auto",
      theme: "grid",
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
      <div className="filter-controls">
        <div className="d-flex">
        <button
          onClick={() => handleFilterVisibility("coordinators")}
          className="btn btn-primary mb-3">
          {filterVisibility.coordinators ? "Hide Coordinators" : "Filter by Coordinators"}
        </button>
          <button onClick={downloadExcel} className="btn btn-success mx-2 mb-3">
              Download Excel
            </button>
            <button onClick={downloadPDF} className="btn btn-danger mx-2 mb-3">
              Download PDF
            </button>
        </div>
        {filterVisibility.coordinators && (
          <Select
            isMulti
            value={selectedCoordinators}
            onChange={handleCoordinatorChange}
            options={coordinators}
            className="basic-multi-select mb-3"
            classNamePrefix="select"
          />
        )}
      </div>
      <table className="table table-bordered table-responsive table-hover table-striped">
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
