<template>
  <div>
    <!-- 三级分类全局组件 -->
    <Category :scene="scene" />
    <el-card style="margin: 10px 0">
      <div v-show="scene === 0">
        <el-button
          type="primary"
          size="default"
          icon="Plus"
          :disabled="!categoryStore.c3Id"
          @click="addAttr"
          >添加平台属性</el-button
        >

        <el-table style="margin: 10px 0" border :data="attrArr">
          <!-- table-column:默认展示数据用div -->
          <el-table-column
            label="序号"
            width="80px"
            align="center"
            type="index"
          ></el-table-column>
          <el-table-column
            label="属性名称"
            width="120px"
            prop="attrName"
          ></el-table-column>
          <el-table-column label="属性值名称">
            <template #="{ row }">
              <el-tag
                v-for="(item, index) in row.attrValueList"
                :key="item.id"
                >{{ item.valueName }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column label="品牌操作" width="120px">
            <template #="{ row }">
              <!-- 修改已有属性的按钮 -->
              <el-button
                type="primary"
                size="small"
                icon="Edit"
                @click="updateAttr(row)"
              ></el-button>
              <!-- 删除确认框 -->
              <el-popconfirm :title="`你确定删除${row.attrName}?`" width="200px" @confirm="deleteAttr(row.id)">
                <template #reference>
                  <el-button
                    type="primary"
                    size="small"
                    icon="Delete"
                  ></el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-show="scene === 1">
        <!-- 展示添加属性与修改属性的结构 -->
        <el-form :inline="true">
          <el-form-item label="属性名称">
            <el-input
              placeholder="请你输入属性的名称"
              v-model="attrParams.attrName"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-button
          @click="addAttrValue"
          :disabled="attrParams.attrName ? false : true"
          type="primary"
          size="default"
          icon="Plus"
          >添加属性值</el-button
        >
        <el-button type="primary" size="default" @click="cancel"
          >取消</el-button
        >
        <el-table
          border
          style="margin: 10px 0"
          :data="attrParams.attrValueList"
        >
          <el-table-column
            label="序号"
            width="80px"
            type="index"
            align="center"
          ></el-table-column>
          <el-table-column label="属性值名称">
            <template #="{ row, $index }">
              <el-input
                :ref="(vc: any) => inputArr[$index] = vc"
                size="small"
                v-if="row.flag"
                @blur="toLook(row, $index)"
                placeholder="请你输入属性值名称"
                v-model="row.valueName"
              ></el-input>
              <div v-else @click="toEdit(row, $index)">{{ row.valueName }}</div>
            </template>
          </el-table-column>
          <el-table-column label="属性值操作">
            <template #="{ row, $index }">
              <el-button
                type="primary"
                size="small"
                icon="Delete"
                @click="attrParams.attrValueList.splice($index, 1)"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button
          type="primary"
          size="default"
          @click="save"
          :disabled="!attrParams.attrValueList.length"
          >保存</el-button
        >
        <el-button type="primary" size="default" @click="cancel"
          >取消</el-button
        >
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, reactive, nextTick, onBeforeUnmount } from 'vue'
// 引入获取已有属性与属性值接口
import { reqAttr, reqAddOrUpdateAttr, reqRemoveAttr } from '@/api/product/attr'
import type {
  AttrResponseData,
  AttrList,
  Attr,
  AttrValue,
} from '@/api/product/attr/type'
// 获取分类的仓库
import useCategoryStore from '@/store/modules/category'
import { ElMessage } from 'element-plus'
let categoryStore = useCategoryStore()
// 存储已有的属性与属性值
let attrArr = ref<AttrList>([])
// 定义card组件内容切换变量
let scene = ref<number>(0) // scene=0,显示table,scene=1,展示添加与修改属性结构
// 收集新增属性的数据
let attrParams = reactive<Attr>({
  attrName: '', // 新增属性的名字
  attrValueList: [], // 新增属性的数组
  categoryId: '', // 三级分类的id
  categoryLevel: 3, // 代表的是三级分类
})
// 准备一个数组：将来存储对应的组件实例el-input
let inputArr = ref<any>([])

// 监听仓库三级分类ID变化
watch(
  () => categoryStore.c3Id,
  () => {
    // 清空上一次查询的属性与属性值
    attrArr.value = []
    // 保证三级分类得有才发请求
    if (!categoryStore.c3Id) return
    getAttr()
  }
)
// 获取已有的属性和属性值的方法
const getAttr = async () => {
  // 获取分类的ID
  const { c1Id, c2Id, c3Id } = categoryStore
  let result: AttrResponseData = await reqAttr(c1Id, c2Id, c3Id)
  if (result.code === 200) {
    attrArr.value = result.data
  }
}

// 添加属性按钮的回调
const addAttr = () => {
  // 每一次点击的时候，先清空数据，再收集数据
  Object.assign(attrParams, {
    attrName: '', // 新增属性的名字
    attrValueList: [], // 新增属性的数组
    categoryId: categoryStore.c3Id, // 三级分类的id
    categoryLevel: 3, // 代表的是三级分类
  })
  // 切换为添加与修改属性的结构
  scene.value = 1
  // 点击这个按钮的时候，收集新增属性的三级分类ID
  // attrParams.categoryId = categoryStore.c3Id
}
// table表格中修改已有属性按钮的回调
const updateAttr = (row: Attr) => {
  // 切换为添加与修改属性的结构
  scene.value = 1
  // 将已有的属性对象赋值给attrParams对象即可
  // ES6 -> Object.assign进行对象的合并
  Object.assign(attrParams, JSON.parse(JSON.stringify(row)))
}

// 取消按钮的回调
const cancel = () => {
  scene.value = 0
}

// 添加属性值按钮的回调
const addAttrValue = () => {
  // 点击添加属性值按钮的时候，向数组添加一个属性值对象
  attrParams.attrValueList.push({
    valueName: '',
    flag: true, // 控制每一个属性值的编辑模式与切换模式的切换
  })
  // 获取最后的el-input组件，聚焦
  nextTick(() => {
    inputArr.value[attrParams.attrValueList.length - 1].focus()
  })
}

// 保存按钮的回调
const save = async () => {
  // 收集参数 发请求
  let result: any = await reqAddOrUpdateAttr(attrParams)
  // 添加属性|修改已有属性 成功
  if (result.code === 200) {
    // 切换场景
    scene.value = 0
    // 提示信息
    ElMessage({
      type: 'success',
      message: attrParams.id ? '修改成功' : '添加成功',
    })
    // 获取全部已有的属性与属性值
    getAttr()
  } else {
    // 提示信息
    ElMessage({
      type: 'error',
      message: attrParams.id ? '修改失败' : '添加失败',
    })
  }
}

// 属性值表单元素失去焦点的方法
const toLook = (row: AttrValue, $index: number) => {
  // 非法情况判断1
  if (row.valueName.trim() === '') {
    // 删除调用对应属性值为空的元素
    attrParams.attrValueList.splice($index, 1)
    // 提示信息
    ElMessage({
      type: 'error',
      message: '属性值不能为空',
    })
    return
  }
  // 非法情况判断2
  let repeat = attrParams.attrValueList.find((item) => {
    // 切记把当前失去焦点属性值对象从当前数组扣除判断
    if (item !== row) {
      return item.valueName === row.valueName
    }
  })
  if (repeat) {
    // 将重复的属性值从数组中去除
    attrParams.attrValueList.splice($index, 1)
    // 提示信息
    ElMessage({
      type: 'error',
      message: '属性值不能为空',
    })
    return
  }
  // 相应的属性值对象flag:变为false,展示div
  row.flag = false
}
// 属性值div点击事件
const toEdit = (row: AttrValue, $index: number) => {
  // 相应的属性值对象flag:变为true,展示input
  row.flag = true
  // nextTick:响应式数据发生变化，获取更新后的dom(组件实例)
  nextTick(() => {
    inputArr.value[$index].focus()
  })
}

// 删除某一个已有属性的回调
const deleteAttr = async (attrId: number) => {
  // 发相应的删除已有的属性的请求
  let result: any = await reqRemoveAttr(attrId)
  // 删除成功
  if (result.code === 200) {
    ElMessage({
      type: 'success',
      message: '删除成功',
    })
    // 获取一次已有的属性与属性值
    getAttr()
  } else {
    ElMessage({
      type: 'error',
      message: '删除失败',
    })
  }
}

// 路由组件销毁的时候，把仓库分类相关的数据清空
onBeforeUnmount(() => {
  // 清空仓库的数据
  categoryStore.$reset()
})

</script>

<style scoped></style>
