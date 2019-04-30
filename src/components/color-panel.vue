<template>
  <div class="panel">
    <!-- Color picker -->
    <colorPicker class="panel-item"/>

    <!-- Color swatches -->
    <div class="panel-item">
      <colorGroup
        :colors="colors"
        @end="onEnd"
        @move="deselectAll"
        @color-click="handleColorClick"
      />

      <!-- class="group-collection" -->
      <draggable v-model="groups" :tag="'ul'" group="groups" @end="onEnd" @move="deselectAll">
        <colorGroup
          v-for="(group, index) in groups"
          :key="index"
          class="--group"
          :class="[{ '--selected': group.isSelected }]"
          :colors="group.content"
          @end="onEnd"
          @move="deselectAll"
          @color-click="handleColorClick"
          @click.self.native="handleGroupClick($event, group)"
        />
      </draggable>
    </div>

    <!-- Action buttons -->
    <div class="panel-footer">
      <button class="btn btn-square" title="Add color [Alt + Shift + A]" @click="addColor()">
        <i class="icon icon-plus"/>
      </button>

      <button class="btn btn-square" title="Add Group [Alt + Shift + F]" @click="addGroup($event)">
        <i class="icon icon-folder"/>
      </button>

      <button
        class="btn btn-square"
        title="Delete selection [Alt + Shift + D]"
        data-maintain-selection
        @click.exact="deleteSelection($event)"
        @click.shift.exact="deleteAll($event)"
      >
        <i class="icon icon-trash"/>
      </button>

      <button class="btn btn-square" title="Export [Alt + Shift + E]" @click.exact="exportColors">
        <i class="icon icon-carret-down"/>
      </button>
    </div>
  </div>
</template>

<script>
import colorGroup from './color-group.vue'
import colorPicker from './color-picker.vue'
import draggable from 'vuedraggable'
import save from 'save-file'
import ase from 'ase-utils'
import { between } from '../utilities/number'

export default {
  components: {
    colorGroup,
    colorPicker,
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

    onEnd () {
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

      // this.saveFile(encodedData)
      const blob = new Blob([encodedData], { type: 'application/octet-stream' })
      const url = this.$root.window.URL.createObjectURL(blob)
      // chrome.downloads.download({ url: url })

      this.port.postMessage({
        type: 'saveASE',
        url: url
      })
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
  padding: $spacer;
  color: $gray-lighter;
  background-color: $gray;
}

.panel-item {
  &:not(:first-child) {
    margin-top: $spacer;

    &:before {
      content: "";
      display: block;
      margin-left: -$spacer;
      margin-right: -$spacer;
      margin-bottom: $spacer;
      border-top: solid $border-width $gray-light;
    }
  }
}

.panel-footer {
  display: flex;
  justify-content: flex-end;

  & > .btn-square {
    border: none;
    margin-left: $spacer;
  }
}
</style>
