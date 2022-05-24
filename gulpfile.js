const { series, src, watch, dest } = require('gulp')
const less = require('gulp-less')
const babel = require('gulp-babel')
const browserify = require('browserify')
const stream = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const terser = require('gulp-terser')
const cleancss = require('gulp-clean-css')

const buildLess = () => {
  return src('src/theme/doctt.less').pipe(less()).pipe(cleancss()).pipe(dest('dist/static'))
}

const buildClient = () => {
  return (
    browserify({
      entries: 'src/client/index.js',
      debug: false,
    })
      .transform('babelify', {
        presets: ['@babel/preset-env'],
        plugins: [['@babel/transform-runtime']],
        sourceMaps: false,
      })
      .bundle()
      .on('error', function (error) {
        console.log(error.toString())
      })
      .pipe(stream('doctt.min.js'))
      .pipe(buffer())
      // .pipe(terser())
      .pipe(dest('dist/static', { overwrite: true }))
  )
}

const buildServer = () => {
  return src('src/server/*')
    .pipe(babel({ presets: ['@babel/preset-env'], sourceMap: false }))
    .pipe(dest('dist/server'))
}

watch(['src/theme/*'], series(buildLess))
watch(['src/client/*'], series(buildClient))
watch(['src/server/*'], series(buildServer))

exports.default = series(buildLess, buildClient, buildServer)
