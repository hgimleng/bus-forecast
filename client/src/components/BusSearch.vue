<!-- BusSearch.vue -->
<template>
  <div class="container">
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
              @click="fetchDirectionsAndStops"
            >
              Find
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="errorMessage" class="row justify-content-center">
      <div class="col-auto">
        <div class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>
      </div>
    </div>
    <hr v-if="step >= 2" />
    <div v-if="step >= 2" class="row justify-content-center">
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
            @click="selectDirection(index)"
          >
            {{ direction }}
          </button>
        </div>
      </div>
    </div>
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

export default {
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
    async fetchDirectionsAndStops() {
      try {
        const path = `http://localhost:5000/api/bus/${this.busNumber}`;
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
        this.errorMessage = `Bus '${this.busNumber}' not found`;
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
          // this.busArrivalTiming = data.arrivalTime;
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
