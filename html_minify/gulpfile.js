const { src, dest } = require('gulp');
const htmlmin = require('gulp-htmlmin');

function htmlTask() {
    return src('src/*.html')
    .pipe(htmlmin({
        removeComments: true,
        minifyCSS: true,
        minifyJS: true
    }))
    .pipe(dest('dist'));
}

exports.default = htmlTask
