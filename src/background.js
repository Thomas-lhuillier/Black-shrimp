import 'babel-polyfill'
import Tab from './tab'
import MessagingService from './messagingService'

const tabs = {}

const toggle = (tab) => {
  if (!tabs[tab.id]) {
    addTab(tab)
  } else {
    deactivateTab(tab.id)
  }
}

const addTab = async (tab) => {
  const app = new Tab(tab, clearTab, MessagingService)
  tabs[tab.id] = app
  await app.init()

  if (app.error) {
    console.warn(app.error.message)
    clearTab(tab.id)
  }
}

const deactivateTab = (id) => {
  tabs[id].destroy()
  clearTab(id)
}

const clearTab = (id) => {
  delete tabs[id]
}

// Listen for click events on the application button
chrome.browserAction.onClicked.addListener(tab => {
  toggle(tab)
})

// On port connection, we register it to the messagingService
// to forward its messages to other part of the application,
// and to post message to the port.
// This way all the ports and workers can talk to each other.
chrome.runtime.onConnect.addListener(async (port) => {
  const app = tabs[port.sender.tab.id]

  // Subscribe to channel corresponding to port name
  app.messagingService.on(port.name, (data) => {
    port.postMessage(data)
  })

  // On port message, trigger message in messagingService
  // to dispatch the message to other parts of the application
  port.onMessage.addListener((message) => {
    const { channel, data } = message
    app.messagingService.trigger(channel, data)
  })

  // Destroy the application when a port is disconnected,
  // this usually means the user has closed or refresh a page
  // where the application was still opened.
  port.onDisconnect.addListener(() => {
    app.destroy(true)
  })
})

chrome.runtime.onSuspend.addListener(() => {
  for (let tabId in tabs) {
    tabs[tabId].deactivate(true)
  }
})
