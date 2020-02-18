import { src, dest, watch, parallel, series } from "gulp";
import tap from "gulp-tap";
import browserify from "browserify";
import babel from "babelify";
import buffer from "gulp-buffer";
import uglify from "gulp-uglify";

const builsScripts = () => {
  return src("./src/scripts/*.js")
    .pipe(
      tap(file => {
        file.contents = browserify(file.path, {
          debug: true
        })
          .transform(babel, {
            presets: [
              [
                "@babel/preset-env",
                {
                  loose: true
                  // modules: false
                }
              ]
            ]
          })
          .bundle();
      })
    )
    .pipe(buffer())
    .pipe(uglify())
    .pipe(dest("./dist/js/"));
};

export default series(builsScripts);
