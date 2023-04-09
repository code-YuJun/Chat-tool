const eventQueueMap = {}; // 监听事件回调函数队列

/**
 * 监听 message 某个事件类型
 * @param {String} eventName 监听的事件名
 * @param {Function} handler 绑定函数
 */
function on(eventName, handler) {
  if (!eventQueueMap[eventName]) {
    eventQueueMap[eventName] = [];
  }

  if (eventQueueMap[eventName].indexOf(handler) === -1) {
    eventQueueMap[eventName].push(handler);
  }
}

function once(eventName, handler) {
  if (!eventQueueMap[eventName]) {
    eventQueueMap[eventName] = [];
  }

  if (eventQueueMap[eventName].indexOf(handler) === -1) {
    const onceHandler = (options) => {
      handler(options);
      off(eventName, onceHandler);
    };
    eventQueueMap[eventName].push(onceHandler);
  }
}

/**
 * 移除事件监听，如果组件有删除的情况，则在 componentWillUnmount 生命周期中应该将事件进行移除
 * @param {String} eventName 事件名
 * @param {Function} handler 绑定函数
 */
function off(eventName, handler) {
  if (eventQueueMap[eventName]) {
    let index = eventQueueMap[eventName].indexOf(handler);
    index > -1 && eventQueueMap[eventName].splice(index, 1);
  }
}

/**
 * 触发某个事件
 * @param {String} eventName 触发的事件名
 * @param {Object} data 参数
 */
const trigger = (eventName, options) => {
  if (eventQueueMap[eventName]) {
    eventQueueMap[eventName].forEach((fn) => {
      fn(options);
    });
  }
};

/**
 * 开始监听 message
 */
const startListener = () => {
  window.addEventListener("message", (event) => {
    /**
     * 监听的事件：
     *  * linkStatusChange 京灵窗口socket连接情况，入参 { status: Number }，0 - 未连接，1 - 已连接
     *  * close 关闭京灵窗口，并断开连接，无入参
     *  * jimiLogoShow 切换logo展示，针对iframe里面页面的一些全屏操作，入参 { isShow: Boolean }
     */
    let origin = event.origin || event.originalEvent.origin;
    if (
      origin === "https://magicmirro.jd.com" ||
      origin === "http://magicmirro.jd.com"
    ) {
      trigger(event.data.type, event.data);
    }
  });
};

export default {
  startListener,
  on,
  off,
  once,
};
