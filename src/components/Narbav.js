import { NavLink } from 'react-router-dom'
import { FaUserCircle } from 'react-icons/fa';

export const Navbar = () => {

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true" || false;
    const role = localStorage.getItem("role") || "guest";

    return (
        <nav className='primary-nav'>

            <NavLink to='/' >Home</NavLink>

            {isLoggedIn && role === "ROLE_USER" && <NavLink to="/my-borrows">My Borrow</NavLink>}

            {isLoggedIn && (role === "ROLE_ADMIN") && <NavLink to="/manage-books">Books</NavLink>}

            {isLoggedIn && (role === "ROLE_ADMIN") && <NavLink to="/manage-accounts">Accounts</NavLink>}

            {isLoggedIn && (role === "ROLE_ADMIN") && <NavLink to="/manage-systems">Systems</NavLink>}
            {isLoggedIn && (role === "ROLE_ADMIN") && <NavLink to="/manage-activity-logs">Activity Logs</NavLink>}
            {isLoggedIn && (role === "ROLE_ADMIN") && <NavLink to="/report">Report</NavLink>}

            {
                isLoggedIn === true ? (
                    <NavLink to='/profile' className='profile-navlink'>
                        <FaUserCircle size={20} />
                    </NavLink>
                ) : <NavLink to="/login" className="login-navlink">Login</NavLink>
            }
        </nav>
    )
}