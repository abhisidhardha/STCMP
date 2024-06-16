import React, { useState, useEffect, useRef } from 'react';
import './Home.css';
import { IoPersonCircle } from "react-icons/io5";
import { RiGraduationCapFill } from "react-icons/ri";
import { FaSearch } from "react-icons/fa";
import { BsFileBarGraphFill } from "react-icons/bs";
import Logo from '../images/vnrlogo.png';
import { useDispatch, useSelector } from "react-redux";
import { resetState } from "../redux/slices/userSlice";
import { useNavigate, NavLink, Outlet } from 'react-router-dom';

function Home() {
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 992);
  const [isSidebarModalOpen, setIsSidebarModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const sidebarModalRef = useRef();
  const { currentUser } = useSelector((state) => state.userLoginReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 992);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarModalRef.current && !sidebarModalRef.current.contains(event.target)) {
        setIsSidebarModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const signout = () => {
    dispatch(resetState());
    navigate("/");
  };

  const toggleSidebarModal = () => {
    if (isSmallScreen) {
      setIsSidebarModalOpen(!isSidebarModalOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  return (
    <div className="home d-flex">
      {isSmallScreen && isSidebarModalOpen && <div className="sidebar-modal-backdrop" onClick={() => setIsSidebarModalOpen(false)}></div>}
      <div
        ref={sidebarModalRef}
        className={`sidebar d-flex flex-column ${isSmallScreen ? 'sidebar-modal' : ''} ${isSidebarModalOpen || !isSmallScreen ? 'd-block' : 'd-none'} ${isSidebarCollapsed && !isSmallScreen ? 'collapsed' : ''}`}
      >
      <div className='header'>
        <img src={Logo} className='vnr-logo' alt="Logo" />
        <h1 className={`fs-3 ${isSidebarCollapsed && !isSmallScreen ? 'd-none' : ''}`}>STCMP</h1>
      </div>
        <div>
          <ul className='side-items list-unstyled'>
          <li onClick={() => setIsSidebarCollapsed(false)}>
  <div className="dropdown">
    <button className="nav-link d-inline dropdown-toggle" type="button" id="trainingsDropdown" data-bs-toggle="dropdown" aria-expanded="false">
      <RiGraduationCapFill className='sidebar-icon' />
      <span className={isSidebarCollapsed && !isSmallScreen ? 'd-none' : ''}>Trainings</span>
    </button>
    <ul className="dropdown-menu" aria-labelledby="trainingsDropdown">
      <li>
        <NavLink className="dropdown-item" to="/home/trainings">Trainings</NavLink>
      </li>
      <li>
        <NavLink className="dropdown-item" to="/home/mytrainings">My Trainings</NavLink>
      </li>
    </ul>
  </div>
  <span className="tooltip-text">Trainings</span>
</li>

            <li onClick={() => setIsSidebarCollapsed(false)}>
              <NavLink className="nav-link" to="">
              <FaSearch className='sidebar-icon nav-link d-inline' /> <span className={isSidebarCollapsed && !isSmallScreen ? 'd-none' : ''}>Audit</span><span className="tooltip-text">Audit</span>
              </NavLink>
              </li>
            <li onClick={() => setIsSidebarCollapsed(false)}>
              <NavLink className="nav-link" to="/home/chart">
              <BsFileBarGraphFill className='sidebar-icon d-inline' /> <span className={isSidebarCollapsed && !isSmallScreen ? 'd-none' : ''}>Summary</span><span className="tooltip-text">Summary</span>
              </NavLink>
              </li>
          </ul>
        </div>
      </div>
      <main className="main-content">
        <nav className='navbar navbar-expand-sm'>
          <div className='container-fluid'>
            <div className='col-2'>
              <button className="toggle-btn btn btn-primary " onClick={toggleSidebarModal}>
                ☰
              </button>
            </div>
            <div className='bg-primary rounded-2 text-center col-8'>
              <p className='fs-3 text-wrap'>Welcome {currentUser.userName} <span>-</span> <NavLink to="/home" style={{color:'white'}}>Home</NavLink></p>
            </div>
            <div className='col-2 d-flex justify-content-end '>
              <button data-bs-target="#main-modal" className='btn btn-primary p-2' data-bs-toggle="modal">
                <IoPersonCircle style={{ fontSize: "30px" }} />
              </button>
              <div className='modal fade details-modal' id='main-modal' tabIndex="-1" aria-labelledby='main-modal-label' aria-hidden="true">
                <div className='modal-dialog'>
                  <div className='modal-content'>
                    <div className="modal-body">
                      <ul className='list-unstyled'>
                        <li className='fs-2 text-end mb-2'>{currentUser.userName}</li>
                        <li><a className="dropdown-item" href="#">Profile</a></li>
                        <li><a className="dropdown-item" href="#">Reset Password</a></li>
                        <li><a className="dropdown-item" href="#" onClick={signout} data-bs-dismiss="modal">Logout</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className='outlet-container'>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Home;
