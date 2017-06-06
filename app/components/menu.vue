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
    },
    methods: {
      move : function(divid, xpos, ypos) {
        divid.style.left = xpos + 'px';
        divid.style.top  = ypos + 'px';
      },

      startMoving : function(divid, container, evt) {
        evt = evt || window.event;
        var posX    = evt.clientX,
            posY    = evt.clientY,
            divTop  = divid.style.top,
            divLeft = divid.style.left,
            eWi = parseInt(divid.style.width),
            eHe = parseInt(divid.style.height),
            cWi = parseInt(document.getElementById(container).style.width),
            cHe = parseInt(document.getElementById(container).style.height);

        document.getElementById(container).style.cursor = 'move';

        divTop = divTop.replace('px', '');
        divLeft = divLeft.replace('px', '');

        var diffX = posX - divLeft,
            diffY = posY - divTop;

        document.onmousemove = function(evt) {
          evt = evt || window.event;
          var posX = evt.clientX,
              posY = evt.clientY,
              aX = posX - diffX,
              aY = posY - diffY;
          if (aX < 0) aX = 0;
          if (aY < 0) aY = 0;
          if (aX + eWi > cWi) aX = cWi - eWi;
          if (aY + eHe > cHe) aY = cHe -eHe;
          mydragg.move(divid, aX, aY);
        }
      },

      stopMoving : function(container) {
        var a = document.createElement('script');
        document.getElementById(container).style.cursor = 'default';
        document.onmousemove = function() {}
      },
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