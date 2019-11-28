var syntax = 'scss', // Syntax: sass or scss;
	gulpVersion = '4'; // Gulp version: 3 or 4
gmWatch = false; // ON/OFF GraphicsMagick watching "img/_src" folder (true/false). Linux install gm: sudo apt update; sudo apt install graphicsmagick

var gulp = require('gulp'),
	gutil = require('gulp-util'),
	sass = require('gulp-sass'),
	browserSync = require('browser-sync'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	cleancss = require('gulp-clean-css'),
	rename = require('gulp-rename'),
	autoprefixer = require('gulp-autoprefixer'),
	notify = require('gulp-notify'),
	rsync = require('gulp-rsync'),
	del = require('del'),
	iconfont = require('gulp-iconfont'),
	iconfontCss = require('gulp-iconfont-css'),
	pug = require('gulp-pug'),
	tinypng = require('gulp-tinypng-free');


// Local Server
gulp.task('browser-sync', function () {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false,
		// open: false,
		// online: false, // Work Offline Without Internet Connection
		// tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
	})
});

// Sass|Scss Styles
gulp.task('styles', function () {
	return gulp.src('app/scss/**/*.scss')
		.pipe(sass({ outputStyle: 'expanded' }))
		.pipe(rename({ suffix: '.min', prefix: '' }))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleancss({ level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.stream())
});

gulp.task('pug', function buildHTML() {
	return gulp.src('app/pug/index.pug')
		.pipe(pug({ pretty: true }))
		.pipe(gulp.dest('app'))
		.pipe(browserSync.stream())
});

// JS
gulp.task('scripts', function () {
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js',
		'app/libs/slick/slick.min.js',
		'app/js/common.js', // Always at the end
	])
		.pipe(concat('scripts.min.js'))
		// .pipe(uglify()) // Mifify js (opt.)
		.pipe(gulp.dest('app/js'))
		.pipe(browserSync.reload({ stream: true }))
});

// HTML Live Reload
gulp.task('code', function () {
	return gulp.src('app/*.html')
		.pipe(browserSync.reload({ stream: true }))
});

// Deploy
gulp.task('rsync', function () {
	return gulp.src('app/**')
		.pipe(rsync({
			root: 'app/',
			hostname: 'username@yousite.com',
			destination: 'yousite/public_html/',
			// include: ['*.htaccess'], // Includes files to deploy
			exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
			recursive: true,
			archive: true,
			silent: false,
			compress: true
		}))
});

// icon fonts
var fontName = 'icons';

// add svg icons to the folder "icons" and use 'iconfont' task for generating icon font
gulp.task('iconfont', async () => {
	gulp.src('app/img/icons/*.svg')
		.pipe(iconfontCss({
			// где будет наш scss файл
			targetPath: '../../scss/icons/_icons.scss',
			// пути подлючения шрифтов в _icons.scss
			fontPath: '../fonts/icons/',
			fontName: fontName
		}))
		.pipe(iconfont({
			fontName: fontName,
			formats: ['svg', 'ttf', 'eot', 'woff', 'woff2'],
			normalize: true,
			fontHeight: 1001
		}))
		.pipe(gulp.dest('app/fonts/icons'))
});

gulp.task('watch', function () {
	gulp.watch('app/' + syntax + '/**/*.' + syntax + '', gulp.parallel('styles'));
	gulp.watch('app/pug/**/*.pug', gulp.parallel('pug'));
	gulp.watch(['libs/**/*.js', 'app/js/common.js'], gulp.parallel('scripts'));
	gulp.watch('app/*.html', gulp.parallel('code'));
});

gulp.task('tinypng', async function (cb) {
	gulp.src('dist/img/**/*.*')
		.pipe(tinypng({}))
		.pipe(gulp.dest('dist/img'));
});

gulp.task('build', async function () {
	let buildHtml = gulp.src('app/**/*.html')
		.pipe(gulp.dest('dist'))
	let buildCss = gulp.src('app/css/**/*.css')
		.pipe(gulp.dest('dist/css'))
	let buildJs = gulp.src('app/js/scripts.min.js')
		.pipe(gulp.dest('dist/js'))
	let buildFonts = gulp.src('app/fonts/**/*.*')
		.pipe(gulp.dest('dist/fonts'))
	let buildImg = gulp.src('app/img/**/*.*')
		.pipe(gulp.dest('dist/img'))
});

gulp.task('default', gulp.parallel('styles', 'scripts', 'browser-sync', 'pug', 'watch'));

