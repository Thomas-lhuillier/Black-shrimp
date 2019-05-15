<template>
  <div class="color-picker">
    <!-- Color Viewer -->
    <div class="color-viewer" :style="{ backgroundColor: hex }" />

    <!-- Color inputs -->
    <div class="valueWrapper">
      <div class="hex-wrapper" :class="[{ '--active': _colorMode === 'hex' }]">
        <input v-model="hex" type="text" spellcheck="false" @click="selectInputText($event)">
      </div>

      <div class="rgb-wrapper" :class="[{ '--active': _colorMode === 'rgb' }]">
        <input v-model="color.r" type="text" spellcheck="false" @click="selectInputText($event)">
        <input v-model="color.g" type="text" spellcheck="false" @click="selectInputText($event)">
        <input v-model="color.b" type="text" spellcheck="false" @click="selectInputText($event)">
      </div>

      <div class="hsl-wrapper" :class="[{ '--active': _colorMode === 'hsl' }]">
        <input v-model="hsl.h" type="text" spellcheck="false" @click="selectInputText($event)">
        <input v-model="hsl.s" type="text" spellcheck="false" @click="selectInputText($event)">
        <input v-model="hsl.l" type="text" spellcheck="false" @click="selectInputText($event)">
      </div>
    </div>

    <!-- Color mode select -->
    <baseSelect
      :options="options"
      :text="_colorMode"
      @change="setColorMode($event.value)"
    />
  </div>
</template>

<script>
import { rgbToHsl, rgbToHex } from '../utilities/color'
import baseSelect from './base-select.vue'
import { mapState } from 'vuex'

export default {
  components: {
    baseSelect
  },

  computed: {
    ...mapState(['color', 'colorMode']),

    _colorMode () {
      return this.colorMode || 'hex'
    },

    hex () {
      const hex = typeof this.color.r !== 'undefined'
        ? rgbToHex(this.color)
        : ''

      return hex
    },

    hsl () {
      const hsl = typeof this.color.r !== 'undefined'
        ? rgbToHsl(this.color)
        : { h: '', s: '', l: '' }

      return hsl
    },

    options () {
      return [
        { text: 'hex', value: 'hex', isSelected: this._colorMode === 'hex' },
        { text: 'rgb', value: 'rgb', isSelected: this._colorMode === 'rgb' },
        { text: 'hsl', value: 'hsl', isSelected: this._colorMode === 'hsl' }
      ]
    }
  },

  methods: {
    setColorMode (value) {
      this.$store.dispatch('setColorMode', value)
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
