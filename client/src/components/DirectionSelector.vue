<template>
    <hr />
    <div class="row justify-content-center">
      <div class="col text-center">
        <h5>Select Direction:</h5>
        <div class="btn-group" role="group">
          <button
            v-for="(direction, index) in directions"
            :key="index"
            class="btn"
            :class="[
              'btn-primary',
              selectedDirection === direction ? 'active' : '',
            ]"
            @click="emitDirection(index)"
          >
            {{ direction }}
          </button>
        </div>
      </div>
    </div>
</template>

<script>
export default {
  props: {
    directions: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
        selectedDirection: ''
    };
  },
  methods: {
    emitDirection(index) {
        this.selectedDirection = this.directions[index];
        this.$emit('direction', index);
    }
  }
};
</script>