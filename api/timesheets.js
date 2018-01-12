const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
    db.get('SELECT * FROM Timesheet WHERE id = $timesheetId', {$timesheetId: timesheetId}, (error, timesheet) => {
      if (error)
      {
        next(error)
      }
      else if (!timesheet)
      {
        res.sendStatus(404);
      }
      else if (timesheet)
      {
        req.timesheet = timesheet;
        next();
      }
    });
});

timesheetsRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Timesheet WHERE Timesheet.employee_id = $id', {$id: req.params.employeeId}, (error, timesheets) => {
    if (error)
    {
      next(error);
    }
    res.status(200).json({timesheets: timesheets});
});
});

timesheetsRouter.post('/', (req, res, next) => {
  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date;

        if (!hours || !rate || !date)
        {
          return res.sendStatus(400);
        }
  db.run('INSERT INTO Timesheet(hours, rate, date, employee_id) VALUES($hours, $rate, $date, $employeeId)',
        {$hours: hours, $rate: rate, $date: date, $employeeId: req.params.employeeId}, function(error) {
          if (error)
          {
            next(error);
          }
          db.get('SELECT * FROM Timesheet WHERE id = $id', {$id: this.lastID}, (error, timesheet) => {
            res.status(201).json({timesheet: timesheet});
          });
        });
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date;

            if (!hours || !rate || !date)
            {
              return res.sendStatus(400);
            }
            db.run('UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId',
                  {$hours: hours, $rate: rate, $date: date, $employeeId: req.params.employeeId}, function(error) {
                    if (error)
                    {
                      next(error);
                    }
                    db.get('SELECT * FROM Timesheet WHERE id = $timesheetId', {$timesheetId: req.params.timesheetId}, (error, timesheet) => {
                      if (error)
                      {
                        next(error);
                      }
                      res.status(200).json({timesheet: timesheet});
                    });
                  });
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
            db.run('DELETE FROM Timesheet WHERE id = $id', {$id: req.params.timesheetId}, function(error) {
              if (error)
              {
                next(error);
              }
              res.sendStatus(204);
            });
});

module.exports = timesheetsRouter;
