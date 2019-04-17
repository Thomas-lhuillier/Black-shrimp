<template>
  <div class="colorMode select-block" v-bind:class="[{'-opened': isOpen }]" v-on-clickaway="close">
    <button class="btn value" v-on:click="toggleDropdown">
      <span class="text">{{text}}</span>
      <i class="bs-icon bs-icon-carret-down"></i>
    </button>
    <ul class="options">
      <li
        class="option"
        v-for="(item, index) in mutableOptions"
        v-bind:class="[{'-selected': item.isSelected }]"
        v-on:click="updateValue(item)"
        v-bind:key="index"
      >{{item.text}}</li>
    </ul>
  </div>
</template>

<script>
import { mixin as clickaway } from "vue-clickaway";

export default {
  mixins: [clickaway],
  props: ["options"],
  data() {
    return {
      isOpen: false,
      selectedOption: false,
      value: "",
      text: "",
      mutableOptions: this.options
    };
  },

  methods: {
    toggleDropdown: function() {
      this.isOpen = !this.isOpen;
    },

    updateValue: function(val) {
      let index = 0;
      this.toggleDropdown();

      if (val.value == this.value) {
        return;
      }

      this.value = val.value;
      this.text = val.text;

      for (let option of this.mutableOptions) {
        if (val == option) {
          this.mutableOptions[index].isSelected = true;
        } else {
          this.mutableOptions[index].isSelected = false;
        }
        index++;
      }

      this.$emit("change", { value: val.value, text: val.text });
    },

    close: function() {
      if (this.isOpen) {
        this.isOpen = false;
      }
    }
  },

  created: function() {
    let index = 0;
    for (let option of this.options) {
      if (option.isSelected) {
        this.value = option.value;
        this.text = option.text;
        this.selectedOption = index;
      }
      index++;
    }
  }
};
</script>

<style lang="scss">
@import "../sass/variables";

.select-block {
  position: relative;
  cursor: pointer;

  > .value {
    display: flex;
    padding-left: $spacer;
    padding-right: $spacer;

    font-size: 10px;
    font-weight: 600;
    line-height: 22px;
    text-transform: uppercase;

    user-select: none;

    > .bs-icon {
      width: 22px;
      height: 22px;
      font-size: 14px;
      vertical-align: middle;
      line-height: inherit;

      &.bs-icon-carret-down {
        display: inline-block;
        margin-right: -$spacer;
        vertical-align: top;
        transition: transform 0.2s ease;

        &:before {
          display: block;
          text-align: center;
          border-radius: 100%;
        }
      }
    }
  }

  &.-opened {
    > .value {
      .bs-icon-carret-down {
        transform: rotateZ(-90deg);
      }
    }
    > .options {
      display: block;
    }
  }

  > .options {
    display: none;
    position: absolute;
    left: 0;
    right: 0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    z-index: 1;

    > .option {
      display: block;
      padding-left: $spacer;
      padding-right: $spacer;
      font-size: 10px;
      line-height: 22px;
      background-color: $gray;

      &:hover,
      &.-focused {
        color: $soft-white;
        background-color: $gray-dark;
      }

      &.-selected {
        color: $soft-white;
        background-color: $gray-light;
        &:before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          width: 3px;
          height: 3px;
          font-sizeborder-radius: 100%;
        }
      }
    }
  }
}
</style>
