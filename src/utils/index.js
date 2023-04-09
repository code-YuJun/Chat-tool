/**
 * 使元素可拖动
 * @param {object} $element 需要拖动的元素
 * @param {object} [$handle] 拖动把手元素，可选
 * @returns {function} 清除拖动事件的函数
 */
export const draggable = function ($element, $handle) {
  $handle = $handle || $element; // 是否需要把手元素，不需要则把手设置为移动元素
  const dragEvent = (e) => {
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      window.event.returnValue = false;
    }
    // 鼠标的位置
    var disX = e.clientX - $element.offsetLeft;
    var disY = e.clientY - $element.offsetTop;
    // 鼠标移动拖动$element移动
    document.onmousemove = function (ev) {
      var oEvent = ev || event;
      var deltaX = Math.abs(oEvent.clientX - e.clientX);
      var deltaY = Math.abs(oEvent.clientY - e.clientY);

      if (deltaX < 2 && deltaY < 2) return;

      var left = oEvent.clientX - disX; // 获取拖动是元素的位置
      var top = oEvent.clientY - disY;

      if (left <= 0) {
        // 防止越过左边缘
        left = 0;
      } else if (
        left >=
        document.documentElement.clientWidth - $element.offsetWidth
      ) {
        // 防止越过右边缘
        left = document.documentElement.clientWidth - $element.offsetWidth;
      }
      if (top <= 0) {
        top = 0;
      } else if (
        top >=
        document.documentElement.clientHeight - $element.offsetHeight
      ) {
        top = document.documentElement.clientHeight - $element.offsetHeight;
      }
      $element.style.right =
        document.documentElement.clientWidth -
        left -
        $element.offsetWidth +
        "px";
      $element.style.top = top + "px";
    };
    // 鼠标松开还原原来的事件
    document.onmouseup = function () {
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };
  $handle.addEventListener("mousedown", dragEvent, false);
  // 提供函数供清除拖动事件
  return function () {
    $handle.removeEventListener("mousedown", dragEvent, false);
  };
};
