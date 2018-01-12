const express = require('express');
const menusRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const menuItemsRouter = require('./menuitems.js');

menusRouter.param('menuId', (req, res, next, menuId) => {
        db.get('SELECT * FROM Menu WHERE id = $menuId', {$menuId: menuId}, (error, menu) => {
          if (error)
          {
            next(error);
          }
          if (!menu)
          {
            return res.sendStatus(404);
          }
          else if (menu)
          {
            req.menu = menu;
            next();
          }
        });
});

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

menusRouter.get('/', (req, res, next) => {
        db.all('SELECT * FROM Menu', (error, menus) => {
          if (error)
          {
            next(error);
          }
          res.status(200).json({menus: menus});
        });
      });

menusRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;
    if (!title)
    {
      res.sendStatus(400);
      return;
    }
      db.run('INSERT INTO Menu(title) VALUES($title)', {$title: title}, function(error) {
        if (error)
        {
          next(error);
        }
        db.get('SELECT * FROM Menu WHERE id = $id', {$id: this.lastID}, (error, menu) => {
          if (error)
          {
            next(error);
          }
          res.status(201).json({menu: menu});
        });
      });
});

menusRouter.get('/:menuId', (req, res, next) => {
        res.status(200).json({menu: req.menu});
});

menusRouter.put('/:menuId', (req, res, next) => {
      const title = req.body.menu.title;
      if (!title)
      {
        res.sendStatus(400);
        return;
      }
        db.run('UPDATE Menu SET title = $title WHERE Menu.id = $menuId', {$title: title, $menuId: req.params.menuId}, function(error) {
          if (error)
          {
            next(error);
          }
          db.get('SELECT * FROM Menu WHERE id = $menuId', {$menuId: req.params.menuId}, (error, menu) => {
            res.status(200).json({menu: menu});
          });
        });
});

menusRouter.delete('/:menuId', (req, res, next) => {
      db.get('SELECT * FROM Menu, MenuItem WHERE Menu.id = $menuId AND Menu.id = MenuItem.menu_id', {$menuId: req.params.menuId},
      (error, menu) => {
        if (error)
        {
          next(error);
        }
        else if (menu)
        {
          res.sendStatus(400);
          return;
        }
        else if (!menu)
        {
          db.run('DELETE FROM Menu WHERE id = $menuId', {$menuId: req.params.menuId}, function(error) {
            if (error)
            {
              next(error);
            }
            res.sendStatus(204);
          });
        }
    });
});

module.exports = menusRouter;
