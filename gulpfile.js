const watchify = require('watchify');
const browserify = require('browserify');
const babelify = require('babelify');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const util = require('gulp-util');
const sourcemaps = require('gulp-sourcemaps');
const size = require('gulp-size');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const R = require('ramda');
const browserSync = require('browser-sync');

const distpath = 'examples';

const customOpts = {
  entries: ['./example.js'],
  debug: true,
  transform: [['babelify', { presets: ['es2015'] }]]
};

const opts = R.merge(watchify.args, customOpts);

const browserification = watchify(browserify(opts));

browserification.on('log', util.log);

gulp.task('bundle', [], function(){
  return browserification.bundle()
      .on('error', function(err){ console.log(err.message); this.emit('end'); })
      .pipe(plumber())
      .pipe(source('config.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(size())
      .pipe(gulp.dest(distpath));
});

/**
 * This task starts watching the files inside 'src'. If a file is changed,
 * removed or added then it will run refresh task which will run the bundle task
 * and then refresh the page.
 *
 * For large projects, it may be beneficial to separate copying of libs and
 * media from bundling the source. This is especially true if you have large
 * amounts of media.
 */
gulp.task('watch', [ 'bundle' ], function() {
  const watcher = gulp.watch('./src/**/*', [ 'refresh' ]);
  watcher.on('change', function(event) {
    console.log(
        'File ' + event.path + ' was ' + event.type + ', running tasks...'
    );
  });
});

/**
 * This task starts browserSync. Allowing refreshes to be called from the gulp
 * bundle task.
 */
gulp.task('browser-sync', [ 'watch' ], function() {
  return browserSync({ server: { baseDir: distpath } });
});

/**
 * This is the default task which chains the rest.
 */
gulp.task('default', [ 'browser-sync' ]);

/**
 * Using a dependency ensures that the bundle task is finished before reloading.
 */
gulp.task('refresh', [ 'bundle' ], browserSync.reload);