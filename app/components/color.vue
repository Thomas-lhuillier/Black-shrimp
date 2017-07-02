<template>
  <div class="panel panel--color">
    <div class="colorPicker">
      <div class="colorViewer" v-bind:style="{ backgroundColor: hex }"></div>

      <div class="valueWrapper">

        <div class="hexWrapper" v-bind:class="[{ active: color.hex.isActive }]">
          <input type="text" class="value_hex" v-model="hex" spellcheck="false" @click="selectInputText($event)">
        </div>

        <div class="rgbWrapper" v-bind:class="[{ active: color.rgb.isActive }]">
          <input type="text" class="value_r" v-model="r" spellcheck="false" @click="selectInputText($event)">
          <input type="text" class="value_g" v-model="g" spellcheck="false" @click="selectInputText($event)">
          <input type="text" class="value_b" v-model="b" spellcheck="false" @click="selectInputText($event)">
        </div>

        <div class="hslWrapper" v-bind:class="[{ active: color.hsl.isActive }]">
          <input type="text" class="value_h" v-model="h" spellcheck="false" @click="selectInputText($event)">
          <input type="text" class="value_s" v-model="s" spellcheck="false" @click="selectInputText($event)">
          <input type="text" class="value_l" v-model="l" spellcheck="false" @click="selectInputText($event)">
        </div>

      </div>

      <SelectComponent :options="[
        { text: 'hex', value: 1, isSelected: true  },
        { text: 'rgb', value: 2, isSelected: false },
        { text: 'hsl', value: 3, isSelected: false },
      ]" v-on:change="changeColorMode($event)">
      </SelectComponent>
    </div>

    <div class="colorSwatches">

      <draggable class="color-collection" v-model="colors" :element="'ul'" :move="onMove" :options="{group:'colors'}">
        <li v-for="(color, index) in colors"
            :key="index"
            class="btn-square -color"
            :class="[{ '-selected': color.isSelected }]"
            :style="{ 'background-color': color.hex }"
            @click="toggleColorSelection($event, color, index, colors)"
        >
        </li>
      </draggable>

      <draggable class="folder-collection" v-model="colorFolders" :element="'ul'" :move="onMove">
        <draggable v-for="(folder, index) in colorFolders"
                   :element="'ul'"
                   class="folder"
                   :class="[{ '-selected': folder.isSelected }]"
                   v-model="colorFolders[index].content"
                   :key="index"
                   :options="{group:'colors'}"
                   :move="onMove"
                   @click.self.native="toggleFolderSelection($event, folder, index)"
                   @click="console.log(folder)"
        >
          <li v-for="(color, subIndex) in folder.content"
              :key="subIndex"
              class="btn-square -color"
              :class="[{ '-selected': color.isSelected }]"
              :style="{ 'background-color': color.hex }"
              @click="toggleColorSelection($event, color, subIndex, folder.content)"
          >
          </li>
        </draggable>
      </draggable>


      <div class="button-wrapper">
        <button class="btn-square" @click="addCurrentColor($event)"><i class="bs-icon bs-icon-plus"></i></button>
        <button class="btn-square" @click="addFolder($event)"><i class="bs-icon bs-icon-folder"></i></button>
        <button class="btn-square"
                @click="deleteSelection($event)"
                @click.shift="deleteAll($event)"
        >
          <i class="bs-icon bs-icon-trash"></i>
        </button>
      </div>

    </div>
  </div>
</template>

<script>
  import SelectComponent from './select-block.vue'
  import draggable from 'vuedraggable'

  export default {
    components: {
      SelectComponent,
      draggable
    },
    data: () => ({
      isActive: true,
      currentColorType: 'hex',
      color: {
        'hex': { isActive: true  },
        'rgb': { isActive: false },
        'hsl': { isActive: false },
      },
      selection: null,
      selection_origin: false,
      editable: true,
      isDragging: false,
      delayedDragging: false
    }),
    computed: {
      hex () {
        return this.$store.getters.getColorState.value.hex.toString();
      },
      r () {
        return this.$store.getters.getColorState.value.r.toString();
      },
      g () {
        return this.$store.getters.getColorState.value.g.toString();
      },
      b () {
        return this.$store.getters.getColorState.value.b.toString();
      },
      h () {
        return this.$store.getters.getColorState.value.h.toString();
      },
      s () {
        return this.$store.getters.getColorState.value.s.toString();
      },
      l () {
        return this.$store.getters.getColorState.value.l.toString();
      },
      colors: {
        get() {
          return this.$store.getters.getColors
        },
        set(data) {
          this.$store.commit('setColors', data)
        },
      },
      colorFolders: {
        get() {
          return this.$store.getters.getColorFolders
        },
        set(data) {
          this.$store.commit('setColorFolders', data)
        },
      },
    },

    watch: {
      colorFolders: {
        handler: function (val, oldVal) {
          console.log('sync color folders:', this.colorFolders);
          chrome.storage.sync.set({'colorFolders': this.colorFolders}, function() {});
        },
        deep: true
      },

      colors: {
        handler: function (val, oldVal) {
          console.log('sync colors:', this.colors);
          chrome.storage.sync.set({'colors': this.colors}, function() {});
        },
        deep: true
      },
    },

    methods: {
      onMove ({relatedContext, draggedContext}) {
        const relatedElement = relatedContext.element;
        const draggedElement = draggedContext.element;
        return (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
      },

      getStoredColors: function() {
       chrome.storage.sync.get('colors', storageData => {
          let data = storageData.colors;
          for (let i = 0; i < data.length; i++) {
            data[i].id = i;
            data[i].isSelected = false;
          }
          // Save chrome data in store.
          this.$store.commit('setColors', data);
          console.log('Store colors:', data);
        });

        chrome.storage.sync.get('colorFolders', storageData => {
          let data = storageData.colorFolders;
          for (let i = 0; i < data.length; i++) {
            data[i].id = i;
            data[i].isSelected = false;
          }
          console.log(data);
          // Save chrome data in store.
          this.$store.commit('setColorFolders', data);
          console.log('Store folders:', data);
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
        for ( let key in changes) {
          let storageChange = changes[key];
          console.log('Storage key "%s" in namespace "%s" changed. ' +
                      'Old value was "%s", new value is "%s".',
                      key,
                      namespace,
                      storageChange.oldValue,
                      storageChange.newValue);
        }
        if (changes['colors'] != undefined) {
          // Save chrome data in store.
          this.$store.commit('setColors', changes['colors'].newValue);
        }
        if (changes['colorFolders'] != undefined) {
          this.$store.commit('setColorFolders', changes['colorFolders'].newValue);
        }
      },

      /**
       *  Save current color to swatch
       */
      addCurrentColor: function(event) {
        console.log('addCurrentColor')
        if (!this.hex) { return }

        // Deselect all
        this.deselectAll();

        let color = {};
        color.type       = 'color';
        color.id         = this.colors.length;

        color.hex        = this.hex;

        color.r          = this.r;
        color.g          = this.g;
        color.b          = this.b;

        color.h          = this.h;
        color.s          = this.s;
        color.l          = this.l;

        color.isSelected = false;

        let currentCollection = this.colors ? this.colors : [];
        currentCollection.push(color);
      },

      /**
       * Select clicked color
       */
      toggleColorSelection: function(event, color, index = false, array = false) {
        let isSelected = color.isSelected ? true : false;

        if (!event) { event = window.event; }

        if (event.ctrlKey ) {            // ctrl is down
          console.log('ctrl selection');
          color.isSelected = !isSelected;
        } else if (event.shiftKey) {     // shift is down
          console.log('shift selection');
          if (!this.selection_origin) { return }
          if (!this.selection_origin.array === array) { return }

          console.log('array:', array);
          console.log('this.selection_origin.array:', this.selection_origin.array);

          for (let i = 0; i < array.length; i++) {
            if ( i.between(this.selection_origin.index, index, true) ) {
              console.log('between true');
              array[i].isSelected = true;
            } else {
              array[i].isSelected = false;
            }
          }
        } else {
          // Single selection
          console.log('single selection');
          this.deselectAll();
          color.isSelected = !isSelected;
          this.selection_origin = {
            'index': index,
            'array': array
          };
          // Update displayed color.
          if ( !isSelected ) {
            color.isSelected = true;

            let colorToSave = {};
            colorToSave.value = {
              'hex' : color.hex,
              'r'   : color.r,
              'g'   : color.g,
              'b'   : color.b,
              'h'   : color.h,
              's'   : color.s,
              'l'   : color.l,
            };

            this.$store.commit('setColor', colorToSave);
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
        console.log('deleteSelection')

        let arrays = [this.colors, this.colorFolders];

        for ( let h in this.colorFolders ) {
          arrays.push(this.colorFolders[h].content);
        }

        for ( let i in arrays ) {
          let array = arrays[i];

          // Build array of selected element indexes.
          let selectedIndexes = []
          for ( let j in array ) {
            if ( array[j].isSelected ) {
              selectedIndexes.push(j);
            }
          }

          // Splice origin array.
          for (let k = selectedIndexes.length -1; k >= 0; k--) {
            array.splice(selectedIndexes[k], 1);
          }

        }
      },

      deleteAll: function(event) {
        let ask = confirm("You are about to delete all your colors and folders. Are you sure you wan't delete everything ?");
        if (!ask) { return }

        // Reset user colors and folders
        this.colors = []
        this.colorFolders = []
      },

      /**
       * Create an empty folder
       */
      addFolder: function(event) {
        let item = {
          content: [],
          isSelected: false,
        }
        this.colorFolders.push(item);
      },

      toggleFolderSelection: function(event, folder, index = false) {
        console.log('toggleFolderSelection');
        let isSelected = folder.isSelected ? true : false;

        if (!event) { event = window.event; }

        if (event.ctrlKey ) {            // ctrl is down
          console.log('ctrl selection');
          folder.isSelected = !isSelected;
        } else if (event.shiftKey) {     // shift is down
          console.log('shift selection');
        } else {
          // Single selection
          console.log('single selection');
          this.deselectAll();

          folder.isSelected = !isSelected;
          this.colorFolders[index].isSelected = !isSelected;

          this.$store.commit('setColorFolders', this.colorFolders);
        }
      },

      onKeyDown: function(event) {
        console.log('event:', event)
        console.log('keyup:', event.keyCode)
        if (event.altKey && event.keyCode == 65) {
          this.addCurrentColor();
        }
      },
    },

    created: function () {
      window.addEventListener('keydown', this.onKeyDown)
    },

    mounted: function() {
      // Register chrome data listener
      chrome.storage.onChanged.addListener(this.onChromeDataChange);
      this.getStoredColors();
    },

    beforeMount: function() {
    },

    beforeDestroy: function() {
      // Remove chrome data listener
      chrome.storage.onChanged.removeListener(this.onChromeDataChange, () => {
        console.log('removed listener');
      });
    }
  }
</script>

<style lang="scss">
  @import "../sass/_vars.scss";
  .blackShrimp {
    .panel {
      position: relative;
      display: block;
      padding: 8px;

      font-size: 10px;

      color: $gray-lighter;
      background-color: $gray;

      border-bottom-left-radius: $border-radius;
      border-bottom-right-radius: $border-radius;
    }

    .colorPicker {
      display: block;
      font-size: 0;
      line-height: 0;

      > * {
        display: inline-block;
        height: 22px;
        vertical-align: top;
      }

      > * + * {
        margin-left: $spacer;
      }

      > .select-block {
        margin-left: 0;
        margin-right: -$spacer;

        > .value > .text {
          width: 24px;
        }

      }
    }

    .colorViewer {
      position: relative;
      width: 22px;
      height: 22px;

      border-radius: 100%;
      border: 1px solid $gray-light;
      box-sizing: border-box;
    }

    .valueWrapper {
    }

    .hexWrapper, .rgbWrapper, .hslWrapper {
      display: none;

      &.active {
        display: inline-block;
      }
    }

    .hexWrapper {
      input {
        width: 140px;
      }

    }

    .rgbWrapper, .hslWrapper {
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

      font-family: 'Poppins', monospace !important;
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
        content: '';
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

          &:before {
            @extend .btn-square;
            display: block;
            content: '\e902';
            font-size: 18px;
            font-family: 'Black-shrimp';
            border-width: 0 !important;
          }

          &.-selected {
            outline-style: dotted;
            outline-width: 1px;
            outline-color: $gray-lighter;

            &:before {
              background-color: $gray-darker;
              color: $soft-white;
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

      transition: all .2s ease;

      > .bs-icon:before {
        display: block;
        color: red ;
        margin-top : -2px;
        margin-left: -2px;
        font-size: 18px;
        font-size: 32px;
      }

      &:hover {
        background-color: $gray-dark;
        color: $soft-white;
      }

      &:focus,
      &.-selected {
        border-color: $gray-darker;
        border-width: 2px;

        > .bs-icon {
          margin-top : -2px;
          margin-left: -2px;
        }
      }

      &:active {
        background-color: $gray-darker;
        > .bs-icon {
          margin-top : -1px !important;
          margin-left: -1px !important;
        }
      }
    }
  }
</style>
