<template>
  <el-row>
    <el-col :offset="1" :span="22">
      <el-menu :default-active="$store.getters.getActiveIndex" :router="true" mode="horizontal">
        <el-menu-item index="/storage">Storage</el-menu-item>
        <el-menu-item index="/bucket">Bucket</el-menu-item>
      </el-menu>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: 'ui-nav',
  mounted() {
    this.$store.dispatch('getAdminRole')
  }
}
</script>

<style scoped>

</style>
