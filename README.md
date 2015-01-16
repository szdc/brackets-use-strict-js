Brackets Extension: Strict JavaScript
======================

Adds the `'use strict';` statement to the top of your JS file on save. 

&#10003; Supports the function form (inserts on the first line after the first opening brace)
```
(function() {
  'use strict';
  ...
})()
```

&#10003; Supports the Node.JS form (based on having `node: true` set in your jslint/jshint file-level settings; inserts a the statement and a new line before the first line of code)
```
/*jslint node: true */
'use strict';

var app = require('express');
...
```

**Menu options**:
- **Enable Strict Mode (Ctrl-Shift-J)**: Immediately checks the current file for the use strict statement, irrespective of the language.
- **Enable Strict Mode On Save**: Checks the current file when saved.  (`.js` files only)

# Installation
In Brackets, choose File > Extension Manager and click on the Available tab.  Then search for `use strict`.
