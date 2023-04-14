<template>
  <div class="container">
    <SearchForm @search="fetchDirectionsAndStops" />
    <ErrorMessage v-if="errorMessage" :message="errorMessage" />
    <DirectionSelector v-if="step >= 2" :directions="directions" @direction="selectDirection" />
    <BusStopSelector v-if="step >= 3" :selectedDirectionStops="stops[selectedDirection]" @stop="fetchBusArrivalTiming" />
    <BusArrivalTiming v-if="step >= 4" :busArrivalTiming="busArrivalTiming" />
  </div>
</template>

<script>
import axios from 'axios';
import SearchForm from './SearchForm.vue';
import ErrorMessage from './ErrorMessage.vue';
import DirectionSelector from './DirectionSelector.vue';
import BusStopSelector from './BusStopSelector.vue';
import BusArrivalTiming from './BusArrivalTiming.vue';

export default {
  components: {
    SearchForm,
    ErrorMessage,
    DirectionSelector,
    BusStopSelector,
    BusArrivalTiming,
  },
  data() {
    return {
      busNumber: '',
      step: 1,
      directions: [],
      stops: {},
      selectedDirection: '',
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
      this.step = 3;
    },
    async fetchBusArrivalTiming(stopSeq) {
      try {
        const path = `http://localhost:5000/api/bus/${this.busNumber}/direction/${this.selectedDirection}/stop/${stopSeq}`;
        const response = await axios.get(path);
        
        if (response.status === 200) {
          const data = response.data;
          this.busArrivalTiming = data;
          this.step = 4;
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
