<!--
This component represent the entire color panel
@todo Should be refactored and splitted.
-->

<template>
  <div class="panel panel--color">
    <div class="colorPicker">
      <div class="colorViewer" v-bind:style="{ backgroundColor: hex }"></div>

      <!-- Color inputs -->
      <div class="valueWrapper">
        <div class="hexWrapper" v-bind:class="[{ active: color.hex.isActive }]">
          <input
            type="text"
            class="value_hex"
            v-model="hex"
            spellcheck="false"
            @click="selectInputText($event)"
          >
        </div>

        <div class="rgbWrapper" v-bind:class="[{ active: color.rgb.isActive }]">
          <input
            type="text"
            class="value_r"
            v-model="r"
            @click="selectInputText($event)"
            spellcheck="false"
          >
          <input
            type="text"
            class="value_g"
            v-model="g"
            @click="selectInputText($event)"
            spellcheck="false"
          >
          <input
            type="text"
            class="value_b"
            v-model="b"
            spellcheck="false"
            @click="selectInputText($event)"
          >
        </div>

        <div class="hslWrapper" v-bind:class="[{ active: color.hsl.isActive }]">
          <input
            type="text"
            class="value_h"
            v-model="h"
            @click="selectInputText($event)"
            spellcheck="false"
          >
          <input
            type="text"
            class="value_s"
            v-model="s"
            @click="selectInputText($event)"
            spellcheck="false"
          >
          <input
            type="text"
            class="value_l"
            v-model="l"
            spellcheck="false"
            @click="selectInputText($event)"
          >
        </div>
      </div>

      <!-- Color mode select -->
      <SelectComponent
        :options="[
        { text: 'hex', value: 1, isSelected: true  },
        { text: 'rgb', value: 2, isSelected: false },
        { text: 'hsl', value: 3, isSelected: false },
      ]"
        v-on:change="changeColorMode($event)"
      ></SelectComponent>
    </div>

    <!-- Color swatches -->
    <div class="colorSwatches">
      <draggable
        class="color-collection"
        v-model="colors"
        :tag="'ul'"
        :move="onMove"
        @end="deselectAll"
        group="colors"
      >
        <li
          v-for="(color, index) in colors"
          :key="index"
          class="btn-square -color"
          :class="[{ '-selected': color.isSelected }]"
          :style="{ 'background-color': color.hex }"
          @click="toggleColorSelection($event, color, index, colors)"
          data-maintain-selection
        ></li>
      </draggable>

      <draggable
        class="folder-collection"
        v-model="colorFolders"
        :tag="'ul'"
        :move="onMove"
        @end="deselectAll"
        group="folders"
      >
        <li
          v-for="(folder, index) in colorFolders"
          :key="index"
          :class="[{ '-selected': folder.isSelected }]"
          class="folder"
        >
          <draggable
            v-model="colorFolders[index].content"
            :tag="'ul'"
            group="colors"
            :move="onMove"
            @end="deselectAll"
            @click.self.native="toggleFolderSelection($event, folder, index)"
            data-maintain-selection
          >
            <li
              v-for="(color, subIndex) in folder.content"
              :key="subIndex"
              class="btn-square -color"
              :class="[{ '-selected': color.isSelected }]"
              :style="{ 'background-color': color.hex }"
              @click="toggleColorSelection($event, color, subIndex, folder.content)"
              data-maintain-selection
            ></li>
          </draggable>
        </li>
      </draggable>

      <!-- Action buttons -->
      <div class="button-wrapper">
        <button
          class="btn-square"
          v-on:click="addCurrentColor($event)"
          title="Add color [Alt + Shift + A]"
        >
          <i class="icon icon-plus"></i>
        </button>

        <button class="btn-square" @click="addFolder($event)" title="Add Folder [Alt + Shift + F]">
          <i class="icon icon-folder"></i>
        </button>

        <button
          class="btn-square"
          @click.exact="deleteSelection($event)"
          @click.shift.exact="deleteAll($event)"
          title="Delete selection [Alt + Shift + D]"
          data-maintain-selection
        >
          <i class="icon icon-trash"></i>
        </button>

        <button class="btn-square">
          <i class="icon icon-binoculars"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import SelectComponent from "./select-block.vue";
import draggable from "vuedraggable";
import save from "save-file";
import ase from "ase-utils";
import { between } from "../utilities/number";

Number.prototype.between = between;

export default {
  components: {
    SelectComponent,
    draggable
  },

  data: () => ({
    isActive: true,
    currentColorType: "hex",
    color: {
      hex: { isActive: true },
      rgb: { isActive: false },
      hsl: { isActive: false }
    },
    selection: null,
    selection_origin: false,
    editable: true,
    isDragging: false,
    delayedDragging: false
  }),

  computed: {
    port() {
      return this.$store.getters.getPort;
    },
    hex() {
      return this.getColor("hex").toString();
    },
    r() {
      return this.getColor("r").toString();
    },
    g() {
      return this.getColor("g").toString();
    },
    b() {
      return this.getColor("b").toString();
    },
    h() {
      return this.getColor("h").toString();
    },
    s() {
      return this.getColor("s").toString();
    },
    l() {
      return this.getColor("l").toString();
    },
    colors: {
      get() {
        return this.$store.getters.getColors;
      },
      set(data) {
        this.$store.commit("setColors", data);
      }
    },
    colorFolders: {
      get() {
        return this.$store.getters.getColorFolders;
      },
      set(data) {
        this.$store.commit("setColorFolders", data);
      }
    }
  },

  watch: {
    colorFolders: {
      handler: function(val, oldVal) {
        chrome.storage.sync.set(
          { colorFolders: this.colorFolders },
          function() {}
        );
      },
      deep: true
    },

    colors: {
      handler: function(val, oldVal) {
        chrome.storage.sync.set({ colors: this.colors }, function() {});
      },
      deep: true
    }
  },

  methods: {
    getColor(key) {
      return this.$store.getters.getColorState.value[key];
    },

    onMove({ relatedContext, draggedContext }) {
      const relatedElement = relatedContext.element;
      const draggedElement = draggedContext.element;
      return (
        (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
      );
    },

    // @todo Maybe we can refactor to mutualize the following code
    getStoredColors: function() {
      chrome.storage.sync.get("colors", storageData => {
        let data = storageData.colors;
        for (let i = 0; i < data.length; i++) {
          data[i].id = i;
          data[i].isSelected = false;
        }

        // Save chrome data in store.
        this.$store.commit("setColors", data);
      });

      chrome.storage.sync.get("colorFolders", storageData => {
        let data = storageData.colorFolders;
        for (let i = 0; i < data.length; i++) {
          data[i].id = i;
          data[i].isSelected = false;
        }

        // Save chrome data in store.
        this.$store.commit("setColorFolders", data);
      });
    },

    changeColorMode: function(event) {
      for (let text in this.color) {
        this.color[text].isActive = text == event.text ? true : false;
      }
    },

    selectInputText: function(event) {
      event.target.select();
    },

    onChromeDataChange: function(changes, namespace) {
      for (let key in changes) {
        let storageChange = changes[key];
      }

      if (changes["colors"] != undefined) {
        // Save chrome data in store.
        this.$store.commit("setColors", changes["colors"].newValue);
      }

      if (changes["colorFolders"] != undefined) {
        this.$store.commit("setColorFolders", changes["colorFolders"].newValue);
      }
    },

    /**
     *  Save current color to swatch
     */
    addCurrentColor: function(event) {
      if (!this.hex) {
        return;
      }

      // Deselect all
      this.deselectAll();

      let color = {};
      color.type = "color";
      color.id = this.colors.length;

      color.hex = this.hex;

      color.r = this.r;
      color.g = this.g;
      color.b = this.b;

      color.h = this.h;
      color.s = this.s;
      color.l = this.l;

      color.isSelected = false;

      let currentCollection = this.colors ? this.colors : [];
      currentCollection.push(color);
    },

    /**
     * Select clicked color
     */
    toggleColorSelection: function(event, color, index = false, array = false) {
      let isSelected = color.isSelected;

      if (!event) {
        event = window.event;
      }

      if (event.ctrlKey) {
        // ctrl selection
        color.isSelected = !isSelected;
      } else if (event.shiftKey) {
        // shift selection
        if (!this.selection_origin || !this.selection_origin.array === array) {
          return;
        }

        console.log("yolo");

        for (let i = 0; i < array.length; i++) {
          console.log("i", i);
          console.log(
            "this.selection_origin.index",
            this.selection_origin.index
          );
          console.log("index", index);
          console.log(
            "between",
            between(this.selection_origin.index, index, true)
          );
          if (between(this.selection_origin.index, index, true)) {
            array[i].isSelected = true;
          } else {
            array[i].isSelected = false;
          }
        }
        event.stopPropagation();
      } else {
        // Single selection
        this.deselectAll();
        color.isSelected = !isSelected;
        this.selection_origin = {
          index: index,
          array: array
        };

        // Update displayed color.
        if (!isSelected) {
          color.isSelected = true;

          // @TODO refactor
          let colorToSave = {};
          colorToSave.value = {
            hex: color.hex,
            r: color.r,
            g: color.g,
            b: color.b,
            h: color.h,
            s: color.s,
            l: color.l
          };

          this.$store.commit("setColor", colorToSave);
        }
      }
    },

    /**
     * Deselect all colors and folders
     */
    deselectAll: function() {
      for (let i = 0; i < this.colors.length; i++) {
        this.colors[i].isSelected = false;
      }

      for (let i = 0; i < this.colorFolders.length; i++) {
        this.colorFolders[i].isSelected = false;
        for (let j = 0; j < this.colorFolders[i].content.length; j++) {
          this.colorFolders[i].content[j].isSelected = false;
        }
      }
    },

    /**
     * Delete selected color
     */
    deleteSelection: function(event) {
      // @TODO rework/refactor this block
      let arrays = [this.colors, this.colorFolders];

      for (let h in this.colorFolders) {
        arrays.push(this.colorFolders[h].content);
      }

      for (let i in arrays) {
        let array = arrays[i];

        // Build array of selected element indexes.
        let selectedIndexes = [];
        for (let j in array) {
          if (array[j].isSelected) {
            selectedIndexes.push(j);
          }
        }

        // Splice origin array.
        for (let k = selectedIndexes.length - 1; k >= 0; k--) {
          array.splice(selectedIndexes[k], 1);
        }
      }
    },

    /**
     * Reset user colors and folders
     */
    deleteAll: function(event) {
      let ask = confirm(
        "You are about to delete all your colors and folders. Please confirm to proceed."
      );
      if (!ask) {
        return;
      }

      this.colors = [];
      this.colorFolders = [];
    },

    /**
     * Create an empty folder
     */
    addFolder: function() {
      let item = {
        content: [],
        isSelected: false
      };
      this.colorFolders.push(item);
    },

    toggleFolderSelection: function(event, folder, index = false) {
      // @todo refactor
      let isSelected = folder.isSelected ? true : false;

      if (!event) {
        event = window.event;
      }

      if (event.ctrlKey) {
        // ctrl is down
        folder.isSelected = !isSelected;
      } else if (event.shiftKey) {
        // shift is down
      } else {
        // Single selection
        this.deselectAll();

        folder.isSelected = !isSelected;
        this.colorFolders[index].isSelected = !isSelected;

        this.$store.commit("setColorFolders", this.colorFolders);
      }
    },

    /**
     * Keyboard shortcuts
     */
    onClick: function(event) {
      // Deselect all if user clicks outside a color or folder.
      if (!event.target.hasAttribute("data-maintain-selection")) {
        this.deselectAll();
      }
    },

    /**
     * Keyboard shortcuts
     */
    onKeyDown: function(event) {
      if (event.altKey && event.shiftKey && event.keyCode == 65) {
        // Alt + Shift + A
        this.addCurrentColor();
      } else if (event.altKey && event.shiftKey && event.keyCode == 70) {
        // Alt + Shift + F
        this.addFolder();
      } else if (event.altKey && event.shiftKey && event.keyCode == 68) {
        // Alt + Shift + D
        this.deleteSelection();
      } else if (event.altKey && event.shiftKey && event.keyCode == 69) {
        // Alt + Shift + E
        // Export swatches .ase
        this.exportColors();
      }
    },

    // Export colors to .ase
    // see npm ase-utils
    exportColors: function(event) {
      let input = {
        version: "1.0",
        groups: [],
        colors: []
      };

      for (let i in this.colors) {
        let color = this.colors[i];
        let formattedColor = this.formatColor(color);
        input.colors.push(formattedColor);
      }

      for (let j in this.colorFolders) {
        let folder = this.colorFolders[j];

        for (let k in folder.content) {
          let color = folder.content[k];
          let formattedColor = this.formatColor(color);
          input.colors.push(formattedColor);
        }
      }

      this.convertToASE(input);
    },

    formatColor: function(color) {
      if (!color) {
        return null;
      }

      let formattedColor = {
        name: "R=" + color.r + "G=" + color.g + "B=" + color.b,
        model: "RGB",
        color: [],
        type: "global"
      };

      formattedColor.color.push(color.r / 255);
      formattedColor.color.push(color.g / 255);
      formattedColor.color.push(color.b / 255);

      return formattedColor;
    },

    convertToASE: function(data) {
      let encodedData = ase.encode(data);
      this.saveFile(encodedData);
    },

    saveFile: function(fileEntry) {
      save(fileEntry, "swatches.ase", (err, data) => {
        if (err) {
          throw err;
        }
      }).then(() => {});
    }
  },

  mounted: function() {
    this.$root.window.addEventListener("click", this.onClick);
    this.$root.window.addEventListener("keydown", this.onKeyDown);
    chrome.storage.onChanged.addListener(this.onChromeDataChange);
    this.getStoredColors();
  },

  beforeDestroy: function() {
    this.$root.window.removeEventListener("click", this.onClick);
    this.$root.window.removeEventListener("keydown", this.onKeyDown);
    chrome.storage.onChanged.removeListener(this.onChromeDataChange);
  }
};
</script>

<style lang="scss">
@import "../sass/abstracts/variables";

.panel {
  position: relative;
  padding: 8px;
  font-size: 10px;
  color: $gray-lighter;
  background-color: $gray;
}

.colorPicker {
  display: flex;
  font-size: 0;
  line-height: 0;

  > * {
    vertical-align: top;
    min-width: 0; // allow flex children to shrink bellow initial size
  }

  > * + * {
    margin-left: $spacer;
  }

  > .select-block {
    flex-shrink: 0;
    width: 52px; // We set the width to avoid chaging width when setting value
  }
}

.colorViewer {
  flex-shrink: 0;
  position: relative;
  width: 22px;
  height: 22px;

  border-radius: 100%;
  border: 1px solid $gray-light;
  box-sizing: border-box;
}

.hexWrapper {
  display: none;

  &.active {
    display: block;
  }
}

.rgbWrapper,
.hslWrapper {
  display: none;

  &.active {
    display: flex;
  }

  input {
    width: 44px;
  }

  input + input {
    margin-left: 4px;
  }
}

input[type="text"] {
  display: inline-block;
  height: 22px;
  padding: 4px;
  width: 100%;

  font-family: "Poppins", monospace !important;
  font-size: 11px;
  line-height: 14px;
  text-align: center;

  color: $soft-white;
  background-color: $gray-dark;
  border: solid 1px $gray-light;
  border-radius: $border-radius-sm;
  box-sizing: border-box;

  &:focus {
    border-color: $gray-darker;
  }
}

.colorSwatches {
  position: relative;
  display: block;
  margin-top: $spacer;
  margin-right: -$spacer / 2;
  padding-top: $spacer;

  &:before {
    content: "";
    display: block;
    position: absolute;
    top: 0;
    left: -$spacer;
    right: -$spacer / 2;
    border-top: solid 1px $gray-light;
  }

  & > .button-wrapper {
    display: block;
    text-align: right;

    & > .btn-square {
      border: none;
      margin-bottom: 0;
    }
  }

  & > .color-collection {
    display: block;
    margin-left: -($spacer / 2);
    padding-left: $spacer / 2;

    &:not(:empty) {
      margin-bottom: $spacer / 2;
    }
  }

  & > .folder-collection {
    display: block;

    &:not(:empty) {
      margin-bottom: $spacer / 2;
    }

    & > .folder {
      display: block;
      position: relative;
      margin-top: -($spacer / 2);
      margin-bottom: $spacer / 2;
      margin-left: -($spacer / 2);
      padding-top: $spacer / 2;
      padding-left: $spacer / 2;

      -webkit-user-drag: element;
      user-select: none;

      &.-selected {
        outline-style: dashed;
        outline-width: 1px;
        outline-color: $gray-lighter;

        & > ul:before {
          background-color: $gray-darker;
          color: $soft-white;
        }
      }

      & > ul {
        display: block;
        position: relative;

        &:before {
          @extend .btn-square;
          display: block;
          content: "\e902";
          font-size: 18px;
          font-family: "Black-shrimp";
          outline-width: 0 !important;
          border-width: 0 !important;
        }
      }
    }
  }

  .btn-square {
    margin-right: $spacer / 2;
    margin-bottom: $spacer / 2;
  }
}

.btn-square {
  display: inline-block;
  width: 18px;
  height: 18px;

  font-size: 18px;
  background-color: $gray-light;

  border-radius: 2px;
  border-width: 1px;
  border-style: solid;
  border-color: transparent;

  box-sizing: border-box;
  vertical-align: middle;
  cursor: pointer;

  -webkit-user-drag: element;
  user-select: none;

  transition: background-color 0.2s ease;

  &:hover {
    background-color: $gray-dark;
    color: $soft-white;
  }

  &.-selected {
    outline-style: dashed;
    outline-width: 1px;
    outline-color: $soft-white;
  }

  &:active {
    background-color: $gray-darker;
    > .icon {
      margin-top: -1px !important;
      margin-left: -1px !important;
    }
  }
}
</style>
