<!--
This component represent the entire color panel
@todo Should be refactored and splitted.
-->

<template>
  <div class="panel panel--color">
    <colorPickerComponent></colorPickerComponent>

    <!-- Color swatches -->
    <div class="colorSwatches">
      <colorGroupComponent
        :move="onMove"
        @end="onEnd"
        :colors="colors"
        @color-click="handleColorClick"
      ></colorGroupComponent>

      <draggable
        class="folder-collection"
        v-model="colorFolders"
        :tag="'ul'"
        :move="onMove"
        @end="onEnd"
        group="folders"
      >
        <li
          v-for="(folder, index) in colorFolders"
          :key="index"
          :class="[{ '-selected': folder.isSelected }]"
          class="folder"
        >
          <colorGroupComponent
            :move="onMove"
            @end="onEnd"
            :colors="colorFolders[index].content"
            @color-click="handleColorClick"
            @click.self.native="handleFolderClick($event, folder)"
          ></colorGroupComponent>
        </li>
      </draggable>

      <!-- Action buttons -->
      <div class="button-wrapper">
        <button
          class="btn-square"
          v-on:click="addColor($event)"
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

        <button class="btn-square" title="Export [Alt + Shift + E]">
          <i class="icon icon-binoculars"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import ColorSwatchComponent from "./color-swatch.vue";
import ColorGroupComponent from "./color-group.vue";
import ColorPickerComponent from "./color-picker.vue";
import draggable from "vuedraggable";
import save from "save-file";
import ase from "ase-utils";
import { between } from "../utilities/number";

export default {
  components: {
    ColorSwatchComponent,
    ColorGroupComponent,
    ColorPickerComponent,
    draggable
  },

  data: () => ({
    isActive: true,
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

  methods: {
    onMove({ relatedContext, draggedContext }) {
      const relatedElement = relatedContext.element;
      const draggedElement = draggedContext.element;
      return (
        (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
      );
    },

    onEnd() {
      this.deselectAll();
      this.colors = [...this.colors];
      this.colorFolders = [...this.colorFolders];
    },

    addColor(event) {
      const color = this.$store.getters.getColor.value;
      if (!color.hex) {
        return;
      }

      color.type = "color";
      color.id = this.colors.length;
      color.isSelected = false;

      this.colors = [...this.colors, color];
    },

    setActiveColor(color) {
      const colorToSave = {};
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
    },

    deselectAll: function() {
      this.colors.forEach(color => {
        color.isSelected = false;
      });

      this.colorFolders.forEach(folder => {
        folder.isSelected = false;
        folder.content.forEach(color => {
          color.isSelected = false;
        });
      });
    },

    deleteSelection: function(event) {
      // @TODO rework/refactor this block
      let arrays = [this.colors, this.colorFolders];

      this.colorFolders.forEach(folder => {
        arrays.push(folder.content);
      });

      arrays.forEach(array => {
        // Build array of selected element indexes.
        let selectedIndexes = [];
        array.forEach((color, index) => {
          if (color.isSelected) {
            selectedIndexes.push(index);
          }
        });

        // Splice origin array (backward to keep indexes correct).
        for (let k = selectedIndexes.length - 1; k >= 0; k--) {
          array.splice(selectedIndexes[k], 1);
        }
      });

      this.colors = [...this.colors];
      this.colorFolders = [...this.colorFolders];
    },

    deleteAll: function() {
      let ask = confirm(
        `You are about to delete all your colors and folders.
        Please confirm to proceed.`
      );

      if (!ask) {
        return;
      }

      this.colors = [];
      this.colorFolders = [];
    },

    addFolder: function() {
      this.colorFolders.push({
        content: [],
        isSelected: false
      });
    },

    /**
     * Select clicked color
     */
    handleColorClick: function(event, color, index = false, array = false) {
      let isSelected = color.isSelected;

      // CTRL or ALT is down : multi selection
      if (event.ctrlKey || event.altKey) {
        color.isSelected = !isSelected;
        return;
      }

      // shift selection
      if (event.shiftKey) {
        if (!this.selection_origin || !this.selection_origin.array === array) {
          return;
        }

        array.forEach((color, i) => {
          if (between(i, this.selection_origin.index, index)) {
            array[i].isSelected = true;
            return;
          }
          array[i].isSelected = false;
        });

        return;
      }

      // Single selection
      this.deselectAll();
      color.isSelected = !isSelected;

      // Set selection origin for eventual shift selections afterward
      this.selection_origin = {
        index: index,
        array: array
      };

      // Update displayed color.
      if (color.isSelected) {
        this.setActiveColor(color);
      }
    },

    handleFolderClick: function(event, folder) {
      const isSelected = folder.isSelected;

      // CTRL or ALT is down : multi selection
      if (!event.ctrlKey || !event.AltKey) {
        this.deselectAll();
      }

      // Single selection
      folder.isSelected = !isSelected;
      this.colorFolders = [...this.colorFolders];
    },

    onClick: function(event) {
      console.log("onClick");
      // Deselect all if user clicks outside a color or folder.
      if (event.target.hasAttribute("data-maintain-selection")) {
        return;
      }

      this.deselectAll();
    },

    /**
     * Keyboard shortcuts
     */
    onKeyDown: function(event) {
      if (event.altKey && event.shiftKey && event.keyCode == 65) {
        // Alt + Shift + A
        this.addColor();
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
        name: `R=${color.r}G=${color.g}B=${color.b}`,
        model: "RGB",
        color: [color.r / 255, color.g / 255, color.b / 255],
        type: "global"
      };

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
  },

  created: function() {
    this.$store.dispatch("fetchColors");
    this.$store.dispatch("fetchColorFolders");
    this.$store.dispatch("registerColorsListener");
  },

  beforeDestroy: function() {
    this.$root.window.removeEventListener("click", this.onClick);
    this.$root.window.removeEventListener("keydown", this.onKeyDown);
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
