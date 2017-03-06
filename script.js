// todo 根据内容设置宽高
const or = 10
const maxD = 60
const easeOutElastic = function (t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
}

const easeInSine = function (t, b, c, d) {
    return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
}
new Vue({
  el: '#app',
  data: {
    x1: 20,
    y1: 10,
    r1: or,
    fill: 'red',
    x2: 20,
    y2: 10,
    r2: or,
    moving: false,
    offsetX: 0,
    offsetY: 0,
    apart: false,
    c1: true,
    c2: true,
    tw: 20,
  },
  watch: {
    d() {
      this.r1 = or - this.d/7
    }
  },
  computed: {
    'y2-y1'() {
      return this.y2-this.y1
    },
    'x2-x1'() {
      return this.x2-this.x1
    },
    d() {
      return Math.sqrt((this['y2-y1'])**2 + (this['x2-x1'])**2)
    },
    sin() {
      return this['y2-y1'] / this.d
    },
    cos() {
      return this['x2-x1'] / this.d
    },
    // 静止圆上两个点
    a1x() {
      return this.x1 - this.r1 * this.sin
    },
    a1y() {
      return this.y1 + this.r1 * this.cos
    },
    a2x() {
      return this.x1 + this.r1 * this.sin
    },
    a2y() {
      return this.y1 - this.r1 * this.cos
    },
    // 拖动圆上两个点
    m1x() {
      return this.x2 - this.r2 * this.sin
    },
    m1y() {
      return this.y2 + this.r2 * this.cos
    },
    m2x() {
      return this.x2 + this.r2 * this.sin
    },
    m2y() {
      return this.y2 - this.r2 * this.cos
    },
    // 一个控制点
    cx() {
      return (this.x2 + this.x1) / 2
    },
    cy() {
      return (this.y2 + this.y1) / 2
    },
    // 路径
    path() {
      if (this.d > 0) {
        return `
          M${this.a1x},${this.a1y}
          Q${this.cx},${this.cy} ${this.m1x},${this.m1y}
          L${this.m2x},${this.m2y}
          Q${this.cx},${this.cy} ${this.a2x},${this.a2y}
          Z
        `
      }
      return ''
    }
  },
  methods: {
    resetPos(apart = false) {
      this.offsetX = 0
      this.offsetY = 0
      if (apart) {
        this.animateApart()
      } else {
        this.moving = false
        this.animate()
      }
    },

    animate() {
      const time = Date.now()
      // cx cy != 0
      const cx = (this.x1 - this.x2) || 1e-16
      const cy = (this.y1 - this.y2) || 1e-16
      const x = this.x2
      const y = this.y2
      const repeat = () => {
        const curTime = Date.now() - time
        this.x2 = easeOutElastic(curTime, x, cx, 350)
        this.y2 = easeOutElastic(curTime, y, cy, 350)
        if (curTime <= 350) {
          requestAnimationFrame(repeat)
        } else {
          this.x2 = this.x1 = 20
          this.y2 = this.y1 = 10
          this.$refs.svg.classList.remove('fullscreen')
        }
      }

      requestAnimationFrame(repeat)
    },
    // todo
    animateApart() {
      const time = Date.now()
      // cx cy != 0
      const cx = (this.x2 - this.x1) || 1e-16
      const cy = (this.y2 - this.y1) || 1e-16
      const x = this.x1
      const y = this.y1
      const repeat = () => {
        const curTime = Date.now() - time
        this.x1 = easeInSine(curTime, x, cx, 20)
        this.y1 = easeInSine(curTime, y, cy, 20)
        if (curTime <= 20) {
          requestAnimationFrame(repeat)
        } else {
          this.c1 = false
        }
      }

      requestAnimationFrame(repeat)
    },
    fullScreen(e) {
      const bound = this.$refs.svg.getBoundingClientRect()
      const left = bound.left + this.r1
      const top = bound.top + this.r1
      this.$refs.svg.classList.add('fullscreen')
      this.x1 = this.x2 = left + 10
      this.y1 = this.y2 = top
    },
    mousedown(e) {
      if (e.button === 0 && e.buttons === 1) {
        this.fullScreen(e)
        this.moving = true
        this.offsetX = this.x1 - e.clientX
        this.offsetY = this.y1 - e.clientY
      }
    },
    mousemove(e) {
      if (this.moving) {
        if (this.d > maxD && !this.apart) {
          this.resetPos(true)
          this.apart = true
        }
        this.x2 = e.clientX + this.offsetX
        this.y2 = e.clientY + this.offsetY
        if (this.apart) {
          this.x1 = this.x2
          this.y1 = this.y2
        }
      }
    },
    mouseup() {
      if (!this.apart) {
        this.resetPos()
      } else {
        // fadeout animation
        this.c2 = false
        this.$nextTick(() => {
          const sprite = this.$refs.sprite
          sprite.style.left = `${this.x2 - 14}px`
          sprite.style.top = `${this.y2 - 14}px`
        })
        this.$refs.svg.classList.remove('fullscreen')
      }
    }
  }
})