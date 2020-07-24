import { series, src, dest, task, watch } from 'gulp';
import pug from "gulp-pug";
import sass from "gulp-sass";
import postcss from "gulp-postcss";
import autoprefixer from "autoprefixer";
import flexfix from "postcss-flexbugs-fixes";
import cssnano from "cssnano";
import cleanCSS from "gulp-clean-css";
import * as SASSCOMPILER from "node-sass";
import concat from "gulp-concat";
import through from 'through2';
import replace from 'gulp-string-replace';
import babel from 'gulp-babel';
import uglify from "gulp-uglify";
import htmlmin from 'gulp-html-minifier';
import browserSync from "browser-sync";
import csscomb from 'gulp-csscomb';
import fs from "fs";
sass.compiler = SASSCOMPILER;

const browser = browserSync.create();

function syncTasks(done) {
  browser.init({ server: "./dist" });
  done();
}

function htmlTask(css, js) {
  const styles = `<style>${css}</style>`;
  const scripts = `<script>${js}</script>`;
  return src('src/index.pug')
    .pipe(pug({
      locals: JSON.parse(fs.readFileSync('./data.json'), { encoding: "utf8" })
    }))
    .pipe(replace('<!--style-->', styles, { logs: { enabled: false } }))
    .pipe(replace('<!--script-->', scripts,  { logs: { enabled: false } }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest('./dist'))
    .pipe(browser.reload({ stream: true }))
}

function jsTasks(css) {
  return src('src/scripts/main.js')
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(uglify())
    .pipe(through.obj(function(vinylFile, encoding, callback) {
      const transformedFile = vinylFile.clone();
      const bufferToString = transformedFile.contents.toString(encoding);
      htmlTask(css, bufferToString);
      callback(null);
    }));
}

function cssTask(callbackJS) {
  return (src(["src/sass/main.scss"])
  .pipe(sass().on("error", sass.logError))
  .pipe(postcss([autoprefixer(), flexfix(), cssnano()]))
  .pipe(concat("main.css"))
  .pipe(csscomb({"sort-order-fallback": "abc"}))
  .pipe(cleanCSS())
  .pipe(through.obj(function(vinylFile, encoding, callback) {
    const transformedFile = vinylFile.clone();
    const bufferToString = transformedFile.contents.toString(encoding);
    callbackJS(bufferToString)
    callback(null);
  })))
}

function build() {
  return cssTask(jsTasks);
}

function watchFiles() {
  watch([
    "src/sass/*.scss", "src/sass/**/*.scss",
    "src/scripts/*.js", "src/scripts/**/*.js",
    "src/*.pug", "src/components/*.pug"
  ]).on("change", () => {
    cssTask(jsTasks);
    browser.reload();
  });
}

task("watch", series(syncTasks, watchFiles))

export default series(build);
