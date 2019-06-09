class Tab {
  constructor (tab, clearTab, MessagingService) {
    this.tab = tab
    this.clearTab = clearTab
    this.messagingService = new MessagingService()
  }

  async init () {
    this.canvas = document.createElement('canvas')
    this.image = new Image()

    try {
      await this.injectScript()
    } catch (err) {
      this.error = err
      return
    }

    this.messagingService.on('tab', (data) => {
      switch (data.type) {
        case 'requestCapture':
          this.captureTab()
          break

        case 'saveASE':
          this.saveFile(data.url)
          break

        case 'destroy':
          this.destroy()
          break
      }
    })

    this.worker = new Worker('worker.js')

    this.worker.onmessage = (message) => {
      const { channel, data } = message.data
      this.messagingService.trigger(channel, data)
    }

    this.messagingService.on('worker', (data) => {
      this.worker.postMessage(data)
    })

    this.captureTab()
    this.getZoom()

    chrome.tabs.onZoomChange.addListener(({ tabId, oldZoomFactor, newZoomFactor }) => {
      if (tabId !== this.tab.id) return
      this.setZoom(newZoomFactor)
    })

    this.messagingService.trigger('injected', { type: 'init' })
    this.worker.postMessage({ type: 'init' })

    // Set active icon
    this.setIcon('active')
  }

  async injectScript () {
    return new Promise((resolve, reject) => {
      chrome.tabs.executeScript(this.tab.id, { file: 'injected.js' }, () => {
        const err = chrome.runtime.lastError
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  }

  destroy (silent) {
    if (!silent) {
      this.messagingService.trigger('injected', { type: 'destroy' })
      this.setIcon('default')
    }

    this.clearTab(this.tab.id)
  }

  async saveFile (url) {
    const handler = this.setFilename
    chrome.downloads.onDeterminingFilename.addListener(handler)

    const currentId = await this.download(url)
    const success = await this.onDownloadComplete(currentId).then(() => {
      chrome.downloads.onDeterminingFilename.removeListener(handler)
    })

    return success
  }

  setFilename (item, suggest) {
    suggest({ filename: 'black_shrimp-swatches.ase', overwrite: true })
  }

  download (url) {
    return new Promise(resolve => chrome.downloads.download({ url, saveAs: true }, resolve))
  }

  onDownloadComplete (itemId) {
    return new Promise(resolve => {
      chrome.downloads.onChanged.addListener(function onChanged ({ id, state }) {
        if (id === itemId && state && state.current !== 'in_progress') {
          chrome.downloads.onChanged.removeListener(onChanged)
          resolve(state.current === 'complete')
        }
      })
    })
  }

  setIcon (icon = 'default') {
    let path
    switch (icon) {
      case 'active':
        path = 'assets/img/icon16_alt.png'
        break

      default:
        path = 'assets/img/icon16.png'
        break
    }

    chrome.browserAction.setIcon({
      tabId: this.tab.id,
      path: {
        16: path
      }
    })
  }

  captureTab () {
    chrome.tabs.captureVisibleTab({ format: 'png' }, this.loadImage.bind(this))
  }

  loadImage (dataUrl) {
    this.image.onload = this.processCapture.bind(this)
    this.image.src = dataUrl
  }

  processCapture () {
    this.context = this.canvas.getContext('2d')

    // adjust the canvas size to the image size
    this.canvas.width = this.tab.width
    this.canvas.height = this.tab.height

    // draw the image to the canvas
    this.context.drawImage(
      this.image,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    )

    // store image data
    let imageData = this.context.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    ).data
    this.sendImageData(imageData)
  }

  sendImageData (imageData) {
    this.worker.postMessage(
      {
        type: 'imageData',
        imageData: imageData.buffer,
        width: this.canvas.width,
        height: this.canvas.height
      },
      [imageData.buffer]
    )

    this.messagingService.trigger('injected', { type: 'captureDone' })
  }

  getZoom () {
    chrome.tabs.getZoom(this.tab.id, this.setZoom.bind(this))
  }

  setZoom (zoom) {
    this.worker.postMessage(
      {
        type: 'setZoom',
        zoom
      }
    )
  }
}

export default Tab
