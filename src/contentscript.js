let debug = true;
let tabs = {};

function toggle(tab) {
  if (!tabs[tab.id]) {
    console.log('addTab', tab.id);
    addTab(tab);
  } else {
    console.log('deactivateTab', tab.id);
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
  tabs[port.sender.tab.id].initialize(port);
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

    this.onBrowserDisconnectClosure = this.onBrowserDisconnect.bind(this);
    this.receiveBrowserMessageClosure = this.receiveBrowserMessage.bind(this);

    chrome.tabs.executeScript(this.tab.id, { file: 'injected.js' });

    // Set active icon
    chrome.browserAction.setIcon({
      tabId: this.tab.id,
      path: {
        16: 'assets/img/icon16_alt.png'
      }
    });

    this.worker = new Worker('worker.js');
    this.worker.onmessage = this.receiveWorkerMessage.bind(this);
    this.worker.postMessage({
      type: 'init',
      debug: debug
    });
  },

  destroy: function(silent) {
    // if(!this.port){
    //   // not yet initialized
    //   this.alive = false;
    //   return;
    // }

    if (!silent) {
      this.port.postMessage({ type: 'destroy' });
    }

    // this.port.onMessage.removeListener(this.receiveBrowserMessageClosure);
    this.port.onDisconnect.removeListener(this.onBrowserDisconnectClosure);

    // this.port.postMessage({ type: 'destroy' });
    this.worker.postMessage({
      type: 'destroy'
    });

    // Set back normal Icon
    chrome.browserAction.setIcon({
      tabId: this.tab.id,
      path: {
        16: 'assets/img/icon16.png'
      }
    });

    clearTab(this.tab.id);
  },

  initialize: function(port) {
    this.port = port;

    console.log('initialize - port:', port);

    this.port.onMessage.addListener(this.receiveBrowserMessageClosure);
    this.port.onDisconnect.addListener(this.onBrowserDisconnectClosure);

    this.port.postMessage({
      type: 'init',
      debug: debug
    });

    this.captureTab();
  },

  onBrowserDisconnect: function() {
    console.log('onBrowserDisconnect');
    this.destroy(true);
  },

  receiveBrowserMessageClosure: function(event) {
    console.log('receiveBrowserMessageClosure', event);
  },

  receiveBrowserMessage: function(event) {
    switch (event.type) {
      case 'mousePos':
        this.worker.postMessage({
          type: 'mousePos',
          coord: event.coord
        });
        break;
      case 'color':
        console.log('receiveBrowserMessage color', event.data.data);
        this.port.postMessage({
          type: 'color',
          coord: event.data
        });
        break;
      case 'viewportChange':
        console.log('receiveBrowserMessage viewportChange', event.pageOffset);
        this.captureTab();
        break;
      case 'destroy':
        console.log('receiveBrowserMessage destroy');
        this.destroy();
        break;
    }
  },

  receiveWorkerMessage: function(event) {
    let forward = ['debug screen', 'color', 'screenshot processed', 'mousePos'];
    console.log('received worker message, forward to port :', event);

    if (forward.indexOf(event.data.type) > -1) {
      this.port.postMessage(event.data);
    }
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
