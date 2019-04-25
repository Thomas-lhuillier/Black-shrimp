<template>
  <div class="panel panel--color">
    <colorPickerComponent />

    <!-- Color swatches -->
    <div class="colorSwatches">
      <colorGroupComponent
        :colors="colors"
        :group-i-d="'default'"
        @end="onEnd"
        @start="onStart"
        @color-click="handleColorClick"
      />

      <draggable
        v-model="groups"
        class="group-collection"
        :tag="'ul'"
        group="groups"
        @end="onEnd"
        @start="onStart"
      >
        <li
          v-for="(group, index) in groups"
          :key="index"
          :class="[{ '-selected': group.isSelected }]"
          class="group"
        >
          <colorGroupComponent
            :colors="group.content"
            :group-i-d="index"
            @end="onEnd"
            @change="console.log('move')"
            @color-click="handleColorClick"
            @click.self.native="handleGroupClick($event, group)"
          />
        </li>
      </draggable>

      <!-- Action buttons -->
      <div class="button-wrapper">
        <button class="btn-square" title="Add color [Alt + Shift + A]" @click="addColor()">
          <i class="icon icon-plus" />
        </button>

        <button class="btn-square" title="Add Group [Alt + Shift + F]" @click="addGroup($event)">
          <i class="icon icon-folder" />
        </button>

        <button
          class="btn-square"
          title="Delete selection [Alt + Shift + D]"
          data-maintain-selection
          @click.exact="deleteSelection($event)"
          @click.shift.exact="deleteAll($event)"
        >
          <i class="icon icon-trash" />
        </button>

        <button class="btn-square" title="Export [Alt + Shift + E]" @click.exact="exportColors">
          <i class="icon icon-carret-down" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import ColorGroupComponent from './color-group.vue'
import ColorPickerComponent from './color-picker.vue'
import draggable from 'vuedraggable'
import save from 'save-file'
import ase from 'ase-utils'
import { between } from '../utilities/number'

export default {
  components: {
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
    port () {
      return this.$store.getters.getPort
    },

    color () {
      return this.$store.getters.getColor
    },

    colors: {
      get () {
        return this.$store.getters.getColors
      },
      set (colors) {
        this.$store.commit('setColors', { colors: colors })
      }
    },

    groups: {
      get () {
        return this.$store.getters.getgroups
      },
      set (groups) {
        this.$store.commit('setGroups', { groups: groups })
      }
    }
  },

  mounted () {
    this.$root.window.addEventListener('click', this.onClick)
    this.$root.window.addEventListener('keydown', this.onKeyDown)
  },

  created () {
    this.$store.dispatch('fetchColors')
    this.$store.dispatch('fetchgroups')
    this.$store.dispatch('registerCollectionsListener')
  },

  beforeDestroy () {
    this.$root.window.removeEventListener('click', this.onClick)
    this.$root.window.removeEventListener('keydown', this.onKeyDown)
  },

  methods: {
    setActiveColor (color) {
      const colorToSave = {
        hex: color.hex,
        r: color.r,
        g: color.g,
        b: color.b,
        h: color.h,
        s: color.s,
        l: color.l
      }

      this.$store.commit('setColor', colorToSave)
    },

    addColor () {
      const color = this.color
      if (!color.hex) {
        return
      }

      color.type = 'color'
      color.id = this.colors.length
      color.isSelected = false

      this.colors = [...this.colors, color]
    },

    addGroup () {
      this.groups = [
        ...this.groups,
        {
          content: [],
          isSelected: false
        }
      ]
    },

    deselectAll () {
      console.log('deselectA')
      this.colors.forEach(color => {
        color.isSelected = false
      })

      this.groups.forEach(group => {
        group.isSelected = false
        group.content.forEach(color => {
          color.isSelected = false
        })
      })
    },

    deleteSelection (event) {
      const arrays = [this.colors, this.groups]

      this.groups.forEach(group => {
        arrays.push(group.content)
      })

      arrays.forEach(array => {
        // Build array of selected element indexes
        let selectedIndexes = []
        array.forEach((color, index) => {
          if (color.isSelected) {
            selectedIndexes.push(index)
          }
        })

        // Splice original array (backward to keep indexes correct)
        for (let k = selectedIndexes.length - 1; k >= 0; k--) {
          array.splice(selectedIndexes[k], 1)
        }
      })

      this.colors = [...this.colors]
      this.groups = [...this.groups]
    },

    deleteAll () {
      let ask = confirm(
        `You are about to delete all your colors and groups.
        Please confirm to proceed.`
      )

      if (!ask) {
        return
      }

      this.colors = []
      this.groups = []
    },

    /**
     * Select clicked color
     */
    handleColorClick (event, payload) {
      const { color, index, colors, groupID } = payload
      let isSelected = color.isSelected

      // CTRL or ALT is down : multi selection
      if (event.ctrlKey || event.altKey) {
        color.isSelected = !isSelected
        this.selection_origin = { index, colors, groupID }
        return
      }

      // shift selection
      if (event.shiftKey) {
        if (
          !this.selection_origin ||
          !this.selection_origin.groupID === groupID
        ) {
          return
        }

        colors.forEach((color, i) => {
          if (between(i, this.selection_origin.index, index)) {
            colors[i].isSelected = true
            return
          }
          colors[i].isSelected = false
        })

        return
      }

      // Single selection
      this.deselectAll()
      color.isSelected = !isSelected

      // Set selection origin for eventual shift selections afterward
      this.selection_origin = { index, colors, groupID }

      // Update displayed color.
      if (color.isSelected) {
        this.setActiveColor(color)
      }
    },

    handleGroupClick (event, group) {
      const isSelected = group.isSelected

      // CTRL or ALT is down : multi selection
      if (!event.ctrlKey || !event.AltKey) {
        this.deselectAll()
      }

      // Single selection
      group.isSelected = !isSelected
      this.groups = [...this.groups]
    },

    onClick (event) {
      // Deselect all if user clicks outside a color or group.
      if (event.target.hasAttribute('data-maintain-selection')) {
        return
      }

      this.deselectAll()
    },

    onKeyDown (event) {
      if (event.altKey && event.shiftKey && event.keyCode === 65) {
        // Alt + Shift + A
        this.addColor()
      } else if (event.altKey && event.shiftKey && event.keyCode === 70) {
        // Alt + Shift + F
        this.addGroup()
      } else if (event.altKey && event.shiftKey && event.keyCode === 68) {
        // Alt + Shift + D
        this.deleteSelection()
      } else if (event.altKey && event.shiftKey && event.keyCode === 69) {
        // Alt + Shift + E
        this.exportColors()
      }
    },

    onStart () {
      console.log('onStart')
    },

    onEnd () {
      console.log('onEnd')
      this.deselectAll()
      this.colors = [...this.colors]
      this.groups = [...this.groups]
    },

    // Export colors to .ase
    // @see npm ase-utils
    exportColors (event) {
      let input = {
        version: '1.0',
        groups: [],
        colors: []
      }

      input.colors
        .push(...this.colors.map(color => {
          return this.formatColor(color)
        }))

      for (const group of this.groups) {
        input.colors
          .push(...group.content.map(color => {
            return this.formatColor(color)
          }))
      };

      this.convertToASE(input)
    },

    formatColor (color) {
      if (!color) {
        return null
      }

      let formattedColor = {
        name: `R=${color.r}G=${color.g}B=${color.b}`,
        model: 'RGB',
        color: [color.r / 255, color.g / 255, color.b / 255],
        type: 'global'
      }

      return formattedColor
    },

    convertToASE (data) {
      let encodedData = ase.encode(data)
      this.saveFile(encodedData)
    },

    saveFile (fileEntry) {
      save(fileEntry, 'swatches.ase', (err, data) => {
        if (err) {
          throw err
        }
      }).then(() => {})
    }
  }
}
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

  & > .group-collection {
    display: block;

    &:not(:empty) {
      margin-bottom: $spacer / 2;
    }

    & > .group {
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
