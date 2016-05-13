## dict-extension
This add-on can be installed from the [Firefox add-on listing page][hosted].

  [hosted]: https://addons.mozilla.org/en-US/firefox/addon/dict-extension/

It looks up words by calling dict client on your machine in a subprocess. It can
also automatically save words you look up into a list to review later. This
extension is for Linux users who use the dict client to look up words. Double
click a word on any web page, and the extension will spawn a process to call
dict and then display the output in a popup. As an added feature, the words you
look up are automatically added to a list for later review.

This addon does not actually implement the DICT protocol, nor call any DICT
servers on it's own. It delegates that entirely to the `dict' client on your
machine. [This extension][another_dict_extension] is quite good and does
implement the dict protocol, if that is what you are looking for.

  [another_dict_extension]: https://addons.mozilla.org/en-US/firefox/addon/dict/

However, I suspect the above mentioned add-on, which does implement a DICT
client, will stop working at some point relatively soon, because like many
useful add-ons, it uses `require('chrome')`, and Mozilla is [doing away with the
add-on SDK][plans] and many of it's low level APIs.

  [plans]: https://blog.mozilla.org/addons/2015/08/21/the-future-of-developing-firefox-add-ons/

### License
Copyright (C) 2016 Maksim Grinman

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.

