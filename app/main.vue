<template>
	<div id="black-shrimp" class="black-shrimp">
		<MenuComponent></MenuComponent>
		<ColorComponent></ColorComponent>
	</div>
</template>

<script>
import MenuComponent  from './components/menu.vue'
import ColorComponent from './components/color.vue'

export default {
	components: {
		MenuComponent,
		ColorComponent
	},
	data() {
	}
}
</script>