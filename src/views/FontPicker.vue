<template>
  <div class="font-picker-container">
    <label for="font-select">Choose your font:</label>
    <select 
      id="font-select" 
      v-model="selectedFont" 
      @change="updateFont"
      class="font-select"
    >
      <option 
        v-for="font in availableFonts" 
        :key="font.name" 
        :value="font.name"
        :style="{ fontFamily: font.name }"
      >
        {{ font.name }}
      </option>
    </select>
  </div>
</template>

<script>
import { loadFonts } from '../utils/fontLoader';

export default {
  name: 'FontPicker',
  data() {
    return {
      selectedFont: 'Arial, sans-serif',
      availableFonts: [
        { name: 'Arial, sans-serif' },
        { name: 'Times New Roman, serif' },
        { name: 'Courier New, monospace' },
        { name: 'Georgia, serif' },
        { name: 'Verdana, sans-serif' },
        { name: 'Poppins, sans-serif' },
        { name: 'Roboto, sans-serif' },
        { name: 'Open Sans, sans-serif' },
        { name: 'Lato, sans-serif' },
        { name: 'Montserrat, sans-serif' }
      ]
    };
  },
  methods: {
    updateFont() {
      this.$emit('font-selected', this.selectedFont);
    }
  },
  mounted() {
    // Load Google Fonts dynamically
    loadFonts(this.availableFonts.map(font => font.name));
  }
};
</script>

<style scoped>
.font-picker-container {
  margin: 20px 0;
}

.font-select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 16px;
  min-width: 200px;
}

/* Apply the selected font to the dropdown options */
option {
  font-family: inherit;
}
</style>