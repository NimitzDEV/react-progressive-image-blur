let gulp = require('gulp')
let pump = require('pump')
let responsive = require('gulp-responsive')

gulp.task('comp-image', function() {
  pump([
    gulp.src('public/images/*.{png,jpg}'),
    responsive(
      {
        '*.jpg': [
          {
            width: 50,
            rename: { suffix: '-w50' }
          },
          {
            width: 200,
            rename: { suffix: '-w200' }
          },
          {
            width: 630,
            rename: { suffix: '-w630' }
          },
          {
            rename: { suffix: '-o' }
          }
        ],
        '*.png': [
          {
            width: 50,
            rename: { suffix: '-w50' }
          },
          {
            width: 200,
            rename: { suffix: '-w200' }
          },
          {
            width: 630,
            rename: { suffix: '-w630' }
          },
          {
            rename: { suffix: '-o' }
          }
        ]
      },
      { quality: 70, withMetadata: false, progressive: true }
    ),
    gulp.dest('public/images/')
  ])
})
