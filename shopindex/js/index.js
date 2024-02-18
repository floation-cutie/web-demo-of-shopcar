//思路：从单数据的变化到界面数据的逻辑  最后添加事件

/**
 * 进行原始数据的包装，而不更改原始数据
 * 先考虑单件商品
 */
// function UIGoods(g) {
//   this.data = g;
//   this.choose = 0;
//   //this.totalPrice = 0; 避免数据的冗余 属性？还是 函数？
// }
// /**
//  * 为对象的原型添加方法
//  */
// UIGoods.prototype.getTotalPrice = function () {
//   return this.data.price * this.choose;
// }

// UIGoods.prototype.isChoose = function () {
//   return this.choose > 0;
// }

// UIGoods.prototype.increase = function () {
//   this.choose++;
// }

// UIGoods.prototype.decrease = function () {
//   if (this.choose > 0)
//     this.choose--;
// }
// 写成类的形式
// class UIGoods{
//   constructor(g){
//     this.data = g;
//     this.choose = 3;
//   }
// }

class UIGoods {
  constructor(g) {
    this.data = g;
    this.choose = 0;
  }
  getTotalPrice() {
    return this.data.price * this.choose;
  }

  isChoose() {
    return this.choose > 0;
  }

  increase() {
    this.choose++;
  }

  decrease() {
    if (this.choose > 0)
      this.choose--;
  }
}

class UIData {
  constructor() {
    let uiGoods = [];
    for (let i = 0; i < goods.length; i++) {
      let uig = new UIGoods(goods[i]);
      uiGoods.push(uig);
    }
    this.uiGoods = uiGoods;
    this.deliveryThreshold = 30;
    this.deliveryPrice = 5;
  }
  getTotalPrice() {
    let sum = 0;
    for (let i = 0; i < this.uiGoods.length; i++) {
      sum += this.uiGoods[i].getTotalPrice();
    }
    return sum;
  }

  /**
   * 封装内部的increase方法
   * @param {*} index 
   */
  increase(index) {
    this.uiGoods[index].increase();
  }

  decrease(index) {
    this.uiGoods[index].decrease();
  }

  getTotalChooseNumber() {
    let sum = 0;
    let len = this.uiGoods.length;
    for (let i = 0; i < len; i++) {
      sum += this.uiGoods[i].choose;
    }
    return sum;
  }

  /**
   * 由样式变化驱动函数变化
   */
  hasGoodsInCar() {
    return this.getTotalChooseNumber() != 0;
  }

  isCrossDeliveryThreshold() {
    return this.getTotalPrice() >= this.deliveryThreshold;
  }

  isChoose(index) {
    return this.uiGoods[index].isChoose();
  }
}


//整个界面
class UI {
  constructor() {
    this.UIData = new UIData();
    this.doms = {
      goodsContainer: document.querySelector('.goods-list'),
      deliveryPrice: document.querySelector('.footer-car-tip'),
      footerPay: document.querySelector('.footer-pay'),
      footerPayInnerSpan: document.querySelector('.footer-pay span'),
      footerTotalPay: document.querySelector('.footer-car-total'),
      footerCar: document.querySelector('.footer-car'),
      footerCarBadge: document.querySelector('.footer-car-badge'),
    };
    let carRect = this.doms.footerCar.getBoundingClientRect();
    //坐标不会更改
    let target = {
      x: carRect.left + carRect.width / 2,
      y: carRect.top + carRect.width / 5
    };
    this.target = target;
    this.createHTML();
    this.updateFooter();
    this.listenEvent();
  }


  //监听事件进行统一
  listenEvent() {
    this.doms.footerCar.addEventListener('animationend', function () {
      //注意这里的this指向发生了变化
      this.classList.remove('animate');
    });

    let that = this;
    //事件委托  提前设置自定义属性
    this.doms.goodsContainer.addEventListener('click', function (e) {
      if (e.target.classList.contains('i-jiajianzujianjiahao')) {
        // e.target.getAttribute()
        let index = +e.target.dataset.index;
        that.increase(index)
      } else if (e.target.classList.contains('i-jianhao')) {
        let index = +e.target.dataset.index;
        that.decrease(index)
      }
    })
  }


  //根据商品数据创建商品列表元素
  createHTML() {
    //1. 生成html字符串 innerHTML (parseHTML 执行效率低 开发效率高)
    //2. 一个一个创建元素
    let html = '';
    for (let i = 0; i < this.UIData.uiGoods.length; i++) {
      let g = this.UIData.uiGoods[i];
      html += `        <div class="goods-item">
      <img src="${g.data.pic}" alt="" class="goods-pic" />
      <div class="goods-info">
        <h2 class="goods-title">${g.data.title}</h2>
        <p class="goods-desc">
          ${g.data.desc}
        </p>
        <p class="goods-sell">
          <span>月售 ${g.data.sellNumber}</span>
          <span>好评率${g.data.favorRate}%</span>
        </p>
        <div class="goods-confirm">
          <p class="goods-price">
            <span class="goods-price-unit">￥</span>
            <span>${g.data.price}</span>
          </p>
          <div class="goods-btns">
            <i data-index=${i} class="iconfont i-jianhao"></i>
            <span>${g.choose}</span>
            <i data-index=${i} class="iconfont i-jiajianzujianjiahao"></i>
          </div>
        </div>
      </div>
    </div>`
    }
    this.doms.goodsContainer.innerHTML = html;
  }

  increase(index) {
    this.UIData.increase(index);//更改数据
    this.updateGoodsItem(index); //更改界面UI
    this.updateFooter();
    this.jump(index);
  }

  decrease(index) {
    this.UIData.decrease(index);
    this.updateGoodsItem(index);
    this.updateFooter();
  }

  updateGoodsItem(index) {
    let goodDom = this.doms.goodsContainer.children[index];
    // console.log(goodDom)
    if (this.UIData.isChoose(index)) {
      goodDom.classList.add('active');
    } else {
      goodDom.classList.remove('active');
    }
    let span = goodDom.querySelector('.goods-btns span');
    span.textContent = this.UIData.uiGoods[index].choose;
  }

  //更新页脚  注意数据问题
  updateFooter() {
    this.doms.deliveryPrice.textContent = `配送费￥${this.UIData.deliveryPrice}`;
    //得到总价数据，保留小数
    this.doms.footerTotalPay.textContent = this.UIData.getTotalPrice().toFixed(2);
    if (this.UIData.isCrossDeliveryThreshold()) {
      //到达起送标准
      this.doms.footerPay.classList.add('active');
    }
    else {
      this.doms.footerPay.classList.remove('active');
      let price = this.UIData.deliveryThreshold - this.UIData.getTotalPrice();
      // 注意price在计算机中的取值
      price = Math.round(price);
      this.doms.footerPayInnerSpan.textContent = `还差￥${price}元起送`;
    }

    if (this.UIData.hasGoodsInCar()) {
      this.doms.footerCar.classList.add('active');
    } else {
      this.doms.footerCar.classList.remove('active');
    }

    this.doms.footerCarBadge.textContent = this.UIData.getTotalChooseNumber();
  }

  //购物车动画
  carAnimate() {
    this.doms.footerCar.classList.add('animate');
  }

  //抛物线跳跃动画  
  jump(index) {
    let btnAdd = this.doms.goodsContainer.children[index].querySelector('.i-jiajianzujianjiahao');
    let btnAddRect = btnAdd.getBoundingClientRect();
    let start = {
      x: btnAddRect.left,
      y: btnAddRect.top,
    };
    let div = document.createElement('div');
    div.className = 'add-to-car';
    let i = document.createElement('i');
    i.className = 'iconfont i-jiajianzujianjiahao';
    div.appendChild(i);
    div.style.transform = `translateX(${start.x}px)`;
    i.style.transform = `translateY(${start.y}px)`;
    document.body.appendChild(div);
    //避免js代码被完全执行，此时决定强行渲染
    div.clientWidth;
    //设置结束位置
    div.style.transform = `translateX(${this.target.x}px)`;
    i.style.transform = `translateY(${this.target.y}px)`;

    let that = this;
    div.addEventListener('transitionend', function () {
      div.remove();
      that.carAnimate();
    },
      {
        once: true, //事件只触发一次
      })
  }
}

let ui = new UI();  