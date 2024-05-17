import express from "express";
import { Router } from 'express';
import db from "./db.js";

const apiRoutes = Router();

// Return JSON-data about the employee with the specified ID
apiRoutes.get("/employee/:id", async (req, res) => {
    if (req.params.id) {
        const [userData] = await db.execute('SELECT * FROM `employees` WHERE id = ?', [req.params.id]);
        res.json(userData);
    }
});

// Return JSON-data with a filtered list of employees
apiRoutes.get('/employees', async (req, res) => {
    try {
        let sql = 'SELECT * FROM `employees`';
        let values = [];
        const baseQueryLength = sql.length;

        // Filter by age
        if (req.query.age) {
            sql += ' WHERE age > ?';
            values.push(req.query.age);
        }
        // Filter by department
        if (req.query.department) {
            sql += (sql.length == baseQueryLength ? ' WHERE' : ' AND') + " department_id = ?";
            values.push(req.query.department);
        }
        // Filter by API name
        if (req.query.name) {
            sql += (sql.length == baseQueryLength ? ' WHERE' : ' AND') + " name LIKE ?";
            values.push(`%${req.query.name}%`);
        }

        // Run query and return result to client as JSON data
        const [employeeRows, fields] = await db.execute(sql, values);
        res.json(employeeRows);
    } catch (err) {
        console.log(err);
    }
});


apiRoutes.get('/projects', async (req, res) => {
    try {
        let sql = 'SELECT name, DATE_FORMAT(startdate, "%Y-%m-%d") AS startdate, DATE_FORMAT(enddate, "%Y-%m-%d") AS enddate FROM `projects`';
        let values = [];
        const baseQueryLength = sql.length;

        // Filter by startdate
        if (req.query.startdate) {
            sql += (sql.length == baseQueryLength ? ' WHERE' : ' AND') + " startdate = ?";
            values.push(req.query.startdate);
        }
        if (req.query.startdate_gt) {
            sql += (sql.length == baseQueryLength ? ' WHERE' : ' AND') + " startdate > ?";
            values.push(req.query.startdate_gt);
        }
        if (req.query.startdate_lt) {
            sql += (sql.length == baseQueryLength ? ' WHERE' : ' AND') + " startdate < ?";
            values.push(req.query.startdate_lt);
        }

        // Filter by enddate
        if (req.query.enddate) {
            sql += (sql.length == baseQueryLength ? ' WHERE' : ' AND') + " enddate = ?";
            values.push(req.query.enddate);
        }
        if (req.query.enddate_gt) {
            sql += (sql.length == baseQueryLength ? ' WHERE' : ' AND') + " enddate > ?";
            values.push(req.query.enddate_gt);
        }
        if (req.query.enddate_lt) {
            sql += (sql.length == baseQueryLength ? ' WHERE' : ' AND') + " enddate < ?";
            values.push(req.query.enddate_lt);
        }

        // Filter by name
        if (req.query.name) {
            sql += (sql.length == baseQueryLength ? ' WHERE' : ' AND') + " name LIKE ?";
            values.push(`%${req.query.name}%`);
        }

        // Filter by id
        if (req.query.id) {
            sql += (sql.length == baseQueryLength ? ' WHERE' : ' AND') + " id = ?";
            values.push(req.query.id);
        }

        // Run query and return result to client as JSON data
        const [projectRows, fields] = await db.execute(sql, values);
        console.log("RES", projectRows);
        res.json(projectRows);
    } catch (err) {
        console.log(err);
    }
});

export default apiRoutes;