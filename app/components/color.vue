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

      <draggable class="color-collection" v-model="colors" :element="'ul'" :move="onMove">
        <li v-for="(color, index) in colors" v-if="color.type == 'color'"
            :key="color.id"
            class="btn-square -color"
            :class="[{ '-selected': color.isSelected }]"
            :style="{ 'background-color': color.hex }"
            @click="selectColor($event, color)"
        >
        </li>
        <li v-for="color in colors" v-else-if="color.type == 'folder'" class="btn-square -folder"></li>
      </draggable>

      <!-- <ul class="color-collection" v-sortable="{onEnd: reorder}">
        <template v-for="(color, index) in colors" v-if="color.type == 'color'">
          <li class="btn-square -color"
              :class="[{ '-selected': color.isSelected }]"
              :style="{ 'background-color': color.hex }"
              @click="selectColor($event, color)"
          >
          </li>
        </template>
        <template v-for="color in colors" v-else-if="color.type == 'folder'">
          <li class="btn-square -folder"></li>
        </template>
      </ul> -->

      <div class="button-wrapper">
        <button class="btn-square" @click="addCurrentColor($event)"><i class="bs-icon bs-icon-plus"></i></button>
        <button class="btn-square"><i class="bs-icon bs-icon-folder"></i></button>
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
      colors2: {
        get() {
          return this.$store.getters.getColors2
        },
        set(data) {
          this.$store.commit('setColors2', data)
        },
      },
      dragOptions() {
        return  {
          animation: 0,
          group: 'description',
          disabled: !this.editable,
          ghostClass: 'ghost'
        };
      },
    },

    methods: {
      orderList () {
        this.list = this.list.sort((one,two) =>{return one.order-two.order; })
      },
      onMove ({relatedContext, draggedContext}) {
        console.log('onMove', {relatedContext, draggedContext});
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
          console.log('coucou c\'est la data:', data);
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
      },

      /**
       *  Save current color to swatch
       */
      addCurrentColor: function(event) {
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

        // Save color collection in Chrome storage
        chrome.storage.sync.set({'colors': currentCollection}, function() {
        });
      },

      /**
       * Select clicked color
       */
      selectColor: function(event, color) {
        let isSelected = this.colors[color.id].isSelected;

        this.deselectAll();

        if ( !isSelected ) {
          this.colors[color.id].isSelected = true;
          this.selection = color.id;

          let colorToSave = {};
          colorToSave.value = {
            'hex' : this.colors[color.id].hex,
            'r'   : this.colors[color.id].r,
            'g'   : this.colors[color.id].g,
            'b'   : this.colors[color.id].b,
            'h'   : this.colors[color.id].h,
            's'   : this.colors[color.id].s,
            'l'   : this.colors[color.id].l,
          };

          this.$store.commit('setColor', colorToSave);
        }
      },

      /**
       * Deselect all colors
       */
      deselectAll: function() {
        for (let i = 0; i < this.colors.length; i++) {
          this.colors[i].isSelected = false;
        }
        this.selection = null;
      },

      /**
       * Delete selected color
       */
      deleteSelection: function(event) {
        if (this.selection == null) { return }

        let currentCollection = this.colors ? this.colors : [];
        currentCollection.splice(this.selection, 1);
        for (let i = 0; i < currentCollection.length; i++) {
          currentCollection[i].id = i;
        }

        chrome.storage.sync.set({'colors': currentCollection}, function() {
          console.log('Colors saved');
        });

        // Empty selection
        this.selection = null;
      },
      deleteAll: function(event) {
        chrome.storage.sync.set({'colors': []}, function() {
          console.log('Colors deleted');
        });
      },

      /**
       * Drag and drop color
       */
       // startMoving: function(event, color) {
       //  event = event || window.event;
       //  let mouseX  = event.clientX;
       //  let mouseY  = event.clientY;
       //  color.isMoving = true;
       //  console.log('start moving - color:', this.colors);
       //  // this.isMoving = true;
       // },

       // move: function() {
       //  if (!this.isMoving) { return; }
       // },

       // stopMoving: function(event, color) {
       //  color.isMoving = true;
       //  console.log('stop moving - color:', this.colors);
       // },

      /**
       * Create an empty folder
       */
      createFolder: function(event) {

      },
    },

    mounted: function() {
      // Register chrome data listener
      console.log('created, this.colors:', this.colors);
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
          margin-bottom: 0;
        }
      }

      & > .color-collection {
        display: block;

        &:not(:empty) {
          margin-bottom: $spacer / 2;
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

      border-radius: 2px;
      border-width: 1px;
      border-style: solid;
      border-color: transparent;

      background-color: $gray-light;

      box-sizing: border-box;
      vertical-align: middle;
      cursor: pointer;

      -webkit-user-drag: element;
      user-select: none;

      transition: all .2s ease;

      > .bs-icon {
        display: block;
        margin-top : -1px;
        margin-left: -1px;
        font-size: 18px;
      }

      &.-big {
        width: 36px;
        height: 36px;
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
