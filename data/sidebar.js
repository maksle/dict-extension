/*global addon */

function addLookup(lookup) {
  var template = document.getElementById('list-item-template');
  var clone = document.importNode(template.content, true);
  var li = clone.querySelector('li');
  clone.querySelector('span.word').innerText = lookup.word;
  clone.querySelector('pre.definition').innerText = lookup.definition;
  li.dataset.word = lookup.word;

  var toggle = clone.querySelector('span.toggle');
  toggle.addEventListener('click', function() {
    var pre = this.parentNode.querySelector('pre');
    if (pre.style.display === 'none') {
      pre.style.display = 'block';
    } else {
      pre.style.display = 'none';
    }
  }, false);

  var remove = clone.querySelector('span.remove');
  remove.addEventListener('click', function() {
    var li = this.parentNode;
    li.style = 'display:none';
    addon.port.emit('remove-word', li.dataset['word']);
  }, true);

  var list = document.getElementById('words');
  list.appendChild(clone);
};

// for some reason sidebar uses 'addon' instead of 'self' like every other widget does
addon.port.on('stored-data', function(payload) {
  payload.words.forEach(function(word) {
    addLookup(payload.wordIndex[word]);
  });
});

addon.port.on('new-data', addLookup);
