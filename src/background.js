import 'babel-polyfill'
import App from './app'

const tabs = {}

const toggle = (tab) => {
  if (!tabs[tab.id]) {
    addTab(tab)
  } else {
    deactivateTab(tab.id)
  }
}

const addTab = async (tab) => {
  const app = new App(tab, clearTab)
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
  // todo delete directly
  for (const tabId in tabs) {
    if (parseInt(tabId, 10) === id) {
      delete tabs[tabId]
    }
  }
}

// Icon click listener
chrome.browserAction.onClicked.addListener(tab => {
  toggle(tab)
})

// Runtime port connexion
chrome.runtime.onConnect.addListener(async (port) => {
  const app = tabs[port.sender.tab.id]
  app.connect(port)
})

chrome.runtime.onSuspend.addListener(() => {
  for (let tabId in tabs) {
    tabs[tabId].deactivate(true)
  }
})
