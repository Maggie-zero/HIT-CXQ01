// utils.js
import { ElNotification } from "element-plus";

// 文件检查
export const fileCheck = (file: any, max_size: any, accept_format: any) => {
  let res = [true, ""];
  // res[0] 是否失败 失败为true， res[1] 文件类型
  if (file.size > max_size * 1024 * 1024) {
    ElNotification.error({
      title: "文件过大",
      message: "文件不能大于" + max_size + "M",
      offset: 0,
      position: "top-right",
      duration: 2000,
    });
    return res;
  }

  const type = file.type !== "" ? file.type : file.name.split(".")[1];
  console.log(type)
  Object.keys(accept_format).forEach((key) => {
    if (accept_format[key].includes(type)) {
      res[0] = false;
      res[1] = key;
    }
  });
  if (res[0]) {
    ElNotification.error({
      title: "文件格式",
      message: "不符合要求文件格式",
      offset: 0,
      position: "top-right",
      duration: 2000,
    });
  }
  return res;
};

// 全局函数
export function validateMobile(str: string) {
  // 检查手机号码格式
  return /^((13[0-9])|(14[5-9])|(15([0-3]|[5-9]))|(16[6-7])|(17[1-8])|(18[0-9])|(19[1|3])|(19[5|6])|(19[8|9]))\d{8}$/.test(
    str,
  );
}

// 非纯数字非纯字母 /^(?![0-9]+$)[0-9A-Za-z|a-zA-Z]{6,16}$/ 
// ^(?!^\d+$)(?!^[a-zA-Z]+$)(?!^\W+$)[a-zA-Z\d\W]{8,16}$('请输入6-11位的非纯数字登录账号~');
export function validatePass(str: string) {
  // let userNameReg = /(?=.*\d)(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{6,11}$/;
  let userNameReg = /^(?!^\d+$)(?!^[a-zA-Z]+$)[a-zA-Z\d\W].{6,11}$/;
  return userNameReg.test(str);
}

export function validateEmail(str: string) {
  // 检查邮箱格式
  return /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/.test(str);
}

export function validatePhone(str: string) {
  // 检查电话格式
  return /^(0\d{2,4}-)?\d{8}$/.test(str);
}

export function validateQQ(str: string) {
  // 检查QQ格式
  return /^[1-9][0-9]{4,}$/.test(str);
}

// 检查验证码格式
export function validateSmsCode(str: string) {
  return /^\d4$/.test(str);
}
// 校验 URL
export function validURL(url: string) {
  const reg =
    /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return reg.test(url)
}

// 校验特殊字符
export function specialCharacter(str: string) {
  const reg = new RegExp(
    // eslint-disable-next-line quotes
    "[`~!@#$^&*()=|{}':;',\\[\\]<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？ ]"
  )
  return reg.test(str)
}
