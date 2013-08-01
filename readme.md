`async-replace` is an asynchronous drop-in replacement for `String.prototype.replace`.

======================================================================================

Use of the synchronous `replace` looks something like this:
```javascript
var summaryTemplate = "My favourite artists for this week are {0}, {1} and {2}.";
var artists = ["Pimp C", "Gay Cat Park", "Tela"];
var summary = summaryTemplate.replace(/{(\d)}/g, function getArtist(match, number, offset, input) {
	return artists[parseInt(number, 10)];
});
console.log(summary);
```

With the asynchronous drop-in, above code could be rewritten as this:
```javascript
String.prototype.replaceAsync = require("../library/async-replace").replaceAsync;

var summaryTemplate = "My favourite artists for this week are {0}, {1} and {2}.";
var artists = ["Pimp C", "Gay Cat Park", "Tela"];
summaryTemplate.replaceAsync(/{(\d)}/g, function getArtist(match, number, offset, input, callback) {
	callback(null, artists[parseInt(number, 10)]);
}, function useSummary(error, summary) {
	console.log(summary);
});
```

Why? Because the `getArtist` function no longer has to return the artist right away. Instead, it can load the list of artists from a slow database or an unreliable server on the other side of the globe, and simply use the `callback` when its ready.

## Copying

Copyright 2013 Pimm Hogeling

async-replace is free software. Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

**The Software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the Software or the use or other dealings in the Software.**

Alternatively, the Software may be used under the terms of either the GNU General Public License Version 3 or later (the "GPL"), or the GNU Lesser General Public License Version 3 or later (the "LGPL"), in which case the provisions of the GPL or the LGPL are applicable instead of those above.
