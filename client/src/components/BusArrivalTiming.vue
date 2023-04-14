<template>
    <hr />
    <div class="row justify-content-center">
        <div class="col-auto">
            <h5>Bus Arrival Timing:</h5>
            <li v-for="timing in busArrivalTiming">
                {{ timing }}
            </li>
        </div>
    </div>
</template>

<script>
export default {
  props: {
    busArrivalTiming: {
      type: Array,
      required: true,
    },
  },
}
</script>