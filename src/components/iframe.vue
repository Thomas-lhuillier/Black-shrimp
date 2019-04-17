<script>
import Vue from "vue";

export default {
  render(h) {
    return h("iframe", {
      style: {
        all: "initial",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        "z-index": 1000000001
      },
      on: {
        load: () => {
          this.injectCSS();
          this.renderChildren();
        }
      }
    });
  },

  computed: {
    isVisible() {
      return this.$store.getters.getVisibility;
    }
  },

  watch: {
    isVisible(value) {
      if (this.$el) {
        this.$el.style.display = value ? "block" : "none";
      }
    }
  },

  beforeUpdate() {
    // Freezing to prevent unnessessary Reactifiation of vNodes
    this.iApp.children = Object.freeze(this.$slots.default);
  },

  methods: {
    renderChildren() {
      // We will mount the iframe children as a nested app inside it
      const self = this;
      const children = this.$slots.default;
      const body = this.$el.contentDocument.body;
      const el = document.createElement("DIV");
      body.appendChild(el);

      const iApp = new Vue({
        name: "iApp",

        // Pass the store to every descendents
        store: self.$store,

        // Freeze to prevent unnessessary Reactifiation of vNodes
        data: {
          children: Object.freeze(children)
        },

        render(h) {
          return h("div", this.children);
        }
      });

      iApp.$mount(el); // mount into iframe

      this.iApp = iApp; // cache instance for later updates
    },

    injectCSS() {
      const head = this.$el.contentDocument.head;
      const style = this.$el.contentDocument.createElement("link");
      style.type = "text/css";
      style.rel = "stylesheet";
      style.href = chrome.extension.getURL("/assets/injected.css");

      head.appendChild(style);
    }
  }
};
</script>

<style lang="scss">
@import "../sass/variables";

// resets
button {
  padding: 0;
  color: inherit;
  cursor: pointer;
}

.btn {
  color: #b3b3b3;
  background-color: #666666;
  border-width: 0;
  border-radius: 2px;

  &:hover {
    color: #f0f0f0;
    background-color: #333333;
  }
}
</style>
