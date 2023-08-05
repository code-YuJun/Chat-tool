import "./style/main.css";
import logo from "./assets/logo.svg";
// import * as utils from "./utils/index";
import windowBridge from "./utils/windowBridge";
export default class Chat {
  constructor({
    draggable = true,
    position = "fixed",
    bottom = 30,
    right = 10
  } = {}) {
    // public variable
    this.draggable = draggable;
    this.position = position;
    this.bottom = bottom;
    this.right = right;
    this.src = "http://helpcenter.jd.com";
    // private variable
    this._appOpen = false; // 聊天窗口是否打开
    this._socketLink = 0; // socket 连接情况，初始未连接
    this.render();
  }
  render() {
    // 开始监听
    windowBridge.startListener()
    // 监听窗口关闭事件
    windowBridge.on('close', () => {
      this.close()
    })
    // 监听 socket 连接情况
    windowBridge.on('linkStatusChange', data => {
      this._socketLink = data
    })

    this.$refs = Object.create(null);
    const renderInner = () => {
      this.$el = document.createElement("div");
      this.$el.className = "chat";
      this.$el.style.position = this.position;
      this.$el.style.right = this.right + "px";
      this.$el.style.bottom = this.bottom + "px";
      let iframeWidth = "300px";
      let iframeHeight = "500px";
      this.$el.innerHTML = `
        <div class="chat-bar">
          <img class="chat-bar__logo" src="${logo}" />
          <span class="chat-bar__text">在线聊天</span>
        </div>
      <div class="chat-content" style="width: ${iframeWidth}; height: ${iframeHeight};">
      </div>
      `;
      this.$refs.bar = this.$el.querySelector(".chat-bar");
      this.$refs.content = this.$el.querySelector(".chat-content");
      document.body.appendChild(this.$el);
      // 开始监听唤起条的一些事件
      this._initEvent();
    };
    renderInner();
  }
  _initEvent() {
    // chat图标和聊天窗口可以拖动
    // this.draggable && utils.draggable(this.$el, this.$refs.frameHeader);
    // 点击图标时
    this.$refs.bar.addEventListener("click", () => {
      if (!this._appOpen) {
        this.open(true, () => {
          // 给聊天窗口发送消息 toolOpen
          this.$refs.iframe.contentWindow.postMessage(
            { type: "toolOpen", visible: this._toolOpen },
            "*"
          );
        });
      } else {
        this.close();
      }
    });
  }
  open(link = true, callback = () => { }) {
    if (this._appOpen) return;
    this._appOpen = true;
    this.$refs.bar.className += " chat-bar--hidden"
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
      this.$refs.content.appendChild(this.$refs.iframe)
    } else {
      // 通知京灵建立socket连接
      this.socketOption(callback, link);
    }
  }
  close(offline = true) {
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
  // 需要socket连接的操作，link 是否需要连接
  socketOption(callback, link = true) {
    if (link && this._socketLink === 0) {
      windowBridge.once('linkStatusChange', data => {
        if (data.status === 1) {
          // 延迟500，避免其他自动加载的消息返回比问题的返回早
          setTimeout(() => {
            callback()
          }, 500)
        }
      })
      this.$refs.iframe.contentWindow.postMessage({ type: 'linkSocket' }, '*')
    } else {
      callback()
    }
  }
}

new Chat()