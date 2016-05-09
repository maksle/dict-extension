var settings = document.getElementById('settings');
var review = document.getElementById('review');

settings.addEventListener('click', function(event) {
    self.port.emit('show-settings');
});

review.addEventListener('click', function(event) {
    self.port.emit('show-review');
});