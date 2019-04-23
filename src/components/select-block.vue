<template>
  <div class="colorMode select-block" v-bind:class="[{'-opened': isOpen }]">
    <button class="btn value" v-on:click="toggle">
      <span class="text">{{text}}</span>
      <i class="icon icon-carret-down"></i>
    </button>

    <ul class="options">
      <li
        class="option"
        v-for="(option, index) in mutableOptions"
        v-bind:class="[{'-selected': option.isSelected }]"
        v-on:click="setValue(option)"
        v-on:keyup.enter="setValue(option)"
        v-bind:key="index"
        tabindex="0"
      >{{option.text}}</li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    options: {
      required: true,
      type: Array
    }
  },

  data() {
    return {
      isOpen: false,
      selectedOption: false,
      value: "",
      text: "",
      mutableOptions: this.options
    };
  },

  watch: {
    mutableOptions: {
      handler(options) {
        if (!options) return;

        options.forEach(option => {
          if (option.isSelected) {
            this.value = option.value;
            this.text = option.text;
          }
        });
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    setValue(option) {
      if (option.isSelected) return;

      this.mutableOptions = this.mutableOptions.map(item => {
        return {
          ...item,
          isSelected: item === option
        };
      });

      this.$emit("change", { value: option.value, text: option.text });
      this.toggle();
    },

    toggle() {
      if (this.isOpen) {
        return this.close();
      }

      return this.open();
    },

    open() {
      this.bindEvents();
      this.isOpen = true;
    },

    close() {
      this.unbindEvents();
      this.isOpen = false;
    },

    bindEvents() {
      const doc = this.$el.ownerDocument;
      doc.addEventListener("click", this.onClickOutside);
      doc.addEventListener("touchstart", this.onClickOutside);
    },

    unbindEvents() {
      const doc = this.$el.ownerDocument;
      doc.removeEventListener("click", this.onClickOutside);
      doc.removeEventListener("touchstart", this.onClickOutside);
    },

    onClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.close();
      }
    }
  },

  beforeDestroy() {
    this.unbindEvents();
  }
};
</script>

<style lang="scss">
@import "../sass/abstracts/variables";

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

    > .icon {
      width: 22px;
      height: 22px;
      font-size: 14px;
      vertical-align: middle;
      line-height: inherit;

      &.icon-carret-down {
        display: inline-block;
        margin-right: -$spacer;
        vertical-align: top;
        transition: transform 0.2s ease;

        &:before {
          display: block;
          text-align: center;
        }
      }
    }
  }

  &.-opened {
    > .value {
      .icon-carret-down {
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
    box-shadow: $shadow;
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
        }
      }
    }
  }
}
</style>
