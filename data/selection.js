document.addEventListener('dblclick', function(event) {
    var selection = window.getSelection();
    var selectionText = selection.toString().trim();
    if (selectionText.indexOf(' ') === -1) {
        self.port.emit('selectionMade', {
            clientX: event.clientX,
            clientY: event.clientY,
            selectionText: selectionText
        });
    }
});
