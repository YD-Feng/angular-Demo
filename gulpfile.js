var gulp = require('gulp'),

    copy = require('gulp-copy'),

    uglify = require('gulp-uglify'),

    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),

    gulpIf = require('gulp-if'),
    replace = require('gulp-replace'),

    util = require('gulp-util'),
    notify = require('gulp-notify'),

    argv = require('minimist')(process.argv.slice(2)),
    path = require('path'),
    fs = require('fs'),
    crypto = require('crypto'),
    sequence = require('gulp-sequence'),
    through = require('through2');

//静态资源添加版本号插件
function addAssetVer (options) {
    var ASSET_REG = {
            SCRIPT: /(<script[^>]+src=)['"]([^'"]+)["']/ig,
            STYLESHEET: /(<link[^>]+href=)['"]([^'"]+)["']/ig,
            IMAGE: /(<img[^>]+src=)['"]([^'"]+)["']/ig,
            BACKGROUND: /(url\()(?!data:|about:)([^)]*)/ig
        },
        createHash = function (file, len) {
            return crypto.createHash('md5').update(file).digest('hex').substr(0, len);
        };

    return through.obj(function (file, enc, cb) {

        options = options || {};

        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('addAssetVer', 'Streaming not supported'));
            return cb();
        }

        var content = file.contents.toString();

        var filePath = path.dirname(file.path);

        for (var type in ASSET_REG) {
            if ( !(type === 'BACKGROUND' && !/\.(css|scss|less)$/.test(file.path)) ) {

                content = content.replace(ASSET_REG[type], function (str, tag, src) {

                    src = src.replace(/\?[\s\S]+$/, '').replace(/(^['"]|['"]$)/g, '');

                    if (!/\.[^\.]+$/.test(src)) {
                        return str;
                    }

                    if (options.verStr) {
                        src += options.verStr;
                        return tag + '"' + src + '"';
                    }

                    // remote resource
                    if (/^https?:\/\//.test(src)) {
                        return str;
                    }

                    var assetPath = null;

                    if (type === 'IMAGE') {
                        assetPath = path.join(typeof options.tplImgPathBase != 'undefined' ? options.tplImgPathBase : filePath, src);
                    } else {
                        assetPath = path.join(filePath, src);
                    }

                    if (src.indexOf('/') == 0) {
                        if (options.resolvePath && typeof options.resolvePath === "function") {
                            assetPath = options.resolvePath(src);
                        } else {
                            assetPath = (options.rootPath || "") + src;
                        }
                    }

                    if (fs.existsSync(assetPath)) {

                        var buf = fs.readFileSync(assetPath),
                            md5 = createHash(buf, options.hashLen || 7),
                            verStr = (options.verConnecter || '') + md5;

                        src = src + '?v=' + verStr;
                    } else {
                        return str;
                    }

                    return tag + '"' + src + '"';
                });
            }
        }

        file.contents = new Buffer(content);
        this.push(file);
        cb();
    });
}

//【内部调用函数】控制台错误处理
function handleErrors () {
    var args = Array.prototype.slice.call(arguments);

    notify.onError({
        title : 'compile error',
        message : '<%=error.message %>'
    }).apply(this, args);//替换为当前对象

    this.emit();//提交
}

/*
 * 任务：将 less 编译成 css
 * */
gulp.task('less', function () {
    var stream = gulp.src('src/less/*.less')
        .pipe(less())
        .on("error", handleErrors)
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 7', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .on('error', handleErrors)
        .pipe(gulp.dest('src/css'))
        .pipe(addAssetVer())
        .pipe(minifycss())
        .pipe(gulp.dest('dist/css'));

    return stream;
});

/*
 * 任务：压缩 js
 * */
gulp.task('script', function () {
    var stream = gulp.src('src/js/**/*.js')
        .pipe(gulpIf(function (file) {
            if (path.basename(file.path) == 'index.js') {
                return true;
            }
            return false;
        }, replace(/\{@version@\}/g, new Date().valueOf())))
        .pipe(uglify())
        .on("error", handleErrors)
        .pipe(gulp.dest('dist/js'));

    return stream;
});

/*
 * 任务：为模版引入的静态资源添加版本号
 * */
gulp.task('tpl', function () {
    var stream = gulp.src(['src/index.html', 'src/view/**/*.html'], { base: 'src' })
        .pipe(addAssetVer({
            tplImgPathBase: 'src'
        }))
        .pipe(gulp.dest('dist'));

    return stream;
});

/*
 * 任务：dist 任务的子任务，用来复制必要文件到 dist 目录
 * */
gulp.task('copy:other', function () {
    var stream = gulp.src(['src/img/**/*', 'src/lib/**/*', 'src/data/**/*', 'src/font/**/*'])
        .pipe(copy('dist', {
            prefix : 1
        }));

    return stream;
});

/*
 * 任务：dist 构建
 * */
gulp.task('dist', function () {
    gulp.start('script', 'less', 'tpl', 'copy:other');
});

gulp.task('watch:script', function () {
    gulp.watch(['src/js/**/*.js'], function(event){
        console.log('File ' + event.path + ' was ' + event.type + ', running script tasks...');
        gulp.start('script');
    });
});

gulp.task('watch:less', function () {
    gulp.watch('src/less/**/*.less', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running less tasks...');
        gulp.start('less');
    });
});

gulp.task('watch:tpl', function () {
    gulp.watch('src/view/**/*.html', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', tpl less tasks...');
        gulp.start('tpl');
    });
});

gulp.task('watch', function () {
    gulp.start('watch:script', 'watch:less', 'watch:tpl');
});

/*
 * 任务：自定义任务
 * 描述：可根据自己需要自定义常用任务
 * */
gulp.task('default', function () {
    gulp.start('dist');
});


