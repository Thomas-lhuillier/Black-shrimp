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

const addTab = (tab) => {
  tabs[tab.id] = Object.create(App)
  tabs[tab.id].construct(tab, { clearTab })
}

const deactivateTab = (id) => {
  tabs[id].destroy()
  clearTab(id)
}

const clearTab = (id) => {
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
chrome.runtime.onConnect.addListener(port => {
  tabs[port.sender.tab.id].connect(port)
})

chrome.runtime.onSuspend.addListener(() => {
  for (let tabId in tabs) {
    tabs[tabId].deactivate(true)
  }
})
