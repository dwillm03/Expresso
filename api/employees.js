const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const timesheetsRouter = require('./timesheets.js');

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
  db.get('SELECT * FROM Employee WHERE id = $employeeId', {$employeeId: employeeId}, (error, employee) => {
    if (error)
    {
      next(error);
    }
    else if (employee)
    {
      req.employee = employee;
      next();
    }
    else if (!employee)
    {
      res.sendStatus(404);
    }
  });
});

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

employeesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Employee WHERE is_current_employee = 1', (error, employees) => {
    if (error)
    {
      next(error);
    }
    else{
      res.status(200).json({employees: employees});
    }
  });
});

employeesRouter.post('/', (req, res, next) => {
  const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage;

        if (!name || !position || !wage)
        {
          res.sendStatus(400);
          return;
        }
  db.run('INSERT INTO Employee(name, position, wage) VALUES($name, $position, $wage)', {$name: name, $position: position, $wage: wage},
          function(error) {
        if (error)
        {
        next(error);
        }
        db.get('SELECT * FROM Employee WHERE id = $employeeId', {$employeeId: this.lastID}, (error, employee) => {
          res.status(201).json({employee: employee});
        });
      });
});

employeesRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).json({employee: req.employee});
});

employeesRouter.put('/:employeeId', (req, res, next) => {
  const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage
        employeeId = req.params.employeeId;
  if (!name || !position || !wage)
  {
    res.sendStatus(400);
    return;
  }
  db.run('UPDATE Employee SET name = $name, position = $position, wage = $wage WHERE id = $employeeId', {$name: name, $position: position, $wage: wage, $employeeId: employeeId},
  function(error) {
    if (error)
    {
      next(error);
    }
    db.get('SELECT * FROM Employee WHERE id = $employeeId', {$employeeId: employeeId}, (error, employee) => {
      if (error)
      {
        next(error);
      }
      res.status(200).json({employee: employee});
    });
  });
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
  const employeeId = req.params.employeeId;

  db.run('UPDATE Employee SET is_current_employee = 0 WHERE id = $employeeId', {$employeeId: employeeId}, function(error) {
    if (error)
    {
      next(error);
    }
    db.get('SELECT * FROM Employee WHERE id = $employeeId', {$employeeId: employeeId}, (error, employee) => {
      if (error)
      {
        next(error);
      }
      res.status(200).json({employee: employee});
    });
  });
});

module.exports = employeesRouter;
