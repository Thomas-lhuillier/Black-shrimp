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
      ]" v-on:change="changeColorMode($event)"></SelectComponent>
    </div>

    <div class="colorSwatches">
      <div class="color-collection">
        <template v-for="(color, index) in colors" v-if="color.type == 'color'">
          <div class="btn-square -color"
               :class="[{ '-selected': color.isSelected }]"
               :style="{ 'background-color': color.hex }"
               @click="selectColor($event, color)"
               >
          </div>
        </template>
        <template v-for="color in colors" v-else-if="color.type == 'folder'">
          <div class="btn-square -folder"></div>
        </template>
      </div>
      <div class="button-wrapper">
        <button class="btn-square" @click="addCurrentColor($event)"><i class="bs-icon bs-icon-plus"></i></button>
        <button class="btn-square"><i class="bs-icon bs-icon-folder"></i></button>
        <button class="btn-square" @click="deleteSelection($event)"><i class="bs-icon bs-icon-trash"></i></button>
      </div>
    </div>
  </div>
</template>

<script>
  import SelectComponent from './select-block.vue'

  export default {
    components: {
      SelectComponent,
    },
    data() {
      return {
        isActive: true,
        currentColorType: 'hex',
        color: {
          'hex': { isActive: true  },
          'rgb': { isActive: false },
          'hsl': { isActive: false },
        },
        colors: [],
        selection: null,
      }
    },
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
    },
    methods: {
      changeColorMode: function(event) {
        for (let text in this.color) {
          this.color[text].isActive = text == event.text ? true : false;
        }
      },

      selectInputText: function(event) {
        event.target.select();
      },

      getStoredColors: function() {
       chrome.storage.sync.get('colors', storageData => {
          let data = storageData.colors;
          for (let i = 0; i < data.length; i++) {
            data[i].id = i;
            data[i].isSelected = false;
          }
          this.colors = data;
          console.log('get stored color:', data);
        });
      },

      addCurrentColor: function(event) {
        if (!this.hex) { return }
        // Deselect all
        this.selection = null;
        for (let i = 0; i < this.colors.length; i++) {
          this.colors[i].isSelected = false;
        }

        let color = {};
        color.type       = 'color';
        color.id         = this.colors.length;
        color.hex        = this.hex;
        color.isSelected = false;

        let currentCollection = this.colors ? this.colors : [];
        currentCollection.push(color);

        // Save color collection in Chrome storage
        chrome.storage.sync.set({'colors': currentCollection}, function() {
          console.log('Colors saved');
        });
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
          this.colors = changes['colors'].newValue;
          console.log('Storage colors changed:', this.colors);
        }
      },

      selectColor: function(event, color, isMultiSelection) {
        console.log('color id:', color.id);
        console.log('colors:', this.colors);
        let isSelected = this.colors[color.id].isSelected;

        for (let i = 0; i < this.colors.length; i++) {
          this.colors[i].isSelected = false;
        }

        if ( isSelected ) {
          this.colors[color.id].isSelected = false;
          this.selection = null;
        } else {
          this.colors[color.id].isSelected = true;
          this.selection = color.id;
          this.$store.commit('setHex', this.colors[color.id].hex);
          console.log('select color:', this.selection);
        }
      },

      createFolder: function(event) {

      },

      deleteSelection: function(event) {
        console.log('delete color:', this.selection);

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
        this.selection = [];
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
        width: 100%;
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

      font-family: 'Poppins', monospace;
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

      transition: all .2s ease;

      > .bs-icon {
        display: block;
        margin-top: -1px;
        margin-left: -1px;
        font-size: 18px;
      }

      &:hover {
        background-color: $gray-dark;
        color: $soft-white;
      }

      &:focus,
      &.-selected {
        border-color: $gray-darker;
        border-width: 2px;
      }

      &:active {
        background-color: $gray-darker;
      }
    }
  }
</style>
