var gulp = require('gulp'),
    babel = require('gulp-babel');
//gulp.task('js', function () {
//  gulp.src(['./app/**/*.js',
//      'app.js',
//      'dist/**/*.js'])
//    .pipe(connect.reload());
//});

//gulp.task('scss', function() {
//  gulp.src('./app/**/*.scss')
//    .pipe(connect.reload());
//});
//
//gulp.task('concatAndBuildCss', function () {
//  gulp.src('./app/**/*.scss')
//    .pipe(concat('test.scss'))
//    .pipe(sass())
//    .pipe(gulp.dest('dist/styles'));
//});
//
//gulp.task('watch', function () {
//  gulp.watch(['./app/**/*.html'], ['html']);
//  gulp.watch(['./app/**/*.js'], ['babelfy', 'js']);
//  gulp.watch(['./app/**/*.scss'], ['concatAndBuildCss', 'scss']);
//});

gulp.task('babelfy', function() {
  gulp.src('./app.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('dist'))
});

//gulp.task('serve', ['concatAndBuildCss', 'connect', 'watch']);
//gulp.task('serve', ['babelfy', 'concatAndBuildCss', 'connect', 'watch']);