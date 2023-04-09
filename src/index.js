import "./style/main.css";
import { logo } from "./resource";
import * as utils from "./utils/index";
import windowBridge from "./utils/windowBridge";
export default class Chat {
  constructor({
    draggable = true,
    position = "fixed",
    top = 0,
    right = 0,
    boxTop = 0,
    boxRight = 0,
    beforeOpen = () => {},
  } = {}) {
    this.draggable = draggable;
    this.position = position;
    this.top = top;
    this.right = right;
    this.boxTop = boxTop;
    this.boxRight = boxRight;
    this.src = "http://helpcenter.jd.com";
    // event
    this.beforeOpen = beforeOpen;
    // private variable
    this._appOpen = false; // 聊天窗口是否打开
    this._isHoverScale = true; // 是否是hover缩放的
    this._toolOpen = false; // 小工具是否打开
    this._reminderOpen = false; // 异常提醒是否打开
    this._socketLink = 0; // socket 连接情况，初始未连接
    this._questionDom = null; // 常见问题组件
    this.render();
  }
  render() {
    // 创建refs用来储存dom对象
    this.$refs = Object.create(null);
    const renderInner = () => {
      this.$el = document.createElement("div");
      this.$el.className = "chat";
      this.$el.style.position = this.position;
      this.$el.style.right = this.right + "px";
      this.$el.style.top = this.top + "px";
      let iframeWidth = "924px";
      let iframeHeight = "90vh";
      const Questions = `
        <div class="chat-tool__text">
          <span class="text">联系客服在线咨询</span>
        </div>
      `;
      this.$el.innerHTML = `
        <div class="chat-tool">
          <img class="chat-tool__logo" src="${logo}" />
          ${Questions}
        </div>
      <div class="chat-content" style="width: ${iframeWidth}; height: ${iframeHeight}; top: ${this.boxTop}px; right: ${this.boxRight}px;">
        <div class="chat-content__header">
          <img class="chat-content__logo" src="${logo}" />
        </div>
        <div class="jimi-content__border"></div>
      </div>
      `;
      this.$refs.logo = this.$el.querySelector(".chat-tool__logo");
      this.$refs.tool = this.$el.querySelector(".chat-tool");
      this.$refs.frameHeader = this.$el.querySelector(".chat-content__header");
      this.$refs.content = this.$el.querySelector(".chat-content");
      document.body.appendChild(this.$el);
      this._initEvent();
    };
    renderInner();
  }
  _initEvent() {
    // chat图标和聊天窗口可以拖动
    this.draggable &&
      utils.draggable(this.$el, this.$refs.logo) &&
      utils.draggable(this.$el, this.$refs.frameHeader);
    // 点击图标时
    this.$refs.tool.addEventListener("click", (event) => {
      console.log("点击了");
      // 判断是否有打开之前执行的函数
      typeof this.beforeOpen === "function" && this.beforeOpen();
      if (!this._appOpen) {
        this.open(true, () => {
          this.$refs.iframe.contentWindow.postMessage(
            { type: "toolOpen", visible: this._toolOpen },
            "*"
          );
        });
        console.log(this._appOpen);
      } else {
        this.close();
        console.log(this._appOpen);
      }
    });
  }
  // link 是否打开弹窗链接会话
  open(link = true, callback = () => {}) {
    if (typeof this.beforeOpen === "function") {
      // 获取 beforeOpen 函数的形参个数，如果个数等于1，则表示接收 resolve 回调函数，接收1个boolean类型的参数，表示是否继续执行打开
      if (this.beforeOpen.length === 1) {
        this.beforeOpen((canContinue) => {
          if (!canContinue) return;
          this._open(link, callback);
        });
        return;
      } else {
        this.beforeOpen();
      }
    }
    this._open(link, callback);
  }
  _open(link = true, callback = () => {}) {
    if (this._appOpen) return;

    this._appOpen = true;
    this.$refs.content.className += " chat-content--show";

    if (!this.$refs.iframe) {
      this.$refs.iframe = document.createElement("iframe");
      this.$refs.iframe.className = "chat-content__iframe";
      this.$refs.iframe.setAttribute("allowfullscreen", "true");
      this.$refs.iframe.setAttribute("webkitallowfullscreen", "true");
      this.$refs.iframe.setAttribute("mozallowfullscreen", "true");
      this.$refs.iframe.setAttribute("oallowfullscreen", "true");
      this.$refs.iframe.setAttribute("msallowfullscreen", "true");
      // 监听 京灵系统 是否准备好了监听建立连接事件，初始化后则通知京灵建立 socket 连接
      windowBridge.once("jimiMessageInit", () => {
        this.socketOption(callback, link);
      });
      this.$refs.iframe.src = this.src;
      this.$refs.content.insertBefore(
        this.$refs.iframe,
        this.$refs.frameHeader
      );
    } else {
      // 通知京灵建立socket连接
      this.socketOption(callback, link);
    }
  }
  // 需要socket连接的操作，link 是否需要连接
  socketOption(callback, link = true) {
    console.log("开始连接");
  }
  close(offline = true) {
    // 如果对话框没有被打开，则不进行任何操作
    if (!this._appOpen) {
      return;
    }
    this._appOpen = false;
    this.$refs.content.className = this.$refs.content.className.replace(
      " chat-content--show",
      ""
    );
    // 通知京灵断开socket连接
    offline &&
      this._socketLink === 1 &&
      this.$refs.iframe.contentWindow.postMessage(
        { type: "disconnectSocket" },
        "*"
      );
  }
  hide() {
    this.$refs = null;
    this.$el.innerHTML = "";
  }
}
