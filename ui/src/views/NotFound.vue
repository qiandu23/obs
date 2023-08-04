<template>
  <el-empty :description="description">
    <el-button type="primary" @click="goHomeIndex">Back Home</el-button>
  </el-empty>
</template>

<script>
export default {
  name: "NotFound",
  data(){
    return {
      description:'Not Found'
    }
  },
  methods:{
    goHomeIndex(){
      this.$router.replace(`/`)
    }
  }
}
</script>

<style scoped>

</style>
