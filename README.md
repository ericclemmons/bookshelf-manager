# [Bookshelf Manager][0]

[![Build Status](https://travis-ci.org/ericclemmons/bookshelf-manager.png)](https://travis-ci.org/ericclemmons/bookshelf-manager)
[![Dependencies](https://david-dm.org/ericclemmons/bookshelf-manager.png)](https://david-dm.org/ericclemmons/bookshelf-manager)
[![devDependencies](https://david-dm.org/ericclemmons/bookshelf-manager/dev-status.png)](https://david-dm.org/ericclemmons/bookshelf-manager#info=devDependencies&view=table)

> Model & Collection manager for [Bookshelf.js][1] to make it easy to create &
> save deep, nested JSON structures from API requests.


## API

*In progress...*


## Changelog

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
