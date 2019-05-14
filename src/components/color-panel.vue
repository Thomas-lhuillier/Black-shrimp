<template>
  <div class="panel">
    <!-- Color picker -->
    <colorPicker class="panel-item" />

    <!-- Color swatches -->
    <div class="panel-item">
      <!-- Empty state - no color and no groups -->
      <div v-if="!colorCollection.length && !groupCollection.length" class="panel-empty-state">
        Click on the screen with the<br>
        eyedropper <span class="btn btn-square"><i class="icon icon-eyeDropper" /></span> to pick a color<br>
        then click on <span class="btn btn-square"><i class="icon icon-plus" /></span> to save it
      </div>

      <colorGroup
        :list="colorCollection"
        :selection="selectedColors"
        @end="onEnd"
        @move="deselectAll"
        @color-click="onColorClick"
        @change="$store.commit('setColorCollection', { data: $event })"
      />

      <!-- Empty state - colors but no group yet -->
      <div v-if="colorCollection.length && !groupCollection.length" class="panel-empty-state">
        Click on <span class="btn btn-square"><i class="icon icon-folder" /></span> to add a group
        then drag some colors inside
      </div>

      <draggable
        v-model="groupCollectionLocal"
        group="groups"
        :animation="200"
        @start="onStart"
        @end="onEnd"
        @move="deselectAll"
      >
        <!-- @todo Put back this transition group on after cleaning storage syncing -->
        <transition-group
          :name="isDragging ? 'flip-list' : 'fall'"
          type="transition"
        >
          <colorGroup
            v-for="groupId in groupCollectionLocal"
            :key="groupId"
            :list="groups[groupId]"
            :group-id="groupId"
            :selection="selectedColors"
            :is-group-selected="selectedGroups[groupId] === true"
            @end="onEnd"
            @move="deselectAll"
            @color-click="onColorClick"
            @select="onGroupClick($event, groupId)"
            @change="$store.commit('setGroups', { data: {...groups, [groupId]: $event } })"
          />
        </transition-group>
      </draggable>
    </div>

    <!-- Action buttons -->
    <!-- @todo use base-button component -->
    <div class="panel-footer">
      <div class="mr-auto">
        <logoSVG class="d-block" />
      </div>

      <button
        v-tooltip="{
          content: '<b>A</b>dd color<br><kbd>ALT + SHIFT + A</kbd>',
          placement: 'bottom',
          offset: 10,
          classes: 'text-center'
        }"
        class="btn btn-square"
        title="Add color [Alt + Shift + A]"
        @click="addColor()"
      >
        <i class="icon icon-plus" />
      </button>

      <button
        v-tooltip="{
          content: 'Add <b>G</b>roup<br><kbd>ALT + SHIFT + G</kbd>',
          placement: 'bottom',
          offset: 10,
          classes: 'text-center'
        }"
        class="btn btn-square"
        title="Add Group [Alt + Shift + G]"
        @click="addGroup($event)"
      >
        <i class="icon icon-folder" />
      </button>

      <button
        v-tooltip="{
          content: '<b>D</b>elete selection<br><kbd>ALT + SHIFT + D</kbd>',
          placement: 'bottom',
          offset: 10,
          classes: 'text-center'
        }"
        class="btn btn-square"
        title="Delete selection [Alt + Shift + D]"
        data-maintain-selection
        @click.exact="deleteSelection($event)"
        @click.shift.exact="deleteAll($event)"
      >
        <i class="icon icon-trash" />
      </button>

      <button
        v-tooltip="{
          content: '<b>E</b>xport<br><kbd>ALT + SHIFT + E</kbd>',
          placement: 'bottom',
          offset: 10,
          classes: 'text-center'
        }"
        class="btn btn-square"
        title="Export [Alt + Shift + E]"
        @click.exact="exportColors"
      >
        <i class="icon icon-download" />
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import colorGroup from './color-group.vue'
import colorPicker from './color-picker.vue'
import draggable from 'vuedraggable'
import ase from 'ase-utils'
import { between } from '../utilities/number'
import logoSVG from '../assets/img/logo.svg?inline'

export default {
  components: {
    colorGroup,
    colorPicker,
    draggable,
    logoSVG
  },

  data: () => ({
    isDragging: false,

    selectedColors: {},
    selectedGroups: {},

    lastSelection: {
      index: null,
      groupId: null
    }
  }),

  computed: {
    ...mapState([ 'color', 'colors', 'colorCollection', 'groups', 'groupCollection' ]),

    groupCollectionLocal: {
      get () {
        return this.groupCollection
      },
      set (groupCollection) {
        this.$store.commit('setGroupCollection', { data: groupCollection })
      }
    }
  },

  mounted () {
    window.addEventListener('click', this.onClick)
    window.addEventListener('keydown', this.onKeyDown)
  },

  beforeDestroy () {
    window.removeEventListener('click', this.onClick)
    window.removeEventListener('keydown', this.onKeyDown)
  },

  methods: {
    setColor (color) {
      this.$store.commit('setColor', color)
    },

    addColor () {
      if (typeof this.color.r === 'undefined') { return } // @Todo show indication to user ?
      this.$store.dispatch('createColor', this.color)
    },

    addGroup () {
      this.$store.dispatch('addGroup')
    },

    deleteSelection (event) {
      const colors = Object.keys(this.selectedColors)
      const groups = Object.keys(this.selectedGroups)

      this.$store.dispatch('deleteColors', colors)
      this.$store.dispatch('deleteGroups', groups)
      this.deselectAll()
    },

    deleteAll () {
      let ask = confirm(
        `You are about to delete all your colors and groups.
        Please confirm to proceed.`
      )

      if (!ask) { return }

      this.$store.dispatch('deleteAll')
      this.deselectAll()
    },

    /**
     * On click on color, select/deselect colors.
     * Hotkeys:
     *  - `CTRL` or `ALT` to toggle color
     *  - `SHIFT` to select multiple items
     */
    onColorClick (event, payload) {
      const { colorId, groupId, index } = payload
      const isSelected = this.selectedColors[colorId]

      // When `SHIFT` is pressed, we select every colors
      // between current and previously selected colors
      if (event.shiftKey) {
        // Check that last previous selection is set and belongs to the current group
        if (
          !typeof this.lastSelection.index === 'number' ||
          this.lastSelection.groupId !== groupId
        ) { return }

        // Get target collection
        const collection = groupId
          ? this.groups[groupId]
          : this.colorCollection

        // Filter items beetween target item and previous item
        const targetIds = collection.filter((_colorId, _index) => {
          return between(_index, this.lastSelection.index, index)
        })

        // Add them to the selection
        this.selectColor(targetIds)
      } else {
        // if `CTRL` or `ALT` is pressed we keep the selection
        if (!event.ctrlKey && !event.altKey) {
          this.deselectAll()
        }

        // Single selection
        if (isSelected) {
          this.deselectColors(colorId)
        } else {
          this.selectColor(colorId)
        }

        this.lastSelection = { index, groupId }

        // Update displayed color.
        if (!isSelected) {
          this.setColor(this.colors[colorId])
        }
      }
    },

    /**
     * Deselect colors and groups
     */
    deselectAll () {
      this.selectedColors = {}
      this.selectedGroups = {}
      this.lastSelection = { index: null, groupId: null }
    },

    /**
     * Select colors
     *
     * @param {Number|Array} colorIds The id(s) of colors to select
     */
    selectColor (colorIds) {
      this.toggleSelectedColors(colorIds)
    },

    /**
     * Deselect colors
     *
     * @param {Number|Array} colorIds The id(s) of colors to deselect
     */
    deselectColors (colorIds) {
      this.toggleSelectedColors(colorIds, false)
    },

    /**
     * Toggle colors selection
     *
     * @param {Number|Array} colorIds The id(s) of colors to toggle
     * @param {Boolean} toggleOn If false, will deselect instead of selecting
     */
    toggleSelectedColors (colorIds, toggleOn = true) {
      const selectedColors = { ...this.selectedColors }
      const ids = colorIds.constructor === Array
        ? colorIds
        : [colorIds]

      ids.forEach(colorId => {
        if (toggleOn) {
          selectedColors[colorId] = true
        } else {
          delete selectedColors[colorId]
        }
      })

      this.selectedColors = selectedColors
    },

    onGroupClick (event, groupId) {
      const isSelected = this.selectedGroups[groupId] === true

      // CTRL or ALT is down : multi selection
      if (!event.ctrlKey && !event.altKey) {
        this.deselectAll()
      }

      // Single selection
      if (isSelected) {
        this.$delete(this.selectedGroups, groupId)
      } else {
        this.$set(this.selectedGroups, groupId, true)
      }
    },

    /**
     * On click, deselect all if user clicks outside a color or group.
     *
     * @param {Event} event
     */
    onClick (event) {
      if (event.target.hasAttribute('data-maintain-selection')) { return }
      this.deselectAll()
    },

    onKeyDown (event) {
      if (event.altKey && event.shiftKey && event.keyCode === 65) {
        // Alt + Shift + A
        this.addColor()
      } else if (event.altKey && event.shiftKey && event.keyCode === 71) {
        // Alt + Shift + G
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
      this.isDragging = true
    },

    onEnd () {
      this.isDragging = false
      this.deselectAll()
    },

    /**
     * Export colors to .ase
     * @see npm ase-utils
     */
    exportColors (event) {
      const data = this.getFormattedData()
      const encodedData = ase.encode(data)
      this.export(encodedData)
    },

    /**
     * Format the whole color collection in order to encode it in ASE format
     * @returns {Object}
     */
    getFormattedData () {
      let input = {
        version: '1.0',
        groups: [],
        colors: []
      }

      input.colors
        .push(...Object.keys(this.colors).map(color => {
          return this.formatColor(this.colors[color])
        }))

      Object.entries(this.groups).map(group => {
        input.colors
          .push(...group.map(color => {
            return this.formatColor(color)
          }))
      })

      return input
    },

    /**
     * Format a color for ASE
     *
     * @param {Object} color The color to encode {r, g, b}
     * @returns {Object}
     */
    formatColor (color) {
      if (!color) { return null }

      const { r, g, b } = color

      let formattedColor = {
        name: `R=${r}G=${g}B=${b}`,
        model: 'RGB',
        color: [r / 255, g / 255, b / 255],
        type: 'global'
      }

      return formattedColor
    },

    /**
     * Export ArrayBuffer converting to objectURL
     * and dispatch the 'export' state action to handle file saving
     *
     * @param {ArrayBuffer} data
     */
    export (data) {
      const blob = new Blob([data], { type: 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      this.$store.dispatch('export', url)
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

.panel-empty-state {
  margin-bottom: $spacer;
  padding: (2 * $spacer) $spacer;
  font-size: 0.75rem;
  line-height: $line-height-lg;
  letter-spacing: -0.5px;
  text-align: center;
  background-color: $gray-dark;
  border-radius: $border-radius;

  .btn-square {
    display: inline-block;
    vertical-align: middle;
    background-color: $color-brand;
    cursor: default;

    > .icon {
      color: $gray-dark;
    }
  }
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
  align-items: center;

  & > .btn-square {
    border: none;
    margin-left: $spacer;
  }
}
</style>
