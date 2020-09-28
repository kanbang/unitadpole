let Epsilon = 0.001;

function WithinEpsilon(a, b, epsilon = 1.401298E-45) {
  var num = a - b;
  return -epsilon <= num && num <= epsilon;
}

export class Vector2 {
  constructor(
    x = 0,
    y = 0) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    return this.copyFromFloats(x, y);
  }

  add(otherVector) {
    return new Vector2(this.x + otherVector.x, this.y + otherVector.y);
  }

  subtract(otherVector) {
    return new Vector2(this.x - otherVector.x, this.y - otherVector.y);
  }

  multiply(value) {
    return new Vector2(this.x * value, this.y * value);
  }

  multiplyVector(otherVector) {
    return new Vector2(this.x * otherVector.x, this.y * otherVector.y);
  }

  negate() {
    return new Vector2(-this.x, -this.y);
  }

  left() {
    return new Vector2(-this.y, this.x);
  }

  equals(otherVector) {
    return otherVector && this.x === otherVector.x && this.y === otherVector.y;
  }

  equalsWithEpsilon(otherVector, epsilon = Epsilon) {
    return otherVector && WithinEpsilon(this.x, otherVector.x, epsilon) && WithinEpsilon(this.y, otherVector.y, epsilon);
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  lengthSquared() {
    return (this.x * this.x + this.y * this.y);
  }

  normalize() {
    var len = this.length();
    if (len === 0) {
      return this;
    }

    var num = 1.0 / len;
    this.x *= num;
    this.y *= num;
    return this;
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  static Zero() {
    return new Vector2(0, 0);
  }

  static Lerp(start, end, amount) {
    var x = start.x + ((end.x - start.x) * amount);
    var y = start.y + ((end.y - start.y) * amount);
    return new Vector2(x, y);
  }

  static Dot(left, right) {
    return left.x * right.x + left.y * right.y;
  }

  //复平面相乘计算向量旋转，减少三角函数运算
  static ComplexMultiply(vecL, vecR) {
    var x = vecL.x * vecR.x - vecL.y * vecR.y;
    var y = vecL.x * vecR.y + vecL.y * vecR.x;
    return new Vector2(x, y);
  }

  //复平面相除计算向量夹角，减少三角函数运算
  static ComplexDivide(vecL, vecR) {
    if (vecR.y == 0) {
      return new Vector2(vecL.x / vecR.x, vecL.y / vecR.x);
    } else {
      var tmp = this.ComplexMultiply(vecL, new Vector2(vecR.x, -vecR.y));
      return this.ComplexDivide(tmp, new Vector2(vecR.x * vecR.x + vecR.y * vecR.y, 0));
    }
  }
};
