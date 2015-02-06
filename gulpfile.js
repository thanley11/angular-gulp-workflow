var gulp               = require('gulp');
var fs                 = require('fs');
var plugins            = require('gulp-load-plugins')();
var es                 = require('event-stream');
var del                = require('del');
var historyApiFallback = require('connect-history-api-fallback');

var vendor             = require('./vendor/manifest');
var root = 'Client-Scripts/';
var paths = {
  appJavascript:    [root + '/app/js/app.js', root + 'app/js/**/*.js'],
  appTemplates:     root + 'app/js/**/*.tpl.html',
  appMainLess:      root + 'app/less/app.less',
  appStyles:        root + 'app/less/**/*.less',
  appImages:        root + 'app/images/**/*',
  indexHtml:        root + 'app/index.html',
  vendorJavascript: vendor.javascript,
  vendorCss:        vendor.css,
  finalAppJsPath:   'js/app.js',
  finalAppCssPath:  'css/app.css',
  specFolder:       [root + 'spec/**/*_spec.js'],
  tmpFolder:        root + 'tmp',
  tmpJavascript:    root + 'tmp/js',
  tmpAppJs:         root + 'tmp/js/app.js',
  tmpCss:           root + 'tmp/css',
  tmpImages:        root + 'tmp/images',
  distFolder:       root + 'dist',
  distJavascript:   root + 'dist/js',
  distCss:          root + 'dist/css',
  distImages:       root + 'dist/images',
  distJsManifest:   root + 'dist/js/rev-manifest.json',
  distCssManifest:  root + 'dist/css/rev-manifest.json'
};

			/* Concatenate   (& = *)
					
					if HTML found:
					function buildTemplates() {
					  return es.pipeline(
						plugins.minifyHtml({
						  empty: true,
						  spare: true,
						  quotes: true
						}),
						plugins.angularTemplatecache({
						  module: 'app'
						})
					  );
					}
										
					ManifestJS:
					'vendor/angular/angular.js',
					'vendor/lodash/dist/lodash.js'
					
					'app/js/app.js', 
					'app/js/&&/&.js'
					'app/js/&&/&.tpl.html',
					INTO 
					'tmp/js'
					AS
					'app.js'
					WITH 
					Sourcemaps
					WITH A DEV SERVER on 
					http://localhost:5000
					AND a LiveReload on port 35729
					*/
					
gulp.task('scripts-dev', function() {				
  return gulp.src(paths.vendorJavascript.concat(paths.appJavascript, paths.appTemplates))
    .pipe(plugins.if(/html$/, buildTemplates()))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.concat('app.js'))
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest(paths.tmpJavascript))
    .pipe(plugins.connect.reload());
});

/* Do Same as Above,
Except:
ngAnnotate, uglify, and revision the js file, create a revision file(rev-manifest) in 'dist/js'
					*/
gulp.task('scripts-prod', function() {
  return gulp.src(paths.vendorJavascript.concat(paths.appJavascript, paths.appTemplates))
    .pipe(plugins.if(/html$/, buildTemplates()))
    .pipe(plugins.concat('app.js'))
    .pipe(plugins.ngAnnotate())
    .pipe(plugins.uglify())
    .pipe(plugins.rev())
    .pipe(gulp.dest(paths.distJavascript))
    .pipe(plugins.rev.manifest({path: 'rev-manifest.json'}))
    .pipe(gulp.dest(paths.distJavascript));
});

/* 
Concat vendor.css
and 'app/less/main.less'
IF less, then run gulp-less
AS 
'app.cs'
INTO 
'tmp/css'
*/
gulp.task('styles-dev', function() {
  return gulp.src(paths.vendorCss.concat(paths.appMainLess))
    .pipe(plugins.if(/less$/, plugins.less()))
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.concat('app.css'))
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest(paths.tmpCss))
    .pipe(plugins.connect.reload());
});
/* 
Same as above,
except, minify, revision, and put in 
'dist/css'
Add rev number to manifest
put in 'dist/css'
*/
gulp.task('styles-prod', function() {
  return gulp.src(paths.vendorCss.concat(paths.appMainLess))
    .pipe(plugins.if(/less$/, plugins.less()))
    .pipe(plugins.concat('app.css'))
    .pipe(plugins.minifyCss())
    .pipe(plugins.rev())
    .pipe(gulp.dest(paths.distCss))
    .pipe(plugins.rev.manifest({path: 'rev-manifest.json'}))
    .pipe(gulp.dest(paths.distCss));
});
// 'app/images/**/*',  --->  'tmp/images',
gulp.task('images-dev', function() {
  return gulp.src(paths.appImages)
    .pipe(gulp.dest(paths.tmpImages))
    .pipe(plugins.connect.reload());
});
// 'app/images/**/*',  --->  'dist/images',
gulp.task('images-prod', function() {
  return gulp.src(paths.appImages)
    .pipe(gulp.dest(paths.distImages));
});
/*
	js : '/js/app.js',
	css: '/css/app.css'  

	html: app/index.html'
	Insert rev numbered css and js into index.html 
	Put index.html into 'tmp'
	with <script type="text/javascript" src="/js/app.js"></script> etc
 */
gulp.task('indexHtml-dev', ['scripts-dev', 'styles-dev'], function() {
  var manifest = {
    js: paths.finalAppJsPath,
    css: paths.finalAppCssPath
  };

  return gulp.src(paths.indexHtml)
    .pipe(plugins.template({css: manifest['css'], js: manifest['js']}))
    .pipe(gulp.dest(paths.tmpFolder))
    .pipe(plugins.connect.reload());
});
/*  
	distJsManifest: 'dist/js/rev-manifest.json'
	distCssManifest: 'dist/css/rev-manifest.json'
	
*/
gulp.task('indexHtml-prod', ['scripts-prod', 'styles-prod'], function() {
  var jsManifest  = JSON.parse(fs.readFileSync(paths.distJsManifest, 'utf8'));
  var cssManifest = JSON.parse(fs.readFileSync(paths.distCssManifest, 'utf8'));

  var manifest = {
    js: '/js/' + jsManifest['app.js'],
    css: '/css/' + cssManifest['app.css']
  };
/*  
	Get 'app/index.html'
	Insert css and js paths to index.html
	place in 'dist/'
	
*/
  return gulp.src(paths.indexHtml)
    .pipe(plugins.template({css: manifest['css'], js: manifest['js']}))
    .pipe(plugins.rename('index.html'))
    .pipe(gulp.dest(paths.distFolder));
});

/*
& = *
concat
['app/js/app.js', 'app/js/&&/&.js']
'spec/&&/&_spec.js'
Lint using jshint-stylish and jshint
*/
gulp.task('lint', function() {
  return gulp.src(paths.appJavascript.concat(paths.specFolder))
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'));
});

// Testing
gulp.task('testem', function() {
  return gulp.src(['']) // We don't need files, that is managed on testem.json
    .pipe(plugins.testem({
      configFile: 'testem.json'
    }));
});

// 'tmp', 'dist'
gulp.task('clean', function(cb) {
  del([paths.tmpFolder, paths.distFolder], cb);
});

gulp.task('watch', ['webserver'], function() {
  gulp.watch(paths.appJavascript, ['lint', 'scripts-dev']);
  gulp.watch(paths.appTemplates, ['scripts-dev']);
  gulp.watch(paths.vendorJavascript, ['scripts-dev']);
  gulp.watch(paths.appImages, ['images-dev']);
  gulp.watch(paths.specFolder, ['lint']);
  gulp.watch(paths.indexHtml, ['indexHtml-dev']);
  gulp.watch(paths.appStyles, ['styles-dev']);
  gulp.watch(paths.vendorCss, ['styles-dev']);
});

gulp.task('webserver', ['indexHtml-dev', 'images-dev'], function() {
  plugins.connect.server({
    root: paths.tmpFolder,
    port: 5000,
    livereload: true,
    middleware: function(connect, o) {
      return [ (function() {
        var url = require('url');
        var proxy = require('proxy-middleware');
        var options = url.parse('http://localhost:8080/api');
        options.route = '/api';
        return proxy(options);
      })(), historyApiFallback ];
    }
  });
});

gulp.task('default', ['watch']);
gulp.task('production', ['scripts-prod', 'styles-prod', 'images-prod', 'indexHtml-prod']);

function buildTemplates() {
  return es.pipeline(
    plugins.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }),
    plugins.angularTemplatecache({
	  //standalone: true,
      module: 'ui.bootstrap.demo'
    })
  );
}
