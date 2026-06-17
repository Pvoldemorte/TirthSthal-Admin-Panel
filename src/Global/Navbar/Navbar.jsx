import React from 'react'
import "./Navbar.css";
import {Link} from 'react-router-dom'
import {useState} from 'react'
import { useLocation } from 'react-router-dom';
import {
    Bell,
    Search,
    Menu,
    LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";



const PAGE_NAMES = {
     "/": "Dashboard",
  "/dashboard": "Dashboard",
  "/temple": "Temple",
  "/dieties": "Deities",
  "/festivals": "Festivals",
}
 const Navbar = ({ setIsOpen, isOpen })=>{
    const location = useLocation();
    const pageName = PAGE_NAMES[location.pathname] || "Dashboard";
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleSidebar = () => {
        setIsOpen(!isOpen)
    }

    const handleLogout = () => {
        logout();
        navigate("/login");
    }
   return (
     <div>
        <header className={`navbar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}>
            <div className='navbar_left'>
                <button className="menu-btn" onClick={handleSidebar}>
                    <Menu size={22}/>
                </button>
                <h3 id='dashboard'>{pageName}</h3>
                <div className="search-box">
                    <h1>SAY MY NAME </h1>
                </div>
            </div>
            <div className="navbar_right">
                <div className="notification">
                    <Bell size={20}/>
                    <span className="notification-badge">
                        3
                    </span>
                </div>
                <div className="profile">
                      <img src="../../public/image.png" alt="" />
                    <div className="profile-info">
                        <h4>{user?.name || "Admin"}</h4>
                        <p>{user?.role || "Owner"}</p>
                    </div>
                </div>
                <button className="menu-btn" title="Logout" onClick={handleLogout}>
                    <LogOut size={20}/>
                </button>
            </div>

        </header>
     </div>
   )
 }
 
 export default Navbar