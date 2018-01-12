const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
                db.get('SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId', {$menuItemId: menuItemId}, (error, menuItem) => {
                  if (error)
                  {
                    next(error);
                  }
                  else if (!menuItem)
                  {
                    res.sendStatus(404);
                  }
                  else if (menuItem)
                  {
                    req.menuItem = menuItem;
                    next();
                  }
                });
});

menuItemsRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId', {$menuId: req.params.menuId}, (error, menuItems) => {
      if (error)
      {
        next(error);
      }
      else
      {
      res.status(200).json({menuItems: menuItems});
      }
    });
});

menuItemsRouter.post('/', (req, res, next) => {
  const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price,
        menuId = req.params.menuId;

        if (!name || !description || !inventory || !price)
        {
          return res.sendStatus(400);
        }
  db.run('INSERT INTO MenuItem(name, description, inventory, price, menu_id) VALUES($name, $description, $inventory, $price, $menuId)',
        {$name: name, $description: description, $inventory: inventory, $price: price, $menuId: menuId}, function(error) {
          if (error)
          {
            next(error);
          }
          db.get('SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId', {$menuItemId: this.lastID}, function(error, menuItem) {
            if (error)
            {
              next(error);
            }
            res.status(201).json({menuItem: menuItem});
          });
        });
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
  const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price;

        if (!name || !description || !inventory || !price)
        {
          return res.sendStatus(400);
        }
      db.run('UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price WHERE id = $menuItemId',
              {$name: name, $description: description, $inventory: inventory, $price: price, $menuItemId: req.params.menuItemId}, function(error) {
                db.get('SELECT * FROM MenuItem WHERE id = $menuItemId', {$menuItemId: req.params.menuItemId}, (error, menuItem) => {
                  if (error)
                  {
                    next(error);
                  }
                  res.status(200).json({menuItem: menuItem});
                });
              });
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
        db.run('DELETE FROM MenuItem WHERE id = $menuItemId', {$menuItemId: req.params.menuItemId}, function(error) {
          if (error)
          {
            next(error);
          }
          res.sendStatus(204);
        });
});

module.exports = menuItemsRouter;
