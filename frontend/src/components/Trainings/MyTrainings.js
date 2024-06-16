import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./MyTrainings.css";
import * as XLSX from "xlsx";

function MyTrainings() {
    const navigate = useNavigate();
    const [trainings, setTrainings] = useState([]);
    const [facultyList, setFacultyList] = useState([]);
    const [showOngoingTrainings, setShowOngoingTrainings] = useState(false);
    const { currentUser } = useSelector((state) => state.userLoginReducer);

    useEffect(() => {
        if (currentUser) {
            axios.get(`http://localhost:5000/trainings-api/trainings/${currentUser.userId}`)
                .then(response => {
                    setTrainings(response.data.payload);
                })
                .catch(error => {
                    console.error("Error fetching trainings:", error);
                });
        }

        // Fetch faculty list
        axios.get('http://localhost:5000/faculty-api/facultyList')
            .then(response => {
                const transformedFacultyList = response.data.faculty.map(faculty => ({
                    label: faculty.userName,
                    value: faculty.userId
                }));
                setFacultyList(transformedFacultyList);
            })
            .catch(error => {
                console.error('Error fetching the faculty list:', error);
            });
    }, [currentUser]);

    const handleCardClick = (id, trainingName) => {
        navigate(`/home/gettrainings/${id}`);
    };

    const exportToExcel = () => {
        const data = trainings.map(training => {
            const coordinatorsNames = training.programCoordinator.map(coordinatorId =>
                facultyList.find(faculty => faculty.value === coordinatorId)?.label || 'Not mentioned'
            );

            return {
                "Training Name": training.trainingName,
                "Start Year": training.startYear,
                "End Year": training.endYear || 'Not mentioned',
                "Total Students": training.totalStudents || 'Not mentioned',
                "Venue": training.venue || 'Not mentioned',
                "Number of Hours": training.noOfHours || 'Not mentioned',
                "Duration": training.duration || 'Not mentioned',
                "Mode": training.mode || 'Not mentioned',
                "Trainer Name": training.trainerName || 'Not mentioned',
                "Designation": training.designation || 'Not mentioned',
                "Company": training.company || 'Not mentioned',
                "Program Coordinators": coordinatorsNames.join(', ') || 'Not mentioned'
            };
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Ongoing Trainings");
        XLSX.writeFile(wb, "ongoing_trainings.xlsx");
    };

    const filteredTrainings = showOngoingTrainings
        ? trainings.filter(training => training.status === "Ongoing")
        : trainings;

    return (
        <div className='p-3 trainings-tab'>
            <nav className='row'>
                <div className='col-lg-3 col-sm-6 col-md-3 mb-1'>
                    <h1 className='px-3 d-inline'>My Trainings</h1>
                </div>
                <div className='checkbox-wrapper-3 text-center d-inline col-lg-4 col-sm-6 col-md-3 mb-1'>
                            <input
                            type="checkbox"
                            id="showOngoingTrainings"
                            checked={showOngoingTrainings}
                            onChange={() => setShowOngoingTrainings(!showOngoingTrainings)} 
                            />
                        <label htmlFor="showOngoingTrainings" className="ms-2 toggle">
                             <span></span>
                        </label>
                        <p className='d-inline px-3 fs-5 '>Show Ongoing</p>
                </div>
                <div className='col text-end col-lg-4 col-sm-6 col-md-3'>
                    <button className="btn btn-success mb-1" onClick={() => navigate("/home/createtraining")} >
                        Add Training
                    </button>
                    <button className="btn btn-primary ms-2" onClick={exportToExcel}>
                        Export to Excel
                    </button>
                </div>
            </nav>
            <div className="trainings-container">
                {filteredTrainings.length > 0 ? (
                    <div className="row row-cols-1 row-cols-md-3 g-4">
                        {filteredTrainings.map(training => (
                            <div key={training._id} className="col">
                                <div className="card h-100" onClick={() => handleCardClick(training._id)}>
                                    <div className="card-body">
                                        <h5 className="card-title">{training.trainingName}</h5>
                                        <p className="card-text">Year: {training.startYear} - {training.endYear}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className='p-5'>No trainings.</p>
                )}
            </div>
        </div>
    );
}

export default MyTrainings;
