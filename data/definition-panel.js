var content = document.getElementById('content');
var heading = document.getElementById('heading');
var addToListDiv = document.getElementById('add-to-list');

self.port.on('show', function() {
    content.scrollTop = 0;
});

self.port.on('hide', function() {
    heading.textContent = '';
    content.textConent = '';
    
});

self.port.on('selection-made', function(selection) {
    heading.textContent = selection;
    content.textContent = '';
});

self.port.on('definition-show', function(definition) {
    content.textContent += definition.definitionBytes;
});

self.port.on('definition-complete', function(payload) {
    if (!payload.autoReview) {
        while (addToListDiv.lastChild) {
            addToListDiv.removeChild(addToListDiv.lastChild);
        }
        var span = document.createElement('span');
        span.innerText = 'Add to review list';
        span.addEventListener('click', function() {
            self.port.emit('add-to-review', payload.lookup);
        });
        addToListDiv.appendChild(span);
        addToListDiv.style.display = 'block';
    }
});
