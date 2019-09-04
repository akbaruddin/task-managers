const { src, dest, series } = require('gulp');
const htmlmin = require('gulp-htmlmin');

function htmlTask() {
  return src('src/sass/*.s(css|ass)')
    .pipe()
    .pipe(dest('dist'));
}

exports.default = series(htmlTask)
