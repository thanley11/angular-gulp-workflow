# Angular - Gulp Workflow
This workflow is based off of [github.com/Foxandxss/fox-angular-gulp-workflow](https://github.com/Foxandxss/fox-angular-gulp-workflow) and it has more documentation on the LiveReload server and proxy middleware.

+ Run `npm install gulp`
 - For proxy, you might need to change the .gitconfig: `git config --global url."https://".insteadOf git://`

+ Add proxy information to .bowerrc, .npmrc, .gitconfig, etc.
+ Run `npm install`
	* Might need to select option `2` for Angular 1.3.12
	* Also, usually need to edit `vendor/manifest.js` but it is filled out this time. (see below under Workflow Notes) This is so Gulp can gather the filepaths to vendor (bower) files.
	* This will run a `bower install` automatically
+ Run `gulp`
+  Deploy to production with `gulp production`

## Workflow Notes:
### When you want to install a new bower package that is not included:

+ You run `bower install [app] --save`
	* That will install [app] to `/vendor` and also save it on the bower.json (should be saved to bower.json already with `--save` param).
+ Then you will need to tell Gulp that you want to load it, for that you need to open `/vendor/manifest.js` and modify it like:
```javascript
exports.javascript = [
  'vendor/angular/angular.js',
  'vendor/lodash/dist/lodash.js',
  'vendor/[app]/dist/[app].js'
];
```
### Templates
Currently, you need to place templates in their respective component folders and also name them with the convention: `[templatename].tpl.html`

The `app/index.html` - Is using lo-dash templates, which look like this:

``` html	
<link rel="stylesheet" href="<%= css %>">
<script type="text/javascript" src="<%= js %>"></script>
```
This is important for the static revisioning, because the versioned css and js can be appended at these locations each time you build.

The `dist/index.html` will have the correctly versioned `app.css` and `app.js` files
### [gulp-rev](https://github.com/sindresorhus/gulp-rev)

This allows for static revisioning of files.  The lodash templates allow you to append the new revision numbered static files each time you run `gulp production`.

A `manifest.json` file is created inside the respective `js` or `css` folder that contains the most recent revision and associates it with `app.css` or `app.js` depending on the type of static asset you have run through gulp-rev.

### [gulp-ng-annotate](https://github.com/Kagami/gulp-ng-annotate)

You can leave out annotations in Angular:
i.e:
``` javascript
angular.module("MyMod").controller("MyCtrl", function($scope, $timeout) {
});
```
+ You then run ng-annotate as a build-step to produce this intermediary, annotated, result (later sent to the minifier):
``` javascript
angular.module("MyMod").controller("MyCtrl", ["$scope", "$timeout", function($scope, $timeout) {
}]);
```

### [angular-template-cache](https://github.com/miickel/gulp-angular-templatecache)
+ You can specify the template module name in:
``` javascript
function buildTemplates() {
  return es.pipeline(
    plugins.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }),
    plugins.angularTemplatecache({
      module: 'ui.bootstrap.demo'
    })
  );
}
```

+ Notice: `module: [Name of Main Module]`. The default name (when no module is specified) is 'templates' which creates a `templates.js` file

Example:
``` javascript
$templateCache.put("shared/modal/modal.tpl.html", ....
```
You can `ng-include` the put text from the created templateCache


Then in `app/index.html`
``` html
 <div src=" 'shared/modal/modal.tpl.html' " ng-include></div>  
```
 or
 ``` javascript
 $templateCache.get('shared/modal/modal.tpl.html')
```
 The included example is using `ng-include`
