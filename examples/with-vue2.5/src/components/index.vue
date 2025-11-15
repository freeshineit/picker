<template>
  <div style="padding-top: 100px">
    <button id="picker">picker</button>
  </div>
</template>

<script>
import '@skax/picker/dist/style/css.css';
import Picker from '@skax/picker';

let picker;

export default {
  name: 'Picker',
  data() {
    return {};
  },
  mounted: () => {
    if (picker) {
      picker.destroy();
      picker = null;
    }
    picker = new Picker(() => document.getElementById('picker'), {
      content: '<p>123</p>',
      placement: 'bottom',
      trigger: 'click',
      onOpenChange: open => {
        console.log('open:', open);
      },
    });

    console.log(picker);
  },
  methods: {},
};
</script>
<style lang="css">
.epicker-body {
  padding: 20px;
  background-color: #fff;
}
</style>
