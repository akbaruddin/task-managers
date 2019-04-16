import {src, dest, watch, parallel, series} from 'gulp'
import del from 'del'
import uglify from 'gulp-uglify'
import livereload from 'gulp-livereload'
import sass from 'gulp-sass'
import cleanCSS from 'gulp-clean-css'
import pug from 'gulp-pug'
import gulpif from 'gulp-if'
import babel from 'gulp-babel'
import yargs from 'yargs'
import concat from 'gulp-concat'

// Build Directories
const dirs = {
  src: 'src',
  dest: {
    css: 'dist/css',
    js: 'dist/js',
    html: 'dist'
  }
}

// File Sources
const sources = {
  styles: `${dirs.src}/scss/*.scss`,
  views: `${dirs.src}/html/*.pug`,
  scripts: `${dirs.src}/js/*.js`
}

// Recognise `--production` argument
const argv = yargs.argv
const production = !!argv.production

// Main Tasks
// Styles 
export const buildStyles = () => {
  return src(sources.styles)
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(cleanCSS({compatibility: 'ie8', format: 'beautify'}))
    .pipe(concat('style.css'))
    .pipe(dest(dirs.dest.css))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(concat('style.min.css'))
    .pipe(dest(dirs.dest.css))
    .pipe(livereload())
}

// Views
export const buildViews = () => {
  return src(sources.views)
    .pipe(pug({ pretty: !production }))
    .pipe(dest(dirs.dest.html))
    .pipe(livereload())
}

// Scripts
export const buildScripts = () => {
  return src(sources.scripts)
    .pipe(babel({ 
      presets: [
        [
          '@babel/preset-env', {
            'modules': false,
            'loose': true
          }
        ]
      ],
      babelrc: false,
      exclude: 'node_modules/**'
    }))
    .pipe(concat('main.js'))
    .pipe(dest(dirs.dest.js))
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(dest(dirs.dest.js))
    .pipe(livereload());
}

// Clean
export const clean = () => del(['dist']);

// Watch Task
export const devWatch = () => {
  livereload.listen()
  watch(sources.styles, buildStyles)
  watch(sources.views, buildViews)
  watch(sources.scripts, buildScripts)
}

// Development Task
export const dev = series(clean, parallel(buildStyles, buildViews, buildScripts), devWatch)

// Serve Task
export const build = series(clean, parallel(buildStyles, buildViews, buildScripts))

// Default task
export default build