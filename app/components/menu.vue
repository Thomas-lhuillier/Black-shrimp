<template>
  <div class="menu" data-js-draggable>
    <span v-for="item in items" class="item" v-bind:class="[{active: item.isActive }, {'-moving': isMoving}, 'item--' + item.name]" data-js-draggable>
      <i class="bs-icon" v-bind:class="['bs-icon-' + item.icon]" data-js-draggable></i>
      <span data-js-draggable>{{item.name}}</span>
    </span>

    <span class="jsClose item"
          :class="{'-moving': isMoving}"
          @click="destroy($event)"
          data-js-draggable>
      <i class="bs-icon bs-icon-close" data-js-draggable></i>
    </span>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        items: [
          {name: 'Color', icon: 'eyeDropper', isActive: true},
          {name: 'Ruler', icon: 'ruler', isActive: false},
          {name: 'Info' , icon: 'binoculars', isActive: false}
        ],
      }
    },
    computed: {
      isMoving() {
        return this.$store.getters.getMovingStatus;
      },
      port() {
        return this.$store.getters.getPort;
      },
    },
    methods: {
      destroy: function() {
        this.port.postMessage({
          'type': 'destroy'
        });
      }
    }
  }
</script>

<style lang="scss">
  @import "../sass/_vars.scss";

  .blackShrimp {
    .menu {
      $height: 28px;

      position: relative;
      display: block;
      height: $height;

      color: $gray-dark;
      background-color: $soft-white;
      border-top-left-radius: $border-radius;
      border-top-right-radius: $border-radius;

      overflow: hidden;
      user-select: none;

      .item {
        display: inline-block;
        padding-left: 5px;
        padding-right: 8px;
        height: $height;

        font-size: 12px;
        line-height: $height;
        vertical-align: top;

        cursor: pointer;
        transition: all 0.3s linear;

        > * {
          display: inline-block;
          vertical-align: top;
          line-height: inherit;
        }

        &:hover, &:focus {
          background: $gray-dark;
          color: $soft-white;
        }

        &.-moving {
          cursor: move;
        }

        &.active {
          color: $soft-white;
          background-color: $gray;
        }

        .bs-icon {
          font-size: 18px;
        }
      }
      .jsClose {
        float: right;
        padding: 0;
        width: $height;
        text-align: center;
        &.-moving {
          cursor: move;
        }
      }
    }
  }
</style>
