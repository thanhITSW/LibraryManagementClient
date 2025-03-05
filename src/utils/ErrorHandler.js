export const getErrorMessage = (errorResponse) => {
    let message = "";
    let statusMessage = "info";

    if (!errorResponse) {
        message = "Cannot connect to the server. Please try again later.";
        statusMessage = "error";
    } else {
        const { data } = errorResponse;

        message = data.message || "An unexpected error occurred.";

        if (data.success === false) {
            statusMessage = "warning";
        } else {
            if (data.code === 1) {
                statusMessage = "warning";
            } else if (data.code === 2) {
                statusMessage = "error";
            } else {
                statusMessage = "error";
            }
        }
    }

    return { message, statusMessage };
};
