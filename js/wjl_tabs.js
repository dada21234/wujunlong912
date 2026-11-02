/* ============================================================
 * 文件名称：js/wjl_tabs.js —— 可复用选项卡组件
 * 作者：吴君龙
 * 建立时间：2026-11-02
 * 使用模型：GLM-5.3-Flash
 * 功能简介：为页面中所有带 data-wjl-tabs 属性的选项卡组绑定
 *           切换逻辑，核心思路为"先清除所有选项卡的选中状态，
 *           再设置当前元素的选中状态"；页面新增选项卡组时只需
 *           按约定写 HTML 结构，无需修改本文件（可复用）
 * ============================================================ */
(function () {
  "use strict";

  /**
   * 功能名称：wjl_clearActive —— 清除一组元素的全部选中状态
   * 功能简介：遍历传入的节点集合，逐个移除 wjl_active 类，
   *           用于实现"清除所有选项卡的选中状态"
   * 作者：吴君龙   建立时间：2026-11-02   使用模型：GLM-5.3-Flash
   * @param {NodeList} wjl_nodes 待清除选中状态的元素集合
   */
  function wjl_clearActive(wjl_nodes) {
    wjl_nodes.forEach(function (wjl_node) {
      wjl_node.classList.remove("wjl_active");
    });
  }

  /**
   * 功能名称：wjl_initTabs —— 初始化一个选项卡组（可复用核心函数）
   * 功能简介：在容器 wjl_root 内查找全部按钮 [data-wjl-tab] 与
   *           面板 [data-wjl-panel]，为每个按钮绑定点击事件监听；
   *           点击时先清除所有按钮与面板的选中状态，再设置当前
   *           元素（this）和下标对应的面板为选中状态
   * 作者：吴君龙   建立时间：2026-11-02   使用模型：GLM-5.3-Flash
   * @param {Element} wjl_root 选项卡组容器元素
   */
  function wjl_initTabs(wjl_root) {
    var wjl_btns = wjl_root.querySelectorAll("[data-wjl-tab]");
    var wjl_panels = wjl_root.querySelectorAll("[data-wjl-panel]");

    wjl_btns.forEach(function (wjl_btn, wjl_i) {
      // 事件监听：点击选项卡按钮时触发切换
      wjl_btn.addEventListener("click", function () {
        /* 第一步：清除所有选项卡（按钮 + 面板）的选中状态 */
        wjl_clearActive(wjl_btns);
        wjl_clearActive(wjl_panels);

        /* 第二步：设置当前元素的选中状态 */
        this.classList.add("wjl_active");
        wjl_panels[wjl_i].classList.add("wjl_active");
      });
    });
  }

  /**
   * 功能名称：DOMContentLoaded 初始化 —— 批量挂载所有选项卡组
   * 功能简介：DOM 加载完毕后，查找页面中全部 [data-wjl-tabs]
   *           容器并逐个调用 wjl_initTabs 初始化，保证组件可复用
   * 作者：吴君龙   建立时间：2026-11-02   使用模型：GLM-5.3-Flash
   */
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-wjl-tabs]").forEach(function (wjl_group) {
      wjl_initTabs(wjl_group);
    });
  });
})();
