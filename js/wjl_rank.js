/* ============================================================
 * 文件名称：js/wjl_rank.js —— 影视热播榜选项卡逻辑
 * 作者：吴君龙
 * 建立时间：2026-11-02
 * 使用模型：GLM-5.3-Flash
 * 功能简介：一比一还原课堂测试 5 的热播榜数据与交互——
 *           为四个选项卡绑定点击事件监听，点击时先清除所有
 *           选项卡的选中状态再设置当前元素选中状态，并把
 *           对应榜单渲染成左右两列（第 1~3 名红橙色序号）
 * ============================================================ */
(function () {
  "use strict";

  /**
   * 功能名称：wjl_data —— 四个选项卡的榜单数据
   * 功能简介：数组顺序与页面选项卡顺序一一对应（每日/每周/每月/全部），
   *           每项为该榜单前 10 名的影片名称
   * 作者：吴君龙   建立时间：2026-11-02   使用模型：GLM-5.3-Flash
   */
  var wjl_data = [
    { // 每日
      wjl_items: ["最美的时光", "咱们结婚吧", "渗透", "继承者们", "烽火佳人",
                  "极品女士第2季", "爱的蜜方", "狼烟（2013）", "钱多多炼爱记", "苍狼"]
    },
    { // 每周
      wjl_items: ["咱们结婚吧", "继承者们", "最美的时光", "爱闪亮", "渗透",
                  "狼烟（2013）", "三十岁，你好", "钱多多炼爱记", "特种兵之火凤凰", "极品女士第2季"]
    },
    { // 每月
      wjl_items: ["特种兵之火凤凰", "咱们结婚吧", "继承者们", "金玉满堂", "王的女人",
                  "爱闪亮", "爱情面前谁怕谁", "英雄联盟", "小爸爸", "我们这拨人"]
    },
    { // 全部
      wjl_items: ["永不磨灭的番号", "特种兵之火凤凰", "新还珠格格", "咱们结婚吧", "小爸爸",
                  "心术", "乡村爱情5", "天天有喜", "一不小心爱上你", "夏日甜心"]
    }
  ];

  /**
   * 功能名称：wjl_renderList —— 渲染当前榜单
   * 功能简介：把 10 条数据拆成左右两列各 5 条，用 createElement 生成
   *           li（序号徽章 + 影片名），第 1~3 名徽章加 wjl_top 类显示
   *           红橙色，其余为灰色；每次渲染前先清空容器
   * 作者：吴君龙   建立时间：2026-11-02   使用模型：GLM-5.3-Flash
   * @param {Element} wjl_box   榜单容器 #wjl_rank_cols
   * @param {string[]} wjl_items 当前榜单的 10 个影片名
   */
  function wjl_renderList(wjl_box, wjl_items) {
    wjl_box.innerHTML = ""; // 清空旧榜单

    // 左右两列：前 5 名进左列，后 5 名进右列
    for (var wjl_col = 0; wjl_col < 2; wjl_col++) {
      var wjl_ul = document.createElement("ul");
      wjl_ul.className = "wjl_rank_col";

      for (var wjl_j = 0; wjl_j < 5; wjl_j++) {
        var wjl_index = wjl_col * 5 + wjl_j; // 该影片在榜单中的名次下标

        var wjl_li = document.createElement("li");
        wjl_li.textContent = wjl_items[wjl_index];

        var wjl_num = document.createElement("span");
        wjl_num.className = "wjl_num" + (wjl_index < 3 ? " wjl_top" : "");
        wjl_num.textContent = wjl_index + 1;

        wjl_li.insertBefore(wjl_num, wjl_li.firstChild);
        wjl_ul.appendChild(wjl_li);
      }
      wjl_box.appendChild(wjl_ul);
    }
  }

  /**
   * 功能名称：wjl_init —— 初始化选项卡并绑定点击事件监听
   * 功能简介：为每个选项卡按钮绑定点击事件；点击时先清除所有
   *           选项卡的选中状态（移除 wjl_active），再设置当前
   *           元素（this）为选中状态，并渲染对应下标的榜单
   * 作者：吴君龙   建立时间：2026-11-02   使用模型：GLM-5.3-Flash
   */
  function wjl_init() {
    var wjl_btns = document.querySelectorAll("#wjl_tab_bar .wjl_tab_btn");
    var wjl_box = document.getElementById("wjl_rank_cols");

    wjl_btns.forEach(function (wjl_btn, wjl_i) {
      // 事件监听：点击选项卡切换榜单
      wjl_btn.addEventListener("click", function () {
        /* 第一步：清除所有选项卡的选中状态 */
        wjl_btns.forEach(function (wjl_b) {
          wjl_b.classList.remove("wjl_active");
        });

        /* 第二步：设置当前元素的选中状态 */
        this.classList.add("wjl_active");

        /* 渲染当前选项卡对应的榜单 */
        wjl_renderList(wjl_box, wjl_data[wjl_i].wjl_items);
      });
    });

    // 页面加载后先渲染默认选中的"每日"榜单
    wjl_renderList(wjl_box, wjl_data[0].wjl_items);
  }

  /**
   * 功能名称：DOMContentLoaded 初始化入口
   * 功能简介：DOM 加载完毕后调用 wjl_init，完成事件绑定与默认榜单渲染
   * 作者：吴君龙   建立时间：2026-11-02   使用模型：GLM-5.3-Flash
   */
  document.addEventListener("DOMContentLoaded", wjl_init);
})();
