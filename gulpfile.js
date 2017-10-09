var gulp = require('gulp');
var semantic = require('./igem2017/static/semantic/tasks/build');

gulp.task('semantic', 'Builds all semantic-ui files from source', semantic);
