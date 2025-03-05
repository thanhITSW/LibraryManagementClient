import { Link } from "react-router-dom";

export const PageNotFound = () => {

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <Link to="/">Go back to Home</Link>
        </div>
    )
}