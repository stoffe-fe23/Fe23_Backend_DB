import express from "express";
import { Router } from 'express';
import db from "./db.js";

const clientRoutes = Router();


// Employees page
clientRoutes.get("/", async (req, res) => {
    const pageTitle = "Company";
    // Display list of employees
    const [employeeRows] = await db.query('SELECT e.id, e.name, e.age, COALESCE(d.name, "(No department)") AS department FROM `employees` e LEFT JOIN departments d ON (e.department_id = d.id) ORDER BY d.name ASC, e.name ASC');
    const [departmentRows] = await db.query('SELECT id, name FROM `departments` ORDER BY id ASC');
    res.render("index", { pageTitle, employeeRows, departmentRows });
});

// Submit for new employee form
clientRoutes.post("/employee/add", async (req, res) => {
    const result = await db.execute('INSERT INTO `employees` (name, age, department_id) VALUES (?, ?, ?)',
        [req.body.name, req.body.age, req.body.department]
    );

    res.redirect(`/`);
});

// Submit for form editing or removing an employee
clientRoutes.post("/employee/edit", async (req, res) => {
    if (req.body.id) {
        if (req.body.submitbutton == 'delete') {
            await db.execute("DELETE FROM `projects_employees` WHERE employee_id = ?", [req.body.id]);
            await db.execute("DELETE FROM `employees` WHERE id = ?", [req.body.id]);
        }
        else {
            const result = await db.execute("UPDATE `employees` SET name = ?, age = ?, department_id = ? WHERE id = ?",
                [req.body.name, req.body.age, req.body.department_id, req.body.id]
            );
        }
    }
    res.redirect(`/`);
});

// Projects page
clientRoutes.get("/projects", async (req, res) => {
    let pageTitle = "Projects";
    // Get name and ID of all projects
    const [projectOptions] = await db.query('SELECT id, name FROM `projects` ORDER BY id ASC');

    // Get name and ID of all employees not already part of the project
    const [employeesList] = await db.execute(
        'SELECT et.id, et.name FROM `employees` et WHERE et.id NOT IN (SELECT e.id AS id FROM `projects` p JOIN projects_employees pe ON (p.id = pe.project_id) LEFT JOIN employees e ON (e.id = pe.employee_id) WHERE p.id = ?) ORDER BY et.name ASC',
        [req.query.projectid ?? 0]
    );

    // query param projectid is received (from URL/form)
    if (req.query.projectid) {
        // Get info about the project matching the ID
        let [projectInfo] = await db.execute('SELECT id, name, DATE_FORMAT(startdate, "%Y-%m-%d") AS startdate, DATE_FORMAT(enddate, "%Y-%m-%d") AS enddate FROM `projects` WHERE id = ?', [req.query.projectid]);
        // Get all members of the project matching the ID
        const [projectMembers, fields] = await db.execute(
            'SELECT e.id, e.name, COALESCE(d.name, "(no department") AS department FROM `projects` p JOIN projects_employees pe ON (p.id = pe.project_id) LEFT JOIN employees e ON (e.id = pe.employee_id) LEFT JOIN departments d ON (d.id = e.department_id) WHERE p.id = ? ORDER BY e.name ASC',
            [req.query.projectid]
        );

        projectInfo = projectInfo[0] ?? { id: 0, name: "No project", startdate: "N/A", enddate: "N/A" };
        pageTitle = projectInfo.name;
        res.render("projects", { pageTitle, projectOptions, projectInfo, projectMembers, employeesList });
    }
    else {
        // No project id received, just show the project picker form
        const projectInfo = { id: 0, name: "Show project", startdate: "N/A", enddate: "N/A" };
        const projectMembers = [];
        res.render("projects", { pageTitle, projectOptions, projectInfo, projectMembers, employeesList });
    }

});

// Submit of form for adding project members.
clientRoutes.post("/project/member/add", async (req, res) => {
    if (req.body.employeeid && req.body.projectid) {
        const result = await db.execute('INSERT INTO projects_employees (employee_id, project_id) VALUES (?, ?)',
            [req.body.employeeid, req.body.projectid]
        );
        // res.json({ message: "Added employee to project.", data: result });
        res.redirect(`/projects?projectid=${req.body.projectid}`);
    }
});

// Submit of form removing project member
clientRoutes.post("/project/member/remove", async (req, res) => {
    if (req.body.projectid && req.body.removemember) {
        const result = await db.execute('DELETE FROM `projects_employees` WHERE project_id = ? AND employee_id = ?',
            [req.body.projectid, req.body.removemember]
        );
        res.redirect(`/projects?projectid=${req.body.projectid}`);
    }
});

// Submit for creating a new project
clientRoutes.post("/project/add", async (req, res) => {
    if (req.body.name && req.body.startdate && req.body.enddate) {
        const [result] = await db.execute('INSERT INTO `projects` (name, startdate, enddate) VALUES (?, ?, ?)',
            [req.body.name, req.body.startdate, req.body.enddate]
        )
        res.redirect(`/projects?projectid=${result.insertId}`);
    }
});

// Submit for removing a project
clientRoutes.post("/project/delete", async (req, res) => {
    if (req.body.id && (req.body.id > 0)) {
        const [resultEmployees] = await db.execute("DELETE FROM `projects_employees` WHERE project_id = ?", [req.body.id]);
        const [resultProject] = await db.execute("DELETE FROM `projects` WHERE id = ?", [req.body.id]);
        console.log("DELETE RES", resultEmployees, resultProject);
        res.json({ message: `Project ${req.body.id} deleted.`, data: { resultProject, resultEmployees } });
    }
    else {
        res.json({ error: "No valid project id.", data: req.body.id });
    }
});


export default clientRoutes;