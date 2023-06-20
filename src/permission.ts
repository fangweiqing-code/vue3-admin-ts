// 路由鉴权：鉴权，项目中的路由能不能被访问的权限的设置（某一个路由什么条件下可以访问、什么条件下不可以访问）
import router from "./router";
import setting from "./setting";
import nprogress from 'nprogress'
// 引入进度条样式
import 'nprogress/nprogress.css'
// 去掉加载圈
nprogress.configure({ showSpinner: false })

// 获取用户相关的小仓库内部token数据，去判断用户是否登录成功
import useUserStore from "./store/modules/user";
// 用小仓库之前必须要有大仓库
import pinia from "./store";
let userStore = useUserStore(pinia)

// 全局守卫：项目当中任意路由切换都会触发的钩子
// 全局前置守卫
router.beforeEach(async(to: any, from: any, next: any) => {
  document.title = `${setting.title} - ${to.meta.title}`
  // 访问某一个路由之前的守卫
  nprogress.start()
  // 获取token,判断用户登录了、还是未登录
  let token = userStore.token
  // 获取用户信息
  let username = userStore.username
  // 用户登录了判断
  if (token) {
    // 登录成功，访问login，不能访问，指向首页
    if (to.path === '/login') {
      next('/')
    } else {
      // 登录成功，访问其余六个路由(登录排除)
      // 有用户信息放行
      if (username) {
        next()
      } else {
        // 没有用户信息
        // 在守卫中发请求获取到用户信息再放行
        try {
          // 获取用户信息
          await userStore.userInfo()
          // 放行
          next()
        } catch (error) {
          // token过期，获取不到用户信息了
          // 或者用户手动修改本地存储token
          // 退出登录 -> 用户相关的数据清空
          await userStore.userLogout()
          next({
            path: '/login',
            query: {
              redirect: to.path
            }
          })
        }
      }
    }
  } else {
    // 用户未登录判断
    if (to.path === '/login') {
      next()
    } else {
      next({
        path: '/login',
        query: {
          redirect: to.path
        }
      })
    }
  }
})

// 全局后置守卫
router.afterEach((to: any, from: any, next: any) => {
  nprogress.done()
  
})

// 第一个问题：任意路由切换，实现进度条业务 ---nprogress
// 第二个问题：路由鉴权(路由组件访问权限的设置)
// 全部路由组件：登录|404|任意路由|首页|数据大屏|权限管理(三个子路由)|商品管理(四个子路由)

// 用户未登录：可以访问login,其余六个路由不能访问(指向login)
// 用户登录成功：不可以访问login[指向首页],其余的路由可以访问
