"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = mergeImg;

var _isPlainObj = _interopRequireDefault(require("is-plain-obj"));

var _jimp = _interopRequireWildcard(require("jimp"));

var _alignImage = _interopRequireDefault(require("./utils/alignImage"));

var _calcMargin = _interopRequireDefault(require("./utils/calcMargin"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function mergeImg(images, {
  direction = false,
  color = 0x00000000,
  align = 'start',
  offset = 0,
  margin
} = {}) {
  if (!Array.isArray(images)) {
    throw new TypeError('`images` must be an array that contains images');
  }

  if (images.length < 1) {
    throw new Error('At least `images` must contain more than one image');
  }

  const processImg = img => {
    if (img instanceof _jimp.default) {
      return {
        img
      };
    }

    if ((0, _isPlainObj.default)(img)) {
      const {
        src,
        offsetX,
        offsetY
      } = img;
      return (0, _jimp.read)(src).then(imgObj => ({
        img: imgObj,
        offsetX,
        offsetY
      }));
    }

    return (0, _jimp.read)(img).then(imgObj => ({
      img: imgObj
    }));
  };

  return Promise.all(images.map(processImg)).then(imgs => {
    let totalX = 0;
    let totalY = 0;
    const imgData = imgs.reduce((res, {
      img,
      offsetX = 0,
      offsetY = 0
    }) => {
      const {
        bitmap: {
          width,
          height
        }
      } = img;
      res.push({
        img,
        x: totalX + offsetX,
        y: totalY + offsetY,
        offsetX,
        offsetY
      });
      totalX += width + offsetX;
      totalY += height + offsetY;
      return res;
    }, []);
    const {
      top,
      right,
      bottom,
      left
    } = (0, _calcMargin.default)(margin);
    const marginTopBottom = top + bottom;
    const marginRightLeft = right + left;
    const totalWidth = direction ? Math.max(...imgData.map(({
      img: {
        bitmap: {
          width
        }
      },
      offsetX
    }) => width + offsetX)) : imgData.reduce((res, {
      img: {
        bitmap: {
          width
        }
      },
      offsetX
    }, index) => res + width + offsetX + Number(index > 0) * offset, 0);
    const totalHeight = direction ? imgData.reduce((res, {
      img: {
        bitmap: {
          height
        }
      },
      offsetY
    }, index) => res + height + offsetY + Number(index > 0) * offset, 0) : Math.max(...imgData.map(({
      img: {
        bitmap: {
          height
        }
      },
      offsetY
    }) => height + offsetY));
    const baseImage = new _jimp.default(totalWidth + marginRightLeft, totalHeight + marginTopBottom, color); // Fallback for `Array#entries()`

    const imgDataEntries = imgData.map((data, index) => [index, data]);

    for (const [index, {
      img,
      x,
      y,
      offsetX,
      offsetY
    }] of imgDataEntries) {
      const {
        bitmap: {
          width,
          height
        }
      } = img;
      const [px, py] = direction ? [(0, _alignImage.default)(totalWidth, width, align) + offsetX, y + index * offset] : [x + index * offset, (0, _alignImage.default)(totalHeight, height, align) + offsetY];
      baseImage.composite(img, px + left, py + top);
    }

    return baseImage;
  });
}