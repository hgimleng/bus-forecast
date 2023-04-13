<template>
    <div class="row justify-content-center">
      <div class="col-auto">
        <div class="alert alert-danger" role="alert">
          {{ message }}
        </div>
      </div>
    </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      required: true,
    },
  },
};
</script>