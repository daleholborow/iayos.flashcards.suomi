var gulp        = require('gulp');
var tsc         = require('gulp-typescript');
var merge       = require('merge2');
var tslint      = require('gulp-tslint');
var browserSync = require('browser-sync').create();
var reload      = browserSync.reload;
var exec = require('child_process').exec;

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


// To go out to the flascardapi.eladaus.com website and regenerate all our dto .ts definitions
gulp.task('refresh-flashcardapi', function(cb) {
    
 exec("typescript-ref app/src/flashcardapi.dtos.ts", function (err, stdout, stderr) {
     console.log(stdout);
     console.log(stderr);
     cb(err);
 });

});

// default task
gulp.task('default', ['lint', 'build', 'serve']);

// static server
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: paths.browsersync.basedir
        }
    });
});

// styles
gulp.task('styles', function() {
    return gulp.src(paths.styles.src)
        .pipe(reload({stream:true}));
});


// typescript

/*var tsProject = tsc.createProject({
    declaration: false,
    outDir: paths.tscripts.dest,
    excludes : [
        paths.tscripts.dest,
        "node_modules"
    ]
});*/

var tsProject = tsc.createProject('tsconfig.json');

gulp.task('build', ['compile:typescript']);

gulp.task('compile:typescript', function() {
    var tsResult = gulp.src(paths.tscripts.src)
        .pipe(tsProject());

    return tsResult
        .pipe(gulp.dest(paths.tscripts.dest))
        .pipe(reload({stream:true}));
    // return merge([ // Merge the two output streams, so this task is finished when the IO of both operations is done. 
    //     // tsResult.dts.pipe(gulp.dest('release/definitions')),
    //     // tsResult.js.pipe(gulp.dest('release/js'))
    //     //tsResult.dts.pipe(gulp.dest(paths.tscripts.dest + '/definitions')),
    //     tsResult.js.pipe(gulp.dest(paths.tscripts.dest))
    // ]);

    // return gulp.src(paths.tscripts.src)
	// 	.pipe(tsc({
	// 		module: "ES6",
	// 		emitError: true,
	// 		sourceMap: false,
	// 		outDir: paths.tscripts.dest,
    //         exclude: [
    //             "dist",
    //             "node_modules"
    //         ]
	// 	}))
	// 	.pipe(gulp.dest(paths.tscripts.dest))
    //     .pipe(reload({stream:true}));
});

// linting
gulp.task('lint', ['lint:default']);
gulp.task('lint:default', function(){
      return gulp.src(paths.tscripts.src)
        .pipe(tslint())
        .pipe(tslint.report('prose' , {
          emitError: true
        }));
});

/*
// run task - not used at this point
gulp.task('run', function() {
	// do nothing for now
});

// buildrun task - not used at this point
gulp.task('buildrun', ['build', 'run'], function() {
	// do nothing for now
});
*/

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