
const port = chrome.runtime.connect(null, { name: 'injected' })

let iframe
port.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.type) {
    case 'init':
      iframe = createIframe()
      break

    // Once an image capture has been processed an instruction
    // will be emitted to turn on the view ; as we hide the view
    // before taking a new capture.
    case 'captureDone':
      iframe.style.display = 'block'
      break

    case 'destroy':
      iframe.parentNode.removeChild(iframe)
      unregisterEvents()
      break
  }
})

/**
 * Create and mount the application iframe
 *
 * @returns {Element} The mounted iframe element
 */
const createIframe = () => {
  iframe = document.createElement('iframe')
  iframe.id = 'black-shrimp-iframe'
  iframe.src = chrome.extension.getURL('index.html')
  iframe.setAttribute('sandbox', 'allow-scripts allow-modals')
  css(iframe, {
    all: 'initial',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    'z-index': 1000000001
  })
  document.body.appendChild(iframe)

  registerEvents()

  return iframe
}

const registerEvents = () => {
  window.addEventListener('scroll', onViewportChange)
  window.addEventListener('resize', onViewportChange)
}

const unregisterEvents = () => {
  window.removeEventListener('scroll', onViewportChange)
  window.removeEventListener('resize', onViewportChange)
}

let scrollTimer
const onViewportChange = () => {
  iframe.style.display = 'none'

  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(function () {
    processViewportChange()
  }, 50)
}

/**
 * Recompute viewport position/dimensions on window resize
 * and user scroll then request a new image capture.
 */
const processViewportChange = () => {
  const doc = document.documentElement
  const pageOffset = {}

  pageOffset.x = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0)
  pageOffset.y = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0)

  port.postMessage({
    channel: 'tab',
    data: {
      type: 'requestCapture',
      pageOffset: { x: pageOffset.x, y: pageOffset.y }
    }
  })
}

const css = (el, styles) => {
  for (const property in styles) { el.style[property] = styles[property] }
}
