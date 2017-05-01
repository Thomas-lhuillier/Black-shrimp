# define bourbon path, use a common library for preventing duplicates
add_import_path "boubon/bourbon"

### -->> project paths, delete/comment if you use scout, codekit etc.
environment = :production # removes single line comments, keeps css comments
output_style = :nested

css_dir         = "css"
sass_dir        = "sass"
images_dir      = "img"
javascripts_dir = "js"
fonts_dir       = "fonts"

# for debug options in chrome web developer tools
sass_options = {
  	:debug_info => true,
	:sourcemap => true
}

# sass --watch sass:css