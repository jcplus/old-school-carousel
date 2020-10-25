function Carousel (param) {
	var _this = this;
	if (typeof param === 'undefined') throw 'First parameter is required';

	// Default settings
	this.active = 0;
	this.container = null;
	this.direction = '|';
	this.dragging = false;
	this.posX = 0;
	this.settings = {
		animation: 'slide', // slide, fadein, fadeout
		duration: 200
	};
	this.speed = 10;
	this.speedLevels = [2, 5, 10, 20, 50, 100, 200, 300, 500, 1000];

	if (typeof param === 'string' && param.trim().length) this.container = document.querySelector(param.trim());
	if (typeof param === 'object') this.container = param;
	if (
		this.container.constructor.toString().indexOf('HTML') === -1
		&& this.container.constructor.toString().indexOf('Element') === -1
	) throw 'The first parameter should be a query selector or an HTML element';

	this.width = this.container.getBoundingClientRect().width;
	this.init();
}

Carousel.prototype.calculatePosition = function () {
	var offset = 0, container = this.container.getBoundingClientRect();
	for (var i = 0; i < this.slides.length; i ++) {
		if (this.slides[i].getAttribute('index') == this.active) {
			offset = i - 1;
			break;
		}
	}
	this.slideWrapper.style.transform = 'translateX(' + (offset * container.width) + 'px)';
	this.slideWrapper.style.WebkitTransform = 'translateX(' + (offset * container.width) + 'px)';
	console.log(offset * container.width);
};

Carousel.prototype.determineSpeed = function (offset) {
	for (var i = 0; i < this.speedLevels.length; i ++) {
		if (Math.abs(offset) > this.speedLevels[i]) this.speed = offset > 0 ? this.speedLevels[i] : -this.speedLevels[i];
	}
};

Carousel.prototype.init = function () {
	var _this = this, clones = [], slides = [];
	this.container.classList.add('carousel');
	this.slideWrapper = this.container.querySelector('.slides');

	var mousemoveFunc = function (e) {
		_this.movemove(e);
	};

	if (!this.slideWrapper.querySelectorAll('.slide').length) {
		console.log('%cNo slides found', 'color: yellow');
		return;
	}

	// Set animation type
	if (!this.container.hasAttribute('animation')) this.container.setAttribute('animation', this.settings.animation);

	// Convert NodeList to Array
	Array.prototype.forEach.call(this.slideWrapper.querySelectorAll('.slide'), function (slide, i) {
		slide.style.width = _this.width + 'px';
		slide.setAttribute('index', i);
		if (slide.getAttribute('active') !== null) _this.active = i;
		slides.push(slide);
		clones.push(slide.cloneNode(true));
	});
	this.slides = slides;
	this.cloneSlides = clones;

	if (this.settings.animation === 'slide') {
		// this.insertBefore(clones[clones.length - 1], 0).calculatePosition();

		this.container.addEventListener('mousedown', function (e) {
			_this.container.removeAttribute('animating');
			_this.posX = e.clientX; // Mousedown position marked as anchor
			_this.dragging = true; // In dragging mode
			document.addEventListener('mousemove', mousemoveFunc);
		});

		window.addEventListener('mouseup', function () {
			_this.dragging = false; // Exit dragging mode
			_this.rearranged = false;
			document.removeEventListener('mousemove', mousemoveFunc, false);
			_this.snapPosition();
		});
	}
};

Carousel.prototype.insertBefore = function (element, i) {
	var slide = this.slides[i],
		index = parseInt(slide.getAttribute('index'));
	element.setAttribute('index', index - 1);
	slide.insertAdjacentElement('beforebegin', element);
	return this;
};

Carousel.prototype.mostDisplaySlide = function () {
	var active = null,
		container = this.container.getBoundingClientRect(),
		wrapper = this.slideWrapper.getBoundingClientRect(),
		offset = (wrapper.left - container.left) / container.width;
	// console.log(offset, 0.2 - Math.abs(offset), Math.floor(0.2 - offset));
	for (var i = 0; i < this.slides.length; i ++) {
		var slide = this.slides[i].getBoundingClientRect();
		if (slide.left - container.left) {}
	}
	return Math.floor(0.5 - offset);
};

Carousel.prototype.movemove = function (e) {
	if (!this.dragging) return;
	var container = this.container.getBoundingClientRect(),
		transform = getComputedStyle(this.slideWrapper).getPropertyValue('transform'),
		matrix = transform.replace(/[^0-9\-.,]/g, '').split(','),
		transform_x = parseFloat((matrix.length > 6) ? matrix[12] : matrix[4]),
		offset = e.clientX - this.posX,
		slide = null,
		direction = offset > 0 ? '>' : '<';
	this.posX += offset;

	// console.log(offset);
	// console.log('speed id %s and direction is %s', this.speed, this.direction);

	this.slideWrapper.style.transform = 'translateX(' + (transform_x + offset) + 'px)';
	this.slideWrapper.style.WebkitTransform = 'translateX(' + (transform_x + offset) + 'px)';
	this.determineSpeed(offset);
};

Carousel.prototype.snapPosition = function () {
	var container = this.container.getBoundingClientRect(), target = this.mostDisplaySlide();
	console.log(this.speed);

	// Fast
	if (Math.abs(this.speed) >= 5) {
		if (this.speed > 0) {
			target --;
		} else {
			target ++;
		}
	}
	if (target < 0) target = 0;
	if (target > this.slides.length - 1) target = this.slides.length - 1;

	this.container.setAttribute('animating', '');
	this.slideWrapper.style.transform = 'translateX(' + (target * container.width * -1) + 'px)';
	this.slideWrapper.style.WebkitTransform = 'translateX(' + (target * container.width * -1) + 'px)';
};

HTMLElement.prototype.carousel = function () {
	new Carousel(this);
};
