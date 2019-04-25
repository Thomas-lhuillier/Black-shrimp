<template>
  <div class="colorPicker">
    <!-- Color Viewer -->
    <div class="colorViewer" :style="{ backgroundColor: color.hex }"/>

    <!-- Color inputs -->
    <div class="valueWrapper">
      <div class="hexWrapper" :class="[{ active: colorMode == 'hex' }]">
        <input v-model="color.hex" type="text" spellcheck="false" @click="selectInputText($event)">
      </div>

      <div class="rgbWrapper" :class="[{ active: colorMode == 'rgb' }]">
        <input v-model="color.r" type="text" spellcheck="false" @click="selectInputText($event)">
        <input v-model="color.g" type="text" spellcheck="false" @click="selectInputText($event)">
        <input v-model="color.b" type="text" spellcheck="false" @click="selectInputText($event)">
      </div>

      <div class="hslWrapper" :class="[{ active: colorMode == 'hsl' }]">
        <input v-model="color.h" type="text" spellcheck="false" @click="selectInputText($event)">
        <input v-model="color.s" type="text" spellcheck="false" @click="selectInputText($event)">
        <input v-model="color.l" type="text" spellcheck="false" @click="selectInputText($event)">
      </div>
    </div>

    <!-- Color mode select -->
    <SelectComponent
      :options="[
        { text: 'hex', value: 1, isSelected: true },
        { text: 'rgb', value: 2, isSelected: false },
        { text: 'hsl', value: 3, isSelected: false },
      ]"
      @change="changeColorMode($event)"
    />
  </div>
</template>

<script>
import SelectComponent from './select-block.vue'

export default {
  components: {
    SelectComponent
  },

  data () {
    return {
      colorMode: 'hex'
    }
  },

  computed: {
    color () {
      return this.$store.getters.getColor
    }
  },

  methods: {
    changeColorMode (event) {
      this.colorMode = event.text
    },

    selectInputText (event) {
      event.target.select()
    }
  }
}
</script>

<style lang="scss">
@import "../sass/abstracts/variables";

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

  font-family: $font-family-base !important;
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
</style>
