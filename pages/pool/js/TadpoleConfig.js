/*
 * @Descripttion: 
 * @version: 0.x
 * @Author: zhai
 * @Date: 2019-10-14 10:43:35
 * @LastEditors: zhai
 * @LastEditTime: 2020-09-11 16:55:36
 */
export class TadpoleConfig {
  constructor() {
    this.name = "";
    // if ($.cookie('todpole_name')) {
    //   this.name = $.cookie('todpole_name');
    // }

    this.gender = 0;  // 0 未知  1 男性  2 女性
    // if ($.cookie('todpole_gender')) {
    //   this.gender = $.cookie('todpole_gender');
    // }
  }

  setName(name) {
    this.name = name;
    // $.cookie('todpole_name', name, {
    //   expires: 14
    // });
  }

  setGender(gender) {
    this.gender = gender;
    // $.cookie('todpole_gender', gender, {
    //   expires: 14
    // });
  }


  static GetGenderRgba(gender, opacity) {
    return "rgba(" + TadpoleConfig.GenderRgb[gender] + "," + opacity + ')'
  }

  GetGenderShow() {
    return this.gender;
  }

  GetNameShow() {
    return this.name;
  }
}

/*
粉：233 80 152
蓝：30 185 238
*/

//性别对应颜色
TadpoleConfig.GenderRgb = ["226,219,226", "192, 253, 247", "255, 181, 197"];

//开启重力漫游
TadpoleConfig.accelerometerOn = true;

//文字颜色 大小
TadpoleConfig.FontColorRGB = "255,255,255";
TadpoleConfig.FontSize = 10;
TadpoleConfig.FontDef = TadpoleConfig.FontSize + 'rpx normal sans-serif';

//水粒子颜色
TadpoleConfig.WaterRGB = "226, 219, 226";