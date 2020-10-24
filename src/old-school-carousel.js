function OldSchoolCarousel (param) {
	var _this = this;
	if (typeof param === 'undefined') throw 'First parameter is required';

	// Default settings
	this.container = null;
	this.direction = '|';
	this.dragging = false;
	this.posX = 0;
	this.settings = {
		animation: 'slide', // slide, fadein, fadeout
		duration: 200
	};
	this.speed = 10;
	this.speedLevels = [10, 50, 100, 200, 500, 1000, 5000, 10000];

	if (typeof param === 'string' && param.trim().length) this.container = document.querySelector(param.trim());
	if (typeof param === 'object') this.container = param;
	if (
		this.container.constructor.toString().indexOf('HTML') === -1
		&& this.container.constructor.toString().indexOf('Element') === -1
	) throw 'The first parameter should be a query selector or an HTML element';

	this.init();
}

OldSchoolCarousel.prototype.compensateSlides = function (i, position) {
	var clone = this.slides[i].cloneNode(true);
	this.slideWrapper.insertAdjacentElement(position, clone);
};

OldSchoolCarousel.prototype.determineSpeed = function (offset) {
	for (var i = 0; i < this.speedLevels.length; i ++) {
		if (Math.abs(offset) > this.speedLevels[i]) this.speed = offset > 0 ? this.speedLevels[i] : -this.speedLevels[i];
	}
	console.log(this.speed);
};

OldSchoolCarousel.prototype.init = function () {
	var _this = this, slides = [];
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
	Array.prototype.forEach.call(this.slideWrapper.querySelectorAll('.slide'), function (slide) {
		slides.push(slide);
	});
	this.slides = slides;
	// this.firstSlide = slides[0];
	// this.lastSlide = slides[slides.length - 1];

	if (this.settings.animation === 'slide') {
		// this.compensateSlides(0, 'afterbegin');
		// this.compensateSlides(slides.length - 1, 'beforeend');

		this.container.addEventListener('mousedown', function (e) {
			_this.posX = e.clientX; // Mousedown position marked as anchor
			_this.dragging = true; // In dragging mode
			document.addEventListener('mousemove', mousemoveFunc);
		});

		window.addEventListener('mouseup', function () {
			_this.dragging = false; // Exit dragging mode
			document.removeEventListener('mousemove', mousemoveFunc, false);
			_this.snapPosition();
		});
	}
};

OldSchoolCarousel.prototype.mostDisplaySlide = function () {
	var container = this.container.getBoundingClientRect(),
		wrapper = this.slideWrapper.getBoundingClientRect(),
		offset = (wrapper.left - container.left) / container.width;
	return Math.floor(0.5 - offset);
};

OldSchoolCarousel.prototype.movemove = function (e) {
	if (!this.dragging) return;
	var transform = getComputedStyle(this.slideWrapper).getPropertyValue('transform'),
		matrix = transform.replace(/[^0-9\-.,]/g, '').split(','),
		transform_x = parseFloat((matrix.length > 6) ? matrix[12] : matrix[4]),
		offset = e.clientX - this.posX;
	// console.log('speed id %s and direction is %s', this.speed, this.direction);

	this.slideWrapper.style.transform = 'translateX(' + (transform_x + offset) + 'px)';
	this.slideWrapper.style.WebkitTransform = 'translateX(' + (transform_x + offset) + 'px)';
	this.posX += offset;
	this.mostDisplaySlide();
	this.determineSpeed(offset);
};

OldSchoolCarousel.prototype.snapPosition = function () {
	console.log('released on %s, speed is %s', this.mostDisplaySlide(), this.speed);
};

HTMLElement.prototype.carousel = function () {
	new OldSchoolCarousel(this);
};
