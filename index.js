var ui = require("sdk/ui");
var panels = require('sdk/panel');
var tabs = require("sdk/tabs");
var pageMod = require('sdk/page-mod');
var child_process = require("sdk/system/child_process");
var notifications = require("sdk/notifications");
var ss = require("sdk/simple-storage");
var emit = require('sdk/event/core').emit;

/* storage */
ss.storage.words = ss.storage.words || [];
ss.storage.wordIndex = ss.storage.wordIndex || {};
ss.storage.settings = ss.storage.settings || {
    dictPath: '/usr/bin/dict',
    autoReview: true
};

ss.on("OverQuote", function() {
    while (ss.quotaUsage > 1) {
        var word = ss.storage.words.pop();
        delete ss.storage.wordIndex[word];
    }
});

/* global */
var panelWidth = 570;
var panelHeight = 400;
var selectedWord;

/* extension button */
var actionButton = ui.ToggleButton({
    id: "dict-extension-button",
    label: "dict-extension",
    icon: {
        '16': './dict-16.png',
        '32': './dict-32.png',
        '64': './dict-64.png'
    },
    onChange: function(state) {
        if (state.checked) {
            actionButtonPanel.show({
                position: actionButton
            });
        }
    }
});

var actionButtonPanel = panels.Panel({
    contentURL: './button-panel.html',
    contentScriptFile: './button-panel.js',
    onHide: function() {
        actionButton.state('window', { checked: false });
    }
});

actionButtonPanel.port.on('show-settings', function() {
    actionButtonPanel.hide();
    settingsPanel.show();
});

actionButtonPanel.port.on('show-review', function() {
    actionButtonPanel.hide();
    sidebar.show();
});

/* settings panel */
var settingsPanel = panels.Panel({
    contentURL: './settings-panel.html',
    contentScriptFile: './settings-panel.js'
});

settingsPanel.on('show', function() {
    settingsPanel.port.emit('show', {
        pathPrefix: dictPathPrefix(),
        autoReview: ss.storage.settings.autoReview
    });
});

settingsPanel.port.on('set-dict-path', function(path) {
    ss.storage.settings.dictPath = path;
});

settingsPanel.port.on('set-auto-review', function(autoReview) {
    ss.storage.settings.autoReview = !!autoReview;
});

function dictPathPrefix() {
    var dictPath = ss.storage.settings.dictPath || '';
    if (dictPath && dictPath.length >= 5 && 
        dictPath.substring(dictPath.length - 5) === '/dict') {
        return dictPath.substring(0, dictPath.length - 5);
    } else {
        return dictPath || '';
    }
}

/* sidebar */
var sidebar = ui.Sidebar({
    id: 'dict-extension-sidebar',
    title: 'Review definitions',
    url: './sidebar.html',
    onReady: function(worker) {
        worker.port.emit('stored-data', { 
            words: ss.storage.words,
            wordIndex: ss.storage.wordIndex
        });
        sidebar.on('new-data', function(lookup) {
            worker.port.emit('new-data', lookup);
        });
        worker.port.on('remove-word', removeLookup);
    }
});
// sidebar you're such a weirdo
sidebar.emit = sidebar.emit || emit.bind(sidebar, sidebar);

function removeLookup(word) {
    for (var i = 0, l = ss.storage.words.length; i < l; i++) {
        if (ss.storage.words[i] === word) {
            ss.storage.words.splice(i, 1);
            delete ss.storage.wordIndex[word];
            break;
        }
    }
}

function addLookup(lookup) {
    if (!ss.storage.wordIndex.hasOwnProperty(lookup.word)) {
        ss.storage.words.push(lookup.word);
        ss.storage.wordIndex[lookup.word] = lookup;
        
        if (ss.quotaUsage > 0.97) {
            notifyUserOfQuota();
        }

        return true;
    }
    return false;
}

/* definition popup panel */
var definitionPanel = panels.Panel({
    contentURL: './definition-panel.html',
    contentScriptFile: './definition-panel.js',
    width: panelWidth, height: panelHeight
});

definitionPanel.on('show', function() {
    definitionPanel.port.emit('show');
    lookup(selectedWord, sendDefinition, function error(exception) {
        // can't use dict error codes, child_process returns some error code of
        // it's own instead
        if (exception && 
            noMatch(exception.message) &&
            hasSuggestions(exception.message)) {
            var suggestion = findSuggestion(exception.message);
            if (suggestion.length) {
                selectedWord = suggestion;
                sendDefinition(suggestion, 'No match, looking up "' + suggestion + '" instead.\n\n');
                lookup(suggestion, sendDefinition, function() {}, lookupComplete);
            }
        }
    }, lookupComplete);
});

definitionPanel.port.on('add-to-review', function(lookup) {
    if (addLookup(lookup)) {
        sidebar.emit('new-data', lookup);
    }
});

function lookupComplete(word, definition, code, errorMessage) {
    if (code !== 0 && !definition.length && !noMatch(errorMessage)) {
        notifyUserOfLookupError(code);
    } else if (code === 0 && definition.length) {
        var lookup = {
            word: word,
            definition: definition
        }

        var payload = {
            lookup: lookup,
            autoReview: ss.storage.settings.autoReview
        };
        definitionPanel.port.emit('definition-complete', payload);

        if (ss.storage.settings.autoReview) {
            console.log('autoReview adding');
            if (addLookup(lookup)) {
                sidebar.emit('new-data', lookup);
            }
        }
    }
}

function noMatch(errorMessage) {
    return errorMessage.search('No definitions found') > -1 ;
}

function hasSuggestions(errorMessage) {
    return errorMessage.search('perhaps you mean') > -1;
}

function notifyUserOfLookupError(code) {
    notifications.notify({
        title: "dict-extension exception",
        text: "Exception occurred calling 'dict' executable",
        data: "Calling " + ss.storage.settings.dictPath + " process exited with code " + code
    });  
}

function notifyUserOfQuota() {
    notifications.notify({
        title: "dict-exception quota notification",
        text: "Quota is at " + ss.quotaUsage + ". Please deleted some words from "  + 
            "the review panel. If storage goes over the quota, the most recent words will " + 
            "be deleted."
    });
}

definitionPanel.on('hide', function() {
    definitionPanel.port.emit('hide');
});

function sendDefinition(word, definitionBytes) {
    if (word === selectedWord) {
        definitionPanel.port.emit('definition-show', {
            word: selectedWord,
            definitionBytes: definitionBytes
        });
    }
}

function findSuggestion(str) {
    var res = str;
    var sentences = res.split('\n');
    var suggestion = '', words, wordArr;
    while (sentences.length) {
        words = sentences.pop().trim();
        words = words.substring(words.search(':') + 1);
        words = words.replace(/\s+/g, ' ').trim().split(' ');
        if (words.length && words[0] !== '') {
            suggestion = words[0];
            break;
        }
    }
    return suggestion;
}

/* pagemod */
pageMod.PageMod({
    include: '*',
    contentScriptFile: './selection.js',
    contentScriptWhen: "ready",
    onAttach: receiveSelections
});

function receiveSelections(worker) {
    worker.port.on('selectionMade', function(selection) {
        selectedWord = selection.selectionText;
        definitionPanel.port.emit('selection-made', selection.selectionText);
        definitionPanel.show({
            position: {
                left: selection.clientX - panelWidth/2 + 25,
                top: selection.clientY - panelHeight - 25
            }
        });
    });
}

/* lookup words */
function lookup(word, cb, err, closeCb) {
    var dict = child_process.spawn(ss.storage.settings.dictPath, [word]);

    var definition = '';
    dict.stdout.on('data', function (data) {
        definition += data;
        cb(word, data);
    });

    var error = '';
    dict.stderr.on('data', function (data) {
        error += data;
    });

    dict.on('close', function (code) {
        if (error.length) {
            err({
                message: error,
                code: code
            });
        } 
        closeCb(word, definition, code, error);
    });
};

