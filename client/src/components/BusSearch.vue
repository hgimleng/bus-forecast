<template>
  <div class="container">
    <SearchForm @search="fetchDirectionsAndStops" />
    <ErrorMessage v-if="errorMessage" :message="errorMessage" />
    <DirectionSelector v-if="step >= 2" :directions="directions" @direction="selectDirection" />
    <hr v-if="step >= 3" />
    <div v-if="step >= 3" class="row justify-content-center">
      <div class="col text-center">
        <h5>Select Bus Stop:</h5>
        <div class="list-group" style="max-height: 300px; overflow-y: auto; width: 300px; margin: 0 auto;">
          <button
            v-for="stop in selectedDirectionStops"
            :key="stop.id"
            class="list-group-item list-group-item-action text-center"
            @click="selectStop(stop)"
          >
            {{ stop.name }}
          </button>
        </div>
      </div>
    </div>
    <hr v-if="step >= 4" />
    <div v-if="step === 4" class="row justify-content-center">
      <div class="col-auto">
        <h5>Bus Arrival Timing:</h5>
        <li v-for="timing in busArrivalTiming">
          {{ timing }}
        </li>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import SearchForm from './SearchForm.vue';
import ErrorMessage from './ErrorMessage.vue';
import DirectionSelector from './DirectionSelector.vue';

export default {
  components: {
    SearchForm,
    ErrorMessage,
    DirectionSelector,
  },
  data() {
    return {
      busNumber: '',
      step: 1,
      directions: [],
      stops: {},
      selectedDirection: '',
      selectedDirectionStops: [],
      busArrivalTiming: '',
      errorMessage: '',
    };
  },
  methods: {
    async fetchDirectionsAndStops(busNumber) {
      this.busNumber = busNumber;
      try {
        const path = `http://localhost:5000/api/bus/${busNumber}`;
        const response = await axios.get(path);
        
        if (response.status === 200) {
          const data = response.data;
          this.directions = data.directions;
          this.stops = data.stops;
          this.step = 2;
          this.errorMessage = ''; // Clear the error message
        } else {
          throw new Error('Not found');
        }
      } catch (error) {
        console.error('Error fetching directions and stops:', error);
        this.errorMessage = `Bus '${busNumber}' not found`;
        this.step = 1;
      }
    },
    selectDirection(direction) {
      this.selectedDirection = direction;
      this.selectedDirectionStops = this.stops[direction];
      this.step = 3;
    },
    selectStop(stop) {
      this.fetchBusArrivalTiming(stop);
      this.step = 4;
    },
    async fetchBusArrivalTiming(stop) {
      try {
        const path = `http://localhost:5000/api/bus/${this.busNumber}/direction/${this.selectedDirection}/stop/${stop.id}`;
        const response = await axios.get(path);
        
        if (response.status === 200) {
          const data = response.data;
          this.busArrivalTiming = data;
        } else {
          throw new Error('Not found');
        }
      } catch (error) {
        console.error('Error fetching bus arrival timing:', error);
      }
    },
  },
};
</script>
