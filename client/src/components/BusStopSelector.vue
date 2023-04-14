<template>
    <hr />
    <div class="row justify-content-center">
      <div class="col text-center">
        <h5>Select Bus Stop:</h5>
        <div class="list-group" style="max-height: 300px; overflow-y: auto; width: 300px; margin: 0 auto;">
          <button
            v-for="stop in selectedDirectionStops"
            :key="stop.stopSequence"
            class="list-group-item list-group-item-action text-center"
            @click="emitStop(stop.stopSequence)"
          >
            {{ stop.name }}
          </button>
        </div>
      </div>
    </div>
</template>

<script>
export default {
  props: {
    selectedDirectionStops: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
        selectedStop: ''
    };
  },
  methods: {
    emitStop(stopSequence) {
        this.selectedStop = stopSequence;
        this.$emit('stop', stopSequence);
    }
  }
}
</script>