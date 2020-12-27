const { Suggestion, Link, CollectionBrowse, CollectionBrowseItem } = require('@assistant/conversation');

module.exports = {
  promptCommand: promptCommandFn
};

function promptCommandFn(conv, speechText, suggestions = [], links = [], collections = []) {
  if(speechText.length > 0) {
    conv.add(speechText);
  }

  suggestions.forEach((attr) => {
    const newAttr = new Suggestion({
      "title": attr
    });

    conv.add(newAttr);
  });

  links.forEach((attr) => {
    const newAttr = new Link({
      "name": attr.name,
      "open": {
        "url": attr.link
      }
    });

    conv.add(newAttr);
  });

  collections.forEach((attr) => {
    const newAttr = new CollectionBrowse({
      "imageFill": attr.imageFill,
      "items": attr.items
    });

    conv.add(newAttr);
  });
};