const tabs = {};

function toggle(tab) {
  if (!tabs[tab.id]) {
    addTab(tab);
  } else {
    deactivateTab(tab.id);
  }
}

function addTab(tab) {
  tabs[tab.id] = Object.create(Blackshrimp);
  tabs[tab.id].construct(tab);
}

function deactivateTab(id) {
  tabs[id].destroy();
}

function clearTab(id) {
  for (let tabId in tabs) {
    if (tabId == id) {
      delete tabs[tabId];
    }
  }
}

let lastBrowserAction = null;

// Icon click listener
chrome.browserAction.onClicked.addListener(function(tab) {
  toggle(tab);
  lastBrowserAction = Date.now();
});

// Runtime port connexion
chrome.runtime.onConnect.addListener(function(port) {
  tabs[port.sender.tab.id].connect(port);
});

chrome.runtime.onSuspend.addListener(function() {
  for (let tabId in tabs) {
    console.log('tab ', tabId, ' deactive');
    tabs[tabId].deactivate(true);
  }
});

const Blackshrimp = {
  image: new Image(),
  canvas: document.createElement('canvas'),

  construct: function(tab) {
    this.tab = tab;

    this.onBrowserDisconnect = this.onBrowserDisconnect.bind(this);
    this.onPortMessage = this.onPortMessage.bind(this);

    chrome.tabs.executeScript(this.tab.id, { file: 'injected.js' });

    // Set active icon
    this.setIcon('active');

    this.worker = new Worker('worker.js');
    this.worker.onmessage = this.onWorkerMessage.bind(this);
    this.worker.postMessage({
      type: 'init'
    });
  },

  destroy: function(silent) {
    if (!silent) {
      this.port.postMessage({ type: 'destroy' });
    }

    this.port.onDisconnect.removeListener(this.onBrowserDisconnect);
    this.worker.postMessage({ type: 'destroy' });
    this.setIcon('default');
    clearTab(this.tab.id);
  },

  connect: function(port) {
    this.port = port;
    this.port.onMessage.addListener(this.onPortMessage);
    this.port.onDisconnect.addListener(this.onBrowserDisconnect);

    this.port.postMessage({
      type: 'init'
    });

    this.captureTab();
  },

  onBrowserDisconnect: function() {
    this.destroy(true);
  },

  onPortMessage: function(event) {
    switch (event.type) {
      case 'mousePos':
        this.worker.postMessage({
          type: 'mousePos',
          coord: event.coord
        });
        break;

      case 'color':
        this.port.postMessage({
          type: 'color',
          coord: event.data
        });
        break;

      case 'viewportChange':
        this.captureTab();
        break;

      case 'destroy':
        this.destroy();
        break;
    }
  },

  onWorkerMessage: function(event) {
    let forward = ['color', 'screenshot processed', 'mousePos'];
    console.log(
      `received worker message, forward to port ${this.port} :`,
      event
    );

    if (forward.indexOf(event.data.type) > -1) {
      this.port.postMessage(event.data);
    }
  },

  setIcon: function(type = 'default') {
    let path;
    switch (type) {
      case 'active':
        path = 'assets/img/icon16_alt.png';
        break;

      default:
        path = 'assets/img/icon16.png';
        break;
    }

    chrome.browserAction.setIcon({
      tabId: this.tab.id,
      path: {
        16: path
      }
    });
  },

  captureTab: function() {
    chrome.tabs.captureVisibleTab({ format: 'png' }, this.loadImage.bind(this));
  },

  loadImage: function(dataUrl) {
    this.image.onload = this.processCapture.bind(this);
    this.image.src = dataUrl;
  },

  processCapture: function() {
    this.context = this.canvas.getContext('2d');

    // adjust the canvas size to the image size
    this.canvas.width = this.tab.width;
    this.canvas.height = this.tab.height;

    // draw the image to the canvas
    this.context.drawImage(
      this.image,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    // store image data
    let imageData = this.context.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    ).data;
    this.sendImageData(imageData);
  },

  sendImageData: function(imageData) {
    this.worker.postMessage(
      {
        type: 'imageData',
        imageData: imageData.buffer,
        width: this.canvas.width,
        height: this.canvas.height
      },
      [imageData.buffer]
    );

    this.port.postMessage({
      type: 'imageData',
      imageData: this.image.src,
      width: this.canvas.width,
      height: this.canvas.height
    });
  }
};
