dict-extension
--------------
Lookup words by calling dict client on your machine in a subprocess.
Automatically save words you look up into a list to review later. This extension
is for Linux users who use the dict client to look up words. Double click a word
on any web page, and the extension will spawn a process to call dict and then
display the output in a popup. As an added feature, the words you look up are
automatically added to a list for later review.

This addon does not actually implement the DICT protocol, nor call any DICT
servers on it's own. It delegates that entirely to the `dict' client on your
machine. [This extension][another_dict_extension] is quite good and does
implement the dict protocol, if that is what you are looking for.

  [another_dict_extension]: https://addons.mozilla.org/en-US/firefox/addon/dict/

However, I suspect the above mentioned add-on will stop working at some point
relatively soon, because like many useful add-ons, it uses `require('chrome')`,
and Mozilla is [doing away with the add-on SDK][plans] and many of it's low
level APIs.

  [plans]: https://blog.mozilla.org/addons/2015/08/21/the-future-of-developing-firefox-add-ons/
