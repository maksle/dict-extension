document.addEventListener('dblclick', function(event) {
  if (event.shiftKey) {
    var selection = window.getSelection();
    var selectionText = selection.toString().trim();
    if (selectionText.indexOf(' ') === -1) {
      self.port.emit('selectionMade', {
        clientX: event.clientX,
        clientY: event.clientY,
        selectionText: selectionText
      });
    }
  }
});
