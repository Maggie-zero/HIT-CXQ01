import { orderBy } from "lodash-es";
class Unit8 {
  // 该类实例
  // private static Unit8: Unit8 | undefined

  // 模型文件
  private origin_data: any;
  private width: any;
  private height: any;
  private length: any;


  public constructor(unit8array: any) {
    this.origin_data = this.unit2rgba(unit8array.data)
    // this.origin_data = this.unit2rgba(unit8array.slice(0, 21)) //切片模式
    this.length = this.origin_data.length
    this.width = unit8array.width
    this.height = unit8array.height
  }


  /**
   *  扫描全图,计算颜色比例
   */
  public calcuRatio() {
    let obj = this.origin_data.reduce((obj, item) => {
      const name = [item[0], item[1], item[2]].toString()
      obj[name] = obj[name] ? ++obj[name] : 1;
      return obj
    }, {})
    // 对象转数组
    const _res = [] as any
    Object.entries(obj).forEach(([k, v]: any) => {
      _res.push({
        color: k,
        ratio: v / this.length
      })
    })
    const res = orderBy(_res, 'ratio', 'desc')
    return res
  }

  /**
   *  除去部分颜色,计算颜色比例
   */
  public calcuExceptRatio(except: any) {
    let obj = this.origin_data.reduce((obj, item) => {
      const name = [item[0], item[1], item[2]].toString()
      obj[name] = obj[name] ? ++obj[name] : 1;
      return obj
    }, {})
    let al_length = this.length;
    // 删除特定元素
    except.forEach((item) => {
      al_length = al_length - obj[item]
      delete obj[item]
    })
    // 对象转数组
    const _res = [] as any
    Object.entries(obj).forEach(([k, v]: any) => {
      _res.push({
        color: k,
        ratio: v / al_length
      })
    })
    const res = orderBy(_res, 'ratio', 'desc')
    return res
  }

  /**
   *  转为rgba数组
   */
  private unit2rgba = (unit8: any) => {
    const rgba = [] as any;
    for (var i = 0; i < unit8.length - 4; i = i + 4) {
      rgba.push([unit8[i], unit8[i + 1], unit8[i + 2], unit8[i + 3]]);
    }
    return rgba;
  };

  /**
   *  根据灰度更改某种颜色
   */
  public changeColorGray() {
    const [...imgData] = this.origin_data
    imgData.forEach((rgba) => {
      if (this.gray(rgba) > 0 && this.gray(rgba) < 6600) {
        rgba = [0, 255, 255, 255]
      } else if (this.gray(rgba) > 0 && this.gray(rgba) < 6600) {
        rgba = [77, 151, 28, 255]
      }
    })
    console.log(Uint8ClampedArray.from(imgData.flat()))
    // const l = new ImageData(Uint8ClampedArray.from(imgData.flat()), this.width, this.height)
    // console.log(l)
    // return new ImageData(imgData.flat(), this.width, this.height);
  }

  /**
   *  更改某种颜色
   */
  private changeColor() {
    // return [rgba[0], rgba[1], rgba[2], rgba[3]]
  }


  /**
   *  计算单点灰度值
   */
  private gray = (rgba) => {
    return rgba[0] * 77 + rgba[1] * 151 + rgba[2] * 28;
  };
}


export { Unit8 };