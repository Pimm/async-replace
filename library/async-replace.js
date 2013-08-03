/**
 * Copyright 2013 Pimm Hogeling
 *
 * async-replace is free software. Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software without restriction, including without
 * limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 *   Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Alternatively, the Software may be used under the terms of either the GNU General Public License Version 3 or later (the
 * "GPL"), or the GNU Lesser General Public License Version 3 or later (the "LGPL"), in which case the provisions of the GPL or
 * the LGPL are applicable instead of those above.
 */
const mapAsync = require("async").map;
exports.replaceAsync = function replaceAsync(regularExpressionOrSubstring, determineReplacement, callback) {
	const matchInformationArrays = [];
	// If the first argument is a regular expression, use the exec method of that argument to determine the matches.
	if (regularExpressionOrSubstring instanceof RegExp) {
		// Note: because this is a var, it will leak into the functions defined below. This is potentially bad.
		var matchInformation;
		while (null !== (matchInformation = regularExpressionOrSubstring.exec(this))) {
			matchInformationArrays.push(matchInformation);
			// If the regular expression is not global, break after this first match.
			if (false === regularExpressionOrSubstring.global) {
				break;
			}
		}
	// If the passed argument is a string, use the indexOf to determine whether there is a match and then kind-of mock an object
	// that RegExp.prototype.exec would return. If the passed argument is not a regular expression nor a string, cast it to a
	// string. This seems to be what String.prototype.replace does.
	} else {
		regularExpressionOrSubstring = String(regularExpressionOrSubstring);
		// Again, var leaks into function below.
		var index;
		if (-1 !== (index = this.indexOf(regularExpressionOrSubstring))) {
			matchInformationArrays[0] = [regularExpressionOrSubstring];
			matchInformationArrays[0]["index"] = index;
		}
	}
	// If there were no matches, directly call the callback passing the input.
	if (0 === matchInformationArrays.length) {
		callback(null, String(this));
		return;
	}
	const input = String(this);
	// Call the passed determineReplacement function for every match, collecting a replacement for every one of them.
	mapAsync(matchInformationArrays, function collectReplacement(matchInformation, callback) {
		// The determineReplacement function will be called with the following arguments:
		// 		match, (submatch,)n, offset, input, callback
		// Where "match" is the entire matched substring and the "substring" arguments are the parenthesised submatches. These are
		// already present in the matchInformation argument. The "offset" ‒ the offset (in characters) of the entire matched
		// substring in the input; the "input" and the callback are pushed.
		matchInformation.push(matchInformation["index"], input, callback);
		// The apply seems to ignore matchInformation["index"] (which exists) and matchInformation["input"] (which might exist,
		// depending on whether regularExpressionOrSubstring is a regular expression or not), which is a good thing.
		try {
			determineReplacement.apply(this, matchInformation);
		// Should this call throw an error (instead of passing an error to its callback, as it should), catch it and pass it to the
		// callback.
		} catch (error) {
			callback(error);
		}
	}, function replaceAll(error, replacements) {
		// If an error was provided, at least one of the calls to determineReplacement provided an error. Stop.
		if (null !== error) {
			callback(error);
			return;
		}
		// For every match, add the substring starting at the pointer and ending where the match starts + the appropriate
		// replacement to the result buffer.
		var pointer = 0;
		const resultBuffer = matchInformationArrays.map(function replace(matchInformation, matchIndex) {
			// Add the substring starting at the pointer and ending where the match starts.
			const result = this.substr(pointer, matchInformation["index"] - pointer) +
			// Move the pointer.
				(pointer = matchInformation["index"] + matchInformation[0].length,
			// Add the appropriate replacement.
				replacements[matchIndex]);
			return result;
		}, input);
		// Finally, add the substring starting at the pointer, which is now at the end of the last match, ending at the end of the
		// input.
		resultBuffer.push(input.substr(pointer));
		// Call the callback.
		callback(null, resultBuffer.join(""));
	});
}
