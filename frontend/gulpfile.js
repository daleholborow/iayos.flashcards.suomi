var gulp        = require('gulp');
var tsc         = require('gulp-tsc');
var tslint      = require('gulp-tslint');
var browserSync = require('browser-sync').create();
var reload      = browserSync.reload;

var paths = {
	browsersync: {
		basedir: './app'
	},
	tscripts: {
		src: ['app/src/**/*.ts'],
		dest: 'app/dist'
	},
	styles: {
		src: ['app/**/*.css']
	},
	htmlfiles: {
		src: ['app/**/*.html']
	}
};

// default task
gulp.task('default', ['lint', 'serve']);

// static server
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: paths.browsersync.basedir
        }//,
		//browser: 'google chrome canary'
    });
});

// styles
gulp.task('styles', function() {
    return gulp.src(paths.styles.src)
        .pipe(reload({stream:true}));
});

// typescript
gulp.task('build', ['compile:typescript']);
gulp.task('compile:typescript', function() {
    return gulp.src(paths.tscripts.src)
		.pipe(tsc({
			module: "commonjs",
			emitError: true,
			sourceMap: false,
			outDir: paths.tscripts.dest,
            exclude: [
                "dist",
                "node_modules"
            ]
		}))
		.pipe(gulp.dest(paths.tscripts.dest))
        .pipe(reload({stream:true}));
});

// linting
gulp.task('lint', ['lint:default']);
gulp.task('lint:default', function(){
      return gulp.src(paths.tscripts.src)
        .pipe(tslint())
        .pipe(tslint.report('prose', {
          emitError: false
        }));
});

// run task - not used at this point
gulp.task('run', function() {
	// do nothing for now
});

// buildrun task - not used at this point
gulp.task('buildrun', ['build', 'run'], function() {
	// do nothing for now
});

// static server + watching css/html files
gulp.task('test', ['serve']);
gulp.task('serve', ['browser-sync'], function() {

	// watch html files - do a complete reload for all browsers
    gulp.watch(paths.htmlfiles.src).on('change', browserSync.reload);

    // Watch .css files - inject changes
    gulp.watch(paths.styles.src, ['styles']);

    // Watch .ts files - inject changes
    gulp.watch(paths.tscripts.src, ['compile:typescript']);
});