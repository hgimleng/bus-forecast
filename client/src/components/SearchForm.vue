<template>
    <div class="row justify-content-center">
        <div class="col-auto">
            <div class="input-group mb-3">
                <input
                    type="text"
                    class="form-control"
                    placeholder="Bus no."
                    aria-label="Bus number"
                    aria-describedby="search-button"
                    v-model="busNumber"
                    maxlength="4"
                    style="width: 80px; min-width: 80px;"
                />
                <div class="input-group-append">
                    <button
                    class="btn btn-success"
                    type="button"
                    id="search-button"
                    @click="emitSearch"
                    >
                    Find
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      busNumber: ''
    };
  },
  methods: {
    emitSearch() {
      this.$emit('search', this.busNumber);
    }
  }
};
</script>