<template>
  <div class="menu">
    <span v-for="item in items" class="item" v-bind:class="[{active: item.isActive }, 'item--' + item.name]">
      <i class="bs-icon" v-bind:class="['bs-icon-' + item.icon]"></i>
      <span>{{item.name}}</span>
    </span>

    <span class="jsClose item"><i class="bs-icon bs-icon-close"></i></span>
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
        ] 
      }
    }
  }
</script>

<style lang="scss">
  @import "../sass/_vars.scss";
  // @import "../../assets/fonts/Black-shrimp/style.scss";
  .blackShrimp {
    .menu {
      $height: 28px;

      display: block;
      height: $height;

      color: $gray-dark;
      background-color: $soft-white;
      border-top-left-radius: $border-radius;
      border-top-right-radius: $border-radius;

      overflow: hidden;

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
      }
    }
  }
</style>