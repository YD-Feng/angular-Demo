var gulp = require('gulp'),

    copy = require('gulp-copy'),

    uglify = require('gulp-uglify'),

    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),

    util = require('gulp-util'),
    notify = require('gulp-notify'),

    argv = require('minimist')(process.argv.slice(2)),
    path = require('path'),
    fs = require('fs');

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
        .pipe(minifycss())
        .pipe(gulp.dest('dist/css'));

    return stream;
});

/*
 * 任务：uglify 压缩 js
 * */
gulp.task('uglify', function () {
    var stream = gulp.src('src/js/**/*.js')
        .pipe(uglify())
        .on("error", handleErrors)
        .pipe(gulp.dest('dist/js'));

    return stream;
});

/*
 * 任务：模版复制
 * */
gulp.task('copy:tpl', function () {
    var stream = gulp.src(['src/view/**/*.html'])
        .pipe(copy('dist', {
            prefix : 1
        }));

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
    gulp.start('uglify', 'less', 'copy:tpl', 'copy:other');
});

gulp.task('watch:js', function () {
    gulp.watch(['src/js/**/*.js'], function(event){
        console.log('File ' + event.path + ' was ' + event.type + ', running uglify tasks...');
        gulp.start('uglify');
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
        console.log('File ' + event.path + ' was ' + event.type + ', copy:tpl less tasks...');
        gulp.start('copy:tpl');
    });
});

gulp.task('watch', function () {
    gulp.start('watch:js', 'watch:less', 'watch:tpl');
});

/*
 * 任务：自定义任务
 * 描述：可根据自己需要自定义常用任务
 * */
gulp.task('default', function () {
    gulp.start('dist');
});


