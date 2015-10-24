import shutil
import glob
import os
import json
import code
import sass
from subprocess import call

def generate_entrypoint_file(mode):
  with open('node_modules/ensemblejs/default.entrypoint.js', 'r') as source:
    with open(''.join(['build/', mode, '.js']), 'wb') as dest:
      dest.write(source.read())
      dest.write("\nentryPoint.set('GameMode', '" + mode + ");\nentryPoint.run();");

SOURCE = { 'js': glob.glob('game/js/*.js'),
            'scss': glob.glob('game/scss/*.scss') }


DIST = { 'root': 'gen',
          'js': glob.glob('gen/js/*.js'),
          'css': glob.glob('gen/css/*.css'),
          'css_map': glob.glob('gen/css/*.css.map') }

# clean
print 'clean'

for f in ["game/js/gen", "game/css", "gen", "build"]:
  shutil.rmtree(f, ignore_errors=True)

print 'npm install'
ret = call('npm install', shell=True)
if ret != 0:
  exit(ret)

print 'preflight'
# preflight
for f in ["gen/js", "gen/css", "game/js/gen", "game/css", "build"]:
  os.makedirs(f)

# generate entry-points
mode_filename = 'game/js/modes.json'
if os.path.isfile(mode_filename):
  with open(mode_filename, 'r') as mode_file:
    modes = json.load(mode_file)
    for mode in modes:
      generate_entrypoint_file(mode)
    #code.interact(local=dict(globals(), **locals()))

# withjson.load
# arr = []
#   json.
#   arr = JSON.parse(File.read(modes_file)) if File.exists? modes_file
#   arr << 'game' if arr.empty?

#   arr.each do | mode |
#     generate_entrypoint_file mode
#   end





print 'browserify'
# browserify
entry_points = ' '.join(SOURCE['js'])
targets = ' -o '.join(SOURCE['js']).replace('game', DIST['root'])

ret = call('browserify -d ' + entry_points + ' -p [ factor-bundle -o ' + targets + ' ] -o ' + DIST['root'] + '/js/common.js', shell=True)

if ret != 0:
  exit(ret)

print 'sass'
# sass
for f in SOURCE['scss']:
  css_f = f.replace('game/scss/', '').replace('.scss', '')
  ret = call('node-sass ' + f + ' ' + DIST['root'] + '/css/' + css_f + '.css', shell=True)
  if ret != 0:
    exit(ret)

print 'minify'
# minify
for f in DIST['css']:
  min_f = f.replace('.css', '.min.css')
  ret = call('cssnano < ' + f + ' > ' + min_f, shell=True)  
  if ret != 0:
    exit(ret)
  print f
  os.remove(f)

print 'uglify'
# uglify
for f in DIST['js']:
  min_name = f.replace(".js", ".min.js")
  ret = call('uglifyjs --compress --mangle -- ' + f + ' > ' + min_name, shell=True)
  if ret != 0:
    exit(ret)
  print f
  os.remove(f)
