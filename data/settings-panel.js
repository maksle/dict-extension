/*global self */

var dictPath =  document.getElementById('dict-path-input');
var dictPathDisplay = document.getElementById('dict-path-display');
var autoReview = document.getElementById('auto-review-checkbox');

self.port.on('show', function(settings) {
  dictPath.value = settings.pathPrefix;
  dictPathDisplay.innerText = settings.pathPrefix + '/dict';
  autoReview.checked = settings.autoReview;
});

dictPath.addEventListener('blur', function(event) {
  self.port.emit('set-dict-path', event.target.value + '/dict');
});

dictPath.addEventListener('input', function(event) {
  dictPathDisplay.innerText = event.target.value + '/dict';
});

autoReview.addEventListener('change', function(event) {
  self.port.emit('set-auto-review', autoReview.checked);
});
