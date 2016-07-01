# [Bookshelf Manager][0]

[![Build Status](https://travis-ci.org/ericclemmons/bookshelf-manager.png)](https://travis-ci.org/ericclemmons/bookshelf-manager)
[![Dependencies](https://david-dm.org/ericclemmons/bookshelf-manager.png)](https://david-dm.org/ericclemmons/bookshelf-manager)
[![devDependencies](https://david-dm.org/ericclemmons/bookshelf-manager/dev-status.png)](https://david-dm.org/ericclemmons/bookshelf-manager#info=devDependencies&view=table)

> Model & Collection manager for [Bookshelf.js][1] to make it easy to create &
> save deep, nested JSON structures from API requests.

## Installation

    npm install bookshelf-manager --save

## Usage

  1. Register as a plugin in Bookshelf:

     ```javascript
     bookshelf.plugin('bookshelf-manager');
     ```

      - Optionally, you can pass in an object with a `root` property to read models from a specified directory:

         ```javascript
         bookshelf.plugin('bookshelf-manager', { root: 'path/to/models' });
         ```

  2. Register individual models (not required if you passed in a `root` model directory as above):

     ```javascript
     bookshelf.manager.register(model, modelName);
     ```

     - Note: Also compatible with models registered with the [Bookshelf Registry](https://github.com/tgriesser/bookshelf/wiki/Plugin:-Model-Registry) plugin.

  3. Use the methods on `bookshelf.manager` to create, fetch, and save models or collections with support for deeply-nested attributes. E.g.:

     ```javascript
     return bookshelf.manager.create('car', {
       features: [
         { name: 'ABS', cost: '1250' },
         { name: 'GPS', cost: '500' }
       ],
       quantity: 1
     }).then(function(car) {
       // created car should now have the associated features
     });
     ```


## API

*In progress...*


## Changelog

- v0.2.0 - Several breaking changes occurred with this version due to updating `devDependencies` and `peerDependencies`:
  - Knex and Bookshelf updated their `bluebird` and `lodash` dependencies
  - Knex changed how undefined values are inserted
- v0.1.0 - Reimplement as a plugin for Bookshelf/Knex 0.8.x
- v0.0.10 - Enforce `belongsToMany` IDs
- v0.0.9 - Destroy removed `hasMany` models
- v0.0.8 - Fetch empty collections
- v0.0.7 - Attempt to use existing, eager-loaded models rather than re-fetch
- v0.0.6 - Ignore `_pivot_` keys
- v0.0.5 - Improve error handling for unintialized instances & missing files
- v0.0.4 - Improve `.attach` and `.detach`
- v0.0.3 - Add support for lazy-managed models.
- v0.0.2 - If instanceof Bookshelf is not provided, instance from `Bookshelf.initialize` is used.
- v0.0.1 - Initial Release.


## [License][2]

Copyright (c) 2013 Eric Clemmons
Licensed under the MIT license.

[0]: https://github.com/ericclemmons/bookshelf-manager
[1]: http://bookshelfjs.org/
[2]: https://raw.github.com/ericclemmons/bookshelf-manager/master/LICENSE
