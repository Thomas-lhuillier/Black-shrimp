<template>
  <div class="panel panel--color">
    <div class="colorPicker">
      <div class="colorViewer" v-bind:style="{ backgroundColor: hex }"></div>

      <div class="valueWrapper">
        <div class="hexWrapper" v-bind:class="[{ active: color.hex.isActive }]">
          <input type="text" class="value_hex" v-model="hex">
        </div>
        <div class="rgbWrapper" v-bind:class="[{ active: color.rgb.isActive }]">
          <input type="text" class="value_r" v-model="r">
          <input type="text" class="value_g" v-model="g">
          <input type="text" class="value_b" v-model="b">
        </div>
        <div class="hslWrapper" v-bind:class="[{ active: color.hsl.isActive }]">
          <input type="text" class="value_h" v-model="h">
          <input type="text" class="value_s" v-model="s">
          <input type="text" class="value_l" v-model="l">
        </div>
      </div>

      <SelectComponent :options="[
        { text: 'hex', value: 1, isSelected: true  },
        { text: 'rgb', value: 2, isSelected: false },
        { text: 'hsl', value: 3, isSelected: false },
      ]" v-on:change="changeColorMode($event)"></SelectComponent>
    </div>

    <div class="colorSwatches"></div>
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
        currentColorType: 'hex',
        color: {
          'hex': { isActive: true  },
          'rgb': { isActive: false },
          'hsl': { isActive: false },
        }
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
      changeColorMode: function(e) {
        console.log('changeColorMode');
        console.log(this.$store.getters.getColorState.value);
        for (let text in this.color) {
          this.color[text].isActive = text == e.text ? true : false;
        }
      },
    },
    mounted: function() {
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
    }
  } 
</style>