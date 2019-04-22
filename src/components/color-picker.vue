<template>
  <div class="colorPicker">
    <!-- Color Viewer -->
    <div class="colorViewer" v-bind:style="{ backgroundColor: hex }"></div>

    <!-- Color inputs -->
    <div class="valueWrapper">
      <div class="hexWrapper" v-bind:class="[{ active: color.hex.isActive }]">
        <input type="text" v-model="hex" @click="selectInputText($event)" spellcheck="false">
      </div>

      <div class="rgbWrapper" v-bind:class="[{ active: color.rgb.isActive }]">
        <input type="text" v-model="r" @click="selectInputText($event)" spellcheck="false">
        <input type="text" v-model="g" @click="selectInputText($event)" spellcheck="false">
        <input type="text" v-model="b" @click="selectInputText($event)" spellcheck="false">
      </div>

      <div class="hslWrapper" v-bind:class="[{ active: color.hsl.isActive }]">
        <input type="text" v-model="h" @click="selectInputText($event)" spellcheck="false">
        <input type="text" v-model="s" @click="selectInputText($event)" spellcheck="false">
        <input type="text" v-model="l" @click="selectInputText($event)" spellcheck="false">
      </div>
    </div>

    <!-- Color mode select -->
    <SelectComponent
      :options="[
        { text: 'hex', value: 1, isSelected: true  },
        { text: 'rgb', value: 2, isSelected: false },
        { text: 'hsl', value: 3, isSelected: false },
      ]"
      v-on:change="changeColorMode($event)"
    ></SelectComponent>
  </div>
</template>

<script>
import SelectComponent from "./select-block.vue";

export default {
  components: {
    SelectComponent
  },

  data() {
    return {
      currentColorType: "hex",
      color: {
        hex: { isActive: true },
        rgb: { isActive: false },
        hsl: { isActive: false }
      }
    };
  },

  computed: {
    hex() {
      return this.getColor("hex").toString();
    },
    r() {
      return this.getColor("r").toString();
    },
    g() {
      return this.getColor("g").toString();
    },
    b() {
      return this.getColor("b").toString();
    },
    h() {
      return this.getColor("h").toString();
    },
    s() {
      return this.getColor("s").toString();
    },
    l() {
      return this.getColor("l").toString();
    }
  },
  methods: {
    getColor(key) {
      return this.$store.getters.getColor.value[key];
    },

    changeColorMode(event) {
      for (let text in this.color) {
        this.color[text].isActive = text == event.text;
      }
    },

    selectInputText(event) {
      event.target.select();
    }
  }
};
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

  font-family: "Poppins", monospace !important;
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
