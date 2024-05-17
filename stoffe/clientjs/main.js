const BASE_URL = "http://localhost:3000/";

const employeeEditButtons = document.querySelectorAll(".employee-row button");
if (employeeEditButtons) {
    employeeEditButtons.forEach((employee) => {
        employee.addEventListener("click", async (event) => {
            const url = new URL(`${BASE_URL}api/employee/${event.currentTarget.value}`);
            // url.searchParams.append("id", event.currentTarget.value);

            const response = await fetch(url);
            const result = await response.json();

            document.querySelector("#employee-edit-name").value = result[0].name;
            document.querySelector("#employee-edit-age").value = result[0].age;
            document.querySelector("#employee-edit-department").value = result[0].department_id;
            document.querySelector("#employee-edit-id").value = result[0].id;
            document.querySelector("#employee-edit-dialog").showModal();
        });
    });
}

const employeeEditForm = document.querySelector("#employee-edit-form");
if (employeeEditForm) {
    employeeEditForm.addEventListener("submit", (event) => {
        event.currentTarget.submit();
        document.querySelector("#employee-edit-dialog").close();
    });
}

const createProjectButton = document.querySelector("#create-project-button");
if (createProjectButton) {
    createProjectButton.addEventListener("click", (event) => {
        const dialog = document.querySelector("#create-project-dialog");
        if (dialog) {
            dialog.showModal();
        }
    });
}

const deleteProjectButton = document.querySelector("#delete-project-button");
if (deleteProjectButton) {
    deleteProjectButton.addEventListener("click", async (event) => {
        if (confirm("Are you sure you wish to remove this project?")) {
            const projectId = new URLSearchParams(window.location.search).get("projectid");
            const response = await fetch(new URL(BASE_URL + "project/delete"), {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: projectId }),
            });

            const result = await response.json();
            if (result.message) {
                alert("Remove project: " + result.message);
                window.location.href = "/projects";
            }
            else if (result.error) {
                alert("Error removing project: " + result.error);
            }
        }
    });
}