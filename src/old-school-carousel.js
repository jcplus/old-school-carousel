function Carousel (param) {
	var _this = this;

	// Validate the first parameter
	// 验证第一个参数
	if (typeof param === 'undefined') throw 'First parameter is required';

	// Default settings
	this.active = 0;
	this.activeSlide = null;
	this.container = null;
	this.direction = '|';
	this.dragging = false;
	this.edgeLimit = 0.25;
	this.posX = 0;
	this.settings = {
		animation: 'slide', // slide, fadein, fadeout
		className: 'carousel',
		slideSelector: '.slide',
		wrapperSelector: '.slides',
		duration: 200
	};
	this.slides = []; // 用来存放幻灯片的数组
	this.speedLimit = 10;

	// String is assumed as query selector
	// 字串会被当做query选择器
	if (typeof param === 'string' && param.trim().length) {
		this.container = document.querySelector(param.trim());
	}

	// Object is assumed as an HTML element
	// 对象会被当做ROM元素
	if (typeof param === 'object') this.container = param;

	// Validate the container
	// 验证轮播容器是否为合法的HTML元素
	if (
		this.container.constructor.toString().indexOf('HTML') === -1
		&& this.container.constructor.toString().indexOf('Element') === -1
	) throw 'The first parameter should be a query selector or an HTML element';

	// Get the container width
	// 获取容器的宽度
	this.width = this.container.getBoundingClientRect().width;

	// Initialisation
	// 初始化
	this.init();
}

// Carousel.prototype.calculatePosition = function () {
// 	var offset = 0, container = this.container.getBoundingClientRect();
// 	for (var i = 0; i < this.slides.length; i ++) {
// 		if (this.slides[i].getAttribute('index') == this.active) {
// 			offset = i - 1;
// 			break;
// 		}
// 	}
// 	this.wrapper.style.transform = 'translateX(' + (offset * container.width) + 'px)';
// 	this.wrapper.style.WebkitTransform = 'translateX(' + (offset * container.width) + 'px)';
// 	console.log(offset * container.width);
// };

// /**
//  * Get the active slide excluding clones
//  * 获取当前幻灯片不包括副本
//  *
//  * @return {HTMLElement}
//  */
// Carousel.prototype.getCurrentSlide = function () {
// 	var current = this.landingSlide();
// 	console.log(current);
// 	return this.wrapper.querySelector(this.settings.slideSelector + '[index="' + this.active + '"]:not([clone])');
// };

/**
 * Get all slides including clones in the wrapper
 * 获取容器内所有幻灯片元素包括副本
 *
 * @return {Array}
 */
Carousel.prototype.getAllSlides = function () {
	return Array.prototype.slice.call(this.wrapper.querySelectorAll(this.settings.slideSelector));
};

/**
 * Get the index of the given element inside the wrapper
 * 获取元素在容器内的序号
 *
 * @param  {HTMLElement} element Slide element
 * @return {Number}              -1 = not found
 */
Carousel.prototype.getIndex = function (element) {
	var nodes = Array.prototype.slice.call(
		this.wrapper.querySelectorAll(this.settings.slideSelector)
	);
	return nodes.indexOf(element);
};

/**
 * Initialisation 初始化
 *
 * @return {Carousel} Return self for chaining 返回自己以便实现方法链
 */
Carousel.prototype.init = function () {
	var _this = this,
		clones = [],
		slides = [],
		mousemoveFunc = function (e) {
			// Mousemove function defined here for easy unbind later
			// 鼠标移动函数，定义在这是为了方便之后解绑
			_this.mousemove(e);
		};

	// Add class name to the container
	// 为容器添加内置class
	this.container.classList.add(this.settings.className);

	// Set animation type, use default if not found
	// 为容器定义动画类型，没找到则使用默认类型
	if (!this.container.hasAttribute('animation')) {
		this.container.setAttribute('animation', this.settings.animation);
	}

	// Get the slide wrapper
	// 获取幻灯片容器，没找到则抛异常
	this.wrapper = this.container.querySelector(this.settings.wrapperSelector);
	if (!this.wrapper) throw 'No slide wrapper found';

	// Get slides
	// 获取幻灯片，没找到则抛异常
	if (!this.wrapper.querySelectorAll(this.settings.slideSelector).length) {
		throw 'No slides wrapper found';
	}

	// Convert NodeList to Array
	// 将 NodeList 里的幻灯片处理后保存在数组内
	Array.prototype.forEach.call(
		this.wrapper.querySelectorAll('.slide'),
		function (slide, i) {

			// Set width to each slide using the container width
			// 为每张幻灯片设置容器宽度
			slide.style.width = _this.width + 'px';
			slide.setAttribute('index', i);

			// Set active slide number if attribute "active" is found
			// If more than one slide having attribute "active", the last one is counted
			// 如果幻灯片元素带有 "active" 属性则该幻灯片的序号为当前显示幻灯片的序号
			// 如果有超过一个幻灯片带有 "active" 属性，则最后一个会被使用
			if (slide.getAttribute('active') !== null) {
				_this.active = i;
				slide.removeAttribute('active');
			}

			// Store in array
			// 保存在数组里
			_this.slides.push(slide);
	});

	// Set active slide
	// 根据 this.active 设置当前激活的幻灯片
	this.activeSlide = this.slides[this.active];

	// 针对动画类型的初始化
	switch (this.settings.animation) {
		case 'fadein':
			break;
		case 'fadeout':
			break;
		case 'slide':
			// mousedown for desktop, touchstart for mobile
			// 桌面监听 mousedown，移动端监听 touchstart
			['mousedown', 'touchstart'].forEach(function (event_name) {
				_this.container.addEventListener(event_name, function (e) {
					_this.container.removeAttribute('animating');
					_this.current = _this.getIndex(_this.landingSlide());
					_this.posX = e.clientX; // Mousedown position marked as anchor
					_this.dragging = true; // In dragging mode
					document.addEventListener('mousemove', mousemoveFunc);
				});
			});

			// mouseup for desktop, touchend for mobile
			// 桌面监听 mouseup，移动端监听 touchend
			['mouseup', 'touchend'].forEach(function (event_name) {
				window.addEventListener(event_name, function () {
					_this.dragging = false; // Exit dragging mode
					_this.rearranged = false;
					document.removeEventListener('mousemove', mousemoveFunc, false);
					_this.snapPosition();
				});
			});

			// Add extra clone slides for infinite slide effect
			this.insertBefore(this.slides[this.slides.length - 2], 0);
			this.insertBefore(this.slides[this.slides.length - 1], 0);
			this.insertAfter(this.slides[1], this.slides.length - 1);
			this.insertAfter(this.slides[0], this.slides.length - 1);

			this.snapPosition(this.activeSlide, true);
			break;
	}
	return this;
};

Carousel.prototype.insertAfter = function (element, i) {
	var clone = element.cloneNode(true),
		slide = this.slides[i];
	clone.setAttribute('clone', '');
	clone.setAttribute('index', element.getAttribute('index'));
	slide.insertAdjacentElement('afterend', clone);
	return this;
};

Carousel.prototype.insertBefore = function (element, i) {
	var clone = element.cloneNode(true),
		slide = this.slides[i];
	clone.setAttribute('clone', '');
	clone.setAttribute('index', element.getAttribute('index'));
	slide.insertAdjacentElement('beforebegin', clone);
	return this;
};

Carousel.prototype.landingSlide = function () {
	var container = this.container.getBoundingClientRect(),
		largest_area_slide = null,
		slides = this.getAllSlides();
	for (var i = 0; i < slides.length; i ++) {
		var slide = slides[i].getBoundingClientRect();
		if (
			(
				slide.left - container.left <= 0 &&
				Math.abs(slide.left - container.left) < container.width * this.edgeLimit
			) ||
			(
				slide.left - container.left >= 0
				&& Math.abs(slide.right - container.right) < container.width * (1 - this.edgeLimit)
			)
		) {
			// console.log('i: %s left: %s right: %s offset %s', parseInt(slides[i].getAttribute('index')), slide.left - container.left, slide.right - container.right, container.width * this.edgeLimit);
			largest_area_slide = slides[i];
		}
	}
	// console.log(largest_area_slide, this.getIndex(largest_area_slide));
	return largest_area_slide;
};

Carousel.prototype.getTransformX = function () {
	var transform = getComputedStyle(this.wrapper).getPropertyValue('transform'),
		matrix = transform.replace(/[^0-9\-.,]/g, '').split(','),
		transform_x = parseFloat((matrix.length > 6) ? matrix[12] : matrix[4]);
	return transform_x;
};

Carousel.prototype.mousemove = function (e) {
	if (!this.dragging) return;
	var container = this.container.getBoundingClientRect(),
		transform_x = this.getTransformX();
		slide = null;

	// Get offset X
	// 获取 X 轴上的位移
	this.offset = e.clientX - this.posX;

	// Determine direction
	// 决定方向
	if (this.offset > 0) {
		this.direction = '>';
	} else if (this.offset < 0) {
		this.direction = '<';
	} else {
		this.direction = '|';
	}

	// Update horizontal position
	// 缓存 X 轴位置
	this.posX += this.offset;

	// Manipulate transform
	// 执行位移
	this.transform(transform_x + this.offset);
};

Carousel.prototype.moveSlide = function (target_index) {
	var offset = 0, position, slide_to_move = null;
	if (this.current > target_index) {
		offset = 1;
		position = 'afterbegin';
		slide_to_move = this.getAllSlides()[this.getAllSlides().length - 1];
	} else if (this.current < target_index) {
		offset = -1;
		position = 'beforeend';
		slide_to_move = this.getAllSlides()[0];
	} else {
		console.log('no movements required');
		return;
	}
	slide_to_move = this.wrapper.removeChild(slide_to_move);
	this.wrapper.insertAdjacentElement(position, slide_to_move);
	console.log(slide_to_move, offset);
	return offset;
};

/**
 * Snap the slides wrapper to the correct ending position
 * 将幻灯片容器位移至正确的停止位置
 *
 * @param  {HTMLElement} target    It's the landing slide if given
 * @param  {Boolean}     immediate Disable animation and jump to the position
 * @return {void}
 */
Carousel.prototype.snapPosition = function (target, immediate) {
	var container = this.container.getBoundingClientRect(),
		slides = this.getAllSlides(),
		target_index,
		transform_x = this.getTransformX();

	// Get landing slide index if target is not defined or out of range
	// 如果 "target" 没有定义或者超出幻灯片范围（不包含副本）获取即将到达的幻灯片序号
	if (
		typeof target === 'undefined'
		|| target === null
		|| target.constructor.toString().indexOf('HTML') === -1
		|| target.constructor.toString().indexOf('Element') === -1
	) target = this.landingSlide();

	if (!target) {
		if (this.direction === '>') {
			target = this.wrapper.querySelectorAll(this.settings.slideSelector)[0];
		} else if (this.direction === '<') {
			target = this.wrapper.querySelectorAll(this.settings.slideSelector)[
				this.wrapper.querySelectorAll(this.settings.slideSelector).length - 1
			];
		} else {
			// target = this.landingSlide();
		}
	}

	if (!target) throw 'Cannot find a landing slide';

	// Set default value of "immediate" to FALSE if given value is not TRUE
	// 如果 "immediate" 传入的值不是 TRUE，为 "immediate" 设置默认值 FALSE
	if (true !== immediate) immediate = false;

	// Get the index of the slide including clones
	// 获得该幻灯片的位置（包括副本）
	target_index = this.getIndex(target);

	if (immediate !== true) {
		// Enable animation if "immediate" is FALSE
		// "immediate" 为 FALSE 时启用动画效果
		this.container.setAttribute('animating', '');
		if (Math.abs(this.offset) > this.speedLimit && this.direction !== '|') {
			this.direction === '>' ? target_index -- : target_index ++;
		}
	} else {
		// Disable "immediate" if it's TRUE
		// "immediate" 为 TRUE 时停用动画效果
		this.container.removeAttribute('animating');
	}

	// Move slide to the next position
	// 将下一帧的幻灯片提前移动到预定位置
	// if (Math.abs(target_index * container.width * -1) - Math.abs(transform_x) > this.width) {}
	console.log('before %s ', target_index);
	if (!immediate && this.current !== target_index) {
		target_index += this.moveSlide(target_index);
	}
	console.log('after %s ', target_index);
	/*
	 * Adjust slide transform after rearranged the slides!!!
	 */

	// Manipulate transform
	// 执行位移
	// console.log(Math.abs(target_index * container.width * -1), Math.abs(transform_x), Math.abs(target_index * container.width * -1) - Math.abs(transform_x));
	this.transform(target_index * container.width * -1);
};

Carousel.prototype.transform = function (amount) {
	this.wrapper.style.transform = 'translateX(' + amount + 'px)';
	this.wrapper.style.MozTransform = 'translateX(' + amount + 'px)';
	this.wrapper.style.WebkitTransform = 'translateX(' + amount + 'px)';
};

/**
 * Create a carousel instance and bind to the element or return the instance if already created
 * 使用该元素创建一个轮播实例并返回该实例，如果已经创建则直接返回该实例
 *
 * @return {Carousel}
 */
HTMLElement.prototype.carousel = function () {
	if (typeof this._carouselInstance !== 'object' || this._carouselInstance !== Carousel) {
		this._carouselInstance = new Carousel(this);
	}
	return this._carouselInstance;
};
