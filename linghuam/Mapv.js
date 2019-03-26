//@ sourceURL=Mapv.js
!function(){
"use strict";

var Mapv;
/**
 * @author nikai (@胖嘟嘟的骨头, nikai@baidu.com)
 * 一些常用的方法库
 */

'use strict';

var util = {
    isPlainObject: function isPlainObject(obj) {
        var key;
        var class2type = {};
        var hasOwn = class2type.hasOwnProperty;

        // Must be an Object.
        // Because of IE, we also have to check the presence of the constructor property.
        // Make sure that DOM nodes and window objects don't pass through, as well
        if (!obj || typeof obj !== 'object' || obj.nodeType) {
            return false;
        }

        // Not own constructor property must be Object
        var hasNoOwn = !hasOwn.call(obj, 'constructor');
        var hasNoOwnPrototypeOf = !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
        if (obj.constructor && hasNoOwn && hasNoOwnPrototypeOf) {
            return false;
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.
        for (key in obj) {}

        return key === undefined || hasOwn.call(obj, key);
    },
    /**
     * 深度扩展一个对象
     */
    extend: function extend(destination, source) {
        var i,
            toStr = Object.prototype.toString,
            astr = '[object Array]';
        destination = destination || {};
        for (i in source) {
            if (source.hasOwnProperty(i)) {
                if (util.isPlainObject(source[i])) {
                    destination[i] = toStr.call(source[i]) === astr ? [] : {};
                    util.extend(destination[i], source[i]);
                    destination[i] = source[i];
                } else {
                    destination[i] = source[i];
                }
            }
        }
        return destination;
    },

    /**
     * copy an object
     * @param {Object} obj the obj
     * @return {Object} new object
     */
    copy: function copy(obj) {
        return this.extend({}, obj);
    },
    /**
     * 为类型构造器建立继承关系
     * @name baidu.lang.inherits
     * @function
     * @grammar baidu.lang.inherits(subClass, superClass[, className])
     * @param {Function} subClass 子类构造器
     * @param {Function} superClass 父类构造器
     * @remark
     *
    使subClass继承superClass的prototype，因此subClass的实例能够使用superClass的prototype中定义的所有属性和方法。<br>
    这个函数实际上是建立了subClass和superClass的原型链集成，并对subClass进行了constructor修正。<br>
    <strong>注意：如果要继承构造函数，需要在subClass里面call一下，具体见下面的demo例子</strong>
     * @shortcut inherits
     * @meta standard
     */
    inherits: function inherits(subClass, superClass) {
        var key;
        var proto;
        var selfProps = subClass.prototype;
        var Clazz = new Function();
        Clazz.prototype = superClass.prototype;
        proto = subClass.prototype = new Clazz();
        for (key in selfProps) {
            proto[key] = selfProps[key];
        }
        subClass.prototype.constructor = subClass;
        subClass.superClass = superClass.prototype;
    },

    // 在页面中添加样式
    addCssByStyle: function addCssByStyle(cssString) {
        var doc = document;
        var style = doc.createElement('style');
        style.setAttribute('type', 'text/css');
        if (style.styleSheet) {
            // IE
            style.styleSheet.cssText = cssString;
        } else {
            // w3c
            var cssText = doc.createTextNode(cssString);
            style.appendChild(cssText);
        }

        var heads = doc.getElementsByTagName('head');
        if (heads.length) {
            heads[0].appendChild(style);
        } else {
            doc.documentElement.appendChild(style);
        }
    },

    // 获取坐标的中心点
    getGeoCenter: function getGeoCenter(geo) {
        var minX = geo[0][0];
        var minY = geo[0][1];
        var maxX = geo[0][0];
        var maxY = geo[0][1];
        for (var i = 1; i < geo.length; i++) {
            minX = Math.min(minX, geo[i][0]);
            maxX = Math.max(maxX, geo[i][0]);
            minY = Math.min(minY, geo[i][1]);
            maxY = Math.max(maxY, geo[i][1]);
        }
        return [minX + (maxX - minX) / 2, minY + (maxY - minY) / 2];
    },

    // 获取Device的Pixel Ratio
    getPixelRatio: function getPixelRatio(context) {
        var backingStore = context.backingStorePixelRatio || context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;

        return (window.devicePixelRatio || 1) / backingStore;
        // return 2;
    },

    dateAdd: function(time, number, interval) {
        number = parseInt(number);
        var date, isUnixTimestamp;
        if (typeof time == 'number') {
            date = new Date(time);
            isUnixTimestamp = true;
        }
        switch (interval) {
            case "year": {
                date.setFullYear(date.getFullYear() + number);
                break;
            }
            case "quarter": {
                date.setMonth(date.getMonth() + number * 3);
                break;
            }
            case "month": {
                date.setMonth(date.getMonth() + number);
                break;
            }
            case "week": {
                date.setDate(date.getDate() + number * 7);
                break;
            }
            case "day": {
                date.setDate(date.getDate() + number);
                break;
            }
            case "hour": {
                date.setHours(date.getHours() + number);
                break;
            }
            case "minute": {
                date.setMinutes(date.getMinutes() + number);
                break;
            }
            case "second": {
                date.setSeconds(date.getSeconds() + number);
                break;
            }
            default: {
                date.setDate(d.getDate() + number);
                break;
            }
        }
        if (isUnixTimestamp) {
            return +date;
        } else {
            return date;
        }
    },
    angleTo: function (p0, p1, angle) {
        var x = p0[0] - p1[0],
            y = p0[1] - p1[1];
        var theta = Math.atan2(y, x);
        return theta += (angle || 0) / 180 * Math.PI;
    }
};
"use strict";

var GeoUtil = (function () {
    // 百度坐标（BD09ll）、国测局坐标（火星坐标，GCJ02）、和WGS84坐标系之间的转换
    // https://github.com/wandergis/coordtransform
    // 改进了是否在中国的坐标判断

    //定义一些常量
    var x_PI = 3.14159265358979324 * 3000.0 / 180.0;
    var PI = 3.1415926535897932384626;
    var a = 6378245.0;
    var ee = 0.00669342162296594323;

    // GCJ-02 -> BD-09ll
    // point: {lng, lat} 
    function gcj02_to_bd09ll(point) {
        var x = point.lng,
            y = point.lat;
        var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_PI);
        var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_PI);
        var bd_lon = z * Math.cos(theta) + 0.0065;
        var bd_lat = z * Math.sin(theta) + 0.006;
        return {
            lng: bd_lon,
            lat: bd_lat
        };
    }

    // BD-09 -> GCJ-02
    // point: {lng, lat}
    function bd09ll_to_gcj02(point) {
        var x = point.lng - 0.0065,
            y = point.lat - 0.006;
        var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_PI);
        var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_PI);

        return {
            lng: z * Math.cos(theta),
            lat: z * Math.sin(theta)
        };
    }

    // WGS-84 -> GCJ-02
    // point: {lng, lat}
    function wgs84_to_gcj02(point) {

        var wgLat = point.lat,
            wgLon = point.lng;

        if (isInChina(wgLon, wgLat)) {
            var dLat = transformLat(wgLon - 105.0, wgLat - 35.0);
            var dLon = transformLon(wgLon - 105.0, wgLat - 35.0);
            var radLat = wgLat / 180.0 * PI;
            var magic = Math.sin(radLat);
            magic = 1 - ee * magic * magic;
            var sqrtMagic = Math.sqrt(magic);
            dLat = dLat * 180.0 / (a * (1 - ee) / (magic * sqrtMagic) * PI);
            dLon = dLon * 180.0 / (a / sqrtMagic * Math.cos(radLat) * PI);

            return {
                lng: wgLon + dLon,
                lat: wgLat + dLat
            };
        } else {
            return {
                lng: wgLon,
                lat: wgLat
            };
        }
    }

    // GCJ-02 -> WGS-84
    // point: {lng, lat}
    function gcj02_to_wgs84(point) {
        var lat = +point.lat;
        var lng = +point.lng;
        if (!isInChina(lng, lat)) {
            return point;
        } else {
            var dlat = transformLat(lng - 105.0, lat - 35.0);
            var dlng = transformLon(lng - 105.0, lat - 35.0);
            var radlat = lat / 180.0 * PI;
            var magic = Math.sin(radlat);
            magic = 1 - ee * magic * magic;
            var sqrtmagic = Math.sqrt(magic);
            dlat = dlat * 180.0 / (a * (1 - ee) / (magic * sqrtmagic) * PI);
            dlng = dlng * 180.0 / (a / sqrtmagic * Math.cos(radlat) * PI);
            var mglat = lat + dlat;
            var mglng = lng + dlng;
            return { lng: lng * 2 - mglng, lat: lat * 2 - mglat };
        }
    }

    // WGS-84 -> BD-09ll
    // point: {lng, lat}
    function wgs84_to_bd09ll(point) {
        return gcj02_to_bd09ll(wgs84_to_gcj02(point));
    }

    // BD-09ll -> WGS-84
    // point: {lng, lat}
    function bd09ll_to_wgs84(point) {
        return gcj02_to_wgs84(bd09ll_to_gcj02(point));
    }

    // 判断GPS坐标是否在中国
    // http://www.cnblogs.com/Aimeast/archive/2012/08/09/2629614.html
    // https://git.load-page.com/r/laravel/blob/cc16b6522d68231c4949251c3886691256b6bb5e/vendor/addons/core/src/Tools/GPS.php
    function Rectangle(lng1, lat1, lng2, lat2) {
        this.west = Math.min(lng1, lng2);
        this.north = Math.max(lat1, lat2);
        this.east = Math.max(lng1, lng2);
        this.south = Math.min(lat1, lat2);
    }

    function isInRect(rect, lon, lat) {
        return rect.west <= lon && rect.east >= lon && rect.north >= lat && rect.south <= lat;
    }
    //China region - raw data
    var region = [new Rectangle(79.446200, 49.220400, 96.330000, 42.889900), new Rectangle(109.687200, 54.141500, 135.000200, 39.374200), new Rectangle(73.124600, 42.889900, 124.143255, 29.529700), new Rectangle(82.968400, 29.529700, 97.035200, 26.718600), new Rectangle(97.025300, 29.529700, 124.367395, 20.414096), new Rectangle(107.975793, 20.414096, 111.744104, 17.871542)];
    //China excluded region - raw data
    var exclude = [new Rectangle(119.921265, 25.398623, 122.497559, 21.785006), new Rectangle(101.865200, 22.284000, 106.665000, 20.098800), new Rectangle(106.452500, 21.542200, 108.051000, 20.487800), new Rectangle(109.032300, 55.817500, 119.127000, 50.325700), new Rectangle(127.456800, 55.817500, 137.022700, 49.557400), new Rectangle(131.266200, 44.892200, 137.022700, 42.569200)];

    function isInChina(lon, lat) {
        for (var i = 0; i < region.length; i++) {
            if (isInRect(region[i], lon, lat)) {
                for (var j = 0; j < exclude.length; j++) {
                    if (isInRect(exclude[j], lon, lat)) {
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    }

    function transformLat(x, y) {
        var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(y / 12.0 * PI) + 320 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0;
        return ret;
    }

    function transformLon(x, y) {
        var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0;
        return ret;
    }

    var module = {
        gcj02_to_bd09ll: gcj02_to_bd09ll,
        bd09ll_to_gcj02: bd09ll_to_gcj02,
        wgs84_to_gcj02: wgs84_to_gcj02,
        gcj02_to_wgs84: gcj02_to_wgs84,
        wgs84_to_bd09ll: wgs84_to_bd09ll,
        bd09ll_to_wgs84: bd09ll_to_wgs84
    };

    // srcCoordType/targetCoordType: [wgs84, gcj02, bd09ll]
    function transform(point, srcCoordType, targetCoordType) {
        if (srcCoordType == targetCoordType) {
            return point;
        } else {
            var transformFunc = srcCoordType + "_to_" + targetCoordType;
            return module[transformFunc](point);
        }
    }

    return {
        transform: transform,
        isInChina: isInChina
    };
})();

var CurveUtil = {
 /**
  * 根据弧线的坐标节点数组
  */
  getPoints: function (points, options) {
        options = options || {};
        var curvePoints = [];
        for (var i = 0; i < points.length - 1; i++) {
        var p = this.getCurveByTwoPoints(points[i], points[i + 1], options.count);
        if (p && p.length > 0) {
            curvePoints = curvePoints.concat(p);
        }
        }
        return curvePoints;
  },
  
   /**
   * 根据两点获取曲线坐标点数组
   * @param Point 起点
   * @param Point 终点
   */
   getCurveByTwoPoints: function (obj1, obj2, count) {
        // console.info(obj1, obj2)
        if (!obj1 || !obj2) {
          return null;
        }
    
        var B1 = function (x) {
          return 1 - 2 * x + x * x;
        };
        var B2 = function (x) {
          return 2 * x - 2 * x * x;
        };
        var B3 = function (x) {
          return x * x;
        };
    
        var curveCoordinates = [];
    
        var count = count || 40; // 曲线是由一些小的线段组成的，这个表示这个曲线所有到的折线的个数
        var isFuture = false;
        var t, h, h2, lat3, lng3, j, t2;
        var LnArray = [];
        var i = 0;
        var inc = 0;
    
        if (typeof (obj2) == "undefined") {
            if (typeof (curveCoordinates) != "undefined") {
                curveCoordinates = [];
            }
            return;
        }
    
        var lat1 = parseFloat(obj1.lat);
        var lat2 = parseFloat(obj2.lat);
        var lng1 = parseFloat(obj1.lng);
        var lng2 = parseFloat(obj2.lng);
    
        // 计算曲线角度的方法
        if (lng2 > lng1) {
        if (parseFloat(lng2 - lng1) > 180) {
            if (lng1 < 0) {
            lng1 = parseFloat(180 + 180 + lng1);
            lng2 = parseFloat(180 + 180 + lng2);
            }
        }
        }
        // 此时纠正了 lng1 lng2
        j = 0;
        t2 = 0;
        // 纬度相同
        if (lat2 == lat1) {
            t = 0;
            h = lng1 - lng2;
            // 经度相同
        } else if (lng2 == lng1) {
            t = Math.PI / 2;
            h = lat1 - lat2;
        } else {
            t = Math.atan((lat2 - lat1) / (lng2 - lng1));
            h = (lat2 - lat1) / Math.sin(t);
        }
        if (t2 == 0) {
            t2 = (t + (Math.PI / 5));
        }
        h2 = h / 2;
        lng3 = h2 * Math.cos(t2) + lng1;
        lat3 = h2 * Math.sin(t2) + lat1;
    
        for (i = 0; i < count + 1; i++) {
            var x = lng1 * B1(inc) + lng3 * B2(inc) + lng2 * B3(inc);
            var y = lat1 * B1(inc) + lat3 * B2(inc) + lat2 * B3(inc);
            var lng1_src = obj1.lng;
            var lng2_src = obj2.lng;
        
            curveCoordinates.push([
                (lng1_src < 0 && lng2_src > 0) ? x - 360 : x, y
            ]);
            inc = inc + (1 / count);
        }
        return curveCoordinates;
   }
};

/**
 * @author kyle / http://nikai.us/
 */

function Canvas(width, height) {

    var canvas;

    if (typeof document === 'undefined') {

        // var Canvas = require('canvas');
        // canvas = new Canvas(width, height);

    } else {

        var canvas= document.createElement('canvas');

        if (width) {
            canvas.width = width;
        }

        if (height) {
            canvas.height = height;
        }

    }

    return canvas;
}

/**
 * Category
 * @param {Object} [options]   Available options:
 * {Object} gradient: { 0.25: "rgb(0,0,255)", 0.55: "rgb(0,255,0)", 0.85: "yellow", 1.0: "rgb(255,0,0)"}
 */
function Intensity(options) {

    options = options || {};
    this.gradient = options.gradient || { 
        0.25: "rgba(0, 0, 255, 1)",
        0.55: "rgba(0, 255, 0, 1)",
        0.85: "rgba(255, 255, 0, 1)",
        1.0: "rgba(255, 0, 0, 1)"
    };
    this.maxSize = options.maxSize || 35;
    this.minSize = options.minSize || 0;
    this.max = options.max || 100;
    this.min = options.min || 0;
    this.initPalette();
}

Intensity.prototype.setMax = function (value) {
    this.max = value || 100;
}

Intensity.prototype.setMin = function (value) {
    this.min = value || 0;
}

Intensity.prototype.setMaxSize = function (maxSize) {
    this.maxSize = maxSize || 35;
}

Intensity.prototype.setMinSize = function (minSize) {
    this.minSize = minSize || 0;
}

Intensity.prototype.initPalette = function () {

    var gradient = this.gradient;

    var canvas = new Canvas(256, 1);

    var paletteCtx = this.paletteCtx = canvas.getContext('2d');

    var lineGradient = paletteCtx.createLinearGradient(0, 0, 256, 1);

    for (var key in gradient) {
        lineGradient.addColorStop(parseFloat(key), gradient[key]);
    }

    paletteCtx.fillStyle = lineGradient;
    paletteCtx.fillRect(0, 0, 256, 1);

}

Intensity.prototype.getColor = function (value) {

    var imageData = this.getImageData(value);

    return "rgba(" + imageData[0] + ", " + imageData[1] + ", " + imageData[2] + ", " + imageData[3] / 256 + ")";

}

Intensity.prototype.getImageData = function (value) {

    var imageData = this.paletteCtx.getImageData(0, 0, 256, 1).data;

    if (value === undefined) {
        return imageData;
    }

    var max = this.max;
    var min = this.min;

    if (value > max) {
        value = max;
    }

    if (value < min) {
        value = min;
    }

    var index = Math.floor((value - min) / (max - min) * (256 - 1)) * 4;

    return [imageData[index], imageData[index + 1], imageData[index + 2], imageData[index + 3]];
}

/**
 * @param Number value 
 * @param Number max of value
 * @param Number max of size
 * @param Object other options
 */
Intensity.prototype.getSize = function (value) {

    var size = 0;
    var max = this.max;
    var min = this.min;
    var maxSize = this.maxSize;
    var minSize = this.minSize;

    if (value > max) {
        value = max;
    }

    if (value < min) {
        value = min;
    }

    size = minSize + (value - min) / (max - min) * (maxSize - minSize);

    return size;

}

Intensity.prototype.getLegend = function (options) {
    var gradient = this.gradient;


    var width = options.width || 20;
    var height = options.height || 180;

    var canvas = new Canvas(width, height);

    var paletteCtx = canvas.getContext('2d');

    var lineGradient = paletteCtx.createLinearGradient(0, height, 0, 0);

    for (var key in gradient) {
        lineGradient.addColorStop(parseFloat(key), gradient[key]);
    }

    paletteCtx.fillStyle = lineGradient;
    paletteCtx.fillRect(0, 0, width, height);

    return canvas;
}

/**
 * @file MVC架构
 *
 */
'use strict';

var MVCObject;
(function () {

    function Accessor(target, targetKey) {
        var self = this;
        self.target = target;
        self.targetKey = targetKey;
    }

    Accessor.prototype.transform = function (from, to) {
        var self = this;
        self.from = from;
        self.to = to;
        self.target.notify(self.targetKey);
        return self;
    };

    MVCObject = (function () {

        var getterNameCache = {};
        var setterNameCache = {};
        var uuid = 0;
        var bindings = '__bindings__';
        var accessors = '__accessors__';
        var uid = '__uid__';

        function capitalize(str) {
            return str.substr(0, 1).toUpperCase() + str.substr(1);
        }

        function getUid(obj) {
            return obj[uid] || (obj[uid] = ++uuid);
        }

        function toKey(key) {
            return '_' + key;
        }

        function getGetterName(key) {
            if (getterNameCache.hasOwnProperty(key)) {
                return getterNameCache[key];
            } else {
                return getterNameCache[key] = 'get' + capitalize(key);
            }
        }

        function getSetterName(key) {
            if (setterNameCache.hasOwnProperty(key)) {
                return setterNameCache[key];
            } else {
                return setterNameCache[key] = 'set' + capitalize(key);
            }
        }

        /**
         * @description 这个函数的触发需要时机
         * 在一个key所在的终端对象遍历到时触发
         * 同时传播给所有直接、间接监听targetKey的对象
         * 在调用MVCObject的set方法时开始遍历
         *
         * @param target {MVCObject} 继承了MVCObject的对象
         * @param targetKey {String} 当前对象中被监听的字段
         * @return {void}
         */
        function triggerChange(target, targetKey) {
            var evt = targetKey + '_changed';

            /**
             * 优先检测并执行目标对象key对应的响应方法
             * 其次检测并执行默认方法
             */
            if (target[evt]) {
                target[evt]();
            } else if (typeof target.changed === 'function') {
                target.changed(targetKey);
            }

            if (target[bindings] && target[bindings][targetKey]) {
                var ref = target[bindings][targetKey];
                var bindingObj, bindingUid;
                for (bindingUid in ref) {
                    if (ref.hasOwnProperty(bindingUid)) {
                        bindingObj = ref[bindingUid];
                        triggerChange(bindingObj.target, bindingObj.targetKey);
                    }
                }
            }
        }

        function MVCObject() {};
        var proto = MVCObject.prototype;

        /**
         * @description 从依赖链中获取对应key的值
         * @param {String} key 关键值
         * @return {mixed} 对应的值
         */
        proto.get = function (key) {
            var self = this;
            if (self[accessors] && self[accessors].hasOwnProperty(key)) {
                var accessor = self[accessors][key];
                var targetKey = accessor.targetKey;
                var target = accessor.target;
                var getterName = getGetterName(targetKey);
                var value;
                if (target[getterName]) {
                    value = target[getterName]();
                } else {
                    value = target.get(targetKey);
                }
                if (accessor.to) {
                    value = accessor.to(value);
                }
            } else if (self.hasOwnProperty(toKey(key))) {
                value = self[toKey(key)];
            }
            return value;
        };

        /**
         * @description set方法遍历依赖链直到找到key的持有对象设置key的值;
         * 有三个分支
         * @param {String} key 关键值
         * @param {all} value 要给key设定的值,可以是所有类型
         * @return {this}
         */
        proto.set = function (key, value) {
            var self = this;
            if (self[accessors] && self[accessors].hasOwnProperty(key)) {
                var accessor = self[accessors][key];
                var targetKey = accessor.targetKey;
                var target = accessor.target;
                var setterName = getSetterName(targetKey);
                if (accessor.from) {
                    value = accessor.from(value);
                }
                if (target[setterName]) {
                    target[setterName](value);
                } else {
                    target.set(targetKey, value);
                }
            } else {
                this[toKey(key)] = value;
                triggerChange(self, key);
            }
            return self;
        };

        /**
         * @description 没个MVCObject对象各自的响应对应的key值变化时的逻辑
         */
        proto.changed = function () {};

        /**
         * @description 手动触发对应key的事件传播
         * @param {String} key 关键值
         * @return {this}
         */
        proto.notify = function (key) {
            var self = this;
            if (self[accessors] && self[accessors].hasOwnProperty(key)) {
                var accessor = self[accessors][key];
                var targetKey = accessor.targetKey;
                var target = accessor.target;
                target.notify(targetKey);
            } else {
                triggerChange(self, key);
            }
            return self;
        };

        proto.setValues = function (values) {
            var self = this;
            var key, setterName, value;
            for (key in values) {
                if (values.hasOwnProperty(key)) {
                    value = values[key];
                    setterName = getSetterName(key);
                    if (self[setterName]) {
                        self[setterName](value);
                    } else {
                        self.set(key, value);
                    }
                }
            }
            return self;
        };

        proto.setOptions = proto.setValues;

        /**
         * @description 将当前对象的一个key与目标对象的targetKey建立监听和广播关系
         * @param key {String} 当前对象上的key
         * @param target {Object} 目标对象
         * @param tarrgetKey {String} 目标对象上的key
         * @param noNotify {Boolean}
         * @return {Accessor}
         */
        proto.bindTo = function (key, target, targetKey, noNotify) {
            targetKey || (targetKey = key);

            var self = this;
            self.unbind(key);

            self[accessors] || (self[accessors] = {});
            target[bindings] || (target[bindings] = {});
            target[bindings][targetKey] || (target[bindings][targetKey] = {});

            var binding = new Accessor(self, key);
            var accessor = new Accessor(target, targetKey);

            self[accessors][key] = accessor;
            target[bindings][targetKey][getUid(self)] = binding;

            if (!noNotify) {
                triggerChange(self, key);
            }

            return accessor;
        };

        /**
         * @description 解除当前对象上key与目标对象的监听
         * @param {String} key 关键字
         * @return {this}
         */
        proto.unbind = function (key) {
            var self = this;
            if (self[accessors]) {
                var accessor = self[accessors][key];
                if (accessor) {
                    var target = accessor.target;
                    var targetKey = accessor.targetKey;
                    self[toKey(key)] = self.get(key);
                    delete target[bindings][targetKey][getUid(self)];
                    delete self[accessors][key];
                }
            }
            return self;
        };

        proto.unbindAll = function () {
            var self = this;
            if (self[accessors]) {
                var ref = self[accessors];
                for (var key in ref) {
                    if (ref.hasOwnProperty(key)) {
                        self.unbind(key);
                    }
                }
            }
            return self;
        };

        proto.initOptions = function (options) {

            for (var key in options) {

                this[getGetterName(key)] = (function (key) {
                    return function () {
                        return this.get(key);
                    };
                })(key);

                this[getSetterName(key)] = (function (key) {
                    return function (value) {
                        this.set(key, value);
                    };
                })(key);

                this[toKey(key)] = options[key];
            }
        };

        return MVCObject;
    })();
})();

Mapv.MVCObject = MVCObject;
/**
 * base Class
 *
 */

"use strict";

function Class() {
    this.__listeners = {}; // 存储自定义事件对象
}

util.inherits(Class, MVCObject);

/**
 * 注册对象的事件监听器
 * @grammar obj.addEventListener(type, handler[, key])
 * @param   {string}   type         自定义事件的名称
 * @param   {Function} handler      自定义事件被触发时应该调用的回调函数
 * @remark  事件类型区分大小写。如果自定义事件名称不是以小写"on"开头，该方法会给它加上"on"再进行判断，即"click"和"onclick"会被认为是同一种事件。 
 */
Class.prototype.addEventListener = function (type, handler) {
    typeof this.__listeners[type] != "object" && (this.__listeners[type] = []);
    this.__listeners[type].push(handler);

    return this;
};

/**
 * 移除对象的事件监听器。
 * @grammar obj.removeEventListener(type, handler)
 * @param {string}   type     事件类型
 * @param {Function} handler  要移除的事件监听函数
 * @remark  如果第二个参数handler没有被绑定到对应的自定义事件中，什么也不做。
 */
Class.prototype.removeEventListener = function (type, handler) {
    var fns = this.__listeners[type];

    if (!fns) {
        return false;
    }

    for (var i = fns.length; i >= 0; i--) {
        if (fns[i] === handler) {
            fns.splice(i, 1);
        }
    }

    return this;
};

/**
 * 派发自定义事件，使得绑定到自定义事件上面的函数都会被执行
 * @grammar obj.dispatchEvent(event, options)
 * @param {String} 事件名称
 * @param {Object} options 扩展参数
 */
Class.prototype.dispatchEvent = function (type, options) {
    var event = util.extend({}, options);

    var fns = this.__listeners[type];

    if (!fns) {
        return false;
    }

    for (var i = fns.length - 1; i >= 0; i--) {
        fns[i].call(this, event);
    }

    return this;
};

Class.prototype.dispose = function () {};
/**
 * @file  控制值域的类
 * @author nikai (@胖嘟嘟的骨头, nikai@baidu.com)
 */

'use strict';

function DataRange(layer) {
    Class.call(this);

    this.initOptions({
        min: 0,
        max: 0
    });

    this.set('layer', layer);
    this.bindTo('data', layer);
    this.bindTo('drawOptions', layer);
    this.bindTo('drawType', layer);

    var me = this;
}

util.inherits(DataRange, Class);

util.extend(DataRange.prototype, {
    defaultGradient: {
        '0.4': 'blue',
        '0.6': 'cyan',
        '0.7': 'lime',
        '0.8': 'yellow',
        '1.0': 'red'
    },
    colors: ['rgba(17, 102, 252, 0.8)', 'rgba(52, 139, 251, 0.8)', 'rgba(110, 176, 253, 0.8)', 'rgba(255, 241, 193, 0.8)', 'rgba(255, 146, 149, 0.8)', 'rgba(253, 98, 104, 0.8)', 'rgba(255, 0, 0, 0.8)', 'rgba(255, 51, 61, 0.8)'],

    // 根据count值获取对应的大小，在bubble绘制中用到
    getSize: function getSize(count) {
        var size = 1;
        var splitList = this.splitList;

        for (var i = 0; i < splitList.length; i++) {
            if ((splitList[i].start === undefined || splitList[i].start !== undefined && count >= splitList[i].start) && (splitList[i].end === undefined || splitList[i].end !== undefined && count < splitList[i].end)) {
                size = splitList[i].size;
                break;
            }
        }

        return size;
    },

    getScale: function getScale(count) {
        if (!this._linearScale) {
            this._linearScale = this.generateLinearScale();
        }
        return this._linearScale(count);
    },

    // 根据count值获取对应的颜色，在choropleth中使用
    getColorByRange: function getColorByRange(count) {
        var color = 'rgba(50, 50, 255, 1)';
        var splitList = this.splitList;

        for (var i = 0; i < splitList.length; i++) {
            if ((splitList[i].start === undefined || splitList[i].start !== undefined && count >= splitList[i].start) && (splitList[i].end === undefined || splitList[i].end !== undefined && count < splitList[i].end)) {
                color = splitList[i].color;
                break;
            }
        }

        return color;
    },

    data_changed: function data_changed() {
        var data = this.get('data');
        if (data && data.length > 0) {
            this._min = data[0].count;
            this._max = data[0].count;
            for (var i = 0; i < data.length; i++) {
                this._max = Math.max(this._max, data[i].count);
                this._min = Math.min(this._min, data[i].count);
            }
        }
    },

    drawType_changed: function drawType_changed() {
        this.update();
    },

    drawOptions_changed: function drawOptions_changed() {
        this.update();
    },

    update: function update() {

        var drawOptions = this.get("drawOptions");
        if (drawOptions && drawOptions.splitList) {
            this.splitList = drawOptions.splitList;
        } else {
            this.generalSplitList();
        }

        if (this.get("layer").getDrawType() === 'category') {
            if (drawOptions && drawOptions.splitList) {
                this.categorySplitList = drawOptions.splitList;
            } else {
                this.generalCategorySplitList();
            }
        }

        if (this.get("layer").getDrawType() === 'heatmap' || this.get("layer").getDrawType() === 'density' || this.get("layer").getDrawType() === 'intensity') {
            this.generalGradient(drawOptions.gradient || this.defaultGradient);
        }

        this.draw();
    },

    draw: function draw() {

        if (this.get("layer").getDataRangeControl()) {
            this.get("layer").dataRangeControl.show();

            if (this.get("layer").getDrawType() === 'category') {
                this.get("layer").dataRangeControl.drawCategorySplit(this.categorySplitList, this.get('drawOptions'));
            } else if (this.get("layer").getDrawType() === 'choropleth') {
                this.get("layer").dataRangeControl.drawChoroplethSplit(this.splitList, this.get('drawOptions'));
            } else {
                this.get("layer").dataRangeControl.hide();
            }
        }
    },

    generateLinearScale: function generateLinearScale() {
        var drawOptions = this.get("drawOptions");
        var scaleRange = drawOptions.scaleRange || [0.5, 1.5];
        return function (v) {
            if (this._min == this._max) {
                return 1;
            } else {
                return scaleRange[0] + (scaleRange[1] - scaleRange[0]) * (v - this._min) / (this._max - this._min);
            }
        };
    },

    generalSplitList: function generalSplitList() {
        var drawOptions = this.get("drawOptions");
        var splitOptions = util.extend({
            minSize: 1,
            maxSize: 9999,
            stepSize: 1,
            splitCount: 7
        }, drawOptions.splitOptions);

        var splitNum = Math.ceil((this._max - this._min) / splitOptions.splitCount);
        var index = this._min;
        this.splitList = [];
        var radius = splitOptions.minSize;
        while (index < this._max) {
            this.splitList.push({
                start: index,
                end: index + splitNum,
                size: radius,
                color: this.colors[radius - 1]
            });
            index += splitNum;
            radius = Math.min(radius + splitOptions.stepSize, splitOptions.maxSize);
        }
    },

    generalCategorySplitList: function generalCategorySplitList() {
        var colors = ['rgba(255, 255, 0, 0.8)', 'rgba(253, 98, 104, 0.8)', 'rgba(255, 146, 149, 0.8)', 'rgba(255, 241, 193, 0.8)', 'rgba(110, 176, 253, 0.8)', 'rgba(52, 139, 251, 0.8)', 'rgba(17, 102, 252, 0.8)'];
        var data = this.get("data");
        this.categorySplitList = {};
        var count = 0;
        for (var i = 0; i < data.length; i++) {
            if (this.categorySplitList[data[i].count] === undefined) {
                this.categorySplitList[data[i].count] = colors[count];
                count++;
            }
            if (count >= colors.length - 1) {
                break;
            }
        }

        this.categorySplitList['other'] = colors[colors.length - 1];
    },

    getCategoryColor: function getCategoryColor(count) {
        var splitList = this.categorySplitList;

        var color = splitList['other'];

        for (var i in splitList) {
            if (count == i) {
                color = splitList[i];
                break;
            }
        }

        return color;
    },

    generalGradient: function generalGradient(grad) {
        // create a 256x1 gradient that we'll use to turn a grayscale heatmap into a colored one
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var gradient = ctx.createLinearGradient(0, 0, 0, 256);

        canvas.width = 1;
        canvas.height = 256;

        for (var i in grad) {
            gradient.addColorStop(i, grad[i]);
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1, 256);

        this._grad = ctx.getImageData(0, 0, 1, 256).data;
    },

    getGradient: function getGradient() {
        return this._grad;
    },

    getColorByGradient: function getColorByGradient(count) {
        var max = this.get("max") || 10;

        var index = count / max;
        if (index > 1) {
            index = 1;
        }
        index *= 255;
        index = parseInt(index, 10);
        index *= 4;

        var color = 'rgba(' + this._grad[index] + ', ' + this._grad[index + 1] + ', ' + this._grad[index + 2] + ',' + this._grad[index + 3] + ')';
        return color;
    }

}); // end extend
/**
 * @file Animation.js
 */
'use strict';

function Animation(opts) {
    var defaultOptions = {
        duration: 1000, // 动画时长, 单位毫秒
        fps: 30, // 每秒帧数
        delay: 0, // 延迟执行时间，单位毫秒,如果delay为infinite则表示手动执行
        transition: Transitions.linear, // 若值为tick则为离散动画
        ticks: 0,
        onPause: function onPause() {}, // 调用pause暂停时的回调函数
        onStop: function onStop() {} // 调用stop停止时的回调函数
    };
    // 需要后续执行动画
    this._anis = [];

    if (opts) {
        for (var i in opts) {
            defaultOptions[i] = opts[i];
        }
    }
    this._opts = defaultOptions;

    this._runTime = 0;

    if (typeof this._opts.transition == 'string' && this._opts.transition !== 'tick') {
        this._opts.transition = Transitions[this._opts.transition] || Transitions.linear;
    }

    if (isNumber(defaultOptions.delay)) {
        var me = this;
        requestTimeout(function () {
            me.start();
        }, defaultOptions.delay);
    } else if (defaultOptions.delay != Animation.INFINITE) {
        this.start();
    }
}
/**
 * 常量，表示动画无限循环
 */
Animation.INFINITE = "INFINITE";
/**
 * 启动动画方法
 */
Animation.prototype.start = function () {
    if (this._opts.transition === 'tick') {
        if (this._opts.ticks > 0) {
            this._tick();
        } else {
            //console.error("No ticks to animate");
        }
    } else {
        this._beginTime = getCurrentTime();
        this._endTime = this._beginTime + this._opts.duration;
        this._launch();
    }
};

Animation.prototype.add = function (ani) {
    this._anis.push(ani);
};

Animation.prototype._tick = function () {
    var me = this;

    if (!me.schedule || me.schedule < 0) {
        me.schedule = 0;
    }

    if (me.schedule < me._opts.ticks) {
        if (me._opts.render) {
            me._opts.render(me.schedule);
        }
        me.schedule++;
        // 执行下一个tick
        if (!me.terminative) {
            me._timer = requestTimeout(function () {
                me._tick();
            }, 1000 / me._opts.fps);
        }
    } else {
        if (me._opts.finish) me._opts.finish();
        me.schedule = 0;
        // 开始后续动画
        if (me._anis.length > 0) {
            var newAni = me._anis[0];
            newAni._anis = [].concat(me._anis.slice(1));
            newAni.start();
        }
    }
};

Animation.prototype._launch = function () {
    var me = this;
    var now = getCurrentTime() + this._runTime;

    if (now >= me._endTime) {
        if (me._opts.render) me._opts.render(me._opts.transition(1));
        // finish()接口，时间线结束时对应的操作
        if (me._opts.finish) me._opts.finish();
        me.schedule = 0;
        me._runTime = 0;
        // 开始后续动画
        if (me._anis.length > 0) {
            var newAni = me._anis[0];
            newAni._anis = [].concat(me._anis.slice(1));
            newAni.start();
        }
        return;
    }

    me.schedule = me._opts.transition((now - me._beginTime) / me._opts.duration);
    // render()接口，用来实现每个脉冲所要实现的效果
    if (me._opts.render) me._opts.render(me.schedule);
    // 执行下一个动作
    if (!me.terminative) {
        me._timer = requestTimeout(function () {
            me._launch();
        }, 1000 / me._opts.fps);
    }
};

Animation.prototype.setSchedule = function (schedule, render) {
    if (this._opts.transition === 'tick') {
        schedule = parseInt((this._opts.ticks - 1) * schedule);
        this.schedule = schedule;
    } else {
        this._runTime = schedule * this._opts.duration;
    }

    if (this._timer) {
        clearRequestTimeout(this._timer);
        this._timer = null;
    }

    if (render && this._opts.render) this._opts.render(schedule);
};

/**
 * 暂停当前动画
 */
Animation.prototype.pause = function () {
    if (this._opts.transition !== 'tick') {
        var now = getCurrentTime();
        this._runTime += now - this._beginTime;
    }

    if (this._timer) {
        clearRequestTimeout(this._timer);
        this._timer = null;
    }

    this._opts.onPause(this.schedule);
};

/**
 * 停止当前动画
 * @type {Boolean 是否停止到动画的终止时刻}
 */
Animation.prototype.stop = function (gotoEnd) {
    this.terminative = true;
    for (var i = 0; i < this._anis.length; i++) {
        this._anis[i].stop();
        this._anis[i] = null;
    }
    this._anis.length = 0;
    if (this._timer) {
        clearRequestTimeout(this._timer);
        this._timer = null;
    }
    this._opts.onStop(this.schedule);

    if (this._opts.transition === 'tick') {
        if (gotoEnd) {
            this.schedule = this._opts.ticks - 1;
            this._tick();
        }
    } else {
        this._runTime = 0;

        if (gotoEnd) {
            this._endTime = this._beginTime;
            this._launch();
        }
    }
};

/**
 * 取消动画
 */
Animation.prototype.cancel = function () {
    if (this._timer) clearRequestTimeout(this._timer);
    this._endTime = this._beginTime;
    this.schedule = 0;
    this._runTime = 0;
};
/**
 * 设置动画结束后的回调函数
 * @param Function
 */
Animation.prototype.setFinishCallback = function (callback) {
    if (this._anis.length > 0) {
        this._anis[this._anis.length - 1]._opts.finish = callback;
    } else {
        this._opts.finish = callback;
    }
};
/**
 * 变换效果函数库
 */
var Transitions = {
    linear: function linear(t) {
        return t;
    },
    reverse: function reverse(t) {
        return 1 - t;
    },
    easeInQuad: function easeInQuad(t) {
        return t * t;
    },
    easeInCubic: function easeInCubic(t) {
        return Math.pow(t, 3);
    },
    easeOutQuad: function easeOutQuad(t) {
        return -(t * (t - 2));
    },
    easeOutCubic: function easeOutCubic(t) {
        return Math.pow(t - 1, 3) + 1;
    },
    easeInOutQuad: function easeInOutQuad(t) {
        if (t < 0.5) {
            return t * t * 2;
        } else {
            return -2 * (t - 2) * t - 1;
        }
        return;
    },
    easeInOutCubic: function easeInOutCubic(t) {
        if (t < 0.5) {
            return Math.pow(t, 3) * 4;
        } else {
            return Math.pow(t - 1, 3) * 4 + 1;
        }
    },
    easeInOutSine: function easeInOutSine(t) {
        return (1 - Math.cos(Math.PI * t)) / 2;
    }
};
Transitions['ease-in'] = Transitions.easeInQuad;
Transitions['ease-out'] = Transitions.easeOutQuad;

/**
 * 获取当前时间
 * @returns {String} 当前时间
 */
function getCurrentTime() {
    return new Date().getTime();
}

/**
 * 是否是数字
 * @param {Mix}
 * @returns {Boolean}
 */
function isNumber(number) {
    return typeof number == "number";
}
/**
 * @file  控制大小值域的类
 * @author nikai (@胖嘟嘟的骨头, nikai@baidu.com)
 */

"use strict";

function SizeDataRange() {
    DataRange.call(this);
}

util.inherits(SizeDataRange, DataRange);

util.extend(SizeDataRange.prototype, {}); // end extend
"use strict";

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function ( /* function */callback, /* DOMElement */element) {
        window.setTimeout(callback, 1000 / 60);
    };
})();

/**
 * Behaves the same as setInterval except uses requestAnimationFrame() where possible for better performance
 * @param {function} fn The callback function
 * @param {int} delay The delay in milliseconds
 */
window.requestInterval = function (fn, delay) {
    if (!window.requestAnimationFrame && !window.webkitRequestAnimationFrame && !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
    !window.oRequestAnimationFrame && !window.msRequestAnimationFrame) return window.setInterval(fn, delay);

    var start = new Date().getTime(),
        handle = new Object();

    function loop() {
        var current = new Date().getTime(),
            delta = current - start;
        var stop = false;

        if (delta >= delay) {
            stop = fn.call();
            start = new Date().getTime();
        }
        if (stop !== true) {
            handle.value = requestAnimFrame(loop);
        }
    }

    handle.value = requestAnimFrame(loop);
    return handle;
};

/**
 * Behaves the same as clearInterval except uses cancelRequestAnimationFrame() where possible for better performance
 * @param {int|object} fn The callback function
 */
window.clearRequestInterval = function (handle) {
    window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) : window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame(handle.value) : window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value) : /* Support for legacy API */
    window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) : window.oCancelRequestAnimationFrame ? window.oCancelRequestAnimationFrame(handle.value) : window.msCancelRequestAnimationFrame ? window.msCancelRequestAnimationFrame(handle.value) : clearInterval(handle);
};

/**
 * Behaves the same as setTimeout except uses requestAnimationFrame() where possible for better performance
 * @param {function} fn The callback function
 * @param {int} delay The delay in milliseconds
 */

window.requestTimeout = function (fn, delay) {
    if (!window.requestAnimationFrame && !window.webkitRequestAnimationFrame && !(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
    !window.oRequestAnimationFrame && !window.msRequestAnimationFrame) return window.setTimeout(fn, delay);

    var start = new Date().getTime(),
        handle = new Object();

    function loop() {
        var current = new Date().getTime(),
            delta = current - start;

        delta >= delay ? fn.call() : handle.value = requestAnimFrame(loop);
    };

    handle.value = requestAnimFrame(loop);
    return handle;
};

/**
 * Behaves the same as clearTimeout except uses cancelRequestAnimationFrame() where possible for better performance
 * @param {int|object} fn The callback function
 */
window.clearRequestTimeout = function (handle) {
    window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) : window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame(handle.value) : window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value) : /* Support for legacy API */
    window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) : window.oCancelRequestAnimationFrame ? window.oCancelRequestAnimationFrame(handle.value) : window.msCancelRequestAnimationFrame ? window.msCancelRequestAnimationFrame(handle.value) : clearTimeout(handle);
};
/**
 * @author nikai (@胖嘟嘟的骨头, nikai@baidu.com)
 * 地图可视化库，目前依赖与百度地图api，在百度地图api上展示点数据
 *
 */

/**
 * Mapv主类
 * @param {Object}
 */
'use strict';

function Mapv(options) {
    Class.call(this);

    this.initOptions(Object.assign({
        useLeaflet: false,
        map: null, //地图参数
        coordType: 'bd09ll',
        drawTypeControl: false,
        drawTypeControlOptions: {
            a: 1
        },
        click: null,
        hover: null,
        tap: null

    }, options));

    this._layers = [];

    this._topLayer = null;

    this._container = this.getMap().getContainer();

    this._initEvents();

    //this._initDrawScale();
    this._fixPinchZoom();

    this.notify('drawTypeControl');
}

util.inherits(Mapv, Class);

Mapv.prototype._initDrawScale = function () {
    this.Scale = new DrawScale();
};

Mapv.prototype.drawTypeControl_changed = function () {
    if (this.getDrawTypeControl()) {
        if (!this.drawTypeControl) {
            this.drawTypeControl = new DrawTypeControl({
                mapv: this
            });
        }
        this.getMap().addControl(this.drawTypeControl);
    } else {
        if (this.drawTypeControl) {
            this.getMap().removeControl(this.drawTypeControl);
        }
    }
};

Mapv.prototype.useLeaflet = function () {
    return this.get("useLeaflet");
};

Mapv.prototype._initEvents = function () {
    var bmap = this.getMap();
    var that = this;

    var elementsFound = [];

    var listener = function listener(e) {
        var target = e.target || e.srcElement;
        if (e.type !== 'tap' && target.tagName.toLowerCase() !== 'canvas') return;

        var rect = this.getBoundingClientRect(),
            x = e.clientX - rect.left,
            y = e.clientY - rect.top;

        var layers = that._layers;
        var results = [];

        var handler = that._getHandler(e.type);

        // console.time('find element');
        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];

            if (layer.getContext() === 'webgl') continue;

            // used for debug: draw the touch point
            // if (i == 0) {
            //     var ctx = layer.getCtx();
            //     var pixelRatio = util.getPixelRatio(ctx);
            //     ctx.save();
            //     ctx.scale(pixelRatio, pixelRatio);
            //     ctx.moveTo(x, y);
            //     ctx.fillStyle = 'black';
            //     ctx.arc(x, y, 2, 0, 2 * Math.PI, false);
            //     ctx.fill();
            //     ctx.restore();
            // }

            var elem = layer.findElementAtPoint(x, y);
            if (elem) {
                // 找到一个元素后就往下层搜寻
                results.push(elem.data);
                // console.log('got it!');

                // 取消其他图层的高亮状态
                for (var j = 0; j < layers.length; j++) {
                    if (i == j) continue;
                    layers[j].clearHighlight();
                }

                break;
            }
        }
        // console.timeEnd('find element');

        // 当再次hover不到元素时，不执行回调
        if (e.type == 'mousemove' && elementsFound.length == 0 && results.length == 0) return;

        elementsFound = results;

        // console.log("find elements at (%f, %f) : %o", x, y, results);
        if (handler && typeof handler == 'function') {
            handler(results, e);
        }
    };

    if (this._getHandler('click')) {
        bmap.getContainer().addEventListener('click', listener);

        // handle tap event
        var _touchStarted = false;
        var _touchMoved = false;
        var _currX = 0;
        var _currY = 0;
        var _cachedX = 0;
        var _cachedY = 0;
        var _touches;

        bmap.addEventListener('touchstart', function (e) {
            var pointer = e.targetTouches[0];
            _currX = _cachedX = pointer.clientX;
            _currY = _cachedY = pointer.clientY;
            _touchStarted = true;

            var that = this;
            (function (e) {
                setTimeout(function () {
                    if (_cachedX == _currX && !_touchStarted & _cachedY == _currY) {
                        var tap_e = document.createEvent('Event');
                        tap_e.initEvent('tap', true, true);
                        tap_e.clientX = _cachedX;
                        tap_e.clientY = _cachedY;
                        listener.call(that.getContainer(), tap_e);
                    }
                }, 200);
            })(e);
        });

        bmap.addEventListener('touchend', function (e) {
            _touchStarted = false;
        });

        bmap.addEventListener('touchmove', function (e) {
            var pointer = e.changedTouches[0];
            _currX = pointer.clientX;
            _currY = pointer.clientY;
        });
    }

    if (this._getHandler('hover')) {
        bmap.getContainer().addEventListener('mousemove', listener);
        bmap.getContainer().addEventListener('mouseleave', function (e) {
            var handler = that._getHandler('hover');
            if (handler && typeof handler === 'function') handler([], e);
        });
    }
};

// 执行pinch手势操作后，将地图的中心点改为两个触摸点的中心点，
// 使放大的区域能够显示在viewport的中心
Mapv.prototype._fixPinchZoom = function () {
    var bmap = this.getMap();
    var _zoom = bmap.getZoom();
    var _touchMidPoint;
    var _offset = bmap.getContainer().getBoundingClientRect();

    bmap.addEventListener('touchstart', function (e) {
        if (e.targetTouches.length == 2) {
            var touches = e.targetTouches;

            var middlePoint = {
                x: (touches[0].clientX + touches[1].clientX) / 2 - _offset.left,
                y: (touches[0].clientY + touches[1].clientY) / 2 - _offset.top
            };

            _touchMidPoint = bmap.pixelToPoint(middlePoint);
        }
    });

    bmap.addEventListener('touchcancel', function (e) {
        _touchMidPoint = null;
    });

    bmap.addEventListener('zoomend', function (e) {
        var newZoom = bmap.getZoom();
        if (newZoom > _zoom && _touchMidPoint) {
            // 放大时才修改中心点
            bmap.panTo(_touchMidPoint);
        }
        _zoom = newZoom;
        _touchMidPoint = null;
    });
};

Mapv.prototype._getHandler = function (type) {
    switch (type) {
        case 'tap':
        case 'click':
            return this.getClick();

        case 'hover':
        case 'mousemove':
            return this.getHover();

        default:
            return null;
    }
};

Mapv.prototype.pauseTimeAnimation = function () {
    this._layers.forEach(function (layer) {
        if (layer.playControl) {
            layer.playControl.pause();
        }
    });
};

Mapv.prototype.startTimeAnimation = function () {
    this._layers.forEach(function (layer) {
        if (layer.playControl) {
            layer.playControl.start();
        }
    });
};

Mapv.prototype.addLayer = function (layer) {
    if (layer) {
        this._layers.push(layer);
        this._topLayer = layer;
    }
};

Mapv.prototype.clearAllLayer = function () {
    var map = this.getMap();
    while (this._layers.length > 0) {
        var layer = this._layers.shift();
        if (this.useLeaflet()) {
            map.removeLayer(layer.canvasLayer);
        } else {
            map.removeOverlay(layer.canvasLayer);
        }
        if (layer.playControl) {
            map.removeControl(layer.playControl);
        }
    }
};

Mapv.prototype.highlight = function (layerIndex, pointIndex) {
    var layer = this._layers[layerIndex];
    if (layer) {
        layer.highlight(pointIndex);
    }
};
/**
 * 一直覆盖在当前地图视野的Canvas对象
 *
 * @author nikai (@胖嘟嘟的骨头, nikai@baidu.com)
 *
 * @param 
 * {
 *     map 地图实例对象
 * }
 */

'use strict';

function CanvasLayer(options) {
    this.options = options || {};
    this.paneName = this.options.paneName || 'mapPane';
    this.zIndex = this.options.zIndex || 0;
    this.context = this.options.context || '2d';
    this._map = options.map;
    this.show();
}

CanvasLayer.prototype = window.BMap ? new BMap.Overlay() : {};

CanvasLayer.prototype.initialize = function (map) {
    this._map = map;
    var canvas = this.canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;" + "left:0;" + "top:0;" + "z-index:" + this.zIndex + ";";
    this.adjustSize();
    map.getPanes()[this.paneName].appendChild(canvas);
    var that = this;

    map.addEventListener('resize', function () {
        that.adjustSize();
        that.draw();
    });

    return this.canvas;
};

CanvasLayer.prototype.adjustSize = function () {
    var size = this._map.getSize();
    var canvas = this.canvas;
    var pixelRatio;

    if (this.context == 'webgl') {
        pixelRatio = 1;
    } else {
        pixelRatio = util.getPixelRatio(canvas.getContext('2d'));
    }

    canvas.width = size.width * pixelRatio;
    canvas.height = size.height * pixelRatio;
    canvas.style.width = size.width + "px";
    canvas.style.height = size.height + "px";
};

CanvasLayer.prototype.draw = function () {
    var map = this._map;
    var size = map.getSize();
    var center = map.getCenter();
    if (center) {
        var pixel = map.pointToOverlayPixel(center);
        this.canvas.style.left = pixel.x - size.width / 2 + 'px';
        this.canvas.style.top = pixel.y - size.height / 2 + 'px';
        this.dispatchEvent('draw');
        this.options.update && this.options.update.call(this);
    }
};

CanvasLayer.prototype.getContainer = function () {
    return this.canvas;
};

CanvasLayer.prototype.show = function () {
    if (!this.canvas) {
        this._map.addOverlay(this);
    }
    this.canvas.style.display = "block";
};

CanvasLayer.prototype.hide = function () {
    this.canvas.style.display = "none";
};

CanvasLayer.prototype.setZIndex = function (zIndex) {
    this.canvas.style.zIndex = zIndex;
};

CanvasLayer.prototype.getZIndex = function () {
    return this.zIndex;
};
/**
 * @author nikai (@胖嘟嘟的骨头, nikai@baidu.com)
 */

'use strict';

function Layer(options) {
    Class.call(this);

    this._drawer = {};

    this.initOptions($.extend({
        ctx: null,
        animationCtx: null,
        mapv: null,
        paneName: 'mapPane',
        map: null,
        context: '2d',
        data: [],
        dataType: 'point',
        animationOptions: {
            size: 5
        },
        coordType: 'bd09ll',
        drawType: 'simple',
        animation: false,
        geometry: null,
        dataRangeControl: false,
        zIndex: 1,
        forceDrawEverything: false,  // 是否强制画出所有点，即使点不在可视区域
        preserveDrawingBuffer: true   //用于导出图片时能使用webgl的绘制缓存

    }, options));

    // hold the element drawed in the layer that need to highlight
    this._highlightElement = null;

    this._id = Math.random();

    // this.dataRangeControl = new DataRangeControl();
    // this.Scale = new DrawScale();

    this.notify('data');
    this.notify('mapv');
}

util.inherits(Layer, Class);

util.extend(Layer.prototype, {
    initialize: function initialize() {

        if (this.canvasLayer) {
            return;
        }

        this.bindTo('map', this.getMapv());

        var that = this;

        if (this.getMapv().useLeaflet()) {
            this.canvasLayer = new LeafletLayer({
                map: this.getMap(),
                context: this.getContext(),
                zIndex: this.getZIndex(),
                onUpdate: function onUpdate() {
                    that.draw();
                }
            });

            this.getMap().addLayer(this.canvasLayer);
        } else {

            this.getMap().addControl(this.dataRangeControl);
            this.getMap().addControl(this.Scale);

            this.canvasLayer = new CanvasLayer({
                map: this.getMap(),
                context: this.getContext(),
                zIndex: this.getZIndex(),
                paneName: this.getPaneName(),
                update: function update() {
                    that.draw();
                },
                elementTag: "canvas"
            });
        }

        var context = this.getContext();
        if (context === 'webgl') {
            this.setCtx(this.canvasLayer.getContainer().getContext(context, { preserveDrawingBuffer: this.getPreserveDrawingBuffer() }));
        } else {
            this.setCtx(this.canvasLayer.getContainer().getContext(context));
        }
    },

    show: function show() {
        this.canvasLayer && this.canvasLayer.show();
    },

    hide: function hide() {
        this.canvasLayer && this.canvasLayer.hide();
    },

    draw: function draw(remainLayout) {
        var dataType = this.getDataType();
        var drawOptions = this.getDrawOptions();
        var me = this;

        if (!this.getMapv()) {
            return;
        }

        this._getDrawer().clearTimer();

        var ctx = this.getCtx();

        if (!ctx) {
            return false;
        }

        var data = this.getData();
        if (!data || !data.length) {
            ctx.save();
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.restore();
            return true;
        }

        if (!remainLayout) {
            this._calculatePixel();
        }

        if (dataType === 'trackline' && this.getAnimation() === 'time') {
            const customOptions = this.getCustomOptions();
            // 由屏幕坐标直接插值，避免经纬度插值再次转屏幕坐标造成精度损失，线条出现锯齿问题
            let interpData = data[0].plocations.map(pt => ({lng: pt[0], lat: pt[1]}));
            let drawCurvePoints = CurveUtil.getPoints(interpData, {count:customOptions.count});
            data[0].pgeo = drawCurvePoints.map((pt, index) => [pt[0], pt[1], index]);
        }

        if (dataType === 'ripple' && !this.getAnimation()) {
            var self = this;
            if (this._rafLoop) {
                window.clearRequestInterval(this._rafLoop);
            }

            var loop = function loop() {
                ctx.save();
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                // ctx.globalCompositeOperation = 'copy';
                // ctx.globalAlpha = 0.1;
                // ctx.drawImage(ctx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.restore();
                return self._getDrawer().drawMap();
            };

            var fps = 1000 / (this.getDrawOptions().fps || 30);
            this._rafLoop = window.requestInterval(loop, fps);
            loop();
            return true;
        }

        // 没有动画，直接绘制
        if (!this.getAnimation() || this._animationTime) {
            if (this.getContext() == '2d') {
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            }
            this._getDrawer().drawMap(this._curTick, null, (this.timeline && isNumber(this.timeline.schedule)) ? this.timeline.schedule : 0);
        }

        // 带动画的绘制
        var animationOptions = this.getAnimationOptions() || {};
        var iconImage = null;

        if (this.getAnimation() && !this._animationTime) {
            this._animationTime = true;
            if (drawOptions.icon && drawOptions.icon.type === "image") {
                (iconImage = new Image()).src = drawOptions.icon.url;
            }

            var drawMap = function drawMap(time, nextTick) {
                if (me.getDataType() === 'ripple') {
                    if (me._rafLoop) {
                        window.clearRequestInterval(me._rafLoop);
                    }

                    var loop = function loop() {
                        ctx.save();
                        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                        ctx.restore();
                        me._getDrawer().drawMap(time, nextTick);
                    };

                    var fps = 1000 / (me.getDrawOptions().fps || 30);
                    me._rafLoop = window.requestInterval(loop, fps);
                } else {
                    if (me.getContext() == '2d') {
                        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    }
                    if (iconImage) {
                        iconImage.onerror = function () {
                            //console.error("icon image loaded fail.");
                        };
                        iconImage.onload = function () {
                            me._getDrawer().drawMap(time, nextTick, null, this);
                        };
                    }
                    else {
                        me._getDrawer().drawMap(time, nextTick, null);
                    }
                }

                me._curTick = time;
            };

            if (this.getAnimation() == 'time' && dataType !== 'trackline' && dataType !== 'trackPoint') {
                // 时变类型
                // 除polyline为连续动画外，其他类型都为离散动画
                var animationOpt, controlOpt;

                if (/*dataType === 'polyline' || */dataType === 'trailline') {
                    animationOpt = {
                        duration: animationOptions.duration || 10000,
                        transition: Transitions[animationOptions.transition || "linear"],
                        fps: animationOptions.fps || 30, // 每秒帧数
                        render: function render(e) {
                            if (me.getContext() == '2d') {
                                if (dataType === 'trailline') {
                                    if (drawOptions.icon && drawOptions.icon.type === "circle") {
                                        ctx.save();
                                        ctx.globalCompositeOperation = 'copy'// 'copy';
                                        ctx.globalAlpha = 0.85;
                                        ctx.drawImage(ctx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
                                        //ctx.fillStyle = 'rgba(0,0,0,0.8)'
                                        //ctx.globalCompositeOperation = 'destination-in';
                                        ctx.restore();
                                    }
                                    else {
                                        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                                    }
                                } else {
                                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                                }
                            }
                            var time = parseInt(parseFloat(me._minTime) + (me._maxTime - me._minTime) * e);
                            me._getDrawer().drawMap(time, null, e, iconImage);
                            animationOptions.render && animationOptions.render(time);
                            me._curTick = time;

                            me.playControl && me.playControl.update(time);
                        }
                    };

                    controlOpt = {
                        min: me._minTime,
                        max: me._maxTime,
                        tickFormatter: animationOptions.tickFormatter || function (tick, tickType) {
                            return new Date(+tick).toLocaleString();
                        }
                    };
                } else {
                    animationOpt = {
                        transition: 'tick',
                        ticks: this._ticks.length,
                        fps: animationOptions.fps || 1, // 每秒帧数
                        render: function render(tick) {
                            var time = me._ticks[tick],
                                nextTick = me._ticks[tick+1] || (time+1);
                            drawMap(time, nextTick);

                            animationOptions.render && animationOptions.render(time);

                            me.playControl && me.playControl.update(tick);
                        }
                    };

                    var formatter = animationOptions.tickFormatter || function (time, tickType) {
                        return new Date(+time).toLocaleString();
                    };

                    controlOpt = {
                        min: 0,
                        max: me._ticks.length - 1,
                        tickFormatter: function tickFormatter(tick, tickType) {
                            return formatter(me._ticks[tick], tickType);
                        }
                    };
                }
           
                animationOpt = util.extend(animationOpt, {
                    delay: animationOptions.delay || Animation.INFINITE, // 延迟执行时间，单位毫秒,如果delay为infinite则表示手动执行
                    onStop: animationOptions.onStop || function (e) {// 调用stop停止时的回调函数
                        // console.log('stop', e);
                    }
                });

                controlOpt = util.extend(controlOpt, animationOptions.control);

                var timeline = this.timeline = new Animation(animationOpt);

                timeline.setFinishCallback(function () {
                    if (animationOptions.loop) {
                        setTimeout(function () {
                            timeline.start();
                        }, animationOptions.loopInterval || 300);
                    } else {
                        me.playControl && me.playControl.setState('stop');
                    }
                    animationOptions.onAnimateFinish && animationOptions.onAnimateFinish.call(this);
                });

                var playControl = this.playControl;

                if (playControl) {
                    playControl.setOptions(controlOpt);
                } else {
                    playControl = this.playControl = new PlaybackControl(null, controlOpt);
                    this.getMap().addControl(playControl);
                }

                playControl.bindAnimation(timeline);

                if (/*dataType === 'polyline' || */dataType == 'trailline') {
                    drawMap(me._minTime);
                } else {
                    drawMap(this._ticks[0], this._ticks[1]);
                }
            }  else if (this.getAnimation() == 'time' && (dataType === 'trackline' || dataType === 'trackPoint')) {
                let animationOpts = {
                    duration: animationOptions.duration || 10000,
                    transition: Transitions[animationOptions.transition || "linear"],
                    fps: animationOptions.fps || 30, // 每秒帧数
                    delay: animationOptions.delay || Animation.INFINITE, // 延迟执行时间，单位毫秒,如果delay为infinite则表示手动执行
                    onStop: animationOptions.onStop || function (e) {// 调用stop停止时的回调函数
                        // console.log('stop', e);
                    },
                    render: function render(e) {
                        if (me.getContext() == '2d' && dataType !== 'trackPoint') {
                            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                        }
                        let min = me._minTime;
                        let max = me._maxTime;
                        if (dataType === 'trackPoint') {
                            min = me._min;
                            max = me._max;
                        }
                        let time = parseInt(parseFloat(min) + (max - min) * e);
                        me._getDrawer().drawMap(time);
                        me._curTick = time;
                        animationOptions.render && animationOptions.render(time);
                    }
                };
                var timeline = this.timeline = new Animation(animationOpts);
                timeline.setFinishCallback(function () {
                    if (animationOptions.loop) {
                        setTimeout(function () {
                            timeline.start();
                        }, animationOptions.loopInterval || 300);
                    }
                    animationOptions.onAnimateFinish && animationOptions.onAnimateFinish.call(this);
                });
            }  else {
                // 渐进动画
                if (this.getDrawOptions().icon) {
                    if (this.getContext() == '2d') {
                        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    }
                    this._getDrawer().drawMap();

                    var canvas = me.canvasLayer.getContainer();
                    canvas.style.transform = "translate(0, -100)";
                    canvas.style.opacity = 0;
                    var timeline = this.timeline = new Animation({
                        duration: animationOptions.duration || 1000, // 动画时长, 单位毫秒
                        fps: animationOptions.fps || 30, // 每秒帧数
                        delay: animationOptions.delay || Animation.INFINITE, // 延迟执行时间，单位毫秒,如果delay为infinite则表示手动执行
                        transition: Transitions[animationOptions.transition || "linear"],
                        onStop: animationOptions.onStop || function (e) {
                            // 调用stop停止时的回调函数
                            console.log('stop', e);
                        },
                        render: function render(e) {
                            var offset = -(1 - e) * 100;
                            var canvas = me.canvasLayer.getContainer();
                            canvas.style.transform = "translate(0, " + offset + "px)";
                            canvas.style.opacity = e;
                            animationOptions.render && animationOptions.render(time);
                        }
                    });

                    timeline.start();
                } else {
                    var timeline = this.timeline = new Animation({
                        duration: animationOptions.duration || 1000, // 动画时长, 单位毫秒
                        fps: animationOptions.fps || 30, // 每秒帧数
                        delay: animationOptions.delay || Animation.INFINITE, // 延迟执行时间，单位毫秒,如果delay为infinite则表示手动执行
                        transition: Transitions[animationOptions.transition || "linear"],
                        onStop: animationOptions.onStop || function (e) {
                            // 调用stop停止时的回调函数
                            console.log('stop', e);
                        },
                        render: function render(e) {
                            if (me.getContext() == '2d') {
                                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                            }
                            me._getDrawer().drawMap(e);
                            animationOptions.render && animationOptions.render(time);
                        }
                    });
                    timeline.start();
                }
            }
        }

        this.dispatchEvent('draw');

        return true;
    },

    mapv_changed: function mapv_changed() {
        // console.log('mapv_changed');
        if (!this.getMapv()) {
            this.canvasLayer && this.canvasLayer.hide();
            return;
        } else {
            this.canvasLayer && this.canvasLayer.show();
        }

        this.initialize();

        // this.updateControl();

        this.draw();

        this.getMapv().addLayer(this);
    },

    drawType_changed: function drawType_changed() {
        // console.log('dataType_changed');
        // this.updateControl();
        this.draw();
    },

    drawOptions_changed: function drawOptions_changed() {
        // console.log('drawOptions_changed');
        this.draw();
    },

    updateControl: function updateControl() {
        var mapv = this.getMapv();

        if (!mapv) {
            return;
        }

        var drawer = this._getDrawer();
        var map = this.getMap();

        // for drawer scale
        if (drawer.scale && this.getDataRangeControl()) {
            drawer.scale(this.Scale);
            this.Scale.show();
        } else {
            this.Scale.hide();
        }

        // mapv._drawTypeControl.showLayer(this);
        this.getMapv().OptionalData && this.getMapv().OptionalData.initController(this, this.getDrawType());
    },

    getDrawedElements: function getDrawedElements() {
        return this._getDrawer().getElementPaths();
    },

    _getDrawer: function _getDrawer() {
        var drawType = this.getDrawType();
        if (!this._drawer[drawType]) {
            var funcName = drawType.replace(/(\w)/, function (v) {
                return v.toUpperCase();
            });
            funcName += 'Drawer';
            var drawer = this._drawer[drawType] = eval('(new ' + funcName + '(this))');
            // if (drawer.scale) {
            //     if (this.getMapv()) {
            //         drawer.scale(this.Scale);
            //         this.Scale.show();
            //     }
            // } else {
            //     this.Scale.hide();
            // }
        }
        return this._drawer[drawType];
    },

    _latLngToPixel: function _latLngToPixel(point) {
        var useLeaflet = this.getMapv().useLeaflet();
        var map = this.getMapv().getMap();
        var pixel;

        if (useLeaflet) {
            pixel = map.latLngToContainerPoint(L.latLng(point.lat, point.lng));
            point.px = pixel.x;
            point.py = pixel.y;
        } else {
            pixel = map.pointToPixel(new BMap.Point(point.lng, point.lat));
            point.px = pixel.x;
            point.py = pixel.y;
        }
        return point;
    },

    _calculatePixel: function _calculatePixel() {
        var useLeaflet = this.getMapv().useLeaflet();
        var map = this.getMapv().getMap();
        var mercatorProjection = !useLeaflet && map.getMapType().getProjection();

        console.time('parseData');
        // 墨卡托坐标计算方法
        var zoom = map.getZoom();
        var zoomUnit = Math.pow(2, 18 - zoom);
        var mcCenter = useLeaflet ? map.latLngToContainerPoint(map.getCenter()) : mercatorProjection.lngLatToPoint(map.getCenter());
        var nwMc;

        if (!useLeaflet) {
            nwMc = new BMap.Pixel(mcCenter.x - map.getSize().width / 2 * zoomUnit, mcCenter.y + map.getSize().height / 2 * zoomUnit); //左上角墨卡托坐标
        }

        var data = this.getData();
        var map = this.getMap();

        var isTrailLine = this.getDataType() === 'trailline';
        var isTrackLine = this.getDataType() === 'trackline';

        for (var j = 0; j < data.length; j++) {
            if (data[j].lng && data[j].lat && !data[j].x && !data[j].y) {
                // var pixel;
                // if (useLeaflet) {
                //     pixel = map.latLngToContainerPoint(L.latLng(data[j].lat, data[j].lng));
                //     data[j].px = pixel.x;
                //     data[j].py = pixel.y;

                // } else {
                //     pixel = map.pointToPixel(new BMap.Point(data[j].lng, data[j].lat));
                //     data[j].px = pixel.x;
                //     data[j].py = pixel.y;
                // }
                this._latLngToPixel(data[j]);
            } else if (data[j].geo) {
                var tmp = [];
                for (var i = 0; i < data[j].geo.length; i++) {
                    var size = parseFloat(data[j].geo[i][3]);
                    var pixel = this._latLngToPixel({ lng: data[j].geo[i][0], lat: data[j].geo[i][1] });
                    tmp.push([pixel.px, pixel.py, parseFloat(data[j].geo[i][2]), size]);
                }
                data[j].pgeo = tmp;

                if (isTrackLine) {
                    let temp = [];
                    for (let i = 0; i < data[j].locations.length; i++) {
                        let pixel = this._latLngToPixel({ lng: data[j].locations[i][0], lat: data[j].locations[i][1] });
                        temp.push([pixel.px, pixel.py]);
                    }
                    data[j].plocations = temp;
                }

                if (isTrailLine) {
                    // 对所有点进行线性插值，使之运动变得平滑
                    var actualPgeo = [];
                    for (var i = 0; i < tmp.length - 1; i++) {
                        var cur = tmp[i],
                            next = tmp[i + 1];
                        var offset = {
                            px: next[0] - cur[0],
                            py: next[1] - cur[1],
                            t: next[2] - cur[2]
                        };
                        var dist = Math.sqrt(Math.pow(offset.px, 2) + Math.pow(offset.py, 2));
                        var step = 1 / dist;

                        actualPgeo.push(cur);

                        if (!isNaN(step) && step < 1) {
                            var tickCount = Math.min(1 / step - 1, 100); //  限定最多的插值点为100个
                            var lerpPoint = cur.slice();
                            while (tickCount > 0) {
                                lerpPoint[0] += offset.px * step;
                                lerpPoint[1] += offset.py * step;

                                if (!isNaN(offset.t)) {
                                    lerpPoint[2] += offset.t * step;
                                }

                                actualPgeo.push(lerpPoint);

                                lerpPoint = lerpPoint.slice();

                                tickCount--;
                            }
                        }
                    }

                    actualPgeo.push(tmp[tmp.length - 1]);

                    data[j].pgeo = actualPgeo;
                }
            }
        }
        console.timeEnd('parseData');
    },
    data_changed: function data_changed() {
        // console.log('data_changed');
        // var useLeaflet = this.getMapv().get("useLeaflet"); // 未使用变量
        
        var data = this.getData();
        var dataType = this.getDataType();

        if (data) {
            // 坐标系转换
            var mapCoordType = '',
                layerCoordType = this.getCoordType();
            if( !!this.getMapv() ){
                mapCoordType = this.getMapv().get("coordType")
            } else{
                mapCoordType = 'bd09ll';
            }

            if (layerCoordType != mapCoordType) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].geo) {
                        data[i].geo.forEach(function (p) {
                            var transformedGeo = GeoUtil.transform({ lng: p[0], lat: p[1] }, layerCoordType, mapCoordType);
                            p[0] = transformedGeo.lng;
                            p[1] = transformedGeo.lat;
                        });
                    } else {
                        var transformedGeo = GeoUtil.transform(data[i], layerCoordType, mapCoordType);
                        data[i].lng = transformedGeo.lng;
                        data[i].lat = transformedGeo.lat;
                    }
                }
            }

            if (this.getAnimation() === 'time' && (dataType === 'point' || dataType == 'ripple')) {
                // 时变动画时，按时间排序
                // data.sort(function (a, b) {
                //     return a.t - b.t;
                // });

                var animateOpt = this.getAnimationOptions();
                var interval = animateOpt && animateOpt.interval;

                if (!interval) {
                    var nextTick = this._minTime = data[0] && data[0].t;
                    this._maxTime = this._minTime;
                    this._ticks = [nextTick];

                    for (var i = 1; i < data.length; i++) {
                        var time = data[i].t;
                        this._minTime = Math.min(this._minTime, time);
                        this._maxTime = Math.max(this._maxTime, time);
                        if (time > nextTick) {
                            nextTick = time;
                            this._ticks.push(nextTick);
                        }
                    }
                } else {
                    var intervalCount = interval.split("-")[0] || 1,
                        intervalType = interval.split("-")[1] || 'day';
                    this._minTime = data[0] && data[0].t;
                    this._maxTime = data[data.length - 1] && data[data.length - 1].t;
                    this._ticks = [this._minTime];
                    if (this._minTime !== this._maxTime) {
                        var start = this._minTime;
                        var maxCount = 100000;
                        while(start < this._maxTime) {
                            start = util.dateAdd(start, intervalCount, intervalType);
                            this._ticks.push(Math.min(start, this._maxTime));
                            maxCount--;
                            if (maxCount < 0) {
                                //console.error('too much frames');
                                break;
                            }
                        }
                    }
                }

                // console.log(this._ticks);
            } else if (this.getDrawType() === 'simple' && dataType === 'point') {
                    // 对气泡从大到小进行排序，确保小气泡总是画在大气泡的上面
                    data.sort(function (a, b) {
                        return b.count - a.count;
                    });
                }

            if ((dataType === "polyline" || dataType === 'trailline' || dataType === 'trackline') && this.getAnimation() === 'time') {
                this._minTime = data[0] && data[0].geo[0][2];
                this._maxTime = this._minTime;
                for (var i = 0; i < data.length; i++) {
                    var geo = data[i].geo;
                    for (var j = 0; j < geo.length; j++) {
                        var time = geo[j][2];
                        if (time < this._minTime) {
                            this._minTime = time;
                        }
                        if (time > this._maxTime) {
                            this._maxTime = time;
                        }
                    }
                }
                var animateOpt = this.getAnimationOptions();
                var interval = (animateOpt && animateOpt.interval) || '1-day';
                var intervalCount = interval.split("-")[0] || 1,
                    intervalType = interval.split("-")[1] || 'day';
                this._ticks = [this._minTime];
                if (this._minTime !== this._maxTime) {
                    var start = this._minTime;
                    while(start < this._maxTime) {
                        start = util.dateAdd(start, intervalCount, intervalType);
                        this._ticks.push(Math.min(start, this._maxTime));
                    }
                }
            }

            if (data.length > 0) {
                this._min = data[0].count || 0;
                this._max = this._min;
            }

            for (var i = 0; i < data.length; i++) {
                if (data[i].count === undefined || data[i].count === null) {
                    data[i].count = 0;
                }
                if (data[i].values && data[i].values.length > 0) {
                    this._max = Math.max(this._max, Math.max.apply(null, data[i].values));
                    this._min = Math.min(this._min, Math.min.apply(null, data[i].values));
                } else {
                    this._max = Math.max(this._max, data[i].count);
                    this._min = Math.min(this._min, data[i].count);
                }

                data[i]._id = i;
            }

            this.draw();
        }
    },
    getDataRange: function getDataRange() {
        // console.log('data_range_changed');
        return {
            minTime: this._minTime,
            maxTime: this._maxTime,
            min: this._min,
            max: this._max
        };
    },
    zIndex_changed: function zIndex_changed() {
        // console.log('zIndex_changed');
        var zIndex = this.getZIndex();
        this.canvasLayer.setZIndex(zIndex);
    },

    dataRangeControl_changed: function dataRangeControl_changed() {
        // console.log('dataRangeControl_changed');
        this.updateControl();
        this._getDrawer().notify('drawOptions');
    },

    highlightElement_changed: function highlightElement_changed() {
        // console.log("highlight element changed: %o", this._highlightElement);
        // 画icon暂时不重绘
        if (this.getDrawType() == "simple" && !this.getDrawOptions().icon && this.getAnimation() !== 'time') {
            // 高亮样式不需要重新计算布局
            // console.log("highlight redraw");
            var remainLayout = true;
            this.draw(remainLayout);
        }
    },

    clearHighlight: function clearHighlight() {
        if (this._highlightElement !== null) {
            this._highlightElement = null;
            this.notify('highlightElement');
        }
    },

    highlight: function highlight(pointIndex) {
        var drawer = this._getDrawer();
        if (drawer) {
            var data = this.getData();
            this._highlightElement = { data: data[pointIndex] };
            this.notify("highlightElement");
        }
    },

    findElementAtPoint: function findElementAtPoint(x, y) {
        var style = window.getComputedStyle(this.canvasLayer.canvas);
        if (style.display === 'none') return null;

        var drawer = this._getDrawer();
        if (drawer) {
            // find out the click point in which path
            var paths = drawer.getElementPaths();
            var ctx = this.getCtx();
            var data = this.getData();
            
            // fix bug 当图层数据设为空时，不展示tooltip信息
            if (data == null || !Object.keys(data).length || !data.length) {
                return;
            }

            if (this._highlightElement) {
                if (ctx.isPointInPath(this._highlightElement.path, x, y)) {
                    return this._highlightElement;
                }
            }

            var newHighlightElement = null;
            for (var i = 0; i < paths.length; i++) {
                //console.log(ctx.isPointInPath(paths[i], x, y), paths[i])
                if (ctx.isPointInPath(paths[i], x, y)) {
                    // bingo!
                    newHighlightElement = { data: paths[i].data, path: paths[i] };
                    break;
                }
            }

            if (this._highlightElement !== newHighlightElement) {
                this._highlightElement = newHighlightElement;
                this.notify("highlightElement");
            }

            return newHighlightElement;
        }
    },

    _getHandler: function _getHandler(type) {
        if (type == 'click') return this.getClick();else if (type == 'hover') return this.getHover();else if (type == 'tap') return this.getTap();else return null;
    },

    getCanvas: function getCanvas() {
        if (this.canvasLayer) return this.canvasLayer.getContainer();else return null;
    }

});
/**
 * 一直覆盖在当前地图视野的Canvas对象
 *
 * @author 唐书源 (tangziyuan@haizhi.com)
 *
 * @param 
 * {
 *     map 地图实例对象
 * }
 */
'use strict';

function LeafletLayer(options) {
    this.options = options || {};
    this.paneName = this.options.paneName || 'mapPane';
    this.zIndex = this.options.zIndex || 0;
    this.context = this.options.context || '2d';
    this._map = options.map;
}

if (window.L) {
    LeafletLayer = L.Layer.extend({
        onAdd: function onAdd(map) {
            var center = map.getCenter(),
                size = map.getSize(),
                left = 0,
                top = 0;

            if (center) {
                var pixel = map.latLngToLayerPoint(center);
                left = Math.floor(pixel.x - size.x / 2) + 'px';
                top = Math.floor(pixel.y - size.y / 2) + 'px';
            }

            var pane = this._map.getPane(this.options.pane);
            var canvas = this.canvas = document.createElement("canvas");
            canvas.style.cssText = "position:absolute;" + "left:" + left + ";top:" + top + ";z-index:" + this.zIndex + ";";
            this.adjustSize();
            pane.appendChild(this.canvas);
            map.on('moveend', this.draw, this); // zoomend后也会触发moveend

            return this.canvas;
        },

        onRemove: function onRemove(map) {
            L.DomUtil.remove(this.canvas);
            map.off('moveend', this.draw, this);
        }

    });
}

LeafletLayer.prototype.initialize = function (options) {
    this._map = options.map;
    this._id = options._id;
    this.zIndex = options.zIndex;
    this.context = options.context || '2d';
    this.onUpdate = options.onUpdate;
};

LeafletLayer.prototype.adjustSize = function () {
    var size = this._map.getSize();
    var canvas = this.canvas;
    var pixelRatio;

    if (this.context == 'webgl') {
        pixelRatio = 1;
    } else {
        pixelRatio = util.getPixelRatio(canvas.getContext('2d'));
    }

    canvas.width = size.x * pixelRatio;
    canvas.height = size.y * pixelRatio;
    canvas.style.width = size.x + "px";
    canvas.style.height = size.y + "px";
};

LeafletLayer.prototype.draw = function () {
    var map = this._map;
    var size = map.getSize();
    var center = map.getCenter();
    if (center) {
        var pixel = map.latLngToLayerPoint(center);
        this.canvas.style.left = Math.floor(pixel.x - size.x / 2) + 'px';
        this.canvas.style.top = Math.floor(pixel.y - size.y / 2) + 'px';
        this.onUpdate && this.onUpdate.call(this);
        // this.show();
    }
};

LeafletLayer.prototype.getContainer = function () {
    return this.canvas;
};

LeafletLayer.prototype.show = function () {
    if (!this.canvas) {
        this._map.addLayer(this);
    }
    this.canvas.style.display = "block";
};

LeafletLayer.prototype.hide = function () {
    this.canvas.style.display = "none";
};

LeafletLayer.prototype.setZIndex = function (zIndex) {
    this.canvas.style.zIndex = zIndex;
};

LeafletLayer.prototype.getZIndex = function () {
    return this.zIndex;
};
/**
 * @author sy-tang (@唐书源, ziyuant@gmail.com)
 * 播放控件
 */

"use strict";

if (window.BMap) {
    window.PlaybackControl = function (animation, options) {

        // 默认停靠位置和偏移量
        this.defaultAnchor = BMAP_ANCHOR_BOTTOM_LEFT;
        this.defaultOffset = new BMap.Size(120, 60);
        this.animation = animation;
        this.options = util.extend({
            tickFormatter: function tickFormatter(value, tickType) {
                return new Date(value).toLocaleString();
            }
        }, /*
           onInitialize: function(elem) {
            },
            onReset: function(elem) {
            },
            onUpdate: function(elem, val, percent) {
                    }
           */
        options);
    };

    PlaybackControl.prototype = new BMap.Control();

    PlaybackControl.prototype.initialize = function (map) {
        // 百度地图的控件初始化接口
        var div = this.init(map);
        // 添加DOM元素到地图中
        map.getContainer().appendChild(div);
        return div;
    };
} else if (window.L) {
    window.PlaybackControl = L.Control.extend({
        initialize: function initialize() {
            util.extend(this.options, util.extend({
                position: "bottomleft",
                tickFormatter: function tickFormatter(value, tickType) {
                    return new Date(value).toLocaleString();
                }
            }, arguments[1]));
        },
        includes: L.Mixin.Events,
        onAdd: function onAdd(map) {
            return this.init(map);
        }
    });
}

var playActionStyle = {
    position: "absolute",
    top: "4px",
    left: "5px",
    width: "0",
    height: "0",
    cursor: 'pointer',
    "font-size": "0",
    border: "4px solid transparent",
    "border-left": "8px solid #ccc",
    "vertical-align": 'middle'

},
    pauseActionStyle = {
    position: "absolute",
    top: "4px",
    left: "5px",
    width: "4px",
    height: "8px",
    margin: '0 2px',
    cursor: 'pointer',
    "font-size": "0",
    border: "2px solid #ccc",
    "border-width": "0 2px",
    "vertical-align": 'middle',
    "box-sizing": 'content-box'
};

util.extend(PlaybackControl.prototype, {

    init: function init(map) {
        this.map = map;

        var self = this;
        var container = this.container = document.createElement('div');
        container.className = "mapv-play-control";
        setStyle(container, {
            width: '600px',
            "padding-left": '22px'
        });

        var playBtn = this._playBtn = document.createElement('div');
        playBtn.className = "mapv-play-control-btn play";
        playBtn.setAttribute('action', 'play');
        setStyle(playBtn, playActionStyle);

        playBtn.addEventListener('click', function (e) {
            var playBtn = e.target;
            if (playBtn.getAttribute('action') == 'play') {
                self.setState('play');
                self.animation.start();
            } else {
                self.setState('pause');
                self.animation.pause();
            }
        });

        container.appendChild(playBtn);

        var slider = this._slider = document.createElement('input');
        // slider.className = "mapv-play-control-slider";
        setStyle(slider, {
            width: '100%',
            margin: 0

        });
        slider.type = 'range';
        slider.min = this.options.min || 0;
        slider.value = slider.min;
        slider.max = this.options.max || 0;
        slider.step = this.options.step || 1;

        slider.addEventListener('change', function (e) {
            // console.log('changed');
            var slider = e.target,
                state = self.getState();

            if (state === 'play') {
                self.setState('play');
                self.animation.start();
            }
        });

        slider.addEventListener('input', function (e) {
            // console.log('changing: ' + e.target.value);
            // self.setState('stop');
            var curVal = slider.value,
                schedule = (curVal - slider.min) / (slider.max - slider.min);

            self.animation.setSchedule(schedule, true);
        });

        var sliderWrap = document.createElement('div');
        sliderWrap.className = "mapv-play-control-slider";

        setStyle(sliderWrap, {
            "position": 'relative'
        });

        sliderWrap.appendChild(slider);
        container.appendChild(sliderWrap);

        var labelWrap = document.createElement('div');
        labelWrap.className = "mapv-play-control-label";

        container.appendChild(labelWrap);

        // 开始时间
        var label = document.createElement('label'),
            labelText = this._getFormattedLabel(slider.min, 'start');
        label.className = "start-label";
        setStyle(label, {
            'position': 'absolute',
            'left': 0
        });
        label.innerHTML = labelText;

        labelWrap.appendChild(label);

        // 结束时间
        label = document.createElement('label'), labelText = this._getFormattedLabel(slider.max, 'end');
        label.className = "end-label";
        setStyle(label, {
            'position': 'absolute',
            'right': 0
        });
        label.innerHTML = labelText;

        labelWrap.appendChild(label);

        // 当前时间
        label = this._curTick = document.createElement('div'), labelText = this._getFormattedLabel(slider.value, 'current');
        label.className = "cur-label";
        setStyle(label, {
            'position': 'absolute',
            'top': '-30px',
            'left': 0,
            'width': '100%',
            'text-align': 'center'
        });
        label.innerHTML = "<span>" + labelText + "</span>";

        labelWrap.appendChild(label);

        if (this.options.onInitialize) {
            setTimeout(function () {
                self.options.onInitialize(container);
            });
        }
        // 将DOM元素返回
        return container;
    },

    _getFormattedLabel: function _getFormattedLabel(value, tickType) {
        return this.options.tickFormatter(value, tickType);
    },

    setOptions: function setOptions(options) {
        util.extend(this.options, options);

        var slider = this._slider;

        slider.min = slider.value = this.options.min || 0;
        slider.max = this.options.max || 0;
        slider.step = this.options.step || 1;

        if (this.options.onReset) {
            this.options.onReset(this._container);
        }
    },

    bindAnimation: function bindAnimation(animation) {
        this.animation = animation;
    },

    update: function update(val) {
        var percent = (val - this._slider.min) / (this._slider.max - this._slider.min);

        this._slider.value = val;

        this._curTick.innerHTML = "<span>" + this._getFormattedLabel(val, 'current') + "</span>";

        if (this.options.onUpdate) {
            var self = this;
            setTimeout(function () {
                self.options.onUpdate(self.container, val, percent);
            });
        }
    },

    pause: function pause() {
        this.animation && this.animation.pause();
        this.setState('pause');
    },

    start: function start() {
        this.animation && this.animation.start();
        this.setState('play');
    },

    setState: function setState(state) {
        var playBtn = this._playBtn,
            oldState = this.getState();

        if (oldState != state) {
            if (state == 'play') {
                setStyle(playBtn, pauseActionStyle);
                playBtn.className = "mapv-play-control-btn pause";
                playBtn.setAttribute('action', 'pause');
            } else {
                setStyle(playBtn, playActionStyle);
                playBtn.className = "mapv-play-control-btn play";
                playBtn.setAttribute('action', 'play');
            }

            if (this.options.onStateChange) {
                var self = this;
                setTimeout(function () {
                    self.options.onStateChange(oldState, state);
                });
            }
        }
    },

    getState: function getState() {
        return this._playBtn.getAttribute('action') == 'play' ? 'pause' : 'play';
    },

    getContainer: function getContainer() {
        return this.container;
    },

    hide: function hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    },

    show: function show() {
        if (this.container) {
            this.container.style.display = 'block';
        }
    }

});

function setStyle(elem, style) {
    var cssText = '';
    for (var prop in style) {
        cssText += prop + ": " + style[prop] + ';';
    }
    elem.style.cssText = cssText;
}
/**
 * @author nikai (@胖嘟嘟的骨头, nikai@baidu.com)
 */
'use strict';

function Drawer(layer) {

    Class.call(this);

    this.mapv = layer._mapv;
    this.initOptions({
        layer: layer,
        map: layer.getMap(),
        ctx: null,
        mapv: null,
        animationOptions: {},
        drawOptions: {
            size: 2
        },
        highlightElement: null
    });

    // store all the path of element drawed in the layer, used for hit-detection
    this._elementPaths = [];

    this.dataRange = new DataRange(layer);

    this.bindTo('ctx', layer);
    this.bindTo('animationOptions', layer);
    this.bindTo('drawOptions', layer);
    this.bindTo('mapv', layer);
    this.bindTo('map', layer);
    this.bindTo('highlightElement', layer);
}

util.inherits(Drawer, Class);

Drawer.prototype.beginDrawMap = function () {
    if (this.getLayer().getContext() == "2d") {
        this.beginDrawCanvasMap();
    }
};

Drawer.prototype.endDrawMap = function () {
    if (this.getLayer().getContext() == "2d") {
        this.endDrawCanvasMap();
    }
};

Drawer.prototype.beginDrawCanvasMap = function () {

    var drawOptions = this.getDrawOptions();
    var ctx = this.getCtx();
    var pixelRatio = util.getPixelRatio(ctx);

    this._elementPaths = [];

    ctx.save();

    ctx.scale(pixelRatio, pixelRatio);

    var property = ['globalCompositeOperation', 'shadowColor', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY', 'globalAlpha', 'fillStyle', 'strokeStyle', 'lineWidth', 'lineCap', 'lineJoin', 'lineWidth', 'miterLimit'];

    for (var i = 0; i < property.length; i++) {
        if (drawOptions[property[i]]) {
            ctx[property[i]] = drawOptions[property[i]];
        }
    }
};

Drawer.prototype.endDrawCanvasMap = function () {
    var ctx = this.getCtx();
    ctx.restore();
};

Drawer.prototype.drawOptions_changed = function () {

    // var drawOptions = this.getDrawOptions();
    // if (drawOptions && drawOptions.splitList) {
    //     this.splitList = drawOptions.splitList;
    // } else {
    //     this.generalSplitList();
    // }

};

Drawer.prototype.colors = ['rgba(17, 102, 252, 0.8)', 'rgba(52, 139, 251, 0.8)', 'rgba(110, 176, 253, 0.8)', 'rgba(255, 241, 193, 0.8)', 'rgba(255, 146, 149, 0.8)', 'rgba(253, 98, 104, 0.8)', 'rgba(255, 0, 0, 0.8)', 'rgba(255, 51, 61, 0.8)'];

Drawer.prototype._getDatasetRange = function (startTick, nextTick) {
    var data = this.getLayer().getData(),
        startIndex = 0,
        endIndex = data.length,
        animation = this.getLayer().getAnimation();

    if (animation && animation == 'time') {
        var animationOptions = this.getAnimationOptions();

        if (this._lastEndIndex) {
            var lastPoint = data[this._lastEndIndex];
            if (lastPoint && lastPoint.t <= startTick) {
                startIndex = this._lastEndIndex;
            } else {
                startIndex = 0;
            }
        } else {
            startIndex = 0;
        }

        var count = 0;
        for (var j = startIndex; j < data.length; j++) {
            var t = data[j].t;
            if (t < startTick) {
                continue;
            } else {
                if (t < nextTick) {
                    count++;
                } else {
                    startIndex = j - count;
                    this._lastEndIndex = endIndex = j;
                    break;
                }
            }
        }
    }
    // console.log(time, startIndex, endIndex);
    return [startIndex, endIndex];
};

Drawer.prototype.generalSplitList = function () {
    var dataRange = this.getLayer().getDataRange();
    var splitNum = Math.ceil((dataRange.max - dataRange.min) / 7);
    var index = dataRange.min;
    this.splitList = [];
    var radius = 1;
    while (index < dataRange.max) {
        this.splitList.push({
            start: index,
            end: index + splitNum,
            size: radius,
            color: this.colors[radius - 1]
        });
        index += splitNum;
        radius++;
    }
};

Drawer.prototype.getRadius = function () {
    var zoom = this.getMap().getZoom();
    var zoomUnit = Math.pow(2, 18 - zoom);

    var drawOptions = this.getDrawOptions();
    var radius = parseFloat(drawOptions.size) || 13;
    var unit = drawOptions.unit || 'px';
    if (unit === 'm') {
        radius = radius / zoomUnit;
    } else {
        radius = radius;
    }

    if (drawOptions.minPxSize && radius < drawOptions.minPxSize) {
        radius = drawOptions.minPxSize;
    }

    return radius;
};

Drawer.prototype.getElementPaths = function () {
    return this._elementPaths;
};

Drawer.prototype.clearTimer = function () {
    if (this._timer) {
        window.clearTimeout(this._timer);
    }
};
/**
 * @file 普通的绘制方式
 * @author nikai@baidu.com tangshuyuan@haizhi.com
 */

'use strict';

function SimpleDrawer() {
    Drawer.apply(this, arguments);
}

util.inherits(SimpleDrawer, Drawer);

SimpleDrawer.prototype.drawMap = function (time, nextTick, percent, image) {
    var dataType = this.getLayer().getDataType();
    var loaded = function (fn) {
        var args = [].slice.call(arguments, 1);
        var that = this;
        setTimeout(function () {
            fn.apply(that, args);
        });
    };
    var stopper;

    if (this.getLayer().getContext() === 'webgl') {
        if (dataType === 'polyline') {
            // 画线
            this.drawWebglPolyline(time, nextTick);
        } else {
            this.drawWebglPoint(time, nextTick);
        }
        return;
    }

    this.beginDrawMap();

    //var data = this.getLayer().getData();
    var drawOptions = this.getDrawOptions();

    if (dataType === 'polyline' || dataType === 'polygon') {
        // 画线或面
        this.drawPolyline(time, nextTick);
    } else if (dataType === 'trailline') {
        // 画轨迹
        this.drawTrailline(time, nextTick, percent, image);
    } else if (dataType === 'trackline') {
        // 画弧线轨迹
        this.drawTrackline(time, nextTick, percent, image);
    } else if (dataType === 'trackPoint') {
        this.drawTrackPoint(time);
    } else if (dataType === 'ripple') {
        stopper = this.drawRipple(time, nextTick);
    } else {
        // 画点  
        var that = this;
        var icon = drawOptions.icon;

        if (icon) {
            // using icon font
            if (icon.font && icon.text) {
                loaded.call(that, that.drawIconsWithFont, icon.font, icon.text, time, nextTick);
            }

            // using image
            if (icon.url) {
                if (this._cachedImage) {
                    loaded.call(this, this.drawIconsWithImage, this._cachedImage, time, nextTick);
                } else {
                    (function (time) {
                        var image = new Image();
                        image.onload = function () {
                            that._cachedImage = image;
                            that.drawIconsWithImage(image, time, nextTick);
                        };
                        image.src = drawOptions.icon.url;
                    })(time);
                }
            }
            else if (icon.path) {
                loaded.call(this, this.drawShapes, time, nextTick);
            }
        } else {
            // using defined shape: circle rect diamond triangle
            if (nextTick) {
                loaded.call(this, this.drawShapes, time, nextTick);
            }
            else {
                this.drawShapes(time, nextTick);
            }
        }
    }

    this.endDrawMap();
    return stopper;
};

SimpleDrawer.prototype.drawTrailline = function (time, nextTick, percent, iconImage) {
    var data = this.getLayer().getData();
    var ctx = this.getCtx();
    var drawOptions = this.getDrawOptions();
    var path = drawOptions.path;
    var currentPath = drawOptions.currentPath;
    var startPoint = drawOptions.startPoint,
        endPoint = drawOptions.endPoint;
    var transform = drawOptions.transform || {},
        translate = transform.translate || [0, 0],
        scale = transform.scale || [0, 0],
        angle = transform.angle;

    var icon = drawOptions.icon;
    var size = drawOptions.size;
    var iconWidth = icon && icon.width,
        iconHeight = icon && icon.height;

    // for (var i = 0, len = data.length; i < len; i++) {

    //     var geo = data[i].pgeo;

    //     if (!geo._index) {
    //         geo._index = 0;
    //     }

    //     geo._index = geo._index % geo.length;

    //     var movingPoint = geo[geo._index],
    //         size = drawOptions.lineWidth || 1;

    //     ctx.save();
    //     ctx.fillStyle = data[i].color || drawOptions.fillStyle || '#5182e4';
    //     ctx.beginPath();
    //     ctx.arc(movingPoint[0], movingPoint[1], size, 0, 2 * Math.PI, false);
    //     ctx.closePath();
    //     ctx.fill();
    //     ctx.restore();

    //     geo._index += 1;
    // }
    var length = data.length,
        i = 0;
    var movingPoint;
    var cx, cy;

    if (currentPath) {
        ctx.save();
        //ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        for (; i < length; i++) {
            var geo = data[i].pgeo,
                end = geo.length;
            var img;
            var theta = 0;
            movingPoint = null;

            for (var j = Math.floor(end * percent); j < end; j++) {
                if (geo[j][2] >= time) {
                    movingPoint = geo[j];
                    break;
                }
            }
            if (percent >= 1) {
                j = end;
                movingPoint = geo[end - 1];
            }
            ctx.save();
            ctx.beginPath();
            ctx.beginPath();
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = 1;
            for (var k = 0; k < j; k++) {
                ctx[k ? "lineTo" : "moveTo"](geo[k][0], geo[k][1]);
            }
            ctx.lineWidth = currentPath.lineWidth || drawOptions.lineWidth || 2;
            ctx.strokeStyle = currentPath.strokeStyle || "#5092FF";
            ctx.stroke();
            ctx.restore();

            if (path) {
                ctx.save();
                ctx.beginPath();
                ctx.globalCompositeOperation = "source-over";
                ctx.globalAlpha = 0.3;
                if (movingPoint) for (k = j; k < end; k++) {
                    ctx[k !== j ? "lineTo" : "moveTo"](geo[k][0], geo[k][1]);
                }
                ctx.lineWidth = drawOptions.lineWidth || currentPath.lineWidth || 2;
                ctx.strokeStyle = drawOptions.strokeStyle || "rgba(80,146,255,1)";
                ctx.stroke();
                ctx.restore();
            }
            if (startPoint && (cy = geo[0])) {
                cx = cy[0], cy = cy[1];
                ctx.beginPath();
                ctx.arc(cx, cy, startPoint.size || 3, 0, Math.PI * 2, true);
                ctx.fillStyle = startPoint.fillStyle || "#29D9FF";
                ctx.fill();
            }
            if (endPoint && (cy = geo[end - 1])) {
                cx = cy[0], cy = cy[1];
                ctx.beginPath();
                ctx.arc(cx, cy, endPoint.size || 2.5, 0, Math.PI * 2, true);
                ctx.fillStyle = endPoint.fillStyle || "#29D9FF";
                ctx.fill();
                ctx.beginPath();
                ctx.arc(cx, cy, (endPoint.size || 2.5) + 4, 0, Math.PI * 2, true);
                ctx.lineWidth = 1;
                ctx.strokeStyle = endPoint.fillStyle || "#29D9FF";
                ctx.stroke();
            }

            if (movingPoint) {
                cx = movingPoint[0], cy = movingPoint[1];
                ctx.save();
                if (icon) {
                    if (icon.type === "image" && iconImage) {
                        ctx.save();
                        ctx.beginPath();
                        ctx.translate(cx, cy);
                        theta = util.angleTo(geo[Math.min(j + 1, end - 1)], [cx, cy], angle || 0);
                        ctx.rotate(theta, theta);

                        ctx.translate(-iconImage.width + (translate[0] || 0), -iconImage.height / 2 + (translate[1] || 0));
                        ctx.drawImage(iconImage, 0, 0);
                        ctx.restore();
                        ctx.fill();
                    }
                    else {
                        if (icon.type === "circle") {
                            size || (size = 5);
                            ctx.beginPath();
                            ctx.arc(cx, cy, size, 0, Math.PI * 2, true);
                            ctx.fillStyle = data[i].color || drawOptions.fillStyle || '#5182e4';
                            ctx.fill();
                        }
                        else if (icon.url) {
                            img = new Path2D(icon.url);
                            ctx.fillStyle = data[i].color || icon.fillStyle || '#5182e4';
                            ctx.translate(cx, cy);
                            if (size > 0)
                                ctx.scale((size * 2 / iconWidth + scale[0]) || 1, (size * 2 / iconHeight + scale[1]) || 1);
                            if (isNumber(angle)) {
                                theta = util.angleTo(geo[Math.min(j + 1, end - 1)], [cx, cy], angle);
                                ctx.rotate(theta, theta);
                            }
                            ctx.translate(-iconWidth + (translate[0] || 0), -iconHeight / 2 + (translate[1] || 0));
                            ctx.fill(img, "evenodd");
                        }
                    }
                }
                else {
                    ctx.fillStyle = data[i].color || drawOptions.fillStyle || '#5182e4';
                    ctx.beginPath();
                    ctx.arc(cx, cy, movingPoint[3] || size, 0, 2 * Math.PI, false);
                    ctx.closePath();
                    ctx.fill();
                }
                ctx.restore();
            }
        }
        ctx.restore();
    }
};

// 画弧线轨迹
SimpleDrawer.prototype.drawTrackline = function(time) {
    let layer = this.getLayer();
    let data =layer.getData();
    let ctx = this.getCtx();
    let customOptions = layer.getCustomOptions() || {};
    let drawOptions = layer.getDrawOptions() || {};
   
    let getGradientCoorRange = function (points) {
        let left = points[0][0], right = points[0][0];
        for (let i = 0, len = points.length; i < len; i++) {
            if (points[i][0] < left) {
                left = points[i][0];
            } else if (points[i][0] > right) {
                right = points[i][0];
            }
        }
        if (points[points.length-1][0] > points[0][0]) {
            return {left: left, right: right};
        } else {
            return {left: right, right: left};
        }
    }

    for (let i = 0, len = data.length; i < len; i++) {
        let pgeo = data[i].pgeo;
        let startIndex = 0;
        let endIndex = 0;
        for (let j = 0; j < pgeo.length; j++) {
            if (parseFloat(pgeo[j][2]) <= time) {
                endIndex = j;
            }
        }
        if (startIndex >= endIndex) continue;
        let points = pgeo.slice(startIndex, endIndex+1);
        const count = customOptions.count;
        const sumPoints = pgeo.length;
        let linesCount = Math.floor(points.length / count);
        let hasOtherPoint = !!(points.length % count);
        let interpolate = customOptions.interpolate;
        let textOptions = drawOptions.iconText || {};
        // this.drawTextIcon(points[endIndex][0], points[endIndex][1], textOptions.text, textOptions);
        if (linesCount > 0) {
            for (let i = 0; i < linesCount; i++) {
                let linePoints = pgeo.slice(i * count, i * count + count + 1);
                let sColor = interpolate.getColor((i * count) / sumPoints);
                let eColor = interpolate.getColor((i * count + count) / sumPoints);
                let range = getGradientCoorRange(linePoints);
                let gradient = ctx.createLinearGradient(range.left, 0, range.right, 0);
                gradient.addColorStop(0, sColor);
                gradient.addColorStop(1, eColor);
                this.drawGradientLine(ctx, linePoints, gradient, drawOptions);
            }
        }
        if (hasOtherPoint) {
            let otherPoints = pgeo.slice(linesCount * count, endIndex + 1);
            let sColor = interpolate.getColor((linesCount * count) / sumPoints);
            let eColor = interpolate.getColor(endIndex / sumPoints);
            let range = getGradientCoorRange(otherPoints);
            let gradient = ctx.createLinearGradient(range.left, 0, range.right, 0);
            gradient.addColorStop(0, sColor);
            gradient.addColorStop(1, eColor);
            this.drawGradientLine(ctx, otherPoints, gradient, drawOptions);
        }  
    }
}

// 画渐变线
SimpleDrawer.prototype.drawGradientLine = function(ctx, points, gradient, drawOptions) {
    ctx.save();
    ctx.beginPath();
    points.forEach((pt, index) => {
        ctx[index ? 'lineTo' : 'moveTo'](pt[0], pt[1]);
    });
    ctx.strokeStyle = gradient;
    ctx.lineWidth = drawOptions.lineWidth || 3;
    ctx.stroke();
    ctx.restore();
}

// 画移动的点，流星摆尾效果
SimpleDrawer.prototype.drawTrackPoint = function(time) {
    let layer = this.getLayer();
    let trackLineLayer = layer.getCustomOptions().trackLineLayer;
    let data = trackLineLayer.getData()[0].pgeo;
    let ctx = this.getCtx();
    let drawOptions = layer.getDrawOptions() || {};
    let trackLineDrawOptins = trackLineLayer.getDrawOptions() || {};
    let textOptions = drawOptions.iconText || trackLineDrawOptins.iconText || {};
    let point = data[time];
    if (point) {
        this.drawTextIcon(point[0], point[1], textOptions.text, textOptions);

        ctx.save();
        // 扫尾效果的原理是在绘制新的一帧时，不是调用clearRect清理掉画布，而是用具有一定透明度的颜色去填充之前的画布
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
 
        ctx.save();
        ctx.fillStyle = drawOptions.fillStyle || '#f00';
        ctx.beginPath();
        ctx.arc(point[0], point[1], drawOptions.size || 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();  
    }
}

// 画移动的文字框
SimpleDrawer.prototype.drawTextIcon = function(x, y, text, options) {
    options = util.extend({
        backgroundColor: 'green',
        opacity: 1,
        color: 'white',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: '16px',
        fontFamily: 'Microsoft YaHei',
        padding: '6px 6px 0'
    }, options);
    if (!Mapv._iconTextObj) {
        let containerEle = document.createElement('div');
        containerEle.setAttribute('style', 'position:absolute;');

        let contentEle = document.createElement('div');
        contentEle.setAttribute('style', 'text-align:center; box-shadow: 0 3px 14px rgba(0, 0, 0, 0.4); border-radius:2px;');

        let arrowContainerEle = document.createElement('div');
        arrowContainerEle.setAttribute('style', 'width:40px; height:20px; position:absolute; left:50%; margin-left:-20px; overflow:hidden;');

        let arrowEle = document.createElement('div');
        arrowEle.setAttribute('style', 'width:17px; height:17px; padding:1px; margin:-10px auto 0; transform:rotate(45deg);');

        arrowContainerEle.appendChild(arrowEle);
        containerEle.appendChild(contentEle);
        containerEle.appendChild(arrowContainerEle);
        this.getMap().getContainer().appendChild(containerEle);
        
        Mapv._iconTextObj = {
            containerEle: containerEle,
            contentEle: contentEle,
            arrowContainerEle: arrowContainerEle,
            arrowEle: arrowEle,
        };
    }
    Mapv._iconTextObj.containerEle.style.transform = 'translate3d(-50%,-150%,0)';
    Mapv._iconTextObj.containerEle.style.left = x + 'px';
    Mapv._iconTextObj.containerEle.style.top = y + 'px';

    const font = `${options.fontStyle} ${options.fontWeight} ${options.fontSize} ${options.fontFamily}`;
    Mapv._iconTextObj.contentEle.style.backgroundColor = options.backgroundColor;
    Mapv._iconTextObj.contentEle.style.color = options.color;
    Mapv._iconTextObj.contentEle.style.opacity = options.opacity;
    Mapv._iconTextObj.contentEle.style.padding = options.padding;
    Mapv._iconTextObj.contentEle.style.font = font;
    Mapv._iconTextObj.contentEle.innerHTML = text;

    Mapv._iconTextObj.arrowEle.style.backgroundColor = options.backgroundColor;
    Mapv._iconTextObj.arrowEle.style.color = options.color;
    Mapv._iconTextObj.arrowEle.style.opacity = options.opacity; 
}

SimpleDrawer.prototype.drawRipple = function (time, nextTick) {
    var layer = this.getLayer();
    var data = layer.getData();
    var ctx = this.getCtx();
    var drawOptions = this.getDrawOptions();
    var rippleStyle = drawOptions.rippleStyle || 'stroke';
    var datasetRange = this._getDatasetRange(time, nextTick);

    var forceDrawEverything = layer.get('forceDrawEverything');

    var stopper = true;
    for (var i = datasetRange[0], len = datasetRange[1]; i < len; i++) {
        var item = data[i];
        var text = item.text;
        if (!forceDrawEverything && (item.px < 0 || item.px > ctx.canvas.width || item.py < 0 || item.py > ctx.canvas.height)) {
            continue;
        }

        var scale = drawOptions.scaleRange ? Math.sqrt(this.dataRange.getScale(item.count)) : 1,
            radius = this.getRadius() * scale;

        // 创建一个path，用于响应事件交互
        var path = new Path2D();
        path.arc(item.px, item.py, radius, 0, 2 * Math.PI, false);
        path.data = item;
        this._elementPaths.push(path);

        ctx.save();

        ctx.fillStyle = item.color || drawOptions.fillStyle || '#5182e4';
        ctx.strokeStyle = item.color || drawOptions.strokeStyle || '#5182e4';

        ctx.beginPath();
        ctx.arc(item.px, item.py, radius, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.closePath();
        stopper = stopper && item.disabled;
        if (!item.disabled && i - datasetRange[0] < 1000) {
            if (!item.ripple) {
                //item.ripple = [0, -1.5, -3.5];
                var start = drawOptions.shuffle ? -Math.random() * 5 : drawOptions.stepIn ? 0 : 3;
                item.ripple = [start, start - 1.5, start - 3.5];
            }

            item.ripple.forEach(function (scale, idx) {
                if (scale > 0) {
                    var alpha = (2 - scale) / 1;
                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.beginPath();
                    ctx.arc(item.px, item.py, radius * (scale + 0), 0, 2 * Math.PI, false);
                    ctx.closePath();

                    if (rippleStyle === 'stroke') {
                        ctx.stroke();
                    } else if (rippleStyle === 'fill') {
                        ctx.globalAlpha *= .6;
                        ctx.fill();
                    } else {
                        // stroke and fill
                        if (idx === 2) {
                            ctx.stroke();
                        } else {
                            ctx.globalAlpha *= .6;
                            ctx.fill();
                        }
                    }

                    ctx.restore();
                }

                item.ripple[idx] += 0.05;

                if (item.ripple[idx] > 2) {
                    item.ripple[idx] = drawOptions.shuffle ? -2 : 0;
                }
            });
        }
        ctx.restore();

        if (text) {
            ctx.save();
            ctx.fillStyle = text.color || drawOptions.textColor || '#fff';
            ctx.font = [drawOptions.fontStyle, drawOptions.fontSize, drawOptions.fontFamily].join(" ");
            ctx.fillText(text.value, item.px - radius + (text.dx || 0) + (radius * 2 - ctx.measureText(text.value).width) / 2, item.py + (text.dy || 0));
            ctx.restore();
        }
    }
    return stopper;
};

SimpleDrawer.prototype.drawPolyline = function (time, nextTick) {
    var dataType = this.getLayer().getDataType();
    var data = this.getLayer().getData();
    var ctx = this.getCtx();
    var drawOptions = this.getDrawOptions();
    var label = drawOptions.label;
    var zoom = this.getMap().getZoom();
    if (label) {
        if (label.font) {
            ctx.font = label.font;
        }
        var labelKey = label.key || 'count';
    }

    var drawEndPoint = drawOptions.endPointStyle && drawOptions.endPointStyle.enable,
        endPointDrawedStatus = {};

    var animationOptions = this.getLayer().getAnimationOptions() || {};

    drawOptions.strokeStyle = drawOptions.strokeStyle || 'rgba(55, 55, 55, .6)';

    for (var i = 0, len = data.length; i < len; i++) {
        var geo = data[i].pgeo,
            actualGeo = data[i].geo;
        var startIndex = 0,
            //开始的索引
        endIndex = geo.length - 1; //结束的索引
        var cx, cy;

        if (time!=undefined) {
            // 按时间动画展示
            // for (var j = 0; j < geo.length; j++) {
            //     if (parseFloat(geo[j][2]) < time) {
            //         startIndex = j;
            //     }
            //     endIndex = j;
            //     if (nextTick && parseFloat(geo[j][2]) >= nextTick) {
            //         endIndex = j - 1;
            //         if (startIndex !== 0) {
            //             startIndex += 1;
            //         }
            //         break;
            //     }
            // }
            var range = [];
            for (var j = 0; j < geo.length; j++) {
                var timestamp = parseFloat(geo[j][2]);
                if (timestamp >= time) {
                    if (timestamp < nextTick) {
                        range.push(j)
                    } else {
                        break;
                    }
                } else {
                    continue;
                }
            }
            if (range.length > 0) {
                startIndex = range[0];
                endIndex = range[range.length - 1];
            }
            range = null;
        }

        // console.log(startIndex, endIndex);

        if (drawEndPoint) {
            // draw start point
            var size = drawOptions.endPointStyle.size || 2,
                color = drawOptions.endPointStyle.color || 'rgba(55, 55, 55, .6)';

            ctx.save();
            
            // ctx.moveTo(geo[startIndex][0], geo[startIndex][1]);
            if (!endPointDrawedStatus[geo[startIndex][0] + "_" + geo[startIndex][1]]) {
                cx = geo[startIndex][0], cy = geo[startIndex][1];
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(cx, cy, size, 0, 2 * Math.PI, false);
                ctx.fill();
                endPointDrawedStatus[geo[startIndex][0] + "_" + geo[startIndex][1]] = 1;
            }

            if (!endPointDrawedStatus[geo[endIndex][0] + "_" + geo[endIndex][1]]) {
                //ctx.arc(geo[endIndex][0], geo[endIndex][1], size, 0, 2 * Math.PI, false);
                cx = geo[endIndex][0], cy = geo[endIndex][1];
                ctx.beginPath();
                ctx.arc(cx, cy, size || 2.5, 0, Math.PI * 2, true);
                ctx.fillStyle = color;// endPoint.fillStyle || "#29D9FF";
                ctx.fill();
                ctx.beginPath();
                ctx.arc(cx, cy, (size || 2.5) + 4, 0, Math.PI * 2, true);
                ctx.lineWidth = 1;
                ctx.strokeStyle = color;// endPoint.fillStyle || "#29D9FF";
                ctx.stroke();
                endPointDrawedStatus[geo[endIndex][0] + "_" + geo[endIndex][1]] = 1;
            }
            ctx.restore();
        }

        if (startIndex >= endIndex) continue;

        ctx.beginPath();
        ctx.moveTo(geo[startIndex][0], geo[startIndex][1]);

        var prevColor = actualGeo[startIndex][3] || drawOptions.strokeStyle,
            prevCount = 0,
            gradient;

        ctx.strokeStyle = prevColor;

        var timeStr = "";
        for (var j = startIndex + 1; j <= endIndex; j++) {
            var curPoint = geo[j],
                curColor = actualGeo[j] && actualGeo[j][3] || drawOptions.strokeStyle;

            // timeStr += animationOptions.tickFormatter(curPoint[2]) + ", ";

            if (curColor != prevColor) {
                // 颜色不同需要先把之前已连线的画出来，再画渐变线

                if (prevCount > 1) {
                    // 先把之前已连线的点画出来
                    ctx.stroke();
                }

                // 再在前一个点和当前点之间画渐变线
                var prevPoint = geo[j - 1];
                gradient = ctx.createLinearGradient(prevPoint[0], prevPoint[1], curPoint[0], curPoint[1]);
                gradient.addColorStop(0, prevColor);
                gradient.addColorStop(1, curColor);

                ctx.strokeStyle = gradient;
                ctx.moveTo(prevPoint[0], prevPoint[1]);
                ctx.lineTo(curPoint[0], curPoint[1]);
                ctx.stroke();

                ctx.moveTo(curPoint[0], curPoint[1]);
                ctx.strokeStyle = prevColor = curColor;
                prevCount = 0;
            } else {
                // 颜色相同则继续连线
                ctx.lineTo(geo[j][0], geo[j][1]);
                prevCount++;
            }
        }

        if (drawOptions.strokeStyle || dataType === 'polyline') {
            ctx.stroke();
        }

        if (dataType === 'polygon') {
            ctx.closePath();
            ctx.fill();
        }

        if (label && label.show && (!label.minZoom || label.minZoom && zoom >= label.minZoom)) {
            ctx.save();
            if (label.fillStyle) {
                ctx.fillStyle = label.fillStyle;
            }
            var center = util.getGeoCenter(geo);
            ctx.fillText(data[i][labelKey], center[0], center[1]);
            ctx.restore();
        }

        // console.log(animationOptions.tickFormatter(time) + ": " + timeStr);
    }
};

SimpleDrawer.prototype.drawShapes = function (time, nextTick) {

    var that = this;
    var drawOptions = this.getDrawOptions();
    var icon = drawOptions.image;
    var data = this.getLayer().getData();
    var datasetRange = this._getDatasetRange(time, nextTick);
    var ctx = this.getCtx();

    var animation = this.getLayer().getAnimation();
    if (time === undefined || animation == 'time') {
        time = 1;
    }

    var isFinalFrame = time < 1 ? false : true;

    var highlightElement = this.getHighlightElement();

    // scale size with map zoom
    var zoomScale = 1 + (this.getMap().getZoom() - 6) * 0.1;
    var maxScale = drawOptions.maxScale || 2,
        minScale = drawOptions.minScale || 0.5;
    // keep scale in [minScale, maxScale];
    zoomScale = Math.max(Math.min(zoomScale, maxScale), minScale);

    var forceDrawEverything = this.getLayer().get('forceDrawEverything');
    for (var i = datasetRange[0], len = datasetRange[1]; i < len; i++) {
        var item = data[i];
        if (!forceDrawEverything && (item.px < 0 || item.px > ctx.canvas.width || item.py < 0 || item.py > ctx.canvas.height)) {
            // console.log("skip");
            continue;
        }
        var path = new Path2D();

        var scale = drawOptions.scaleRange ? Math.sqrt(this.dataRange.getScale(item.count)) : 1;

        scale *= time;

        scale *= zoomScale;

        var radius = this.getRadius() * scale;

        var shape = item.shape || drawOptions.shape || 'circle';

        var hasIcon = shape === "icon";

        switch (shape) {
            case 'rect':
                path.moveTo(item.px - radius, item.py - radius);
                path.rect(item.px - radius, item.py - radius, radius * 2, radius * 2);
                break;

            case 'triangle':
                radius *= 1.5;

                path.moveTo(item.px, item.py - radius);
                path.lineTo(item.px - radius * Math.sqrt(3) / 2, item.py + radius / 2);
                path.lineTo(item.px + radius * Math.sqrt(3) / 2, item.py + radius / 2);
                path.lineTo(item.px, item.py - radius);
                break;

            case 'diamond':
                path.moveTo(item.px, item.py - 1.5 * radius);
                path.lineTo(item.px - radius, item.py);
                path.lineTo(item.px, item.py + 1.5 * radius);
                path.lineTo(item.px + radius, item.py);
                path.lineTo(item.px, item.py - 1.5 * radius);
                break;
            case 'icon':
                if (icon && isNumber(item.px) && isNumber(item.py)) {
                    ctx.save();
                    ctx.translate(item.px - icon.width / 2, item.py - icon.height / 2);
                    ctx.beginPath();
                    
                    // 增加外界传参scale功能
                    if(icon.scale){
                        ctx.translate(icon.width / 2, icon.height / 2);
                        ctx.scale(icon.scale[0], icon.scale[1]);
                        ctx.translate(-icon.width / 2, -icon.height / 2);
                    }

                    ctx.fillStyle = item.color || drawOptions.fillStyle;
                    ctx.fill(new Path2D(icon.path), "evenodd");
                    ctx.restore();
                    path.rect(item.px - icon.width / 2, item.py - icon.height / 2, icon.width, icon.height);
                }
                break;

            case 'circle':
            default:
                // path.moveTo(item.px, item.py);
                path.arc(item.px, item.py, radius, 0, 2 * Math.PI, false);
        }

        // item.radius = radius;

        if (isFinalFrame) {
            path.data = item;
            this._elementPaths.push(path);
            // reset highlightElement since there may be some element out of canvas
            if (highlightElement && highlightElement.data._id == item._id) {
                highlightElement.data = item;
                highlightElement.path = path;
                this._highlightElement = highlightElement;
                continue;
            }
        }

        if (!hasIcon) {
            ctx.save();
            ctx.fillStyle = item.color || drawOptions.fillStyle;
            ctx.globalAlpha = (drawOptions.fillAlpha || 1) * time;

            ctx.fill(path);
            if (drawOptions.strokeStyle) {
                ctx.strokeStyle = drawOptions.strokeStyle;
                ctx.lineWidth = drawOptions.lineWidth || 1;
                ctx.stroke(path);
            }

            ctx.restore();
        }
    }

    // 最后给highlight的元素加边框
    if (highlightElement && !hasIcon) {
        var item = highlightElement.data;

        if (!forceDrawEverything && (item.px < 0 || item.px > ctx.canvas.width || item.py < 0 || item.py > ctx.canvas.height)) {
            // console.log('highlightElement out of canvas');
            return;
        }

        var highlightPath = highlightElement.path;

        var shape = item.shape || drawOptions.shape || 'circle';
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = item.radius;

        var path = new Path2D();
        var radius = item.radius + 1;
        switch (shape) {
            // 某些android机型（如三星g3），不能正确stroke...真是蛋疼.
            case 'rect':
                path.moveTo(item.px - radius, item.py - radius);
                path.rect(item.px - radius, item.py - radius, radius * 2, radius * 2);
                ctx.fill(path);
                // ctx.stroke(path);
                radius += item.radius;
                path.moveTo(item.px - radius, item.py - radius);
                path.rect(item.px - radius, item.py - radius, radius * 2, radius * 2);
                ctx.fillStyle = ctx.strokeStyle;
                ctx.fill(path);
                break;

            // 三角形和菱形不能直接用stroke的方式画最外层的边框（边框会出现断点）
            case 'triangle':
                path.moveTo(item.px, item.py - radius);
                path.lineTo(item.px - radius * Math.sqrt(3) / 2, item.py + radius / 2);
                path.lineTo(item.px + radius * Math.sqrt(3) / 2, item.py + radius / 2);
                path.lineTo(item.px, item.py - radius);
                ctx.fill(path);

                path = new Path2D();
                radius = item.radius * 2;

                path.moveTo(item.px, item.py - radius);
                path.lineTo(item.px - radius * Math.sqrt(3) / 2, item.py + radius / 2);
                path.lineTo(item.px + radius * Math.sqrt(3) / 2, item.py + radius / 2);
                path.lineTo(item.px, item.py - radius);

                ctx.fillStyle = ctx.strokeStyle;
                ctx.fill(path);

                break;

            case 'diamond':
                path.moveTo(item.px, item.py - 1.5 * radius);
                path.lineTo(item.px - radius, item.py);
                path.lineTo(item.px, item.py + 1.5 * radius);
                path.lineTo(item.px + radius, item.py);
                path.lineTo(item.px, item.py - 1.5 * radius);

                ctx.fill(path);

                path = new Path2D();
                radius = item.radius * 2;

                path.moveTo(item.px, item.py - 1.5 * radius);
                path.lineTo(item.px - radius, item.py);
                path.lineTo(item.px, item.py + 1.5 * radius);
                path.lineTo(item.px + radius, item.py);
                path.lineTo(item.px, item.py - 1.5 * radius);

                ctx.fillStyle = ctx.strokeStyle;
                ctx.fill(path);

                break;

            case 'circle':
            default:
                path.arc(item.px, item.py, radius, 0, 2 * Math.PI, false);
                ctx.fill(path);
                ctx.stroke(path);
        }

        ctx.restore();

        ctx.save();
        ctx.fillStyle = item.color || drawOptions.fillStyle;
        ctx.fill(highlightPath);
        ctx.restore();
    }
};

// 绘制icon
SimpleDrawer.prototype.drawIconsWithImage = function (image, time, nextTick) {
    if (time == undefined) {
        time = 1;
    }
    var isFinalFrame = time < 1 ? false : true;

    var that = this;
    var drawOptions = this.getDrawOptions();
    var data = this.getLayer().getData();
    var ctx = this.getCtx();

    var queue = [];
    var group = [];

    for (var i = 0, len = data.length; i < len; i++) {
        var item = data[i];
        // if (item.px < 0 || item.px > ctx.canvas.width || item.py < 0 || item > ctx.canvas.height) {
        //     continue;
        // }

        var scale = drawOptions.scaleRange ? Math.sqrt(that.dataRange.getScale(item.count)) : 1;

        scale *= time;

        var icon = util.copy(drawOptions.icon);

        if (drawOptions.scaleRange) {
            // console.log(scale);
            // debugger;
            icon.width *= scale;
            icon.height *= scale;
            icon.offsetX = icon.offsetX ? icon.offsetX * scale : 0;
            icon.offsetY = icon.offsetY ? icon.offsetY * scale : 0;
        }

        if (i % 100 == 0) {
            group = [];
            queue.push(group);
        }

        group.push({
            item: item, icon: icon
        });

        // this.drawIcon(ctx, item, icon);
    }

    if (queue.length > 0) {
        // console.log('start queue: draw %d icons in total.', data.length);
        var id = parseInt(Math.random() * 10000);
        var loop = function loop() {
            var group = queue.shift();

            // console.log('process %d:  draw %d icons.', id, group.length);
            for (var i = 0; i < group.length; i++) {
                var drawObj = group[i];
                var icon = drawObj.icon;
                var item = drawObj.item;

                that.drawImage(ctx, drawObj.item, drawObj.icon, image);

                // add path for event trigger
                var path = new Path2D();
                var offsetX = icon.offsetX;
                var offsetY = icon.offsetY;
                var width = icon.width || 0;
                var height = icon.height || 0;

                var path = new Path2D();
                var x = item.px - width / 2 - offsetX,
                    y = item.py - height / 2 - offsetY;

                path.rect(x, y, width, height);

                // ctx.stroke(path);

                isFinalFrame && that._elementPaths.push(path);
            }
            if (queue.length > 0) {
                that._timer = setTimeout(loop, 0);
            }
        };
        that._timer = setTimeout(loop, 0);
    }
};

SimpleDrawer.prototype.drawImage = function (ctx, item, icon, image) {
    var width = icon.width || 0;
    var height = icon.height || 0;
    var offsetX = icon.offsetX || 0;
    var offsetY = icon.offsetY || 0;

    var pixelRatio = util.getPixelRatio(ctx);
    var x = item.px - width / 2 - offsetX,
        y = item.py - height / 2 - offsetY;

    var color = item.color || icon.color || undefined;

    ctx.save();
    ctx.scale(pixelRatio, pixelRatio);
    if (color) {
        var color = color.replace('rgba(', "").replace(")", "").split(",");
        // create offscreen buffer,
        var buffer = document.createElement('canvas');

        var bx = buffer.getContext('2d');
        var pixelRatio = 2;

        buffer.width = width * pixelRatio;
        buffer.height = height * pixelRatio;

        bx.drawImage(image, 0, 0, buffer.width, buffer.height);

        var imgData = bx.getImageData(0, 0, buffer.width, buffer.height);
        var data = imgData.data;

        for (var i = 0; i < data.length; i += 4) {
            var red = data[i + 0];
            var green = data[i + 1];
            var blue = data[i + 2];
            var alpha = data[i + 3];

            // skip transparent/semiTransparent pixels
            if (alpha < 100 || red > 200 && green > 200 && blue > 200) {
                continue;
            }

            data[i + 0] = parseInt(color[0]);
            data[i + 1] = parseInt(color[1]);
            data[i + 2] = parseInt(color[2]);
        }

        bx.putImageData(imgData, 0, 0);

        image = buffer;
    }

    ctx.drawImage(image, x, y, width, height);
    ctx.restore();
};

SimpleDrawer.prototype.drawIconsWithFont = function (iconfont, text, time, nextTick) {

    var that = this;
    var drawOptions = this.getDrawOptions();
    var data = this.getLayer().getData();
    var datasetRange = this._getDatasetRange(time, nextTick);
    var ctx = this.getCtx();

    var animation = this.getLayer().getAnimation();
    if (time === undefined || animation == 'time') {
        time = 1;
    }

    var isFinalFrame = time < 1 ? false : true;

    var highlightElement = this.getHighlightElement();

    var zoomScale = 1 + (this.getMap().getZoom() - 6) * 0.1;
    var maxScale = drawOptions.maxScale || 2,
        minScale = drawOptions.minScale || 0.5;
    // keep scale in [minScale, maxScale];
    zoomScale = Math.max(Math.min(zoomScale, maxScale), minScale);

    // console.log('map zoom: ' + this.getMap().getZoom() + ', zoomScale: ' + zoomScale);

    drawOptions.size = drawOptions.size || 16;

    var baseSize = 16;

    var forceDrawEverything = this.getLayer().get('forceDrawEverything');
    for (var i = datasetRange[0], len = datasetRange[1]; i < len; i++) {
        var item = data[i];
        if (!forceDrawEverything && (item.px < 0 || item.px > ctx.canvas.width || item.py < 0 || item.py > ctx.canvas.height)) {
            continue;
        }
        var scale = drawOptions.scaleRange ? Math.sqrt(that.dataRange.getScale(item.count)) : drawOptions.size / baseSize;

        scale *= zoomScale;

        var icon = drawOptions.icon;

        var width = baseSize * scale;
        var height = baseSize * scale;

        var pixelRatio = util.getPixelRatio(ctx);

        ctx.save();
        ctx.font = baseSize * scale + "px " + iconfont;
        ctx.scale(pixelRatio, pixelRatio);

        if (isFinalFrame) {
            // add path for event trigger
            var path = new Path2D();
            path.rect(item.px - width * 0.6 / 2, item.py - height * 0.7, width * 0.6, height * 0.8);
            // ctx.stroke(path);

            path.data = item;
            this._elementPaths.push(path);
            // reset highlightElement since there may be some element out of canvas
            if (highlightElement && highlightElement.data._id == item._id) {
                highlightElement.data = item;
                highlightElement.path = path;
                this._highlightElement = highlightElement;
            }
        }

        if (highlightElement && highlightElement.data._id == item._id) {
            ctx.restore();
            continue;
        }

        // 中心圆点的白色填充
        ctx.beginPath();
        ctx.fillStyle = '#fff';
        ctx.arc(item.px, item.py - height * 0.55, width * 0.2, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = item.color || icon.color || drawOptions.fillStyle;
        ctx.globalAlpha = drawOptions.fillAlpha || 1;
        ctx.fillText(text, item.px - width / 2, item.py + 0.1 * height);

        // ctx.beginPath();
        // ctx.arc(item.px, item.py, 2, 0, 2 * Math.PI, false);
        // ctx.closePath();
        // ctx.fill();

        ctx.restore();
    }

    if (highlightElement) {
        var item = highlightElement.data;
        if (!forceDrawEverything && (item.px < 0 || item.px > ctx.canvas.width || item.py < 0 || item.py > ctx.canvas.height)) {
            return;
        }
        var scale = drawOptions.scaleRange ? Math.sqrt(that.dataRange.getScale(item.count)) : drawOptions.size / baseSize;

        scale *= zoomScale;

        scale *= 1.5;

        var icon = drawOptions.icon;

        var width = baseSize * scale;
        var height = baseSize * scale;

        var pixelRatio = util.getPixelRatio(ctx);

        ctx.save();
        ctx.font = baseSize * scale + "px " + iconfont;
        ctx.scale(pixelRatio, pixelRatio);
        ctx.fillStyle = item.color || icon.color || drawOptions.fillStyle;
        ctx.fillText(text, item.px - width / 2, item.py + 0.1 * height);
        ctx.restore();
    }
};

// 使用webgl来绘点，支持更大数据量的点
SimpleDrawer.prototype.drawWebglPoint = function (time, nextTick) {

    var data = this.getLayer().getData();

    if (!data) {
        return;
    }

    var gl = this.getCtx();

    var vs, fs, vs_s, fs_s;

    vs = gl.createShader(gl.VERTEX_SHADER);
    fs = gl.createShader(gl.FRAGMENT_SHADER);

    vs_s = ['attribute vec4 a_Position;', 'attribute vec4 a_Color;', 'attribute float a_PointSize;', 'varying vec4 v_Color;', 'void main() {', 'gl_Position = a_Position;', 'v_Color = a_Color;', 'gl_PointSize = a_PointSize;', '}'].join('');

    fs_s = ['precision mediump float;', 'varying vec4 v_Color;', 'void main() {', 'gl_FragColor = v_Color;', '}'].join('');

    var program = gl.createProgram();
    gl.shaderSource(vs, vs_s);
    gl.compileShader(vs);
    gl.shaderSource(fs, fs_s);
    gl.compileShader(fs);
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.bindAttribLocation(program, 0, 'a_Position'); // http://stackoverflow.com/questions/20305231/webgl-warning-attribute-0-is-disabled-this-has-significant-performance-penalt
    gl.linkProgram(program);
    gl.useProgram(program);

    var a_Position = gl.getAttribLocation(program, 'a_Position');

    var a_PointSize = gl.getAttribLocation(program, 'a_PointSize');

    var uFragColor = gl.getUniformLocation(program, 'u_FragColor');

    //gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var halfCanvasWidth = gl.canvas.width / 2;
    var halfCanvasHeight = gl.canvas.height / 2;

    // used to pick color rgba
    var tmpCanvas = document.createElement('canvas');
    var tmpCtx = tmpCanvas.getContext('2d');
    tmpCanvas.width = 1;
    tmpCanvas.height = 1;

    // create vertices buffer
    var verticesData = [];
    var colorsData = [];
    var count = 0;
    var datasetRange = this._getDatasetRange(time, nextTick);
    var forceDrawEverything = this.getLayer().get('forceDrawEverything');
    for (var i = datasetRange[0], len = datasetRange[1]; i < len; i++) {
        var item = data[i];

        var x = (item.px - halfCanvasWidth) / halfCanvasWidth;
        var y = (halfCanvasHeight - item.py) / halfCanvasHeight;

        if (!forceDrawEverything && (x < -1 || x > 1 || y < -1 || y > 1)) {
            continue;
        }
        verticesData.push(x, y);

        tmpCtx.fillStyle = item.color || this.getDrawOptions().fillStyle;
        tmpCtx.fillRect(0, 0, 1, 1);
        var colored = tmpCtx.getImageData(0, 0, 1, 1).data;
        colorsData.push(colored[0] / 255, colored[1] / 255, colored[2] / 255, colored[3] / 255);

        count++;
    }

    var vertices = new Float32Array(verticesData);
    var colors = new Float32Array(colorsData);
    var n = count; // The number of vertices

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    var colorBuffer = gl.createBuffer();
    if (!colorBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    var a_Color = gl.getAttribLocation(program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);

    gl.vertexAttrib1f(a_PointSize, this.getRadius());

    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_SUBTRACT);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_COLOR);

    gl.drawArrays(gl.POINTS, 0, n);
};

// 使用webgl来绘线，支持更大数据量的线
SimpleDrawer.prototype.drawWebglPolyline = function () {
    var data = this.getLayer().getData();

    if (!data) {
        return;
    }

    var gl = this.getCtx();

    var vs, fs, vs_s, fs_s;

    vs = gl.createShader(gl.VERTEX_SHADER);
    fs = gl.createShader(gl.FRAGMENT_SHADER);

    vs_s = ['attribute vec4 a_Position;', 'void main() {', 'gl_Position = a_Position;', 'gl_PointSize = 30.0;', '}'].join('');

    fs_s = ['precision mediump float;', 'uniform vec4 u_FragColor;', 'void main() {', 'gl_FragColor = u_FragColor;', '}'].join('');

    var program = gl.createProgram();
    gl.shaderSource(vs, vs_s);
    gl.compileShader(vs);
    gl.shaderSource(fs, fs_s);
    gl.compileShader(fs);
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    //gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var halfCanvasWidth = gl.canvas.width / 2;
    var halfCanvasHeight = gl.canvas.height / 2;

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    var a_Position = gl.getAttribLocation(program, 'a_Position');
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    var uFragColor = gl.getUniformLocation(program, 'u_FragColor');

    var tmpCanvas = document.createElement('canvas');
    var tmpCtx = tmpCanvas.getContext('2d');
    tmpCanvas.width = 1;
    tmpCanvas.height = 1;
    tmpCtx.fillStyle = this.getDrawOptions().strokeStyle || 'red';
    tmpCtx.fillRect(0, 0, 1, 1);
    var colored = tmpCtx.getImageData(0, 0, 1, 1).data;

    gl.uniform4f(uFragColor, colored[0] / 255, colored[1] / 255, colored[2] / 255, colored[3] / 255);

    gl.lineWidth(this.getDrawOptions().lineWidth || 1);

    for (var i = 0, len = data.length; i < len; i++) {
        var geo = data[i].pgeo;

        var verticesData = [];

        for (var j = 0; j < geo.length; j++) {
            var item = geo[j];

            var x = (item[0] - halfCanvasWidth) / halfCanvasWidth;
            var y = (halfCanvasHeight - item[1]) / halfCanvasHeight;
            verticesData.push(x, y);
        }
        var vertices = new Float32Array(verticesData);
        // Write date into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.drawArrays(gl.LINE_STRIP, 0, geo.length);
    }
};
'use strict';

function GraphDrawer() {
    Drawer.apply(this, arguments);
}

util.inherits(GraphDrawer, Drawer);

GraphDrawer.prototype.drawMap = function (time, nextTick) {
    // GraphDrawer.prototype.drawMap = function(time) {
    var dataType = this.getLayer().getDataType();

    this.beginDrawMap();

    var data = this.getLayer().getData();
    var ctx = this.getCtx();
    var drawOptions = this.getDrawOptions();

    ctx.beginPath();

    var graphType = drawOptions.graphType || 'pie';

    switch (graphType) {
        case 'column':
            this.drawColumn(time, nextTick);
            break;
        case 'bar':
            this.drawBar(time, nextTick);
            break;
        case 'pie':
        default:
            this.drawPie(time, nextTick);
    }

    this.endDrawMap();
};

GraphDrawer.prototype.drawPie = function (time, nextTick) {
    var that = this;
    var drawOptions = this.getDrawOptions();
    var data = this.getLayer().getData();
    var dataSetRange = this._getDatasetRange(time, nextTick);
    var ctx = this.getCtx();
    var seriesColorVal = drawOptions.colors || ["red", "blue", "green"];

    // scale size with map zoom
    var zoomScale = 1 + (this.getMap().getZoom() - 6) * 0.15;
    // keep scale in [0.5, 2];
    zoomScale = Math.max(Math.min(zoomScale, 2), 0.5);

    var forceDrawEverything = this.getLayer().get('forceDrawEverything');
    for (var i = dataSetRange[0], len = dataSetRange[1]; i < len; i++) {
        var item = data[i];

        if (!item.sum) {
            item.sum = item.values.reduce(function (sum, val) {
                return sum + +val;
            }, 0);
        }

        if (!forceDrawEverything && (item.px < 0 || item.px > ctx.canvas.width || item.py < 0 || item.py > ctx.canvas.height) || item.sum <= 0) {
            continue;
        }
        var path = new Path2D();

        var radius = this.getRadius();

        var scale = drawOptions.scaleRange ? Math.sqrt(this.dataRange.getScale(item.count)) : 1;

        scale *= zoomScale;

        var startEven = -0.5 * Math.PI,
            startOdd = -0.5 * Math.PI;

        radius *= scale;

        var colors = seriesColorVal;

        for (var j = 0; j < item.values.length; j++) {

            var color = colors[j % colors.length];
            var isOddSlice = j % 2 == 0,
                startRad = isOddSlice ? startOdd : startEven,
                sliceRad = 2 * Math.PI * item.values[j] / item.sum,
                endRad = isOddSlice ? startOdd + sliceRad : startEven - sliceRad;

            var path = new Path2D();

            path.arc(item.px, item.py, radius, 0, 2 * Math.PI, false);

            path.data = item;
            this._elementPaths.push(path);

            ctx.save();
            ctx.fillStyle = color;

            ctx.beginPath();
            ctx.moveTo(item.px, item.py);

            ctx.arc(item.px, item.py, radius, startRad, endRad, !isOddSlice);

            ctx.lineTo(item.px, item.py);
            ctx.closePath();
            ctx.fill();

            ctx.restore();

            if (isOddSlice) {
                startOdd = endRad;
            } else {
                startEven = endRad;
            }
        }
    }
};

GraphDrawer.prototype.drawColumn = function (time, nextTick) {

    var that = this;
    var drawOptions = this.getDrawOptions();
    var data = this.getLayer().getData();
    var dataSetRange = this._getDatasetRange(time, nextTick);
    var ctx = this.getCtx();
    var colorScheme = drawOptions.colors || ["red", "blue", "green"];
    var dataRange = this.getLayer().getDataRange();
    var maxValue = dataRange ? dataRange.max : 0;

    // scale size with map zoom
    var zoomScale = 1 + (this.getMap().getZoom() - 6) * 0.15;
    // keep scale in [0.5, 2];
    zoomScale = Math.max(Math.min(zoomScale, 2), 0.5);

    var offset = drawOptions.offset || { x: 0.5, y: 0.5 };

    var padding = drawOptions.padding || 1 / 3;

    var forceDrawEverything = this.getLayer().get('forceDrawEverything');
    for (var i = dataSetRange[0], len = dataSetRange[1]; i < len; i++) {
        var item = data[i];
        if (!forceDrawEverything && (item.px < 0 || item.px > ctx.canvas.width || item.py < 0 || item.py > ctx.canvas.height )|| item.sum <= 0) {
            continue;
        }
        var path = new Path2D();

        var radius = this.getRadius();

        var scale = drawOptions.scaleRange ? Math.sqrt(this.dataRange.getScale(item.count)) : 1;

        scale *= zoomScale;

        radius *= scale;

        var count = item.values.length,
            rectWidth = 2 * radius / (count + (count + 1) * padding),
            rectPadding = rectWidth * padding,
            rectRaio = 2 * radius / maxValue,
            xOffset = offset.x * 2 * radius,
            yOffset = offset.y * 2 * radius;

        for (var j = 0, len2 = item.values.length; j < len2; j++) {

            var rectHeight = item.values[j] * rectRaio,
                startX = item.px - xOffset + (j + 1) * rectPadding + j * rectWidth,
                startY = item.py - yOffset + 2 * radius - rectHeight,
                color = colorScheme[j % colorScheme.length],
                path = new Path2D();

            path.rect(startX, startY, rectWidth, rectHeight);

            path.data = item;
            this._elementPaths.push(path);

            ctx.save();
            ctx.fillStyle = color;
            ctx.fillRect(startX, startY, rectWidth, rectHeight);

            ctx.fill();

            ctx.restore();
        }
    }
};

GraphDrawer.prototype.drawBar = function (time, nextTick) {

    var that = this;
    var drawOptions = this.getDrawOptions();
    var data = this.getLayer().getData();
    var dataSetRange = this._getDatasetRange(time, nextTick);
    var ctx = this.getCtx();

    var dataRange = this.getLayer().getDataRange();
    var maxValue = dataRange ? dataRange.max : 0;

    var colorScheme = drawOptions.colors || ["red", "blue", "green"];

    // scale size with map zoom
    var zoomScale = 1 + (this.getMap().getZoom() - 6) * 0.15;
    // keep scale in [0.5, 2];
    zoomScale = Math.max(Math.min(zoomScale, 2), 0.5);

    var offset = drawOptions.offset || { x: 0.5, y: 0.5 };

    var padding = drawOptions.padding || 1 / 3;

    var forceDrawEverything = this.getLayer().get('forceDrawEverything');
    for (var i = dataSetRange[0], len = dataSetRange[1]; i < len; i++) {
        var item = data[i];
        if (!forceDrawEverything && (item.px < 0 || item.px > ctx.canvas.width || item.py < 0 || item.py > ctx.canvas.height )|| item.sum <= 0) {
            continue;
        }
        var path = new Path2D();

        var radius = this.getRadius();

        var scale = drawOptions.scaleRange ? Math.sqrt(this.dataRange.getScale(item.count)) : 1;

        scale *= zoomScale;

        radius *= scale;

        var count = item.values.length,
            rectHeight = 2 * radius / (count + (count + 1) * padding),
            rectPadding = rectHeight * padding,
            rectRaio = 2 * radius / maxValue,
            xOffset = offset.x * 2 * radius,
            yOffset = offset.y * 2 * radius;

        for (var j = 0; j < count; j++) {

            var rectWidth = item.values[j] * rectRaio,
                startX = item.px - xOffset,
                startY = item.py - yOffset + (j + 1) * rectPadding + j * rectHeight,
                color = item.color || colorScheme[j % colorScheme.length],
                path = new Path2D();

            path.rect(startX, startY, rectWidth, rectHeight);

            path.data = item;
            this._elementPaths.push(path);

            ctx.save();
            ctx.fillStyle = color;
            ctx.fillRect(startX, startY, rectWidth, rectHeight);

            ctx.fill();

            ctx.restore();
        }
    }
};
/**
 * @file Heatmap Draw
 * @author nikai (@胖嘟嘟的骨头, nikai@baidu.com)
 */

/* globals Drawer, util drawOptions map*/

'use strict';

function HeatmapDrawer() {
    var self = this;
    self.masker = {};
    Drawer.apply(this, arguments);
    this._max = 20;
    this._data = [];
}

util.inherits(HeatmapDrawer, Drawer);

HeatmapDrawer.prototype.drawMap = function (time, nextTick) {
    // console.log('---??? do ')
    var self = this;

    self.Scale && self.Scale.set({
        min: 0,
        max: self.getMax(),
        colors: this.getGradient()
    });

    this.beginDrawMap();

    var ctx = this.getCtx();

    this._width = ctx.canvas.width;
    this._height = ctx.canvas.height;

    var data = this.getLayer().getData();
    this._data = data;

    if (this._width > 0 && this._height > 0) {
        console.time('drawHeatMap');
        this.drawHeatmap(time, nextTick);
        console.timeEnd('drawHeatMap');
    }

    this.endDrawMap();
};

HeatmapDrawer.prototype.scale = function (scale) {
    var self = this;

    scale.change(function (min, max) {
        self.masker = {
            min: min,
            max: max
        };

        self.drawMap();
    });
    self.Scale = scale;
};

util.extend(HeatmapDrawer.prototype, {

    defaultRadius: 10,

    defaultGradient: {
        '0.4': 'blue',
        '0.6': 'cyan',
        '0.7': 'lime',
        '0.8': 'yellow',
        '1.0': 'red'
    },

    getGradient: function getGradient() {
        return this.getDrawOptions().gradient || this.defaultGradient;
    },

    getMax: function getMax() {
        var max = this._max;
        if (this.getDrawOptions().max !== undefined) {
            max = this.getDrawOptions().max;
        } else {
            var dataRange = this.getLayer().getDataRange();
            max = dataRange.min + (dataRange.max - dataRange.min) * 0.7;
        }
        return max;
    },

    data: function data(_data) {
        this._data = _data;
        return this;
    },

    max: function max(_max) {
        this._max = _max;
        return this;
    },

    add: function add(point) {
        this._data.push(point);
        return this;
    },

    clear: function clear() {
        this._data = [];
        return this;
    },

    radius: function radius(r) {
        // create a grayscale blurred circle image that we'll use for drawing points
        var circle = this._circle = document.createElement('canvas'),
            ctx = circle.getContext('2d');

        var shadowBlur = 0;

        if (this.getDrawOptions().shadowBlur !== undefined) {
            shadowBlur = parseFloat(this.getDrawOptions().shadowBlur);
        } else {
            shadowBlur = 0;
        }

        var r2 = Math.max(1, this._r = r + shadowBlur);

        if (this.getDrawOptions().type === 'rect') {
            circle.width = circle.height = r2;
        } else {
            circle.width = circle.height = r2 * 2;
        }

        var offsetDistance;

        if (this.getDrawOptions().shadowBlur !== undefined) {
            ctx.shadowBlur = shadowBlur;
            ctx.shadowColor = 'black';
            offsetDistance = 10000;
        } else {
            offsetDistance = 0;
            var grad = ctx.createRadialGradient(r2 - offsetDistance, r2 - offsetDistance, 0, r2 - offsetDistance, r2 - offsetDistance, r);
            /* 设定各个位置的颜色 */
            grad.addColorStop(0, 'rgba(0, 0, 0, .8)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grad;
        }

        ctx.shadowOffsetX = ctx.shadowOffsetY = offsetDistance;

        ctx.beginPath();
        if (this.getDrawOptions().type === 'rect') {
            ctx.fillRect(-offsetDistance, -offsetDistance, circle.width, circle.height);
        } else {
            ctx.arc(r2 - offsetDistance, r2 - offsetDistance, r, 0, Math.PI * 2, true);
        }
        ctx.closePath();
        ctx.fill();

        return this;
    },

    drawHeatmap: function drawHeatmap(time, nextTick) {
        // if (!this._circle) {
        this.radius(this.getRadius());
        // }

        var ctx = this.getCtx();
        ctx.save();

        ctx.clearRect(0, 0, this._width, this._height);

        // console.log(this.masker)
        // draw a grayscale heatmap by putting a blurred circle at each data point
        var dataType = this.getLayer().getDataType();
        var max = this.getMax();
        if (dataType === 'polyline') {
            ctx.strokeStyle = this.getDrawOptions().strokeStyle || 'rgba(0, 0, 0, 0.8)';

            /*
            ctx.shadowOffsetX = ctx.shadowOffsetY = 0;
            ctx.shadowBlur = 0.1;
            ctx.shadowColor = 'black';
            */

            ctx.lineWidth = this.getDrawOptions().lineWidth || 1;
            ctx.beginPath();
            for (var i = 0, len = this._data.length; i < len; i++) {
                p = this._data[i];
                var geo = p.pgeo;
                ctx.beginPath();
                ctx.moveTo(geo[0][0], geo[0][1]);
                for (var j = 1; j < geo.length; j++) {
                    ctx.lineTo(geo[j][0], geo[j][1]);
                }
                ctx.globalAlpha = Math.max(p.count / max, 0.05);
                ctx.stroke();
            }
        } else {

            var boundary = this.getDrawOptions().boundary || this._circle.width + 50;

            var dataSetRange = this._getDatasetRange(time, nextTick);

            console.time('drawHeatMap');
            var forceDrawEverything = this.getLayer().get('forceDrawEverything');

            for (var i = dataSetRange[0], len = dataSetRange[1]; i < len; i++) {
                var p = this._data[i];
                if (!p.count || (!forceDrawEverything && (p.px < -boundary || p.py < -boundary || p.px > ctx.canvas.width + boundary || p.py > ctx.canvas.height + boundary))) {
                    continue;
                }
                if (p.count < this.masker.min || p.count > this.masker.max) {
                    continue;
                }
                ctx.globalAlpha = Math.max(p.count / max, 0.05);

                ctx.drawImage(this._circle, p.px - this._r, p.py - this._r);
                var path = new Path2D();
                path.arc(p.px - this._r, p.py - this._r, this._circle, 0, 2 * Math.PI, false);
                path.data = p;
                this._elementPaths.push(path);
            }
            console.timeEnd('drawHeatMap');
        }

        // colorize the heatmap, using opacity value of each pixel to get the right color from our gradient
        // console.log( this._width, this._height)

        var colored = ctx.getImageData(0, 0, this._width, this._height);
        this.colorize(colored.data, this.dataRange.getGradient());
        ctx.putImageData(colored, 0, 0);

        ctx.restore();
        return this;
    },

    colorize: function colorize(pixels, gradient) {
        var jMin = 0;
        var jMax = 1024;
        if (this.masker.min) {
            jMin = this.masker.min / this.getMax() * 1024;
        }

        if (this.masker.max) {
            jMax = this.masker.max / this.getMax() * 1024;
        }

        var maxOpacity = this.getDrawOptions().maxOpacity || 0.8;
        for (var i = 3, len = pixels.length, j; i < len; i += 4) {
            j = pixels[i] * 4; // get gradient color from opacity value

            if (pixels[i] / 256 > maxOpacity) {
                pixels[i] = 256 * maxOpacity;
            }

            if (j && j >= jMin && j <= jMax) {
                pixels[i - 3] = gradient[j];
                pixels[i - 2] = gradient[j + 1];
                pixels[i - 1] = gradient[j + 2];
            } else {
                pixels[i] = 0;
            }
        }
    }
});
"use strict";

Mapv.Layer = Layer;
Mapv.CurveUtil = CurveUtil;
Mapv.Intensity = Intensity;
Mapv.GeoUtil = GeoUtil;
window.Mapv = Mapv;
}();