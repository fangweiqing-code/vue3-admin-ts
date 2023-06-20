<template>
  <el-card>
    <el-form :inline="true">
      <el-form-item label="一级分类">
        <el-select :disabled="scene" v-model="categoryStore.c1Id" @change="handler1">
          <!-- option:label即为显示文字，value属性即为select下拉菜单收集的数据 -->
          <el-option v-for="(c1, index) in categoryStore.c1Arr" :key="c1.id" :label="c1.name" :value="c1.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="二级分类">
        <el-select :disabled="scene" v-model="categoryStore.c2Id" @change="handler2">
          <el-option v-for="(c2, index) in categoryStore.c2Arr" :key="c2.id" :label="c2.name" :value="c2.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="三级分类">
        <el-select :disabled="scene" v-model="categoryStore.c3Id">
          <el-option v-for="(c3, index) in categoryStore.c3Arr" :key="c3.id" :label="c3.name" :value="c3.id"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
// 引入分类相关的仓库
import useCategoryStore from '@/store/modules/category'
let categoryStore = useCategoryStore()

// 分类全局组件挂载完毕，通知仓库发请求获取一级分类的数据
onMounted(() => {
  getC1()
})

// 获取一级分类数据的方法
const getC1 = async () => {
  // 通知分类仓库发请求获取一级分类的数据
  categoryStore.getC1()
}

// 一级下拉菜单选中值发生变化触发（保证一级分类的id有了）
const handler1 = () => {
  // 需要将二级、三级分类的数据清空
  categoryStore.$patch({
    c2Id: '',
    c3Arr: [],
    c3Id: ''
  })
  // 通知仓库获取二级分类的数据
  categoryStore.getC2()
}
// 二级下拉菜单选中值发生变化触发（保证二级分类的id有了）
const handler2 = () => {
  // 需要将三级分类的数据清空
  categoryStore.c3Id = ''
  // 通知仓库获取三级分类的数据
  categoryStore.getC3()
}

// 接收父组件传递过来的scene
defineProps(['scene'])

</script>

<style scoped></style>
