<template>
  <div class="colorMode select-block" :class="[{'--opened': isOpen }]">
    <baseButton class="select-button" @click="toggle">
      <span class="text">{{ mutableText }}</span>
      <i class="icon icon-carret-down" />
    </baseButton>

    <transition name="fall">
      <ul v-if="isOpen" class="select-options">
        <li
          v-for="(option, index) in mutableOptions"
          :key="index"
          class="select-option"
          :class="[{'--selected': option.isSelected }]"
          tabindex="0"
          @click="setValue(option)"
          @keyup.enter="setValue(option)"
        >{{ option.text }}</li>
      </ul>
    </transition>
  </div>
</template>

<script>
import baseButton from './base-button.vue'

export default {
  components: {
    baseButton
  },

  props: {
    options: {
      required: true,
      type: Array
    },

    text: {
      required: false,
      type: String,
      default: ''
    }
  },

  data () {
    return {
      isOpen: false,
      value: '',
      mutableOptions: [...this.options],
      mutableText: this.text
    }
  },

  watch: {
    mutableOptions: {
      handler (options) {
        if (!options) return

        options.forEach(option => {
          if (option.isSelected) {
            this.value = option.value
            this.mutableText = option.text
          }
        })
      },
      deep: true,
      immediate: true
    }
  },

  beforeDestroy () {
    this.unbindEvents()
  },

  methods: {
    setValue (option) {
      if (option.isSelected) {
        this.toggle()
        return
      }

      this.mutableOptions = this.mutableOptions.map(item => {
        return {
          ...item,
          isSelected: item === option
        }
      })

      this.$emit('change', { value: option.value, text: option.text })
      this.toggle()
    },

    toggle () {
      if (this.isOpen) {
        this.close()
      } else {
        this.open()
      }
    },

    open () {
      this.bindEvents()
      this.isOpen = true
    },

    close () {
      this.unbindEvents()
      this.isOpen = false
    },

    bindEvents () {
      const doc = this.$el.ownerDocument
      doc.addEventListener('click', this.onClickOutside)
      doc.addEventListener('touchstart', this.onClickOutside)
    },

    unbindEvents () {
      const doc = this.$el.ownerDocument
      doc.removeEventListener('click', this.onClickOutside)
      doc.removeEventListener('touchstart', this.onClickOutside)
    },

    onClickOutside (event) {
      if (!this.$el.contains(event.target)) {
        this.close()
      }
    }
  }
}
</script>

<style lang="scss">
@import "../sass/abstracts/variables";
@import "../sass/abstracts/mixins";

@include transition-fall;

.select-block {
  position: relative;
  cursor: pointer;

  &.--opened {
    > .select-button {
      .icon {
        transform: rotateZ(-90deg);
      }
    }
  }
}

.select-button {
  position: relative;
  display: flex;
  width: 100%;
  padding-left: $spacer;
  padding-right: $spacer;

  font-size: 0.75rem;
  line-height: 22px;

  user-select: none;
  z-index: 2;

  > .icon {
    width: 22px;
    height: 22px;
    margin-right: -$spacer;
    line-height: inherit;

    transition: transform $transition-duration ease;

    &:before {
      display: block;
      text-align: center;
    }
  }
}

.select-options {
  position: absolute;
  left: 0;
  right: 0;
  margin-top: 1px;
  box-shadow: $shadow;
  z-index: 1;

  > .select-option {
    display: block;
    padding-left: $spacer;
    padding-right: $spacer;
    font-size: 10px;
    line-height: 22px;
    background-color: $gray;

    &:hover {
      color: $soft-white;
      background-color: $gray-dark;
    }

    &.--selected {
      color: $soft-white;
      background-color: $gray-light;
    }

    &:focus {
      z-index: 1;
      position: relative;
    }
  }
}
</style>
