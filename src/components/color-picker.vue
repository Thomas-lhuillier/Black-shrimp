<template>
  <div class="color-picker">
    <!-- Color Viewer -->
    <div class="color-viewer" :style="{ backgroundColor: color.hex }" />

    <!-- Color inputs -->
    <div class="valueWrapper">
      <div class="hex-wrapper" :class="[{ '--active': colorMode == 'hex' }]">
        <input v-model="color.hex" type="text" spellcheck="false" @click="selectInputText($event)">
      </div>

      <div class="rgb-wrapper" :class="[{ '--active': colorMode == 'rgb' }]">
        <input v-model="color.r" type="text" spellcheck="false" @click="selectInputText($event)">
        <input v-model="color.g" type="text" spellcheck="false" @click="selectInputText($event)">
        <input v-model="color.b" type="text" spellcheck="false" @click="selectInputText($event)">
      </div>

      <div class="hsl-wrapper" :class="[{ '--active': colorMode == 'hsl' }]">
        <input v-model="color.h" type="text" spellcheck="false" @click="selectInputText($event)">
        <input v-model="color.s" type="text" spellcheck="false" @click="selectInputText($event)">
        <input v-model="color.l" type="text" spellcheck="false" @click="selectInputText($event)">
      </div>
    </div>

    <!-- Color mode select -->
    <baseSelect
      :options="options"
      :text="colorMode"
      @change="changeColorMode($event)"
    />
  </div>
</template>

<script>
import baseSelect from './base-select.vue'

export default {
  components: {
    baseSelect
  },

  data () {
    return {
      colorMode: null
    }
  },

  computed: {
    color () {
      return this.$store.getters.getColor
    },

    options () {
      return [
        { text: 'hex', value: 1, isSelected: this.colorMode === 'hex' },
        { text: 'rgb', value: 2, isSelected: this.colorMode === 'rgb' },
        { text: 'hsl', value: 3, isSelected: this.colorMode === 'hsl' }
      ]
    }
  },

  created () {
    this.fetchColorMode().then(colorMode => {
      this.colorMode = colorMode
    })
  },

  methods: {
    fetchColorMode () {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.get('colorMode', storage => {
          resolve(storage.colorMode || 'hex')
        })
      })
    },

    saveColorMode (value) {
      chrome.storage.sync.set({ colorMode: value }, () => {
      })
    },

    changeColorMode (event) {
      const colorMode = event.text
      this.colorMode = colorMode
      this.saveColorMode(colorMode)
    },

    selectInputText (event) {
      event.target.select()
    }
  }
}
</script>

<style lang="scss">
@import "../sass/abstracts/variables";

.color-picker {
  display: flex;

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

.color-viewer {
  flex-shrink: 0;
  position: relative;
  width: 22px;
  height: 22px;

  border-radius: 100%;
  border: $border-width solid $gray-light;
  box-sizing: border-box;
}

.hex-wrapper {
  display: none;

  &.--active {
    display: block;
  }
}

.rgb-wrapper,
.hsl-wrapper {
  display: none;

  &.--active {
    display: flex;
  }

  input + input {
    margin-left: ($spacer / 2);
  }
}

input[type="text"] {
  display: inline-block;
  height: 22px;
  padding: ($spacer / 2);
  width: 100%;

  font-family: $font-family-base;
  font-size: 0.75rem;
  text-align: center;

  color: $soft-white;
  background-color: $gray-dark;
  border: solid $border-width $gray-light;
  border-radius: $border-radius-sm;
  box-sizing: border-box;

  &:focus {
    border-color: $gray-darker;
  }
}
</style>
