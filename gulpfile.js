const { src, dest, watch, series } = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass')(require('sass'));
const plumber = require('gulp-plumber');
const changed = require('gulp-changed');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const prettify = require('gulp-prettify');
const pugInheritance = require('gulp-pug-inheritance');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const uglifycss = require('gulp-uglifycss');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const include = require('gulp-include');
const del = require('delete');
const optspug = require('pug');

let browserSync = require('browser-sync').create();
sass.compiler = require('sass');

const app = 'app',
    build = 'dist';

const scss = {
    sassOpts: {
        outputStyle: 'expanded',
        includePaths: [
            './node_modules/'
        ]
    },
    sassOptsMinify: {
        outputStyle: 'compressed',
        includePaths: [
            './node_modules/'
        ]
    }
};

const options = {
    del: [
        'frontend'
    ],
    browserSync: {
        server: {
            baseDir: build,
            index: 'index.html'
        }
    },
    htmlPrettify: {
        'indent_size': 2,
        'unformatted': ['pre', 'code', 'style', 'script'],
        'indent_with_tabs': false,
        'preserve_newlines': true,
        'brace_style': 'expand',
        'end_with_newline': true
    },
    include: {
        hardFail: true,
        includePaths: [
          __dirname + '/',
          __dirname + '/node_modules',
          __dirname + '/app/js'
        ]
    },
    pug: {
        pug: optspug,
        pretty: '\t'
    }
}

function clean(cb) {
    return del(options.del, cb);
}

function browsersync() {
    return browserSync.init(options.browserSync);
}

function cssTranspile() {
    return src([
            app + '/scss/*.scss',
            '!'+ app +'/scss/_*.scss'
        ])
        .pipe(sourcemaps.init())
        .pipe(
            sass(scss.sassOpts)
            .on('error', sass.logError)
        )
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('./', {
            includeContent: false,
            sourceRoot: app + '/scss'
        }))
        .pipe(dest(build + '/Assets/css'))
        .pipe(browserSync.stream());
}

function cssMinify() {
    return src([
            app + '/scss/*.scss',
            '!'+ app +'/scss/_*.scss'
        ])
        .pipe(
            sass(scss.sassOpts)
            .on('error', sass.logError)
        )
        .pipe(autoprefixer())
        .pipe(uglifycss())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(dest(build + '/Assets/css'));
}

function jsBundle() {
    return src(['*.js', '!_*.js'], {cwd: app + '/js'})
        .pipe(babel())
        .pipe(include(options.include))
        .pipe(concat('global.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(build + '/Assets/js'));
}

function jsMinify() {
    return src(['*.js', '!_*.js'], {cwd: app + '/js'})
        .pipe(babel())
        .pipe(include(options.include))
        .pipe(concat('global.js'))
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(dest(build + '/Assets/js'));
}

function images() {
    return src(app + '/images/**/*.*')
        .pipe(dest(build + '/Assets/img'));
}

function fonts() {
    return src(app + '/fonts/*.*')
        .pipe(dest(build + '/Assets/fonts'));
}

function html() {
    return src(['*.html', '!_*.html'], {cwd: app})
        .pipe(prettify(options.htmlPrettify))
        .pipe(dest(build));
}

function pugs() {
    return src(['*.pug', '!_*.pug'], {cwd: app})
        .pipe(plumber(function(error){
            console.log('Error with Jade/Pug! -> ', error.message);
            this.emit('end');
        }))
        .pipe(changed(build, {extension: '.html'}))
        .pipe(pugInheritance({
            basedir: app,
            skip: ['node_modules']
        }))
        .pipe(pug(options.pug))
        .on('error', function (error) {
            console.error('Error with Jade/Pug! -> ' + error);
            this.emit('end');
        })
        .pipe(prettify(options.htmlPrettify))
        .pipe(plumber.stop())
        .pipe(dest(build));
}

function watchFunction() {
    var watcherCss = watch(app + '/scss/**/*.scss', cssTranspile);
    var watcherMinifyCss = watch(app + '/scss/**/*.scss', cssMinify);
    var watcherImage = watch(app + '/images/**/*', images);
    var watcherFonts = watch(app + '/fonts/**/*', fonts);
    var watcherJs = watch(app + '/js/**/*.js', jsBundle);
    var watcherJsMinify = watch(app + '/js/**/*.js', jsMinify);
    var watcherHtml = watch([
        app + '*.html',
        app + '**/*.html'
    ], html);
    var watcherPug = watch(
        [
            app + '*.pug',
            app + '**/*.pug'
        ], pugs
    );
    watcherCss.on('change', function(path, stats) {
        browserSync.reload();
    });
    watcherMinifyCss.on('change', function(path, stats) {
        browserSync.reload();
    });
    watcherImage.on('change', function(path, stats) {
        browserSync.reload();
    });
    watcherFonts.on('change', function(path, stats) {
        browserSync.reload();
    });
    watcherJs.on('change', function(path, stats) {
        browserSync.reload();
    });
    watcherJsMinify.on('change', function(path, stats) {
        browserSync.reload();
    });
    watcherHtml.on('change', function(path, stats) {
        browserSync.reload();
    });
    watcherPug.on('change', function(path, stats) {
        browserSync.reload();
    });
}

exports.watch = watchFunction;

exports.start = function() {
    clean();
    cssTranspile();
    cssMinify();
    images();
    fonts();
    jsBundle();
    jsMinify();
    html();
    pugs();
    browsersync();
    watchFunction();
}

exports.default = function(cb) {
    cb();
    console.log('Copyright © 2019. Developed by duchv.')
}
