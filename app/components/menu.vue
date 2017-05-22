<template>
  <div class="bs-menu">
    <span v-for="item in items" class="bs-menu__item" v-bind:class="[{ active: item.isActive }, 'bs-menu__item--' + item.name]">
      <i class="bs-icon" v-bind:class="['bs-icon-' + item.icon]"></i>
      <span class="bs-menu__name">{{item.name}}</span>
    </span>

    <span class="bs-close"><i class="bs-icon bs-icon-close"></i></span>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [
        {name: 'color', icon: 'eyeDropper', isActive: true},
        {name: 'ruler', icon: 'ruler', isActive: false},
        {name: 'info' , icon: 'binoculars', isActive: false}
      ] 
    }
  }
}
</script>